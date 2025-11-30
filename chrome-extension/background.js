// Track tabs for new player stats tab for interception injection into existing stats tab
chrome.tabs.onCreated.addListener((tab) => {
    // Exit if no pendingUrl
    if (!tab.pendingUrl) return;

    const url = tab.pendingUrl;

    // Exit if url isn't relevant
    if (!url.startsWith("https://www.sharkscope.com/poker-statistics/networks/")) return;

    chrome.tabs.query({ 
        url: [
            "https://www.sharkscope.com/poker-statistics/*",
            "https://www.sharkscope.com/*"
        ]
    }, tabs => {
        // Exit if API error from query
        if (chrome.runtime.lastError) return;

        // Sort tabs by timestamp (most recent first)
        const tabsSorted = tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);

        // Find first and most recent matching tab that isn't the new tab, else exit
        const recent = tabsSorted.find(t => 
            t.id !== tab.id && 
            (t.url.startsWith("https://www.sharkscope.com/poker-statistics/") || 
            t.title === "Player Statistics - SharkScope")
        );
        if (!recent) return;

        // Create message data for existing tab
        const data = extractPlayerData(url);
        // Exit if missing data
        if (!data) return;

        // Close the new tab
        chrome.tabs.remove(tab.id);

        // Focus existing tab and it's window
        chrome.tabs.update(recent.id, { active: true });
        chrome.windows.update(recent.windowId, { focused: true });

        // Send new tab data to the existing tab (for use in it's content.js to interact with forms)
        chrome.tabs.sendMessage(recent.id, {
            type: "fill-and-submit",
            payload: data
        });
    });
});

function extractPlayerData(url) {
    const u = new URL(url);

    // Produce truthy path segments
    const parts = u.pathname.split("/").filter(Boolean);

    const networksIndex = parts.indexOf("networks");
    const playersIndex = parts.indexOf("players");

    const networkValue = networksIndex !== -1 ? parts[networksIndex + 1] : null;
    const playerValue = playersIndex !== -1 ? parts[playersIndex + 1] : null;
    const playerValueDecoded = decodeURIComponent(playerValue);

    if (networkValue === null || playerValue === null) return null;

    return {
        network: networkValue,
        player: playerValueDecoded
    };
}