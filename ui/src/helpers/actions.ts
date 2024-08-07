import { useDebounceFn } from "@vueuse/core";
import { uid } from "quasar";
import { isReactive, Ref, shallowRef } from "vue";
import type { ActionOptions, ActionTarget, AnyObject, ResourceAction } from "../types";
import { FlashMessages } from "./FlashMessages";
import { storeObject } from "./objectStore";

export const activeActionVnode: Ref = shallowRef(null);

/**
 * Hook to perform an action on a set of targets
 * This helper allows you to perform actions by name on a set of targets using a provided list of actions
 */
export function useActions(actions: ActionOptions[], globalOptions: Partial<ActionOptions> | null = null) {
	const namespace = uid();

	/**
	 * Extend an action so the base action can be modified without affecting other places the action is used.
	 * This isolates the action to the provided id, so it is still re-usable across the system, but does not affect behavior elsewhere.
	 *
	 * For example, when you have a list of items and you want to perform a callback on the action on a single item, you can extend the action
	 * with the id of the item you want to perform the action on, allowing you to perform behavior on a single item, instead of all instances
	 * in the list receiving the same callback.
	 */
	function extendAction(actionName: string, extendedId: string | number, actionOptions: Partial<ActionOptions>): ResourceAction {
		const action = getAction(actionName);
		const extendedAction = { ...action, ...actionOptions, id: extendedId };
		if (extendedAction.debounce) {
			extendedAction.trigger = useDebounceFn((target, input) => performAction(extendedAction, target, input), extendedAction.debounce);
		} else {
			extendedAction.trigger = (target, input) => performAction(extendedAction, target, input);
		}
		return storeObject(extendedAction);
	}

	/**
	 * Resolve the action object based on the provided name (or return the object if the name is already an object)
	 */
	function getAction(actionName: string, actionOptions?: Partial<ActionOptions>): ResourceAction {
		/// Resolve the action options or resource action based on the provided input
		const baseOptions = actions.find(a => a.name === actionName) || { name: actionName };

		if (actionOptions) {
			Object.assign(baseOptions, actionOptions);
		}

		// If the action is already reactive, return it
		if (isReactive(baseOptions) && "__type" in baseOptions) return baseOptions as ResourceAction;

		const resourceAction: ResourceAction = storeObject({
			...globalOptions,
			...baseOptions,
			trigger: (target, input) => performAction(resourceAction, target, input),
			isApplying: false,
			__type: "__Action:" + namespace
		});

		// Assign Trigger function if it doesn't exist
		if (baseOptions.debounce) {
			resourceAction.trigger = useDebounceFn((target, input) => performAction(resourceAction, target, input), baseOptions.debounce);
		}

		return resourceAction;
	}

	/**
	 * Filter the list of actions based on the provided filters in key-value pairs
	 * You can filter on any ActionOptions property by matching the value exactly or by providing an array of values
	 *
	 * @param filters
	 * @returns {ActionOptions[]}
	 */
	function getActions(filters?: AnyObject): ResourceAction[] {
		let filteredActions = [...actions];

		if (filters) {
			for (const filterKey of Object.keys(filters)) {
				const filterValue = filters[filterKey];
				filteredActions = filteredActions.filter((a: AnyObject) => a[filterKey] === filterValue || (Array.isArray(filterValue) && filterValue.includes(a[filterKey])));
			}
		}

		return filteredActions.map((a: ActionOptions) => getAction(a.name));
	}

	/**
	 * Perform an action on a set of targets
	 *
	 * @param {string} action - can either be a string or an action object
	 * @param {object[]|object} target - an array of targets or a single target object
	 * @param {any} input - The input data to pass to the action handler
	 */
	async function performAction(action: ResourceAction, target: ActionTarget = null, input: any = null) {
		// Resolve the original action, if the current action is an alias
		const aliasedAction = action.alias ? getAction(action.alias) : null;

		const vnode = action.vnode && action.vnode(target);
		let result: any;

		// Run the onStart handler if it exists and quit the operation if it returns false
		if (action.onStart) {
			if (!action.onStart(action, target, input)) {
				return;
			}
		}

		setTargetSavingState(target, true);
		action.isApplying = true;

		if (aliasedAction) {
			aliasedAction.isApplying = true;
		}

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

		// If the request was aborted (likely due to a newer request), just return immediately without changing state
		if (result?.abort) {
			return result;
		}

		action.isApplying = false;
		setTargetSavingState(target, false);

		if (aliasedAction) {
			aliasedAction.isApplying = false;
		}

		if (result?.item) {
			result.item = storeObject(result.item);
		}

		return result;
	}

	return {
		getAction,
		getActions,
		extendAction
	};
}

/**
 * Set the reactive saving state of a target
 */
function setTargetSavingState(target: ActionTarget, saving: boolean) {
	if (!target) return;
	target = Array.isArray(target) ? target : [target];
	for (const t of target) {
		t.isSaving = saving;
	}
}

/**
 * Execute the confirmed action on the target (ie: calling the server, or whatever the callback function does).
 *
 * 1. If the action has an optimistic callback, it will be called before the actual action to immediately update the UI (non batch actions only).
 * 2. Call the onBatchAction or onAction callback of the action object, depending on if the target is an array or not.
 * 3. Call the onSuccess or onError callback based on the result of the action.
 * 4. Call the onFinish callback of the action object.
 */
async function onConfirmAction(action: ActionOptions, target: ActionTarget, input: any = null) {
	if (!action.onAction) {
		throw new Error("No onAction handler found for the selected action:" + action.name);
	}

	const isBatch = Array.isArray(target);
	let result: any;

	try {
		if (isBatch) {
			if (action.onBatchAction) {
				result = await action.onBatchAction(action.alias || action.name, target, input);
			} else {
				result = { error: `Action ${action.name} does not support batch actions` };
			}
		} else {
			// If the action has an optimistic callback, we call it before the actual action to immediately
			// update the UI
			if (typeof action.optimistic === "function") {
				action.optimistic(action, target, input);
			} else if (action.optimistic) {
				storeObject({ ...target, ...input });
			}

			result = await action.onAction(action.alias || action.name, target, input);
		}
	} catch (e) {
		if (("" + e).match(/Request was aborted/)) {
			result = { abort: true };
		} else {
			console.error(e);
			result = { error: `An error occurred while performing the action ${action.label}. Please try again later.` };
		}
	}

	if (result?.abort) {
		return result;
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
			await action.onSuccess(result, target, input);
		}

		if (isBatch && action.onBatchSuccess) {
			await action.onBatchSuccess(result, target, input);
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
			await action.onError(result, target, input);
		}
	}

	if (action.onFinish) {
		await action.onFinish(result, target, input);
	}

	return result;
}
