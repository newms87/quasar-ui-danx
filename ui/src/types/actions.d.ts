import { VNode } from "vue";
import { TypedObject } from "./shared";

export interface ActionPanel {
	name: string | number;
	label: string;
	category?: string;
	class?: string | object;
	enabled?: boolean | (() => boolean);
	tabVnode?: (activePanel: string | number) => VNode | any;
	vnode: (activePanel: string) => VNode | any;
}

export interface ActionTargetItem extends TypedObject {
	isSaving?: boolean;
}

export type ActionTarget = ActionTargetItem[] | ActionTargetItem | null;

export interface ActionOptions {
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
	optimistic?: boolean | ((action: ActionOptions, target: ActionTargetItem | null, input: any) => void);
	vnode?: ((target: ActionTarget) => VNode) | any;
	enabled?: (target: object) => boolean;
	batchEnabled?: (targets: object[]) => boolean;
	onAction?: (action: string | null | undefined, target: ActionTargetItem | null, input: any) => Promise<any> | void;
	onBatchAction?: (action: string | null | undefined, targets: ActionTargetItem[], input: any) => Promise<any>;
	onStart?: (action: ActionOptions | null, targets: ActionTarget, input: any) => boolean;
	onSuccess?: (result: any, targets: ActionTarget, input: any) => any;
	onBatchSuccess?: (result: any, targets: ActionTargetItem[], input: any) => any;
	onError?: (result: any, targets: ActionTarget, input: any) => any;
	onFinish?: (result: any, targets: ActionTarget, input: any) => any;
}

export interface ActionOptionsPartial extends ActionOptions {
	name?: string;
}

export interface ResourceAction extends ActionOptions {
	isApplying: boolean;
	trigger: (target?: ActionTarget, input?: any) => Promise<any>;
	__type: string;
}
