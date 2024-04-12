import { watch } from "vue";

/**
 * Sleep function to be used in conjuction with async await:
 *
 * eg: await sleep(5000);
 *
 * @param delay
 * @returns {Promise<any>}
 */
export function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Wait for a ref to have a value and then resolve the promise
 *
 * @param ref
 * @param value
 * @returns {Promise<void>}
 */
export function waitForRef(ref, value) {
    return new Promise<void>((resolve) => {
        watch(ref, (newValue) => {
            if (newValue === value) {
                resolve();
            }
        });
    });
}

/**
 * Returns a number that is constrained to the given range.
 * @param min
 * @param max
 * @param value
 * @returns {number}
 */
export function minmax(min, max, value) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Convert meters to miles
 * @param meters
 * @returns {number}
 */
export function metersToMiles(meters) {
    return meters * 0.000621371;
}

/**
 * Convert miles to meters
 * @param miles
 * @returns {number}
 */
export function milesToMeters(miles) {
    return miles / 0.000621371;
}

/**
 * Parses a string for Lat and Long coords
 * @param location
 * @returns {null|{lng: number, lat: number}}
 */
export function parseCoords(location) {
    const latLong = location.split(",");

    if (latLong.length === 2) {
        const lat = parseFloat(latLong[0].trim());
        const lng = parseFloat(latLong[1].trim());

        if (!isNaN(lat) && !isNaN(lng)) {
            return {
                lat,
                lng
            };
        }
    }

    return null;
}
