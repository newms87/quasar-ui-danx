/**
 * Replace an item in an array with a new item
 */
export function replace(array: any[], item: any, newItem = undefined, appendIfMissing = false) {
	const index: any = typeof item === "function" ? array.findIndex(item) : array.indexOf(item);
	if (index === false || index === -1) {
		return appendIfMissing ? [...array, newItem] : array;
	}

	const newArray = [...array];
	newItem !== undefined
			? newArray.splice(index, 1, newItem)
			: newArray.splice(index, 1);
	return newArray;
}

/**
 * Remove an item from an array
 */
export function remove(array: any[], item: any) {
	return replace(array, item);
}

/**
 * Remove duplicate items from an array using a callback to compare 2 elements
 */
export function uniqueBy(array: any[], cb: (a: any, b: any) => boolean) {
	return array.filter((a, index, self) => {
		// Check if the current element 'a' is the first occurrence in the array
		return index === self.findIndex((b) => cb(a, b));
	});
}
