import ExifReader from "exifreader";
import { UploadedFile } from "../types";
import { useCompatibility } from "./compatibility";
import { FlashMessages } from "./FlashMessages";

export async function resolveFileLocation(file: UploadedFile, waitMessage: string | null = null) {
	if (file.location) {
		return file.location;
	}

	try {
		const tags = await ExifReader.load(file.blobUrl || file.url || "", {
			expanded: true
		});
		if (tags.gps) {
			return {
				latitude: tags.gps.Latitude,
				longitude: tags.gps.Longitude
			};
		}
	} catch (error) {
		console.error("Failed to load EXIF data from file:", error);
	}

	try {
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
		} else if (window.location.href.match("localhost")) {
			// XXX: Special case for local development so we can test without https
			return {
				latitude: 37.7749,
				longitude: -122.4194,
				accuracy: 1,
				altitude: 0,
				altitudeAccuracy: 0
			};
		}

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
