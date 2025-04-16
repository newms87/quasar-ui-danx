import { AnyObject } from "./shared";

export interface ActiveRequest {
	requestPromise?: Promise<any>,
	abortController?: AbortController,
	timestamp: number
}

export interface RequestApi {
	activeRequests: {
		[key: string]: ActiveRequest
	};

	url(url: string): string;

	call(url: string, options?: RequestCallOptions): Promise<any>;

	get(url: string, options?: RequestCallOptions): Promise<any>;

	post(url: string, data?: object, options?: RequestCallOptions): Promise<any>;

	poll(url: string, options?: RequestCallOptions, interval?: number, fnUntil?: (response) => boolean): Promise<any>;
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
	requestKey?: string;
	waitOnPrevious?: boolean;
	useMostRecentResponse?: boolean;
	ignoreAbort?: boolean;
	params?: AnyObject;
}

