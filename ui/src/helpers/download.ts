// download.js v4.2, by dandavis; 2008-2016. [CCBY2] see http://danml.com/download.html for tests/usage
// v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and
// optional mime v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for
// larger+faster saves than dataURLs v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback
// was improved with force-download mime and base64 support. 3.1 improved safari handling. v4 adds AMD/UMD, commonJS,
// and plain browser support v4.1 adds url download capability via solo URL argument (same domain/CORS only) v4.2 adds
// semantic variable names, long (over 2MB) dataURL support, and hidden by default temp anchors
// https://github.com/rndme/download

export async function downloadBlobOrUrl(blobOrUrl, filename = "download") {
	// Create a Promise that resolves to a Blob URL
	const blobUrlPromise = new Promise((resolve, reject) => {
		if (blobOrUrl instanceof File) {
			// Create an object URL from the File
			const url = URL.createObjectURL(blobOrUrl);
			resolve(url);
		} else if (typeof blobOrUrl === "string") {
			// It's a Blob URL
			resolve(blobOrUrl);
		} else if (blobOrUrl instanceof Blob) {
			// Create an object URL from the Blob
			const url = URL.createObjectURL(blobOrUrl);
			resolve(url);
		} else {
			console.error("blobOrUrl was not a Blob or URL", blobOrUrl);
			reject(new Error("The provided value must be a Blob or a Blob URL string."));
		}
	});

	return await blobUrlPromise.then((blobUrl) => {
		// Create a temporary anchor element
		const anchor = document.createElement("a");
		anchor.style.display = "none";
		anchor.href = blobUrl as string;
		anchor.download = filename;
		anchor.target = "_blank";

		// Append the anchor to the body
		document.body.appendChild(anchor);

		// Programmatically trigger a click event on the anchor
		const clickEvent = new MouseEvent("click", {
			view: window,
			bubbles: true,
			cancelable: true
		});
		anchor.dispatchEvent(clickEvent);

		// Remove the anchor from the document
		document.body.removeChild(anchor);

		// Revoke the object URL if we created one
		if (blobOrUrl instanceof Blob) {
			setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
		}
	}).catch((error) => {
		console.error("An error occurred while downloading the file:", error);
	});
}

/* eslint-disable */
export function download(data, strFileName, strMimeType) {
	var self = window;
	// this script is only for browsers anyway...

	var defaultMime = "application/octet-stream";
	// this default mime also triggers iframe downloads

	var mimeType = strMimeType || defaultMime;

	var payload = data;

	var url = !strFileName && !strMimeType && payload;

	var anchor = document.createElement("a");

	var toString = function (a) {
		return String(a);
	};

	// @ts-ignore
	var myBlob = self.Blob || self.MozBlob || self.WebKitBlob || toString;

	var fileName = strFileName || "download";

	var blob;

	var reader;
	myBlob = myBlob.call ? myBlob.bind(self) : Blob;

	if (String(this) === "true") {
		// reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
		payload = [payload, mimeType];
		mimeType = payload[0];
		payload = payload[1];
	}

	if (url && url.length < 2048) {
		// if no filename and no mime, assume a url was passed as the only argument
		fileName = url.split("/").pop().split("?")[0];
		anchor.href = url; // assign href prop to temp anchor

		// if the browser determines that it's a potentially valid url path:
		if (
				anchor.href.indexOf(url) !== -1 ||
				anchor.href.indexOf(encodeURI(url)) !== -1 ||
				anchor.href === encodeURI(url)
		) {
			var ajax = new XMLHttpRequest();
			ajax.open("GET", url + "?no-cache=" + Date.now(), true);
			ajax.responseType = "blob";
			ajax.onload = function (e) {
				// @ts-ignore
				download(e.target.response, fileName, defaultMime);
			};
			ajax.onerror = function (e) {
				// As a fallback, just open the request in a new tab
				window.open(url, "_blank").focus();
			};
			setTimeout(function () {
				ajax.send();
			}, 0); // allows setting custom ajax headers using the return:
			return ajax;
		} else {
			throw new Error("Invalid URL given, cannot download file: " + url);
		}
	} // end if url?

	// go ahead and download dataURLs right away
	if (/^data:[\w+-]+\/[\w+-]+[,;]/.test(payload)) {
		if (payload.length > 1024 * 1024 * 1.999 && myBlob !== toString) {
			payload = dataUrlToBlob(payload);
			mimeType = payload.type || defaultMime;
		} else {
			// IE10 can't do a[download], only Blobs
			// everyone else can save dataURLs un-processed
			// @ts-ignore
			return navigator.msSaveBlob ? navigator.msSaveBlob(dataUrlToBlob(payload), fileName) : saver(payload);
		}
	} // end if dataURL passed?

	blob =
			payload instanceof myBlob
					? payload
					: new myBlob([payload], { type: mimeType });

	function dataUrlToBlob(strUrl) {
		var parts = strUrl.split(/[:;,]/);

		var type = parts[1];

		var decoder = parts[2] === "base64" ? atob : decodeURIComponent;

		var binData = decoder(parts.pop());

		var mx = binData.length;

		var i = 0;

		var uiArr = new Uint8Array(mx);

		for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);

		return new myBlob([uiArr], { type: type });
	}

	function saver(url, winMode) {
		// Detect Chrome on iPhone (or any iOS device using WebKit)
		const isIOSChrome =
				/CriOS/.test(navigator.userAgent) && /iP(hone|od|ad)/.test(navigator.platform);

		if (isIOSChrome) {
			window.open(url, "_blank");

			return true;
		}

		if ("download" in anchor) {
			// HTML5 A[download]
			anchor.href = url;
			anchor.setAttribute("download", fileName);
			anchor.style.display = "none";
			document.body.appendChild(anchor);

			setTimeout(() => {
				anchor.click();
				document.body.removeChild(anchor);

				if (winMode === true) {
					setTimeout(() => {
						URL.revokeObjectURL(anchor.href); // Release the Object URL
					}, 250);
				}
			}, 0);

			return true;
		}

		// General fallback for unsupported browsers
		const fallbackIframe = document.createElement("iframe");
		fallbackIframe.style.display = "none";
		fallbackIframe.src = url;
		document.body.appendChild(fallbackIframe);

		setTimeout(() => {
			document.body.removeChild(fallbackIframe);
		}, 5000); // Clean up iframe after 5 seconds

		return true;
	}

	// @ts-ignore
	if (navigator.msSaveBlob) {
		// IE10+ : (has Blob, but not a[download] or URL)
		// @ts-ignore
		return navigator.msSaveBlob(blob, fileName);
	}

	if (self.URL) {
		// simple fast and modern way using Blob and URL:
		saver(self.URL.createObjectURL(blob), true);
	} else {
		// handle non-Blob()+non-URL browsers:
		if (typeof blob === "string" || blob.constructor === toString) {
			try {
				// @ts-ignore
				return saver("data:" + mimeType + ";base64," + self.btoa(blob));
			} catch (y) {
				// @ts-ignore
				return saver("data:" + mimeType + "," + encodeURIComponent(blob));
			}
		}

		// Blob but not URL support:
		reader = new FileReader();
		reader.onload = function (e) {
			// @ts-ignore
			saver(this.result);
		};
		reader.readAsDataURL(blob);
	}
	return true;
}
