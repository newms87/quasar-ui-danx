import { Ref, watch } from "vue";

/**
 * Sleep function to be used in conjunction with async await:
 *
 * eg: await sleep(5000);
 */
export function sleep(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Wait for a ref to have a value and then resolve the promise
 */
export function waitForRef(ref: Ref, value: any) {
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
 */
export function minmax(min: number, max: number, value: number) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number) {
    return meters * 0.000621371;
}

/**
 * Convert miles to meters
 */
export function milesToMeters(miles: number) {
    return miles / 0.000621371;
}

/**
 * Parses a string for Lat and Long coords
 */
export function parseCoords(location: string) {
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

/**
 * Increment a name by adding a number to the end of it or incrementing the number if it already exists
 */
export function incrementName(name: string) {
    name = (name || "New Item").trim();
    const match = name.match(/(\d+)$/);
    if (match) {
        return name.replace(/\d+$/, (match: string) => "" + (parseInt(match) + 1));
    }
    return `${name} 1`;
}
