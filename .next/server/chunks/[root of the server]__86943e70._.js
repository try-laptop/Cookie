module.exports = {

"[project]/.next-internal/server/app/api/download-extension/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route.runtime.dev.js [external] (next/dist/compiled/next-server/app-route.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@opentelemetry/api [external] (@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@opentelemetry/api", () => require("@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/lib/extension-store.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/lib/extension-store.ts
// THIS IS A DEMO STORE AND IS NOT SUITABLE FOR PRODUCTION
// Data will be lost on server restart.
__turbopack_context__.s({
    "addExtensionFileToStore": (()=>addExtensionFileToStore),
    "deleteExtensionFileFromStore": (()=>deleteExtensionFileFromStore),
    "getExtensionFileFromStore": (()=>getExtensionFileFromStore),
    "getExtensionFileMetadataFromStore": (()=>getExtensionFileMetadataFromStore)
});
const EXTENSION_STORE_KEY = 'chrome-extension-zip';
let extensionStore;
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    if (!globalThis.__extensionStore__) {
        globalThis.__extensionStore__ = new Map();
    }
    extensionStore = globalThis.__extensionStore__;
}
function addExtensionFileToStore(file) {
    const id = EXTENSION_STORE_KEY; // Use a fixed key to ensure only one extension
    const newFile = {
        ...file,
        id,
        uploadedAt: new Date()
    };
    // Overwrite any existing extension by using .set()
    extensionStore.set(id, newFile);
    return newFile;
}
function getExtensionFileFromStore() {
    return extensionStore.get(EXTENSION_STORE_KEY);
}
function getExtensionFileMetadataFromStore() {
    const file = extensionStore.get(EXTENSION_STORE_KEY);
    if (file) {
        const { content, ...metadata } = file;
        return metadata;
    }
    return undefined;
}
function deleteExtensionFileFromStore() {
    if (extensionStore.has(EXTENSION_STORE_KEY)) {
        return extensionStore.delete(EXTENSION_STORE_KEY);
    }
    return false; // No file to delete
}
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/app/api/download-extension/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/app/api/download-extension/route.ts
__turbopack_context__.s({
    "GET": (()=>GET),
    "dynamic": (()=>dynamic)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$extension$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/extension-store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
async function GET(request) {
    console.log('[API /api/download-extension] GET request received.');
    const fileData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$extension$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExtensionFileFromStore"])();
    if (!fileData) {
        console.error('[API /api/download-extension] Extension file not found in store. It might not have been uploaded or the server may have restarted.');
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Extension file not found. Please upload it again.', {
            status: 404
        });
    }
    console.log(`[API /api/download-extension] File found: ${fileData.fileName}, size: ${fileData.size}, mimeType: ${fileData.mimeType}`);
    try {
        const blob = new Blob([
            fileData.content
        ], {
            type: fileData.mimeType
        });
        const headers = new Headers();
        headers.set('Content-Type', fileData.mimeType);
        headers.set('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
        headers.set('Content-Length', String(blob.size));
        console.log('[API /api/download-extension] Sending file to client.');
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](blob, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('[API /api/download-extension] Error creating or sending blob:', error);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Error processing file for download. Check server logs.', {
            status: 500
        });
    }
}
const dynamic = 'force-dynamic';
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__86943e70._.js.map