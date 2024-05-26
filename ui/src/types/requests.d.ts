import { AnyObject } from "./shared";

export interface RequestApi {
	abortControllers: { [key: string]: { abort: AbortController, timestamp: number } };

	url(url: string): string;

	call(url: string, options?: RequestCallOptions): Promise<any>;

	get(url: string, options?: RequestCallOptions): Promise<any>;

	post(url: string, data?: object, options?: RequestCallOptions): Promise<any>;
}

export interface HttpResponse {
	headers: any;
	data?: any;
	ok?: boolean;

	blob(): any;
}

export interface RequestOptions {
	baseUrl?: string;
	headers?: AnyObject;
	onUnauthorized?: (result: any, response: Response) => object;
	onAppVersionMismatch?: (version) => void;
}

export interface RequestCallOptions extends RequestInit {
	abortOn?: string;
}

