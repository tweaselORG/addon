import { setImportWasmModule } from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler';
import { generate } from 'reporthar';

const wasmPath = new URL('npm:@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm', import.meta.url);
setImportWasmModule(() => wasmPath);

if (window.browser || window.opener) throw new Error('This script can only be run in a sandboxed environment!');

window.addEventListener('message', async (event) => {
    try {
        const request = JSON.parse(event.data);

        event.source?.postMessage(JSON.stringify({ def: wasmPath, ghi: setImportWasmModule.toString() }), {
            targetOrigin: event.origin,
        });

        // TypeScript doesn't know about `toBase64()` yet.
        const result = (await generate(request.options)) as Uint8Array<ArrayBufferLike> & { toBase64: () => string };

        event.source?.postMessage(JSON.stringify({ def: 'adfdf' }), { targetOrigin: event.origin });

        event.source?.postMessage(JSON.stringify({ id: request.id, result: result.toBase64() }), {
            targetOrigin: event.origin,
        });
    } catch (err) {
        console.error('Error processing using ReportHAR:', event.data, err);
        event.source?.postMessage(JSON.stringify({ err, msg: err.message }), { targetOrigin: event.origin });
    }
});
