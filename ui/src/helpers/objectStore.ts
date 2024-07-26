import { uid } from "quasar";
import { ShallowReactive, shallowReactive } from "vue";
import { TypedObject } from "../types";

const store = new Map<string, any>();

/**
 * Store an object in the object store via type + id
 * Returns the stored object that should be used instead of the passed object as the returned object is shared across the system
 */
export function storeObject<T extends TypedObject>(newObject: T): ShallowReactive<T> {
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

	// Retrieve the existing object if it already exists in the store
	const oldObject = store.get(objectKey);

	// If an old object exists, and it is newer than the new object, do not store the new object, just return the old
	// @ts-expect-error __timestamp is guaranteed to be set in this case on both old and new
	if (oldObject && newObject.__timestamp <= oldObject.__timestamp) {
		return oldObject;
	}

	// Recursively store all the children of the object as well
	for (const key of Object.keys(newObject)) {
		const value = newObject[key];
		if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
			for (const index in value) {
				newObject[key][index] = storeObject(value[index]);
			}
		} else if (value?.__type) {
			// @ts-expect-error newObject[key] is guaranteed to be a TypedObject
			newObject[key] = storeObject(value);
		}
	}

	// Update the old object with the new object properties
	if (oldObject) {
		Object.assign(oldObject, newObject);
		return oldObject;
	}

	const reactiveObject = shallowReactive(newObject);
	store.set(objectKey, reactiveObject);
	return reactiveObject;
}
