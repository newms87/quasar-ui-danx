import { ref } from "vue";
import { waitForRef } from "./index";

interface ActionOptions {
    name: string;
    label: string;
    menu?: boolean;
    batch?: boolean;
    confirmDialog?: (targets: object[]) => any;
    enabled?: (target: object) => boolean;
    onAction?: (action: string | null, target: object, input: any) => any;
    onBatchAction?: (action: string | null, targets: object[], input: any) => any;
    onFinish?: (action: string | null, targets: object, input: any) => void;
}

/**
 * Hook to perform an action on a set of targets
 * This helper allows you to perform actions by name on a set of targets using a provided list of actions
 *
 * @param actions
 * @param {ActionOptions} globalOptions
 */
export function useActions(actions: ActionOptions[], globalOptions: ActionOptions = null) {
    const activeAction = ref(null);
    const activeTarget = ref(null);

    return {
        actions,
        activeAction,
        activeTarget,

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
         * Perform an action on a set of targets
         *
         * @param {string} name - can either be a string or an action object
         * @param {object[]|object} target - an array of targets or a single target object
         * @param {ActionOptions} options
         * @returns {Promise<void>}
         */
        async performAction(name: string | object, target: object[] | object, options = null) {
            const action = typeof name === "string" ? actions.find(a => a.name === name) : name;
            if (!action) {
                throw new Error(`Unknown action: ${name}`);
            }

            activeAction.value = { ...globalOptions, ...action, ...options };
            activeTarget.value = target;
            await waitForRef(activeAction, null);
        },

        /**
         * Clear the active action and targets - (note: this will tear down any dialogs / rendered components)
         * triggered by the ActionPerformerTool
         */
        clearAction() {
            activeAction.value = null;
            activeTarget.value = null;
        }
    };
}
