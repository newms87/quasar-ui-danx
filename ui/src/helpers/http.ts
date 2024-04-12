export const request = {
    async get(url, options = {}) {
        return fetch(url, {
            method: "get",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            ...options
        }).then((r) => r.json());
    },

    async post(url, data = {}, options = {}) {
        return fetch(url, {
            method: "post",
            body: JSON.stringify(data),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            ...options
        }).then((r) => r.json());
    }
};

/**
 * Fetches a resource list applying the filter. If there is a selected resource,
 * stores that resource from the already populated list. If that resource does not exist
 * also fetches that resource record from the endpoint, then adds it to the list if it
 * does not exist in the filtered list
 *
 * @param fetchFn
 * @param list
 * @param id
 * @param filter
 * @returns {Promise<void>}
 */
export async function fetchResourceListWithSelected(fetchFn, list, id, filter) {
    // First make sure we have the selected record, so we can always add it to the list
    let selectedResource;
    if (id) {
        selectedResource = list.value.find((c) => c.id === id) || (await fetchFn({ id }))[0];
    }

    // Get the filtered campaign list
    list.value = await fetchFn(filter);

    // If our selected campaign is not in the filtered list, add it
    if (selectedResource && !list.value.find((c) => c.id === id)) {
        list.value.push(selectedResource);
    }
}

/**
 * Returns the value of the URL parameter (if it is set)
 * @param key
 * @param url
 */
export function getUrlParam(key, url = undefined) {
    const params = new URLSearchParams(url?.replace(/.*\?/, "") || window.location.search);
    return params.get(key);
}
