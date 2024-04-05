import { ref } from "vue";
import { waitForRef } from "./index";

export const activeAction = ref(null);
export const actionTargets = ref([]);

/**
 * Hook to perform an action on a set of targets
 * This helper allows you to perform actions by name on a set of targets using a provided list of actions
 *
 * @param actions
 * @returns {{performAction(name, targets): Promise<void>}}
 */
export function usePerformAction(actions: any[]) {
    return {
        /**
         * Perform an action on a set of targets
         *
         * @param name - can either be a string or an action object
         * @param targets - an array of targets (or a single target object)
         * @param options
         * @returns {Promise<void>}
         */
        async performAction(name, targets, options = {}) {
            const action = typeof name === "string" ? actions.find(a => a.name === name) : name;
            if (!action) {
                throw new Error(`Unknown action: ${name}`);
            }
            targets = Array.isArray(targets) ? targets : [targets];

            await performAction({ ...action, ...options }, targets);
        }
    };
}

/**
 * Perform an action on a set of targets
 *
 * NOTE: This function and variables should be used w/ the ActionPerformerTool - make sure to use a Layout that has
 * rendered this component so the actions will be performed
 *
 * @param action
 * @param targets
 * @returns {Promise<void>}
 */
export async function performAction(action: any, targets: any[]): Promise<void> {
    activeAction.value = action;
    actionTargets.value = targets;
    await waitForRef(activeAction, null);
}

/**
 * Clear the active action and targets - (note: this will tear down any dialogs / rendered components) triggered by the
 * ActionPerformerTool
 */
export function clearAction() {
    activeAction.value = null;
    actionTargets.value = [];
}
