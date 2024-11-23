import { DragAndDrop } from "./dragAndDrop";

/**
 * ListDragAndDrop supports dragging elements in a list to new positions in the same list.
 * A placeholder is rendered to show the position the list item will be dropped.
 *
 * @class
 */
export class ListDragAndDrop extends DragAndDrop {
	listPosition = 0;
	cursorPosition = 0;
	initialPosition = 0;
	initialDropZone: HTMLElement | null = null;
	onPositionChangeCb = null;
	onDragPositionChangeCb = null;
	onDropZoneChangeCb = null;
	placeholder = null;

	constructor(options = {}) {
		super({
			showPlaceholder: true,
			allowDropZoneChange: true,
			...options
		});
	}

	/**
	 * Callback that fires after dragging has ended and the list position has changed from the original
	 */
	onPositionChange(cb): ListDragAndDrop {
		this.onPositionChangeCb = cb;
		return this;
	}

	/**
	 * Callback that fires when the drop zone has changed
	 */
	onDropZoneChange(cb): ListDragAndDrop {
		this.onDropZoneChangeCb = cb;
		return this;
	}

	/**
	 * Callback that fires while dragging the element when the cursor's position has changed in the list
	 * @param cb
	 * @returns {ListDragAndDrop}
	 */
	onDragPositionChange(cb) {
		this.onDragPositionChangeCb = cb;
		return this;
	}

	/**
	 * Start listening for drag events and prepare an element for drag/drop
	 * @param e
	 * @param data
	 */
	dragStart(e, data) {
		super.dragStart(e, data);

		if (this.currentDropZone) {
			this.listPosition = this.getListPosition(e.target);
			this.initialPosition = this.listPosition;
			this.initialDropZone = this.currentDropZone;
			this.updateScrollPosition();
		}
	}

	/**
	 * When dragging has ended, check for list position changes and fire the onPositionChange callback if it has
	 */
	dragEnd(e) {
		const draggableData = this.draggableData;
		this.placeholder?.remove();
		const newDropZone = this.currentDropZone;
		super.dragEnd(e);

		// If the list drop zone has changed, trigger the callback for drop zone change
		if (newDropZone && newDropZone !== this.initialDropZone) {
			this.onDropZoneChangeCb && this.onDropZoneChangeCb(e, newDropZone, this.listPosition, this.initialPosition, draggableData);
		} else if (this.listPosition !== this.initialPosition) {
			// If our list position has changed, trigger the position change callback
			this.onPositionChangeCb &&
			this.onPositionChangeCb(this.listPosition, this.initialPosition, draggableData);
		}
	}

	/**
	 * The dragging element is moving
	 * @param e
	 */
	dragOver(e) {
		super.dragOver(e);
		this.updateListPosition(e);
	}

	/**
	 * Notify if the targeted position of the cursor is different from the current position
	 * @param e
	 */
	updateListPosition(e: MouseEvent) {
		const point = {
			x: e.clientX,
			y: e.clientY
		};
		const newDropZone = this.getDropZoneForTarget(e.target as HTMLElement);
		if (newDropZone !== this.currentDropZone) {
			this.currentDropZone = newDropZone;
			this.cursorPosition = 0;
			this.listPosition = 0;
			this.placeholder?.remove();
		}

		const prevPosition = this.listPosition;
		const newPosition = this.getListPositionOfPoint(point);

		// If the cursor position has changed, we should update the rendering and see if our actual list position has
		// changed
		if (this.cursorPosition !== newPosition) {
			this.cursorPosition = newPosition;
			this.listPosition =
					this.initialPosition < this.cursorPosition
							? this.cursorPosition - 1
							: this.cursorPosition;
			if (this.options.showPlaceholder) {
				this.renderPlaceholder();
			}

			// The position has changed, trigger the callback
			if (this.listPosition !== prevPosition) {
				this.onDragPositionChangeCb &&
				this.onDragPositionChangeCb(this.listPosition, this.draggableData);
			}
		}
	}

	/**
	 * Find the numeric position of the element in the children of the list
	 * @returns {Number|null}
	 * @param item
	 */
	getListPosition(item) {
		let index = 0;
		for (const child of this.getChildren()) {
			if (child === item) {
				return index;
			}
			index++;
		}

		return null;
	}

	/**
	 * Get all the children of the current drop zone, excluding the placeholder
	 * @returns {*}
	 */
	getChildren() {
		return [...(this.currentDropZone?.children || [])].filter(
				(c) => c.className.match(/dx-drag-placeholder/) === null
		);
	}

	/**
	 * Get the list element that is the parent of the target element
	 */
	getDropZoneForTarget(target: HTMLElement): HTMLElement | null {
		return target.closest(`[data-drop-zone]`);
	}

	/**
	 * Check if the current drop zone is the same as the initial drop zone
	 */
	isSameDropZone() {
		return this.currentDropZone === this.initialDropZone;
	}

	/**
	 * Find the element at the current cursor position in the given drop zone
	 * @param point
	 * @returns {null}
	 */
	getListPositionOfPoint(point) {
		let index = 0;
		const children = this.getChildren();

		while (index < children.length) {
			const rect = children[index].getBoundingClientRect();
			if (this.isVertical()) {
				if (point.y < rect.top + rect.height / 2) {
					break;
				}
			} else {
				if (point.x < rect.left + rect.width / 2) {
					break;
				}
			}
			index++;
		}

		return index;
	}

	/**
	 * Updates the scroll position while dragging an element so a user can navigate a longer list while dragging
	 */
	updateScrollPosition() {
		if (this.currentDropZone) {
			const rect = this.currentDropZone.getBoundingClientRect();
			const threshold = 100;
			let velocity = 0;
			const velocityFn = (x) => x * 5;
			const cursorPos = this.isVertical() ? this.cursorY : this.cursorX;
			const rectStart = this.isVertical() ? rect.top : rect.left;
			const rectEnd = this.isVertical() ? rect.bottom : rect.right;
			const beforeDiff = rectStart + threshold - cursorPos;
			const afterDiff = cursorPos - (rectEnd - threshold);

			if (beforeDiff > 0) {
				velocity = -velocityFn(beforeDiff);
			} else if (afterDiff > 0) {
				velocity = velocityFn(afterDiff);
			}

			if (velocity) {
				if (this.isVertical()) {
					this.currentDropZone.scrollTo({
						top: this.currentDropZone.scrollTop + velocity,
						behavior: "smooth"
					});
				} else {
					this.currentDropZone.scrollTo({
						left: this.currentDropZone.scrollLeft + velocity,
						behavior: "smooth"
					});
				}
			}

			setTimeout(() => this.updateScrollPosition(), 500);
		}
	}

	/**
	 * Render a placeholder element at the given position (in between the elements)
	 */
	renderPlaceholder() {
		// If we're not allowed to change drop zones and we're not in the same drop zone, don't render the placeholder
		if (!this.options.allowDropZoneChange && !this.isSameDropZone()) {
			return;
		}

		if (!this.placeholder) {
			this.placeholder = document.createElement("div");
			this.placeholder.classList.add("dx-drag-placeholder");
		}

		// Make sure the placeholder is oriented correctly
		if (this.isVertical()) {
			this.placeholder.classList.add("dx-direction-vertical");
			this.placeholder.classList.remove("dx-direction-horizontal");
			this.placeholder.style.height = undefined;
		} else {
			this.placeholder.classList.add("dx-direction-horizontal");
			this.placeholder.classList.remove("dx-direction-vertical");
			this.placeholder.style.height =
					this.currentDropZone.getBoundingClientRect().height + "px";
		}

		const children = this.getChildren();
		if (this.cursorPosition < children.length) {
			this.currentDropZone.insertBefore(
					this.placeholder,
					children[this.cursorPosition]
			);
		} else {
			this.currentDropZone.appendChild(this.placeholder);
		}
	}
}
