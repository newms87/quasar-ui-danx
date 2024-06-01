import { QInputProps } from "quasar";

export interface TextFieldProps {
	modelValue?: string | number;
	type?: QInputProps["type"];
	label?: string;
	required?: boolean;
	requiredLabel?: string;
	prependLabel?: boolean;
	placeholder?: string;
	labelClass?: string | object;
	inputClass?: string | object;
	allowOverMax?: boolean;
	maxLength?: number;
	autogrow?: boolean;
	noLabel?: boolean;
	showName?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	debounce?: string | number;
}
