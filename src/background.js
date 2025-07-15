chrome.commands.onCommand.addListener(async (command) => {
    if (command !== "yt-snip") return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url.includes("youtube.com/watch")) return;

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            if (!window.__ytLastSnipTime) window.__ytLastSnipTime = null;

            const video = document.querySelector("video");
            if (!video) {
                alert("Видео не найдено");
                return;
            }

            const t = video.currentTime;
            const hours = Math.floor(t / 3600).toString().padStart(2, "0");
            const minutes = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
            const seconds = Math.floor(t % 60).toString().padStart(2, "0");
            const centis = Math.floor((t * 100) % 100).toString().padStart(2, "0");
            const nowStr = `${hours}:${minutes}:${seconds}.${centis}`;

            if (window.__ytLastSnipTime) {
                // second press → generate string
                const snipCmd = `yt-snip ${location.href} ${window.__ytLastSnipTime} ${nowStr}`;
                navigator.clipboard.writeText(snipCmd)
                    .then(() => {
                        alert(`Copied:\n${snipCmd}`);
                    })
                    .catch(() => {
                        alert(snipCmd); // fallback
                    });

                window.__ytLastSnipTime = null;
            } else {
                // first press → store time
                window.__ytLastSnipTime = nowStr;
                console.log("Marked first time:", nowStr);
            }
        }
    });
});
