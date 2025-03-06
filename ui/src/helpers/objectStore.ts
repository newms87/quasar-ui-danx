import { uid } from "quasar";
import { ShallowReactive, shallowReactive } from "vue";
import { AnyObject, TypedObject } from "../types";
import { FlashMessages } from "./FlashMessages";

const store = new Map<string, any>();

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
	if (!id || !type) return shallowReactive(newObject);

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

	// If an old object exists, and it is newer than the new object, do not store the new object, just return the old
	// NOTE: If the timestamp is the same, its possible the intention is to update the existing object, so DO NOT return old object in this case
	// @ts-expect-error __timestamp is guaranteed to be set in this case on both old and new
	if (oldObject && newObject.__timestamp < oldObject.__timestamp) {
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
		if (Array.isArray(value) && value.length > 0) {
			for (const index in value) {
				if (value[index] && typeof value[index] === "object") {
					if (!applyToObject[key]) {
						applyToObject[key] = [];
					}
					applyToObject[key][index] = storeObject(value[index], recentlyStoredObjects);
				}
			}
		} else if (value?.__type) {
			// @ts-expect-error __type is guaranteed to be set in this case
			applyToObject[key] = storeObject(value as TypedObject, recentlyStoredObjects);
		}
	}
}

/**
 * Remove an object from all lists in the store
 */
function removeObjectFromLists<T extends TypedObject>(object: T) {
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
}

/**
 * Auto refresh an object based on a condition and a callback. Returns the timeout ID for the auto-refresh.
 * NOTE: Use the timeout ID to clear the auto-refresh when the object is no longer needed (eg: when the component is unmounted)
 */
const registeredAutoRefreshes: AnyObject = {};

export async function autoRefreshObject<T extends TypedObject>(object: T, condition: (object: T) => boolean, callback: (object: T) => Promise<T>, interval = 3000) {
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

	// Save the timeoutId to the object so it can be cleared when the object refresh is no longer needed
	const timeoutId = setTimeout(() => autoRefreshObject(object, condition, callback, interval), interval);
	registeredAutoRefreshes[object.__type + ":" + object.id] = timeoutId;
}

export async function stopAutoRefreshObject<T extends TypedObject>(object: T) {
	const timeoutId = registeredAutoRefreshes[object.__type + ":" + object.id];

	timeoutId && clearTimeout(timeoutId);
}
