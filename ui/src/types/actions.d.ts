import { ComputedRef, Ref, ShallowRef, VNode } from "vue";

export interface ActionController {
	name: string;
	label: string;
	pagedItems: Ref<PagedItems | null>;
	activeFilter: Ref<ListControlsFilter>;
	globalFilter: Ref<ListControlsFilter>;
	filterActiveCount: ComputedRef<number>;
	showFilters: Ref<boolean>;
	summary: ShallowRef<object | null>;
	filterFieldOptions: Ref<AnyObject>;
	selectedRows: ShallowRef<ActionTargetItem[]>;
	isLoadingList: Ref<boolean>;
	isLoadingFilters: Ref<boolean>;
	isLoadingSummary: Ref<boolean>;
	pager: ComputedRef<{
		perPage: number;
		page: number;
		filter: ListControlsFilter;
		sort: object[] | undefined;
	}>;
	pagination: ShallowRef<ListControlsPagination>;
	activeItem: ShallowRef<ActionTargetItem | null>;
	activePanel: ShallowRef<string | null>;

	// Actions
	initialize: () => void;
	loadSummary: () => Promise<void>;
	resetPaging: () => void;
	setPagination: (updated: ListControlsPagination) => void;
	setSelectedRows: (selection: ActionTargetItem[]) => void;
	clearSelectedRows: () => void;
	loadList: (filter) => Promise<void>;
	loadMore: (index: number, perPage?: number) => Promise<boolean>;
	refreshAll: () => Promise<void[]>;
	exportList: (filter) => Promise<void>;
	setActiveItem: (item: ActionTargetItem | null) => void;
	getNextItem: (offset: number) => Promise<void>;
	activatePanel: (item: ActionTargetItem | null, panel: string) => void;
	setActiveFilter: (filter: ListControlsFilter) => void;
	applyFilterFromUrl: (url: string, filterFields?: Ref<FilterGroup[]> | null) => void;
	getFieldOptions: (field: string) => any[];
}

export interface LabelValueItem {
	label: string;
	value: string | number | boolean;
}

export interface FilterField {
	name: string;
	label: string;
	type: string;
	options?: string[] | number[] | LabelValueItem[];
	inline?: boolean;
}

export interface FilterGroup {
	name?: string;
	flat?: boolean;
	fields: FilterField[];
}

export interface ActionPanel {
	name: string | number;
	label: string;
	category?: string;
	class?: string | object;
	enabled?: boolean | (() => boolean);
	tabVnode?: (activePanel: string | number) => VNode | any;
	vnode: (activePanel: string) => VNode | any;
}

export interface ListControlsFilter {
	[key: string]: object | object[] | null | undefined | string | number | boolean;
}

export interface ListControlsRoutes {
	list: (pager: object) => Promise<ActionTargetItem[]>;
	details?: (item: object) => Promise<ActionTargetItem> | null;
	summary?: (filter: object | null) => Promise<object> | null;
	filterFieldOptions?: (filter: object | null) => Promise<object> | null;
	more?: (pager: object) => Promise<ActionTargetItem[]> | null;
	export: (filter: object) => Promise<void>;
}

export interface ListControlsOptions {
	label?: string,
	routes: ListControlsRoutes;
	urlPattern?: RegExp | null;
	filterDefaults?: Record<string, object>;
	refreshFilters?: boolean;
}

export interface ListControlsPagination {
	__sort: object[] | null;
	sortBy: string | null;
	descending: boolean;
	page: number;
	rowsNumber: number;
	rowsPerPage: number;
}

export interface PagedItems {
	data: ActionTargetItem[] | undefined;
	meta: {
		total: number;
		last_page?: number;
	} | undefined;
}

export type AnyObject = { [key: string]: any };

export type ActionTargetItem = AnyObject & {
	id: number | string;
	isSaving?: Ref<boolean>;
	__type: string;
};

export type ActionTarget = ActionTargetItem[] | ActionTargetItem | null;

export interface ActionOptions {
	name?: string;
	label?: string;
	menu?: boolean;
	batch?: boolean;
	category?: string;
	class?: string;
	debounce?: number;
	trigger?: (target: ActionTarget, input: any) => Promise<any>;
	vnode?: ((target: ActionTarget) => VNode) | any;
	enabled?: (target: object) => boolean;
	batchEnabled?: (targets: object[]) => boolean;
	optimistic?: (action: ActionOptions, target: ActionTargetItem | null, input: any) => void;
	onAction?: (action: string | null | undefined, target: ActionTargetItem | null, input: any) => Promise<any> | void;
	onBatchAction?: (action: string | null | undefined, targets: ActionTargetItem[], input: any) => Promise<any>;
	onStart?: (action: ActionOptions | null, targets: ActionTarget, input: any) => boolean;
	onSuccess?: (result: any, targets: ActionTarget, input: any) => any;
	onBatchSuccess?: (result: any, targets: ActionTargetItem[], input: any) => any;
	onError?: (result: any, targets: ActionTarget, input: any) => any;
	onFinish?: (result: any, targets: ActionTarget, input: any) => any;
}
