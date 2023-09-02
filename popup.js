const tabs = await chrome.tabs.query({
    url: [
        "https://developer.chrome.com/docs/webstore/*",
        "https://developer.chrome.com/docs/extensions/*"
    ]
});

// Sort the tabs by the user's preferred language.
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

// Defined an HTML element that can be cloned, as opposed to using document.createElement() for each item.
const template = document.getElementById("li_template");
const elements = new Set();

for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);
    
    const title = tab.title.split("-")[0].trim();
    const pathname = new URL(tab.url).pathname.slice("/docs".length);
    
    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = pathname;
    element.querySelector("a").addEventListener("click", async () => {
        // Need to focus window as well as the active tab.
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
    });
    
    elements.add(element);
}

document.querySelector("ul").append(...elements);

const button = document.querySelector("button");

button.addEventListener("click", async () => {
    const tabIds = tabs.map(({ id }) => id);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: "DOCS" });
});
