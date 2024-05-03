import { ActionTargetItem } from "./actions";

export interface DialogLayoutProps {
	modelValue?: string | boolean | object;
	title?: string;
	titleClass?: string;
	subtitle?: string;
	content?: string;
	backdropDismiss?: boolean;
	maximized?: boolean;
	fullWidth?: boolean;
	fullHeight?: boolean;
	contentClass?: string;
}

export interface ConfirmDialogProps extends DialogLayoutProps {
	disabled?: boolean;
	isSaving?: boolean;
	closeOnConfirm?: boolean;
	hideConfirm?: boolean;
	confirmText?: string;
	cancelText?: string;
	confirmClass?: string;
	contentClass?: string;
}

export interface ConfirmActionDialogProps extends ConfirmDialogProps {
	action: string,
	label: string,
	target: ActionTargetItem | ActionTargetItem[]
	message?: string,
}
