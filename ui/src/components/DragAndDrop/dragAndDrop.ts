/**
 * Drag and Drop basic functionality for dragging elements and firing events on drag start, drag over and drag end
 */
export class DragAndDrop {
  options: {
    direction?: string,
    hideDragImage?: boolean,
    showPlaceholder?: boolean,
  } = { direction: "vertical", hideDragImage: false };

  // State
  startY = 0;
  startX = 0;
  startSize = 0;
  cursorY = 0;
  cursorX = 0;
  onStartCb = null;
  onEndCb = null;
  onDropCb = null;
  onDraggingCb = null;
  dropZoneResolver = null;
  currentDropZone = null;
  draggableData = null;
  // Used to abort dragging event listeners on the element
  abortController = null;

  constructor(options = {}) {
    // Options
    options = {
      direction: "vertical",
      hideDragImage: false,
      ...options,
    };

    this.setOptions(options);
  }

  /**
   * Set the options for the drag and drop instance
   * @param options
   * @returns {DragAndDrop}
   */
  setOptions(options = {}) {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Returns if the list is stacked vertically or horizontally
   * @returns {boolean}
   */
  isVertical() {
    return this.options.direction === "vertical";
  }

  /**
   * Set the target drop zone for draggable elements
   * @param dropZone
   * @returns {DragAndDrop}
   */
  setDropZone(dropZone) {
    this.dropZoneResolver = dropZone;
    return this;
  }

  /**
   * Callback that fires when an element has started dragging
   * @param cb
   * @returns {DragAndDrop}
   */
  onStart(cb) {
    this.onStartCb = cb;
    return this;
  }

  /**
   * Callback that fires when an element has stopped dragging
   * @param cb
   * @returns {DragAndDrop}
   */
  onEnd(cb) {
    this.onEndCb = cb;
    return this;
  }

  /**
   * Callback that fires when the dragging element is moved
   * @param cb
   * @returns {DragAndDrop}
   */
  onDragging(cb) {
    this.onDraggingCb = cb;
    return this;
  }

  /**
   * Callback that fires when the dragging element has been dropped
   * @param cb
   * @returns {DragAndDrop}
   */
  onDrop(cb) {
    this.onDropCb = cb;
    return this;
  }

  /**
   * Start listening for drag events and prepare an element for drag/drop
   * @param e
   * @param data
   */
  dragStart(e, data) {
    this.currentDropZone = this.getDropZone(e);

    if (this.currentDropZone) {
      this.startY = e.clientY;
      this.startX = e.clientX;
      this.startSize = this.getDropZoneSize();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";
      this.draggableData = data;
      this.abortController = new AbortController();
      const options = { signal: this.abortController.signal };
      document.addEventListener("dragenter", (e) => this.dragEnter(e), options);
      document.addEventListener("dragover", (e) => this.dragOver(e), options);
      document.addEventListener("drop", (e) => this.drop(e), options);
      this.onStartCb && this.onStartCb(e);

      if (this.options.hideDragImage) {
        e.dataTransfer.setDragImage(new Image(), 0, 0);
      }
    } else {
      console.error("Drop zone was not found", e, data);
    }
  }

  /**
   * Clean up event listeners after dragging is done
   */
  dragEnd(e) {
    this.currentDropZone = null;
    this.abortController.abort();
    this.draggableData = null;
    this.onEndCb && this.onEndCb(e);
  }

  /**
   * The dragging element has entered a new target
   * @param e
   */
  dragEnter(e) {
    e.preventDefault();
  }

  /**
   * The dragging element is moving
   * @param e
   */
  dragOver(e) {
    e.preventDefault();
    this.cursorY = e.clientY;
    this.cursorX = e.clientX;
    this.onDraggingCb && this.onDraggingCb(e);
  }

  /**
   * Handle dropping the element into its correct position
   * @param e
   */
  drop(e) {
    e.dataTransfer.dropEffect = "move";
    e.preventDefault();
    this.onDropCb && this.onDropCb(e, this.draggableData);
  }

  /**
   * Returns the drop zone if the current target element is or is inside the drop zone
   * @param e
   * @returns {HTMLElement|null}
   */
  getDropZone(e) {
    if (typeof this.dropZoneResolver === "string") {
      let target = e.target;
      while (target) {
        if (target.dataset?.dropZone === this.dropZoneResolver) {
          return target;
        }
        target = target.parentNode;
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
   * @returns {number}
   */
  getDistance() {
    return this.isVertical()
      ? this.cursorY - this.startY
      : this.cursorX - this.startX;
  }

  /**
   * Returns the size of the drop zone
   */
  getDropZoneSize() {
    return this.isVertical()
      ? this.currentDropZone?.offsetHeight
      : this.currentDropZone?.offsetWidth;
  }

  /**
   * Returns the percent change between the start and current cursor position relative to the drop zone size
   *
   * @returns {number}
   */
  getPercentChange() {
    const distance = this.getDistance();
    return (distance / this.startSize) * 100;
  }
}
