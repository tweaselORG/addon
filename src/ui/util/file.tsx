export const createBlobUrl = (file: BlobPart, type?: string) => {
    const blob = new Blob([file], { type });
    return URL.createObjectURL(blob);
};

export const openPdf = (pdf: Uint8Array<ArrayBufferLike>) => {
    const url = createBlobUrl(pdf, 'application/pdf');
    window.open(url, '_blank');
    return url;
};
