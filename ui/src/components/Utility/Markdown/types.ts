export type LineType = "paragraph" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "ul" | "ol" | "code" | "blockquote";

export interface LineTypeOption {
  value: LineType;
  label: string;
  icon: string;
  shortcut: string;
}

export interface PopoverPosition {
  x: number;
  y: number;
}
