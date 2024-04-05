import { ref } from "vue";

export const activeAction = ref(null);
export const actionTargets = ref([]);

export async function performAction(action, targets) {
    console.log("performing action", action, targets);
    activeAction.value = action;
    actionTargets.value = targets;
}
