import { danxOptions } from "../config";
import { AnyObject, HttpResponse } from "../types";
import { download } from "./download";

/**
 * Asynchronously load a file from the URL and trigger a download in the browser
 *
 * @param url
 * @param filename
 * @param postParams
 * @returns {Promise<void>}
 */
export async function downloadFile(url: string, filename = "", postParams: AnyObject | null = null) {
	let fetchOptions: AnyObject | undefined = undefined;

	if (postParams) {
		fetchOptions = {
			method: "POST",
			headers: {
				...danxOptions.value.request?.headers
			},
			body: JSON.stringify(postParams)
		};
	}

	const response: HttpResponse = await fetch(url, fetchOptions);

	if (!response.ok) {
		throw Error("File download failed: invalid response from server");
	}

	let errorMessage;

	// Handle a JSON response (which indicates an error occurred)
	try {
		const jsonResponse = JSON.parse(new TextDecoder().decode(response.data));
		console.error("Error downloading file:", jsonResponse);
		errorMessage = jsonResponse.message;
		if (jsonResponse.errors) {
			errorMessage = jsonResponse.errors[0].message;
		}
	} catch (e) {
		// we expect an error thrown for invalid JSON when the response is a file
	}

	if (errorMessage) {
		throw new Error("Failed to download file: " + errorMessage);
	}

	await downloadFileResponse(response, filename);
}

/**
 * Downloads a file from a response object w/ a file attachment
 *
 * @param response
 * @param filename
 */
export async function downloadFileResponse(response: HttpResponse, filename = "") {
	const contentDisposition = getResponseHeader(
			response,
			"content-disposition",
			""
	);

	const contentType = getResponseHeader(response, "content-type", "");

	const match = contentDisposition.match(/filename="([^"]+)"/);

	filename = filename || (match && match[1]) || "download.pdf";

	let data = response.data;
	if (!data) {
		data = await response.blob();
	}

	download(data, filename, contentType);
}

/**
 * Get a header from a response object
 * @param response
 * @param header
 * @param defaultValue
 * @returns {*}
 */
export function getResponseHeader(response: HttpResponse, header: string, defaultValue: any) {
	if (response.headers) {
		if (typeof response.headers.get === "function") {
			return response.headers.get(header) || defaultValue;
		} else {
			return response.headers[header] || defaultValue;
		}
	}
}
