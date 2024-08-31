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
		return oldObject;
	}

	// Reference to the reactive version of the object so we can update all the child relationships and return the reactive object
	const reactiveObject = oldObject || shallowReactive(newObject);

	// Make sure to store the object in the recently stored objects to avoid infinite recursion
	recentlyStoredObjects[objectKey] = reactiveObject;

	// Recursively store all the children of the object as well
	for (const key of Object.keys(newObject)) {
		const value = newObject[key];
		if (Array.isArray(value) && value.length > 0) {
			for (const index in value) {
				if (value[index] && typeof value[index] === "object") {
					newObject[key][index] = storeObject(value[index], recentlyStoredObjects);
				}
			}
		} else if (value?.__type) {
			// @ts-expect-error __type is guaranteed to be set in this case
			newObject[key] = storeObject(value as TypedObject, recentlyStoredObjects);
		}
	}

	Object.assign(reactiveObject, newObject);

	if (!oldObject) {
		// Store the reactive object in the store if there was not already one existing
		store.set(objectKey, reactiveObject);
	}

	return reactiveObject;
}

export async function autoRefreshObject<T extends TypedObject>(object: T, condition: (object: T) => boolean, callback: (object: T) => Promise<T>, interval = 3000) {
	if (!object?.id || !object?.__type) {
		throw new Error("Invalid stored object. Cannot auto-refresh");
	}

	if (condition(object)) {
		const refreshedObject = await callback(object);

		if (!refreshedObject.id) {
			return FlashMessages.error(`Failed to refresh ${object.__type} (${object.id}) status: ` + object.name);
		}

		storeObject(refreshedObject);
	}

	setTimeout(() => autoRefreshObject(object, condition, callback), interval);
}
