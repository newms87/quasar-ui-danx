import { shallowRef } from "vue";
import { FlashMessages } from "./index";

interface ActionOptions {
    name: string;
    label: string;
    menu?: boolean;
    batch?: boolean;
    inputComponent?: (target: object[] | object) => any;
    enabled?: (target: object) => boolean;
    onAction?: (action: string | null, target: object, input: any) => Promise<any>;
    onBatchAction?: (action: string | null, targets: object[], input: any) => Promise<any>;
    onSuccess?: (action: string | null, targets: object, input: any) => any;
    onError?: (action: string | null, targets: object, input: any) => any;
    onFinish?: (action: string | null, targets: object, input: any) => any;
}

export const activeActionInput = shallowRef(null);

/**
 * Hook to perform an action on a set of targets
 * This helper allows you to perform actions by name on a set of targets using a provided list of actions
 *
 * @param actions
 * @param {ActionOptions} globalOptions
 */
export function useActions(actions: ActionOptions[], globalOptions: ActionOptions = null) {
    const isSavingTarget = shallowRef(null);

    /**
     * Resolves an action by name or object, adds globalOptions and overrides any passes options
     *
     * @param name
     * @param {any} options
     * @returns {any}
     */
    function resolveAction(name, options = null) {
        const action = typeof name === "string" ? actions.find(a => a.name === name) : name;
        if (!action) {
            throw new Error(`Unknown action: ${name}`);
        }

        return { ...globalOptions, ...action, ...options };
    }

    return {
        actions,
        isSavingTarget,
        resolveAction,

        /**
         * Filter the list of actions based on the provided filters in key-value pairs
         * You can filter on any ActionOptions property by matching the value exactly or by providing an array of values
         *
         * @param filters
         * @returns {ActionOptions[]}
         */
        filterActions(filters: object) {
            let filteredActions = [...actions];

            for (const filter of Object.keys(filters)) {
                const filterValue = filters[filter];
                filteredActions = filteredActions.filter(a => a[filter] === filterValue || (Array.isArray(filterValue) && filterValue.includes(a[filter])));
            }
            return filteredActions;
        },

        /**
         * TODO: HOW TO INTEGRATE optimistic updates and single item updates?
         */
        async applyAction(item, input, itemData = {}) {
            isSavingItem.value = item;

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
            isSavingItem.value = null;
            return result;
        },

        /**
         * Perform an action on a set of targets
         *
         * @param {string} name - can either be a string or an action object
         * @param {object[]|object} target - an array of targets or a single target object
         * @param {any} input
         */
        async performAction(name: string | object, target: object[] | object, input: any = null) {
            const action = resolveAction(name);
            const component = action.inputComponent && action.inputComponent(target);
            let result = null;

            isSavingTarget.value = target;

            // If no component input is required, we can directly perform the action
            if (component) {
                // If the action requires an input, we set the activeActionInput to the input component.
                // This will tell the ActionInputComponent to render the input component, and confirm or cancel the
                // action The confirm function has the input from the component passed and will resolve the promise
                // with the result of the action
                result = await new Promise((resolve, reject) => {
                    activeActionInput.value = {
                        component,
                        confirm: async () => resolve(await onConfirmAction(action, target, input)),
                        cancel: reject
                    };
                });
                activeActionInput.value = null;
            } else {
                result = await onConfirmAction(action, target, input);
            }

            isSavingTarget.value = null;
            return result;
        }
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
    if (result === undefined || result?.success) {

        if (result?.success) {
            FlashMessages.success(`The update was successful`);
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
