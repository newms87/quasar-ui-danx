export interface HttpResponse {
	headers: any;
	data?: any;
	ok?: boolean;

	blob(): any;
}

export interface RequestOptions {
	baseUrl?: string;
	headers?: object;
}
