import { VNode } from "vue";
import { ActionOptions } from "./actions";

export interface TableColumn {
	actionMenu?: ActionOptions[],
	align?: string,
	category?: string,
	class?: string | object,
	field?: string,
	format?: (value: any, options: any) => any,
	hideContent?: boolean,
	headerClass?: string | object,
	columnClass?: string | object,
	innerClass?: string | object,
	style?: string | object,
	headerStyle?: string | object,
	isSavingRow?: boolean | (() => boolean),
	label: string,
	width?: number;
	maxWidth?: number,
	minWidth?: number,
	name: string,
	onClick?: (target: any) => void,
	required?: boolean,
	resizeable?: boolean,
	sortable?: boolean,
	sortBy?: string,
	sortByExpression?: string,
	titleColumns?: () => string[],
	vnode?: (row?) => VNode | any,
}
