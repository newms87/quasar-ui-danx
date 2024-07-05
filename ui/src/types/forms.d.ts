import { AnyObject } from "src/types/shared";
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
	placeholder?: string;
	enabled?: boolean | ((input: AnyObject) => boolean);
	vnode?: ((props) => VNode | any);
	component?: any;
	clearable?: boolean;
	required?: boolean;
	required_group?: string;
	toggleIndeterminate?: boolean;
	inline?: boolean;
	maxLength?: number;
	minLength?: number;
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
