import { FilterGroup, ListController, ListControlsRoutes } from "src/types/controls";
import { FormField } from "src/types/forms";
import { TableColumn } from "src/types/tables";
import { VNode } from "vue";
import { AnyObject, ComputedRef, TypedObject } from "./shared";

export interface ActionTargetItem extends TypedObject {
	isSaving?: boolean;
	updated_at?: string;
}

export type ActionTarget<T = ActionTargetItem> = T[] | T | null;

export interface ActionPanel<T = ActionTargetItem> {
	name: string | number;
	label: string;
	category?: string;
	class?: string | object;
	enabled?: boolean | ((target: T) => boolean);
	tabVnode?: (target: T | null | undefined, activePanel: string | number) => VNode | any;
	vnode: (target: T | null | undefined) => VNode | any;
}

export interface ActionOptions<T = ActionTargetItem> {
	name: string;
	alias?: string;
	label?: string;
	icon?: string | object;
	iconClass?: string | object;
	menu?: boolean;
	batch?: boolean;
	category?: string;
	class?: string;
	debounce?: number;
	useInputFromConfirm?: boolean;
	optimistic?: boolean | ((action: ActionOptions<T>, target: T | null, input: any) => void);
	vnode?: (target: ActionTarget<T>, data: any) => VNode | any;
	enabled?: (target: ActionTarget<T>) => boolean;
	batchEnabled?: (targets: T[]) => boolean;
	onAction?: (action: string | ResourceAction<T> | ActionOptions<T>, target: T | null, input?: AnyObject | any) => Promise<AnyObject | any> | void;
	onBatchAction?: (action: string | ResourceAction<T> | ActionOptions<T>, targets: T[], input: any) => Promise<AnyObject | any> | void;
	onStart?: (action: ActionOptions<T> | null, targets: ActionTarget<T>, input: any) => boolean;
	onSuccess?: (result: any, targets: ActionTarget<T>, input: any) => any;
	onBatchSuccess?: (result: any, targets: T[], input: any) => any;
	onError?: (result: any, targets: ActionTarget<T>, input: any) => any;
	onFinish?: (result: any, targets: ActionTarget<T>, input: any) => any;
}

export interface ActionGlobalOptions extends Partial<ActionOptions> {
	routes?: ListControlsRoutes;
	controls?: ListController;
}

export interface ResourceAction<T = ActionTargetItem> extends ActionOptions<T> {
	isApplying: boolean;
	trigger: (target?: ActionTarget<T>, input?: any) => Promise<any>;
	__type: string;
}

export interface ActionController<T = ActionTargetItem> {
	// Actions
	action?: (actionName: string, target?: T | null, input?: any) => Promise<any | void>;
	getAction?: (actionName: string, actionOptions?: Partial<ActionOptions>) => ResourceAction;
	getActions?: (names?: string[]) => ResourceAction[];
	extendAction?: (actionName: string, extendedId: string | number, actionOptions: Partial<ActionOptions>) => ResourceAction;
	modifyAction?: (actionName: string, actionOptions: Partial<ActionOptions>) => ResourceAction;
	batchActions?: ResourceAction[];
	menuActions?: ResourceAction[];
	columns?: TableColumn[];
	filters?: ComputedRef<FilterGroup[]>;
	fields?: FormField[];
	panels?: ActionPanel[];
	routes?: ListControlsRoutes;
}
