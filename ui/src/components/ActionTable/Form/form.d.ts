export interface FormField {
	id?: string;
	type?: string;
	name: string;
	label: string;
	component?: any;
	required?: boolean;
	required_group?: string;
}

export interface Form {
	id?: string;
	name?: string;
	variations?: number;
	fields: FormField[];
}

export interface FormFieldValue {
	name: string,
	value: any,
	variation?: string
}
