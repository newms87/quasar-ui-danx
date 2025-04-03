export type AnyObject = { [key: string]: any };

export interface TypedObject {
	id?: string | number;
	name?: string;
	__type: string;
	__timestamp?: number;
	__id?: string;

	[key: string]: TypedObject[] | any;
}

export interface LabelValueItem {
	label: string;
	value: string | number | boolean;
}
