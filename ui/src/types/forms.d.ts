import { VNode } from "vue";
import { AnyObject } from "./shared";

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
	vnode?: ((field: FormFieldOption, input?: AnyObject) => VNode | any);
	component?: any;
	clearable?: boolean;
	required?: boolean;
	required_group?: string;
	default_value?: any;
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

export interface RenderedFormProps {
	values?: FormFieldValue[] | object | null;
	form: Form;
	noLabel?: boolean;
	showName?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	saving?: boolean;
	clearable?: boolean;
	emptyValue?: string | number | boolean;
	canModifyVariations?: boolean;
	fieldClass?: string;
	savingClass?: string;
	savedAt?: string;
}
