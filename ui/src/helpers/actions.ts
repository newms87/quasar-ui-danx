import { ref, shallowRef, VNode } from "vue";
import { FlashMessages } from "./index";

/**
 * TODO: HOW TO INTEGRATE optimistic updates and single item updates?
 */
async function applyAction(item, input, itemData = {}) {
    setItemInPagedList({ ...item, ...input, ...itemData });
    const result = await applyActionRoute(item, input);
    if (result.success) {
        // Only render the most recent campaign changes
        if (resultNumber !== actionResultCount) return;

        // Update the updated item in the previously loaded list if it exists
        setItemInPagedList(result.item);

        // Update the active item if it is the same as the updated item
        if (activeItem.value?.id === result.item.id) {
            activeItem.value = { ...activeItem.value, ...result.item };
        }
    }
    return result;
}

interface ActionOptions {
    name?: string;
    label?: string;
    menu?: boolean;
    batch?: boolean;
    category?: string;
    class?: string;
    trigger?: (target: object[] | object, input: any) => Promise<any>;
    activeTarget?: any;
    vnode?: (target: object[] | object) => VNode;
    enabled?: (target: object) => boolean;
    batchEnabled?: (targets: object[]) => boolean;
    onAction?: (action: string | null, target: object, input: any) => Promise<any>;
    onBatchAction?: (action: string | null, targets: object[], input: any) => Promise<any>;
    onSuccess?: (action: string | null, targets: object, input: any) => any;
    onError?: (action: string | null, targets: object, input: any) => any;
    onFinish?: (action: string | null, targets: object, input: any) => any;
}

export const activeActionVnode = shallowRef(null);

/**
 * Hook to perform an action on a set of targets
 * This helper allows you to perform actions by name on a set of targets using a provided list of actions
 *
 * @param actions
 * @param {ActionOptions} globalOptions
 */
export function useActions(actions: ActionOptions[], globalOptions: ActionOptions = null) {
    const mappedActions = actions.map(action => {
        const mappedAction = { ...globalOptions, ...action };
        if (!mappedAction.trigger) {
            mappedAction.trigger = (target, input) => performAction(mappedAction, target, input);
            mappedAction.activeTarget = ref(null);
        }
        return mappedAction;
    });

    /**
     * Check if the provided target is currently being saved by any of the actions
     */
    function isSavingTarget(target: any): boolean {
        if (!target) return false;

        for (const action of mappedActions) {
            const activeTargets = (Array.isArray(action.activeTarget.value) ? action.activeTarget.value : [action.activeTarget.value]).filter(t => t);
            if (activeTargets.length === 0) continue;

            for (const activeTarget of activeTargets) {
                if (activeTarget === target || (activeTarget.id && activeTarget.id === target.id)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Perform an action on a set of targets
     *
     * @param {string} name - can either be a string or an action object
     * @param {object[]|object} target - an array of targets or a single target object
     * @param {any} input - The input data to pass to the action handler
     */
    async function performAction(name: string | object, target: object[] | object, input: any = null) {
        const action: ActionOptions = typeof name === "string" ? mappedActions.find(a => a.name === name) : name;
        if (!action) {
            throw new Error(`Unknown action: ${name}`);
        }

        const vnode = action.vnode && action.vnode(target);
        let result: any;

        action.activeTarget.value = target;

        // If additional input is required, first render the vnode and wait for the confirm or cancel action
        if (vnode) {
            // If the action requires an input, we set the activeActionVnode to the input component.
            // This will tell the ActionVnode to render the input component, and confirm or cancel the
            // action The confirm function has the input from the component passed and will resolve the promise
            // with the result of the action
            result = await new Promise((resolve, reject) => {
                activeActionVnode.value = {
                    vnode,
                    confirm: async (input: any) => {
                        const result = await onConfirmAction(action, target, input);

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

        action.activeTarget.value = null;
        return result;
    }

    /**
     * Filter the list of actions based on the provided filters in key-value pairs
     * You can filter on any ActionOptions property by matching the value exactly or by providing an array of values
     *
     * @param filters
     * @returns {ActionOptions[]}
     */
    function filterActions(filters: object): ActionOptions[] {
        let filteredActions = [...mappedActions];

        for (const filter of Object.keys(filters)) {
            const filterValue = filters[filter];
            filteredActions = filteredActions.filter(a => a[filter] === filterValue || (Array.isArray(filterValue) && filterValue.includes(a[filter])));
        }
        return filteredActions;
    }

    return {
        actions: mappedActions,
        isSavingTarget,
        filterActions,
        performAction
    };
}

async function onConfirmAction(action: ActionOptions, target: object[] | object, input: any = null) {
    if (!action.onAction) {
        throw new Error("No onAction handler found for the selected action:" + action.name);
    }

    let result: any;
    try {
        if (Array.isArray(target)) {
            result = await action.onBatchAction(action.name, target, input);
        } else {
            result = await action.onAction(action.name, target, input);
        }
    } catch (e) {
        console.error(e);
        result = { error: `An error occurred while performing the action ${action.label}. Please try again later.` };
    }

    // If there is no return value or the result marks it as successful, we show a success message
    if (result === undefined || result === true || result?.success) {
        if (result?.success && Array.isArray(target)) {
            FlashMessages.success(`Successfully performed action ${action.label} on ${target.length} items`);
        }

        if (action.onSuccess) {
            action.onSuccess(result, target, input);
        }
    } else {
        const errors = [];
        if (result.errors) {
            errors.push(...result.errors);
        } else if (result.error) {
            errors.push(typeof result.error === "string" ? result.error : result.error.message);
        } else {
            errors.push("An unknown error occurred. Please try again later.");
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
