import { reactive, UnwrapNestedRefs } from "vue";

export interface TypedObject {
	id?: string | number;
	name?: string;
	__type: string;

	[key: string]: TypedObject[] | any;
}

const store = new Map<string, any>();

/**
 * Store an object in the object store via type + id
 * Returns the stored object that should be used instead of the passed object as the returned object is shared across the system
 *
 * @param {TypedObject} newObject
 * @returns {TypedObject}
 */
export function storeObject<T extends TypedObject>(newObject: T): UnwrapNestedRefs<T> {
	const id = newObject.id || newObject.name;
	const type = newObject.__type;
	if (!id || !type) return reactive(newObject);

	const objectKey = `${type}:${id}`;

	const oldObject: UnwrapNestedRefs<T> | undefined = store.get(objectKey);

	// Apply all properties from newObject to oldObject then store and return the updated object
	if (oldObject) {
		const oldTimestamp = oldObject.__timestamp || oldObject.updated_at;
		const newTimestamp = newObject.__timestamp || newObject.updated_at;
		// If the old object is newer, do not store the new object, just return the old
		if (oldTimestamp && newTimestamp && newTimestamp < oldTimestamp) {
			return oldObject;
		}
	}

	// Recursively store all the children of the object as well
	for (const key of Object.keys(newObject)) {
		const value = newObject[key];
		if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
			for (const index in value) {
				newObject[key][index] = storeObject(value[index]);
			}
		}
	}

	// Update the old object with the new object properties
	if (oldObject) {
		// If the new object is newer, apply all properties from the new object to the old object
		Object.assign(oldObject, newObject);
		return oldObject;
	}

	const reactiveObject = reactive(newObject);
	store.set(objectKey, reactiveObject);
	return reactiveObject;
}
