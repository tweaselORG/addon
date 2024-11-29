const output = document.getElementById('har-output') as HTMLPreElement;

chrome.devtools.network.getHAR((har) => console.log(har));
