import { process } from 'trackhar';

if (window.browser || window.opener) throw new Error('This script can only be run in a sandboxed environment!');

window.addEventListener('message', async (event) => {
    try {
        const request = JSON.parse(event.data);

        const result = await process(request.har);

        event.source?.postMessage(JSON.stringify({ id: request.id, result }), { targetOrigin: event.origin });
    } catch (err) {
        console.error('Error processing using TrackHAR:', event.data, err);
    }
});
