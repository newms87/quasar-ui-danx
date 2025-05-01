import { AnyObject } from "../../types";

export type DropZoneResolver = ((e: DragEvent) => HTMLElement) | string | null;
export type DragAndDropCallback = ((e: DragEvent, data: DraggableData) => void) | null;
export type DraggableData = AnyObject | string | number | null;

/**
 * Drag and Drop basic functionality for dragging elements and firing events on drag start, drag over and drag end
 */
export class DragAndDrop {
	options: {
		direction?: string,
		hideDragImage?: boolean,
		showPlaceholder?: boolean,
		allowDropZoneChange?: boolean,
		disabled?: boolean,
	} = { direction: "vertical", hideDragImage: false };

	// State
	startY = 0;
	startX = 0;
	startSize = 0;
	cursorY = 0;
	cursorX = 0;
	onStartCb: DragAndDropCallback = null;
	onEndCb: DragAndDropCallback = null;
	onDropCb: DragAndDropCallback = null;
	onDraggingCb: DragAndDropCallback = null;
	dropZoneResolver: DropZoneResolver = null;
	currentDropZone: HTMLElement | null = null;
	draggableData: DraggableData = null;
	// Used to abort dragging event listeners on the element
	abortController: AbortController | null = null;

	constructor(options = {}) {
		// Options
		options = {
			disabled: false,
			direction: "vertical",
			hideDragImage: false,
			...options
		};

		this.setOptions(options);
	}

	/**
	 * Set the options for the drag and drop instance
	 */
	setOptions(options = {}) {
		this.options = { ...this.options, ...options };
		return this;
	}

	/**
	 * Returns if the list is stacked vertically or horizontally
	 */
	isVertical() {
		return this.options.direction === "vertical";
	}

	/**
	 * Set the target drop zone for draggable elements
	 */
	setDropZone(dropZone: DropZoneResolver) {
		this.dropZoneResolver = dropZone;
		return this;
	}

	/**
	 * Callback that fires when an element has started dragging
	 */
	onStart(cb: DragAndDropCallback) {
		this.onStartCb = cb;
		return this;
	}

	/**
	 * Callback that fires when an element has stopped dragging
	 */
	onEnd(cb: DragAndDropCallback) {
		this.onEndCb = cb;
		return this;
	}

	/**
	 * Callback that fires when the dragging element is moved
	 */
	onDragging(cb: DragAndDropCallback) {
		this.onDraggingCb = cb;
		return this;
	}

	/**
	 * Callback that fires when the dragging element has been dropped
	 */
	onDrop(cb: DragAndDropCallback) {
		this.onDropCb = cb;
		return this;
	}

	/**
	 * Start listening for drag events and prepare an element for drag/drop
	 */
	dragStart(e: DragEvent, data: DraggableData) {
		if (this.options.disabled) return;
		this.currentDropZone = this.getDropZone(e);

		if (this.currentDropZone) {
			this.startY = e.clientY;
			this.startX = e.clientX;
			this.startSize = this.getDropZoneSize();
			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = "move";
				e.dataTransfer.dropEffect = "move";
			}
			this.draggableData = data;
			this.abortController = new AbortController();
			const options = { signal: this.abortController.signal };
			document.addEventListener("dragenter", (e) => this.dragEnter(e), options);
			document.addEventListener("dragover", (e) => this.dragOver(e), options);
			document.addEventListener("drop", (e) => this.drop(e), options);
			this.onStartCb && this.onStartCb(e, this.draggableData);

			if (e.dataTransfer && this.options.hideDragImage) {
				e.dataTransfer.setDragImage(new Image(), 0, 0);
			}
		} else {
			console.error("Drop zone was not found", e, data);
		}
	}

	/**
	 * Clean up event listeners after dragging is done
	 */
	dragEnd(e: DragEvent) {
		if (this.options.disabled) return;
		this.currentDropZone = null;
		this.abortController?.abort();
		this.onEndCb && this.onEndCb(e, this.draggableData);
		this.draggableData = null;
	}

	/**
	 * The dragging element has entered a new target
	 */
	dragEnter(e: DragEvent) {
		e.preventDefault();
	}

	/**
	 * The dragging element is moving
	 */
	dragOver(e: DragEvent) {
		if (this.options.disabled) return;
		e.preventDefault();
		this.cursorY = e.clientY;
		this.cursorX = e.clientX;
		this.onDraggingCb && this.onDraggingCb(e, this.draggableData);
	}

	/**
	 * Handle dropping the element into its correct position
	 */
	drop(e: DragEvent) {
		if (this.options.disabled) return;
		e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		e.preventDefault();
		this.onDropCb && this.onDropCb(e, this.draggableData);
	}

	/**
	 * Returns the drop zone if the current target element is or is inside the drop zone
	 */
	getDropZone(e: DragEvent): HTMLElement | null {
		if (typeof this.dropZoneResolver === "string") {
			let target = e.target as HTMLElement;
			while (target) {
				if (target.dataset?.dropZone === this.dropZoneResolver) {
					return target;
				}
				target = target.parentNode as HTMLElement;
			}
			return null;
		} else if (typeof this.dropZoneResolver === "function") {
			return this.dropZoneResolver(e);
		} else {
			return document.body;
		}
	}

	/**
	 * Returns the distance between the start and current cursor position
	 */
	getDistance(): number {
		return this.isVertical()
				? this.cursorY - this.startY
				: this.cursorX - this.startX;
	}

	/**
	 * Returns the size of the drop zone
	 */
	getDropZoneSize(): number {
		return (this.isVertical()
				? this.currentDropZone?.offsetHeight
				: this.currentDropZone?.offsetWidth) || 0;
	}

	/**
	 * Returns the percent change between the start and current cursor position relative to the drop zone size
	 */
	getPercentChange() {
		const distance = this.getDistance();
		return (distance / (this.startSize || 1)) * 100;
	}
}
