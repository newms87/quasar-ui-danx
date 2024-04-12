import { watch } from "vue";

export class FlashMessages {
    static notify;

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

    static enable(msgProps) {
        FlashMessages.success(msgProps.successMsg);
        FlashMessages.error(msgProps.errorMsg);
        FlashMessages.warning(msgProps.warningMsg);
        watch(() => msgProps.successMsg, FlashMessages.success);
        watch(() => msgProps.errorMsg, FlashMessages.error);
        watch(() => msgProps.warningMsg, FlashMessages.warning);
    }

    static send(message, options = {}) {
        if (message) {
            FlashMessages.notify({
                message,
                timeout: 10000,
                color: "gray-base",
                textColor: "white",
                position: "top",
                closeBtn: "X",
                ...options
            });
        }
    }

    static success(message, options = {}) {
        FlashMessages.send(message, {
            color: "green-light",
            textColor: "green-dark",
            icon: "hero:check-circle",
            ...options
        });
    }

    static error(message, options = {}) {
        FlashMessages.send(message, {
            color: "red-light",
            textColor: "red-dark",
            icon: "hero:alert",
            ...options
        });
    }

    static warning(message, options = {}) {
        FlashMessages.send(message, {
            color: "yellow-lighter",
            textColor: "yellow-base",
            icon: "hero:alert",
            ...options
        });
    }

    static combine(type, messages, options = {}) {
        FlashMessages[type](messages.map(m => typeof m === "string" ? m : (m.message || m.Message)).join("<br/>"), {
            ...options,
            html: true
        });
    }
}

export const notify = new FlashMessages();
