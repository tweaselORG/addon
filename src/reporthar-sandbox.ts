import { setImportWasmModule } from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler';
import fs from 'fs';
import { generate } from 'reporthar';

if (window.browser || window.opener) throw new Error('This script can only be run in a sandboxed environment!');

const wasm = fs.readFileSync(
    __dirname + '/../node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
);
setImportWasmModule(() => wasm);

window.addEventListener('message', async (event) => {
    try {
        const request = JSON.parse(event.data);

        // TypeScript doesn't know about `toBase64()` yet.
        const result = (await generate(request.options)) as Uint8Array<ArrayBufferLike> & { toBase64: () => string };

        event.source?.postMessage(JSON.stringify({ id: request.id, result: result.toBase64() }), {
            targetOrigin: event.origin,
        });
    } catch (err: any) {
        console.error('Error processing using ReportHAR:', event.data, err);
        event.source?.postMessage(JSON.stringify({ error: true, message: err.message }), {
            targetOrigin: event.origin,
        });
    }
});
