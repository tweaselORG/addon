declare module '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler' {
    export function setImportWasmModule(
        importer: (wasmName: string, importMetaUrl: string) => string | Uint8Array,
    ): void;
}
