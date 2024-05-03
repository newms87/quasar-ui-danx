import { useDebounceFn } from "@vueuse/core";
import { Ref, shallowRef } from "vue";
import { ActionOptions, ActionTarget, AnyObject } from "../types";
import { FlashMessages } from "./FlashMessages";
import { storeObject } from "./objectStore";

export const activeActionVnode: Ref = shallowRef(null);

/**
 * Hook to perform an action on a set of targets
 * This helper allows you to perform actions by name on a set of targets using a provided list of actions
 *
 * @param actions
 * @param {ActionOptions | null} globalOptions
 */
export function useActions(actions: ActionOptions[], globalOptions: ActionOptions | null = null) {
	const mappedActions = actions.map(action => {
		const mappedAction: ActionOptions = { ...globalOptions, ...action };
		if (mappedAction.debounce) {
			mappedAction.trigger = useDebounceFn((target, input) => performAction(mappedAction, target, input, true), mappedAction.debounce);
		} else if (!mappedAction.trigger) {
			mappedAction.trigger = (target, input) => performAction(mappedAction, target, input, true);
		}
		return mappedAction;
	});

	/**
	 * Set the reactive saving state of a target
	 */
	function setTargetSavingState(target: ActionTarget, saving: boolean) {
		if (!target) return;
		target = Array.isArray(target) ? target : [target];
		for (const t of target) {
			if (!t.isSaving) {
				t.isSaving = shallowRef(saving);
			} else {
				t.isSaving.value = saving;
			}
		}
	}

	/**
	 * Perform an action on a set of targets
	 *
	 * @param {string} name - can either be a string or an action object
	 * @param {object[]|object} target - an array of targets or a single target object
	 * @param {any} input - The input data to pass to the action handler
	 * @param isTriggered - Whether the action was triggered by a trigger function
	 */
	async function performAction(name: string | object, target: ActionTarget = null, input: any = null, isTriggered = false) {
		const action: ActionOptions | null | undefined = typeof name === "string" ? mappedActions.find(a => a.name === name) : name;
		if (!action) {
			throw new Error(`Unknown action: ${name}`);
		}

		// We always want to call the trigger function if it exists, unless it's already been triggered
		// This provides behavior like debounce and custom action resolution
		if (action.trigger && !isTriggered) {
			return action.trigger(target, input);
		}

		const vnode = action.vnode && action.vnode(target);
		let result: any;

		// Run the onStart handler if it exists and quit the operation if it returns false
		if (action.onStart) {
			if (!action.onStart(action, target, input)) {
				return;
			}
		}

		setTargetSavingState(target, true);

		// If additional input is required, first render the vnode and wait for the confirm or cancel action
		if (vnode) {
			// If the action requires an input, we set the activeActionVnode to the input component.
			// This will tell the ActionVnode to render the input component, and confirm or cancel the
			// action The confirm function has the input from the component passed and will resolve the promise
			// with the result of the action
			result = await new Promise((resolve) => {
				activeActionVnode.value = {
					vnode,
					confirm: async (confirmInput: any) => {
						const result = await onConfirmAction(action, target, { ...input, ...confirmInput });

						// Only resolve when we have a non-error response, so we can show the error message w/o
						// hiding the dialog / vnode
						if (result === undefined || result === true || result?.success) {
							resolve(result);
						}
					},
					cancel: resolve
				};
			});

			activeActionVnode.value = null;
		} else {
			result = await onConfirmAction(action, target, input);
		}

		setTargetSavingState(target, false);

		if (result?.item) {
			result.item = storeObject(result.item);
		}

		return result;
	}

	/**
	 * Filter the list of actions based on the provided filters in key-value pairs
	 * You can filter on any ActionOptions property by matching the value exactly or by providing an array of values
	 *
	 * @param filters
	 * @returns {ActionOptions[]}
	 */
	function filterActions(filters: AnyObject): ActionOptions[] {
		let filteredActions = [...mappedActions];

		for (const filter of Object.keys(filters)) {
			const filterValue = filters[filter];
			filteredActions = filteredActions.filter((a: AnyObject) => a[filter] === filterValue || (Array.isArray(filterValue) && filterValue.includes(a[filter])));
		}
		return filteredActions;
	}

	return {
		actions: mappedActions,
		filterActions,
		performAction
	};
}

async function onConfirmAction(action: ActionOptions, target: ActionTarget, input: any = null) {
	if (!action.onAction) {
		throw new Error("No onAction handler found for the selected action:" + action.name);
	}

	const isBatch = Array.isArray(target);
	let result: any;

	try {
		if (isBatch) {
			if (action.onBatchAction) {
				result = await action.onBatchAction(action.name, target, input);
			} else {
				result = { error: `Action ${action.name} does not support batch actions` };
			}
		} else {
			// If the action has an optimistic callback, we call it before the actual action to immediately
			// update the UI
			if (action.optimistic) {
				action.optimistic(action, target, input);
			}

			result = await action.onAction(action.name, target, input);
		}
	} catch (e) {
		console.error(e);
		result = { error: `An error occurred while performing the action ${action.label}. Please try again later.` };
	}

	// If there is no return value or the result marks it as successful, we show a success message
	if (result === undefined || result === true || result?.success) {
		// Add the item to the object store if it has a type
		if (result && result.item) {
			result.item = storeObject(result.item);
		}

		if (result?.success && Array.isArray(target)) {
			FlashMessages.success(`Successfully performed action ${action.label} on ${target.length} items`);
		}

		if (action.onSuccess) {
			action.onSuccess(result, target, input);
		}

		if (isBatch && action.onBatchSuccess) {
			action.onBatchSuccess(result, target, input);
		}
	} else {
		const errors = [];
		if (result.errors) {
			errors.push(...result.errors);
		} else if (result.error) {
			let message = result.error;
			if (typeof result.error === "boolean") {
				message = result.message;
			} else if (typeof result.error === "object") {
				message = result.error.message;
			} else if (typeof result.error !== "string") {
				message = "An unknown error occurred. Please try again later.";
			}
			errors.push(message);
		} else {
			errors.push("An unexpected error occurred. Please try again later.");
		}

		FlashMessages.combine("error", errors);

		if (action.onError) {
			action.onError(result, target, input);
		}
	}

	if (action.onFinish) {
		action.onFinish(result, target, input);
	}

	return result;
}
