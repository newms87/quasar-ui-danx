import { ActionOptions, ActionTargetItem, ResourceAction } from "./actions";
import { AnyObject, ComputedRef, LabelValueItem, Ref } from "./shared";

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

export interface ListControlsRoutes<T = ActionTargetItem> {
	list(pager?: ListControlsPagination): Promise<PagedItems>;

	summary?(filter?: ListControlsFilter): Promise<AnyObject>;

	details?(target: T): Promise<T>;

	detailsAndStore?(target: T): Promise<T>;

	relation?(target: T, relation: string): Promise<T>;

	more?(pager: ListControlsPagination): Promise<T[]>;

	fieldOptions?(filter?: AnyObject): Promise<AnyObject>;

	applyAction?(action: string | ResourceAction | ActionOptions, target: T | null, data?: object): Promise<AnyObject>;

	batchAction?(action: string | ResourceAction | ActionOptions, targets: T[], data: object): Promise<AnyObject>;

	export?(filter?: ListControlsFilter, name?: string): Promise<void>;
}

export interface ListControlsOptions {
	label?: string,
	routes: ListControlsRoutes;
	urlPattern?: RegExp | null;
	filterDefaults?: Record<string, object>;
	refreshFilters?: boolean;
	isListEnabled?: boolean;
	isSummaryEnabled?: boolean;
	isDetailsEnabled?: boolean;
	isFieldOptionsEnabled?: boolean;
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

export interface PagedItems<T = ActionTargetItem> {
	data: T[] | undefined;
	meta: {
		total: number;
		last_page?: number;
	} | undefined;
}

export interface ListController<T = ActionTargetItem> {
	name: string;
	label: string;
	pagedItems: Ref<PagedItems<T> | null>;
	activeFilter: Ref<ListControlsFilter>;
	globalFilter: Ref<ListControlsFilter>;
	filterActiveCount: ComputedRef<number>;
	showFilters: Ref<boolean>;
	summary: Ref<object | null>;
	selectedRows: Ref<T[]>;
	isLoadingList: Ref<boolean>;
	isLoadingFilters: Ref<boolean>;
	isLoadingSummary: Ref<boolean>;
	pager: ComputedRef<{
		perPage: number;
		page: number;
		filter: ListControlsFilter;
		sort: object[] | undefined;
	}>;
	pagination: Ref<ListControlsPagination>;
	activeItem: Ref<T | null>;
	activePanel: Ref<string | null>;

	// List Controls
	initialize: (updateOptions?: Partial<ListControlsOptions>) => void;
	setOptions: (updateOptions: Partial<ListControlsOptions>) => void;
	resetPaging: () => void;
	setPagination: (updated: Partial<ListControlsPagination>) => void;
	setSelectedRows: (selection: T[]) => void;
	clearSelectedRows: () => void;
	loadList: (filter?: ListControlsFilter) => Promise<void>;
	loadSummary: (filter?: ListControlsFilter) => Promise<void>;
	loadListAndSummary: (filter?: ListControlsFilter) => Promise<void>;
	loadMore: (index: number, perPage?: number) => Promise<boolean>;
	loadFieldOptions: () => Promise<void>;
	getActiveItemDetails: () => Promise<void>;
	refreshAll: () => Promise<void[]>;
	exportList: (filter?: ListControlsFilter) => Promise<void>;
	setActiveItem: (item: T | null) => void;
	getNextItem: (offset: number) => Promise<void>;
	activatePanel: (item: T | null, panel: string) => void;
	setActiveFilter: (filter?: ListControlsFilter) => void;
	applyFilterFromUrl: (url: string, filters?: Ref<FilterGroup[]> | null) => void;
	getFieldOptions: (field: string) => any[];
}
