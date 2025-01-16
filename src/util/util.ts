import { type Header } from 'har-format';

export const generateReference = (date: Date) =>
    date.getFullYear() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();

export const pause = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const httpHeadersToHarHeaders = (headers: browser.webRequest.HttpHeaders): Header[] =>
    // Looks like the webext API consolidates multiple headers with the same name into a single object for some reason,
    // even though this isn't documented. Splitting on newlines seems like a safe workaround since that's also what
    // delimits headers in raw HTTP.
    headers.flatMap((header) =>
        (header.value || String.fromCharCode(...(header.binaryValue || []))).split('\n').map((value) => ({
            name: header.name,
            value,
        })),
    );
