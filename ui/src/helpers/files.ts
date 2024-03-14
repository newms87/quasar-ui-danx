import { FlashMessages, useCompatibility } from "danx/src/helpers";
import ExifReader from "exifreader";

export async function resolveFileLocation(file, waitMessage = null) {
  if (file.location) {
    return file.location;
  }

  try {
    const tags = await ExifReader.load(file.blobUrl || file.url, {
      expanded: true
    });
    if (tags.gps) {
      return {
        latitude: tags.gps.Latitude,
        longitude: tags.gps.Longitude
      };
    }

    const { waitForLocation, location } = useCompatibility();

    // Show a waiting for location message if we have not returned within 1 second
    if (waitMessage) {
      setTimeout(() => {
        if (!location.value && waitMessage) {
          FlashMessages.warning(waitMessage);
        }
      }, 1000);
    }

    // Wait for the browser to return the location (https only as http will not return a location)
    if (window.location.protocol === "https:") {
      await waitForLocation();
    }
    // Ignore the wait message if we already returned
    waitMessage = false;
    if (!location.value) {
      return null;
    }

    return {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
      accuracy: location.value.accuracy,
      altitude: location.value.altitude,
      altitudeAccuracy: location.value.altitudeAccuracy
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
