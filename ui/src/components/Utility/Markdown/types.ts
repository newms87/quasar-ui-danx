export type LineType = "paragraph" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "ul" | "ol" | "code" | "blockquote";

export interface LineTypeOption {
  value: LineType;
  label: string;
  icon: string;
  shortcut: string;
}

export type ContextMenuContext = "table" | "list" | "code" | "text";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;  // Optional - not needed if has children
  disabled?: boolean;
  children?: ContextMenuItem[];  // For nested submenus
  divider?: boolean;  // For visual dividers between items
}

export interface ContextMenuGroup {
  id: string;
  label: string;
  items: ContextMenuItem[];
}
