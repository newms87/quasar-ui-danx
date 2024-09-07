import { VNode } from "vue";
import { ActionOptions, ActionTargetItem } from "./actions";

export interface TableColumn<T = ActionTargetItem> {
	actionMenu?: ActionOptions<T>[];
	align?: string;
	category?: string;
	class?: string | object;
	field?: string;
	format?: (value: any, options: any) => any;
	hideContent?: boolean;
	shrink?: boolean;
	headerClass?: string | object;
	summaryClass?: string | object;
	columnClass?: string | object;
	innerClass?: string | object;
	style?: string | object;
	headerStyle?: string | object;
	isSavingRow?: boolean | (() => boolean);
	label: string;
	width?: number;
	maxWidth?: number;
	minWidth?: number;
	name: string;
	onClick?: (target: any) => void;
	required?: boolean;
	resizeable?: boolean;
	sortable?: boolean;
	sortBy?: string;
	sortByExpression?: string;
	titleColumns?: () => string[];
	vnode?: (row?) => VNode | any;
}
