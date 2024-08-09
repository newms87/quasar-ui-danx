import { QNotifyCreateOptions } from "quasar";
import { watch } from "vue";
import { danxOptions } from "../config";

export class FlashMessages {
	static notify: (options: QNotifyCreateOptions) => void;

	static PROP_DEFINITIONS = {
		successMsg: {
			type: String,
			default: ""
		},
		infoMsg: {
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

	static enable(msgProps: { successMsg?: string, infoMsg?: string, errorMsg?: string, warningMsg?: string }) {
		FlashMessages.success(msgProps.successMsg);
		FlashMessages.error(msgProps.errorMsg);
		FlashMessages.warning(msgProps.warningMsg);
		watch(() => msgProps.successMsg, msg => FlashMessages.success(msg));
		watch(() => msgProps.infoMsg, msg => FlashMessages.info(msg));
		watch(() => msgProps.errorMsg, msg => FlashMessages.error(msg));
		watch(() => msgProps.warningMsg, msg => FlashMessages.warning(msg));
	}

	static formatMessage(message: string) {
		message = message.replace(/\r\n|\r|\n/g, "<br/>");
		message = message.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
		// Replace <SomeComponent ... > with <b>SomeComponent ... </b>
		return message.replace(/<(\w+)([^>]*)>/g, "<b>$1$2</b>");
	}

	static send(message?: string, options: QNotifyCreateOptions = {}) {
		if (message) {
			message = FlashMessages.formatMessage(message);

			FlashMessages.notify({
				message,
				timeout: 10000,
				classes: "bg-gray-500 text-white",
				position: "top",
				closeBtn: "X",
				...danxOptions.value.flashMessages?.default,
				...options
			});
		}
	}

	static success(message?: string, options: QNotifyCreateOptions = {}) {
		FlashMessages.send(message, {
			classes: "bg-green-300 !text-green-900",
			icon: "check",
			...options,
			...danxOptions.value.flashMessages?.success
		});
	}

	static info(message?: string, options: QNotifyCreateOptions = {}) {
		FlashMessages.send(message, {
			classes: "bg-sky-300 !text-sky-900",
			icon: "info",
			...options,
			...danxOptions.value.flashMessages?.info
		});
	}

	static error(message?: string, options: QNotifyCreateOptions = {}) {
		FlashMessages.send(message, {
			classes: "bg-red-300 !text-red-900",
			icon: "error",
			...options,
			...danxOptions.value.flashMessages?.error
		});
	}

	static warning(message?: string, options: QNotifyCreateOptions = {}) {
		FlashMessages.send(message, {
			classes: "bg-yellow-300 !text-yellow-900",
			icon: "warning",
			...options,
			...danxOptions.value.flashMessages?.warning
		});
	}

	static combine(type: string, messages: string[] | { message: string, Message: string }[], options = {}) {
		// @ts-expect-error - type is a string
		const messageType = FlashMessages[type];

		if (typeof messageType !== "function") {
			throw new Error(`FlashMessages.${type} is not a function`);
		}

		messageType(messages.map(m => typeof m === "string" ? m : (m.message || m.Message)).join("<br/>"), {
			...options,
			html: true
		});
	}
}

export const notify = new FlashMessages();
