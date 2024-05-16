export function setItem(key: string, value: any) {
	localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key: string, defaultValue: any = null) {
	const item = localStorage.getItem(key);
	try {
		return item ? JSON.parse(item) : defaultValue;
	} catch (e) {
		return undefined;
	}
}
