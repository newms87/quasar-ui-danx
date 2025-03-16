import { AnyObject } from "../types";

export function importJson(file: File): Promise<AnyObject> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		let jsonData = null;

		reader.onload = async (e) => {
			try {
				jsonData = JSON.parse(e.target?.result as string);
				resolve(jsonData);
			} catch (error) {
				console.error("Invalid JSON file:", error);
				reject(error);
			}
		};

		reader.readAsText(file);
	});
}
