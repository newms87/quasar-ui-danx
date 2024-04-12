/**
 *
 * @param array
 * @param item
 * @param newItem
 * @returns {*[]}
 */
export function replace(array, item, newItem = undefined) {
  const index =
    typeof item === "function" ? array.findIndex(item) : array.indexOf(item);
  if (index === false) {
    console.error("Item not found in array", item, array);
    throw new Error("Item not found in array");
  }
  const newArray = [...array];
  newItem !== undefined
    ? newArray.splice(index, 1, newItem)
    : newArray.splice(index, 1);
  return newArray;
}

export function remove(array, item) {
  return replace(array, item);
}

/**
 * Remove duplicate items from an array using a callback to compare 2 elements
 * @param array
 * @param cb
 * @returns {*}
 */
export function uniqueBy(array, cb) {
  return array.filter((a, index, self) => {
    // Check if the current element 'a' is the first occurrence in the array
    return index === self.findIndex((b) => cb(a, b));
  });
}
