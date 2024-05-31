import { QInputProps } from "quasar";
import { FormField } from "./forms";

export interface TextFieldProps {
	modelValue?: string | number;
	field?: FormField;
	type?: QInputProps["type"];
	required?: boolean;
	label?: string;
	placeholder?: string;
	labelClass?: string;
	parentClass?: string;
	inputClass?: string;
	allowOverMax?: boolean;
	maxLength?: number;
	autogrow?: boolean;
	noLabel?: boolean;
	showName?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	debounce?: string | number;
	min?: number;
	max?: number;
}
