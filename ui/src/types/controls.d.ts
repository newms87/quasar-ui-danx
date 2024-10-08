import { FormField } from "src/types/forms";
import { TableColumn } from "src/types/tables";
import { ComputedRef, Ref, ShallowRef } from "vue";
import { ActionOptions, ActionPanel, ActionTargetItem, ResourceAction } from "./actions";
import { AnyObject, LabelValueItem } from "./shared";

export interface ListControlsFilter {
	[key: string]: object | object[] | null | undefined | string | number | boolean;
}

export interface FilterableField {
	name: string;
	label: string;
	type: string;
	options?: string[] | number[] | LabelValueItem[];
	inline?: boolean;
}

export interface FilterGroup {
	name?: string;
	flat?: boolean;
	fields: FilterableField[];
}

export interface ListControlsRoutes {
	list(pager?: ListControlsPagination): Promise<ActionTargetItem[]>;

	summary?(filter?: ListControlsFilter): Promise<AnyObject>;

	details?(target: ActionTargetItem): Promise<ActionTargetItem>;

	detailsAndStore?(target: ActionTargetItem): Promise<ActionTargetItem>;

	relation?(target: ActionTargetItem, relation: string): Promise<ActionTargetItem>;

	more?(pager: ListControlsPagination): Promise<ActionTargetItem[]>;

	fieldOptions?(filter?: AnyObject): Promise<AnyObject>;

	applyAction?(action: string | ResourceAction | ActionOptions, target: ActionTargetItem | null, data?: object): Promise<AnyObject>;

	batchAction?(action: string | ResourceAction | ActionOptions, targets: ActionTargetItem[], data: object): Promise<AnyObject>;

	export?(filter?: ListControlsFilter, name?: string): Promise<void>;
}

export interface ListControlsOptions {
	label?: string,
	routes: ListControlsRoutes;
	urlPattern?: RegExp | null;
	filterDefaults?: Record<string, object>;
	refreshFilters?: boolean;
}

export interface ListControlsPagination {
	__sort?: object[] | null;
	sortBy?: string | null;
	descending?: boolean;
	page?: number;
	rowsNumber?: number;
	rowsPerPage?: number;
	perPage?: number;
	filter?: ListControlsFilter;
}

export interface PagedItems {
	data: ActionTargetItem[] | undefined;
	meta: {
		total: number;
		last_page?: number;
	} | undefined;
}

export interface ListController {
	name: string;
	label: string;
	pagedItems: Ref<PagedItems | null>;
	activeFilter: Ref<ListControlsFilter>;
	globalFilter: Ref<ListControlsFilter>;
	filterActiveCount: ComputedRef<number>;
	showFilters: Ref<boolean>;
	summary: ShallowRef<object | null>;
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

	// List Controls
	initialize: () => void;
	resetPaging: () => void;
	setPagination: (updated: Partial<ListControlsPagination>) => void;
	setSelectedRows: (selection: ActionTargetItem[]) => void;
	clearSelectedRows: () => void;
	loadList: (filter?: ListControlsFilter) => Promise<void>;
	loadSummary: (filter?: ListControlsFilter) => Promise<void>;
	loadListAndSummary: (filter?: ListControlsFilter) => Promise<void>;
	loadMore: (index: number, perPage?: number) => Promise<boolean>;
	loadFieldOptions: () => Promise<void>;
	getActiveItemDetails: () => Promise<void>;
	refreshAll: () => Promise<void[]>;
	exportList: (filter?: ListControlsFilter) => Promise<void>;
	setActiveItem: (item: ActionTargetItem | null) => void;
	getNextItem: (offset: number) => Promise<void>;
	activatePanel: (item: ActionTargetItem | null, panel: string) => void;
	setActiveFilter: (filter?: ListControlsFilter) => void;
	applyFilterFromUrl: (url: string, filters?: Ref<FilterGroup[]> | null) => void;
	getFieldOptions: (field: string) => any[];
}

export interface ActionController {
	// Actions
	action?: (actionName: string, target?: ActionTargetItem | null, input?: any) => Promise<any | void>;
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
