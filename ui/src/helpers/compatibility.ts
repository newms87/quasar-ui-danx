import { useGeolocation } from "@vueuse/core";
import { sleep } from "../helpers";
import { computed } from "vue";

let isLoaded = false;
let hasAlreadyWaited = false;
let geolocationError = null;
let hasLocation = null;
let geolocation = null;

export function useCompatibility(requestLocation = true) {
  if (!isLoaded && requestLocation) {
    const { coords, error, locatedAt } = useGeolocation();
    geolocationError = error;
    hasLocation = locatedAt;
    geolocation = coords;
    isLoaded = true;
  }

  const isLocationSupported = "geolocation" in navigator;

  const location = computed(() => {
    if (hasLocation?.value) {
      return geolocation?.value;
    }
    return null;
  });

  const isCompatible = computed(() => !geolocationError?.value && !!hasLocation?.value);

  /**
   * Wait for location to be available and returns the location when it is or null after the wait period times out.
   * @param maxWait
   */
  const waitForLocation = async (maxWait = 3000) => {
    // We only should wait once, if we already waited and failed, its unlikely the location will be available at a
    // later time
    if (hasAlreadyWaited) {
      return location;
    }

    hasAlreadyWaited = true;
    let waitTime = 0;
    while (!location.value) {
      await sleep(100);
      waitTime += 100;

      if (waitTime > maxWait) {
        return null;
      }
    }

    return location;
  };

  return {
    isLocationSupported,
    isCompatible,
    geolocationError,
    hasLocation,
    location,
    waitForLocation
  };
}
