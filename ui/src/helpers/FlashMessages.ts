import { watch } from "vue";
import { DanxFlashMessageOptions, danxOptions } from "../config";

export class FlashMessages {
    static notify: (options: DanxFlashMessageOptions) => void;

    static PROP_DEFINITIONS = {
        successMsg: {
            type: String,
            default: ""
        },
        errorMsg: {
            type: String,
            default: ""
        },
        warningMsg: {
            type: String,
            default: ""
        }
    };

    static enable(msgProps: { successMsg?: string, errorMsg?: string, warningMsg?: string }) {
        FlashMessages.success(msgProps.successMsg);
        FlashMessages.error(msgProps.errorMsg);
        FlashMessages.warning(msgProps.warningMsg);
        watch(() => msgProps.successMsg, msg => FlashMessages.success(msg));
        watch(() => msgProps.errorMsg, msg => FlashMessages.error(msg));
        watch(() => msgProps.warningMsg, msg => FlashMessages.warning(msg));
    }

    static send(message?: string, options: DanxFlashMessageOptions = {}) {
        if (message) {
            FlashMessages.notify({
                message,
                timeout: 10000,
                classes: "bg-gray-500 text-white",
                position: "top",
                closeBtn: "X",
                ...options,
                ...danxOptions.flashMessages.default
            });
        }
    }

    static success(message?: string, options: DanxFlashMessageOptions = {}) {
        FlashMessages.send(message, {
            classes: "bg-blue-500 text-white",
            icon: "check",
            ...options,
            ...danxOptions.flashMessages.success
        });
    }

    static error(message?: string, options: DanxFlashMessageOptions = {}) {
        FlashMessages.send(message, {
            classes: "bg-red-500 text-white",
            icon: "error",
            ...options,
            ...danxOptions.flashMessages.error
        });
    }

    static warning(message?: string, options: DanxFlashMessageOptions = {}) {
        FlashMessages.send(message, {
            classes: "bg-yellow-500 text-yellow-900",
            icon: "warning",
            ...options,
            ...danxOptions.flashMessages.warning
        });
    }

    static combine(type: string, messages: string[] | { message: string, Message: string }[], options = {}) {
        if (typeof FlashMessages[type] !== "function") {
            throw new Error(`FlashMessages.${type} is not a function`);
        }

        FlashMessages[type](messages.map(m => typeof m === "string" ? m : (m.message || m.Message)).join("<br/>"), {
            ...options,
            html: true
        });
    }
}

export const notify = new FlashMessages();
