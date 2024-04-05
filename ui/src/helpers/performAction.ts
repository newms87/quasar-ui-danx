import { ref } from "vue";
import { waitForRef } from "./index";

export const activeAction = ref(null);
export const actionTargets = ref([]);

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
