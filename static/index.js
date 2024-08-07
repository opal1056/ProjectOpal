"use strict";

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");

/**
 * Initialize BareMuxConnection with the path to the worker script
 * @type {BareMux.BareMuxConnection}
 */
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

// Define the constant WISP URL to always use
const WISP_URL = "wss://ruby.rubynetwork.co/wisp/";

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Register the service worker
    try {
        await registerSW();
    } catch (err) {
        error.textContent = "Failed to register service worker.";
        errorCode.textContent = err.toString();
        return; // Exit early if service worker registration fails
    }

    // Perform the search and get the URL
    const url = search(address.value, searchEngine.value);

    const frame = document.getElementById("uv-frame");
    frame.style.display = "block";

    try {
        // Check and update the transport if necessary
        const currentTransport = await connection.getTransport();
        if (currentTransport !== "/epoxy/index.mjs") {
            await connection.setTransport("/epoxy/index.mjs", [{ wisp: WISP_URL }]);
        }
    } catch (err) {
        error.textContent = "Failed to set transport.";
        errorCode.textContent = err.toString();
        return; // Exit early if setting transport fails
    }

    // Update iframe source with encoded URL
    try {
        frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
    } catch (err) {
        error.textContent = "Failed to update iframe source.";
        errorCode.textContent = err.toString();
    }
});
