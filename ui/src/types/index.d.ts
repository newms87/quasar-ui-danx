import { ActionController, ActionTargetItem } from "./actions";
import { ListController } from "./controls";

export * from "./actions";
export * from "./config";
export * from "./controls";
export * from "./dialogs";
export * from "./fields";
export * from "./files";
export * from "./formats";
export * from "./forms";
export * from "./requests";
export * from "./shared";
export * from "./tables";
export * from "./widgets";

export type DanxController<T = ActionTargetItem> = ActionController<T> & ListController<T>;
