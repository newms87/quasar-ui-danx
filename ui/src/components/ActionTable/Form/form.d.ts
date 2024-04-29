import { VNode } from "vue";

export interface FormFieldOption {
	value: string;
	label: string;
}

export interface FormField {
	id?: string;
	type?: string;
	name: string;
	label: string;
	vnode?: ((props) => VNode | any);
	component?: any;
	required?: boolean;
	required_group?: string;
	options?: FormFieldOption[];
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
