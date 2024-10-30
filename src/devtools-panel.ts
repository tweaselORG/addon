const output = document.getElementById('har-output') as HTMLPreElement;
browser.devtools.network.getHAR().then((har) => {
    if (output) output.innerText = JSON.stringify(har, null, 2);
});

browser.devtools.network.onRequestFinished.addListener(() =>
    browser.devtools.network.getHAR().then((har) => {
        if (output) output.innerText = JSON.stringify(har, null, 2);
    }),
);
