let appRefreshed = false;

export function refreshApplication(callback: () => void) {
	// Only allow refreshing the application once
	if (appRefreshed) return;
	appRefreshed = true;

	// Create a hidden iframe
	const iframe = document.createElement("iframe");
	iframe.style.display = "none";
	iframe.src = window.location.href;
	document.body.appendChild(iframe);

	// Listen for the iframe to finish loading
	iframe.onload = () => {
		// Remove the iframe
		document.body.removeChild(iframe);
		callback();
	};
}
