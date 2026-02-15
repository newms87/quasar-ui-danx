import { uid } from "quasar";
import type { Ref } from "vue";
import { ShallowReactive, shallowReactive } from "vue";
import { AnyObject, TypedObject } from "../types";
import { FlashMessages } from "./FlashMessages";

const store = new Map<string, any>();

/**
 * External list refs registered for automatic optimistic delete support.
 * When removeObjectFromLists fires, these arrays are also scanned and spliced.
 */
const registeredLists = new Set<Ref<TypedObject[]>>();

/**
 * Register a local ref array so optimistic deletes automatically remove items from it.
 *
 * Without registration, removeObjectFromLists only scans arrays that are properties
 * of stored objects. Local component refs (e.g., from routes.list()) are invisible
 * to the store. Registering bridges that gap.
 *
 * Always call unregisterList in onBeforeUnmount to prevent memory leaks.
 */
export function registerList(listRef: Ref<TypedObject[]>): void {
	registeredLists.add(listRef);
}

/**
 * Unregister a previously registered list ref.
 * Call this in onBeforeUnmount to clean up.
 */
export function unregisterList(listRef: Ref<TypedObject[]>): void {
	registeredLists.delete(listRef);
}

export function storeObjects<T extends TypedObject>(newObjects: T[]) {
	for (const index in newObjects) {
		if (newObjects[index] && typeof newObjects[index] === "object") {
			newObjects[index] = storeObject(newObjects[index]);
		}
	}
	return newObjects;
}

/**
 * Store an object in the object store via type + id
 * Returns the stored object that should be used instead of the passed object as the returned object is shared across the system
 */
export function storeObject<T extends TypedObject>(newObject: T, recentlyStoredObjects: AnyObject = {}): ShallowReactive<T> {
	if (typeof newObject !== "object") {
		return newObject;
	}

	const id = newObject?.id || newObject?.name;
	const type = newObject?.__type;
	if (!id || !type) {
		// Still process children to store any nested TypedObjects
		const reactiveObject = shallowReactive(newObject);
		storeObjectChildren(newObject, recentlyStoredObjects, reactiveObject);
		return reactiveObject;
	}

	if (!newObject.__id) {
		newObject.__id = uid();
	}
	if (!newObject.__timestamp) {
		newObject.__timestamp = newObject.updated_at || 0;
	}

	const objectKey = `${type}:${id}`;

	// If the object was recently stored, return the recently stored object to avoid infinite recursion
	if (recentlyStoredObjects[objectKey]) {
		return recentlyStoredObjects[objectKey];
	}

	// Retrieve the existing object if it already exists in the store
	const oldObject = store.get(objectKey);

	// If an old object exists, and it is newer than the new object, and all the child objects are not newer than the original do not store the new object,
	// just return the old
	// NOTE: If the timestamp is the same, its possible the intention is to update the existing object, so DO NOT return old object in this case
	if (!hasRecentUpdates(newObject, oldObject)) {
		recentlyStoredObjects[objectKey] = oldObject;

		// Recursively store all the children of the object as well
		storeObjectChildren(newObject, recentlyStoredObjects, oldObject);
		return oldObject;
	}

	// Reference to the reactive version of the object so we can update all the child relationships and return the reactive object
	const reactiveObject = oldObject || shallowReactive(newObject);

	// Make sure to store the object in the recently stored objects to avoid infinite recursion
	recentlyStoredObjects[objectKey] = reactiveObject;

	// Recursively store all the children of the object as well
	storeObjectChildren(newObject, recentlyStoredObjects);

	Object.assign(reactiveObject, newObject);

	if (!oldObject) {
		// Store the reactive object in the store if there was not already one existing
		store.set(objectKey, reactiveObject);
	}

	if (reactiveObject.__deleted_at) {
		removeObjectFromLists(reactiveObject);
	}

	return reactiveObject;
}

/**
 *  A recursive way to store all the child TypedObjects of a TypedObject.
 *  recentlyStoredObjects is used to avoid infinite recursion
 *  applyToObject is used to apply the stored objects to a different object than the one being stored.
 *  The apply to object is the current object being returned by storeObject() - Normally, the oldObject if it has a more recent timestamp than the newObject being stored.
 */
function storeObjectChildren<T extends TypedObject>(object: T, recentlyStoredObjects: AnyObject = {}, applyToObject: T | null = null) {
	applyToObject = applyToObject || object;
	for (const key of Object.keys(object)) {
		const value = object[key];
		if (Array.isArray(value)) {
			for (const index in value) {
				if (value[index] && typeof value[index] === "object") {
					if (!applyToObject[key]) {
						// @ts-expect-error this is fine... T is generic, but not sure why the matter to write to an object?
						applyToObject[key] = [];
					}
					applyToObject[key][index] = storeObject(value[index], recentlyStoredObjects);
				}
			}
		} else if (value?.__type) {
			// @ts-expect-error __type is guaranteed to be set in this case
			applyToObject[key] = storeObject(value as TypedObject, recentlyStoredObjects);
		} else if (value && typeof value === "object") {
			// Handle plain objects/dictionaries - recurse to find nested TypedObjects at any depth
			storeObjectChildren(value, recentlyStoredObjects, applyToObject[key]);
		}
	}
}

/**
 * Recursively check the current object and all its child objects
 * to see if any of the objects are newer than the currently stored objects
 */
function hasRecentUpdates(newObject: TypedObject, oldObject: TypedObject | null) {
	// If there are no timestamps to compare, assume there are updates
	if (!newObject.__timestamp || !oldObject?.__timestamp) return true;

	// If the new object has a newer timestamp than the old then there are updates
	if (newObject.__timestamp > oldObject.__timestamp) return true;

	for (const key of Object.keys(newObject)) {
		const newObjectValue = newObject[key];
		const oldObjectValue = oldObject[key];

		// If the old object does not have this key, this is new information, therefore there are updates
		if (!oldObjectValue?.__timestamp) {
			return true;
		}

		if (Array.isArray(newObjectValue) && newObjectValue.length > 0) {
			for (const newObjectItem of newObjectValue as TypedObject[]) {
				// Only compare the object if it is a TypedObject
				if (newObjectItem?.__type) {
					const oldObjectItem = (oldObjectValue as TypedObject[]).find((v: TypedObject) => v.id === newObjectItem.id && v.__type === newObjectItem.__type);

					// If the oldObject does not have this entry, then there is new information, therefore there are updates
					if (!oldObjectItem?.__timestamp) {
						return true;
					}

					// Compare the child objects to see if there are updates
					if (hasRecentUpdates(newObjectItem, oldObjectItem)) {
						return true;
					}
				}
			}
		} else if (newObjectValue?.__type) {
			// Only compare the object if it is a TypedObject
			if (hasRecentUpdates(newObjectValue, oldObjectValue)) {
				return true;
			}
		}
	}

	// If no updates were found, return false
	return false;
}

/**
 * Remove an object from all lists in the store AND from any registered external list refs.
 */
function removeObjectFromLists<T extends TypedObject>(object: T) {
	// Remove from arrays that are properties of stored objects
	for (const storedObject of store.values()) {
		for (const key of Object.keys(storedObject)) {
			const value = storedObject[key];
			if (Array.isArray(value) && value.length > 0) {
				const index = value.findIndex(v => v.__id === object.__id && v.__type === object.__type);
				if (index !== -1) {
					value.splice(index, 1);
					storedObject[key] = [...value];
				}
			}
		}
	}

	// Remove from registered external list refs
	for (const listRef of registeredLists) {
		const arr = listRef.value;
		if (arr.length > 0) {
			const index = arr.findIndex(v => v.__id === object.__id && v.__type === object.__type);
			if (index !== -1) {
				arr.splice(index, 1);
			}
		}
	}
}

/**
 * Auto refresh an object based on a condition and a callback. Returns the timeout ID for the auto-refresh.
 * NOTE: Use the timeout ID to clear the auto-refresh when the object is no longer needed (eg: when the component is unmounted)
 */
const registeredAutoRefreshes: AnyObject = {};

export async function autoRefreshObject<T extends TypedObject>(name: string, object: T, condition: (object: T) => boolean, callback: (object: T) => Promise<T>, interval = 3000) {
	// Always clear any previously registered auto refreshes before creating a new timeout
	stopAutoRefreshObject(name);

	if (!object?.id || !object?.__type) {
		throw new Error("Invalid stored object. Cannot auto-refresh");
	}

	if (condition(object)) {
		const refreshedObject = await callback(object);

		if (!refreshedObject.id) {
			FlashMessages.error(`Failed to refresh ${object.__type} (${object.id}) status: ` + object.name);
			return null;
		}

		storeObject(refreshedObject);
	}

	// Save the autoRefreshId for the object so it can be cleared when the object refresh is no longer needed
	registeredAutoRefreshes[name] = setTimeout(() => autoRefreshObject(name, object, condition, callback, interval), interval);
}

export function stopAutoRefreshObject(name: string) {
	const timeoutId = registeredAutoRefreshes[name];
	timeoutId && clearTimeout(timeoutId);
}
