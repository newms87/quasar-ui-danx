import { Ref, ref } from "vue";

interface HotkeyListener {
    id?: string,
    name: string,
    callback: Function
}

interface Hotkey {
    name: string,
    ctrl?: boolean,
    alt?: boolean,
    shift?: boolean,
    type: "keyup" | "keydown",
    key: string | string[] | number | number[],
}

const hotkeys: Ref<Hotkey[]> = ref([]);
const listeners: Ref<HotkeyListener[]> = ref([]);

export function addHotkey(key: Hotkey) {
    hotkeys.value = [...hotkeys.value, key];
}

export function listen(name: string, callback: Function, id?: string) {
    listeners.value.push({ id, name, callback });
}

export function unlisten(id: string) {
    listeners.value = listeners.value.filter(listener => listener.id !== id);
}

function triggerEvent(type: "keydown" | "keyup", key: string | number, e: KeyboardEvent) {
    for (let hotkey of hotkeys.value) {
        if (hotkey.type === type && hotkey.key === key && e.ctrlKey === !!hotkey.ctrl && e.altKey === !!hotkey.alt && e.shiftKey === !!hotkey.shift) {
            for (let listener of listeners.value) {
                if (listener.name === hotkey.name) {
                    listener.callback(e);
                }
            }
        }
    }
}

function getKey(e: KeyboardEvent) {
    return e.key ? ("" + e.key).toLowerCase() : e.keyCode;
}

export function registerHotkeys(keys: Hotkey[]) {
    hotkeys.value = keys;

    window.addEventListener("keydown", e => {
        triggerEvent("keydown", getKey(e), e);
    });

    window.addEventListener("keyup", e => {
        triggerEvent("keyup", getKey(e), e);
    });
}
