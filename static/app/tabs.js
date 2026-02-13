const tabHandlers = {};

function registerTab(tabName, handler) {
    tabHandlers[tabName] = handler;
}

function initTabs() {

    const tabs = document.querySelectorAll(".tab");
    const pages = document.querySelectorAll(".page");

    tabs.forEach(tab => {
        tab.addEventListener("click", async () => {

            if (tab.classList.contains("active")) return;

            tabs.forEach(t => t.classList.remove("active"));
            pages.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");

            const pageId = tab.dataset.tab;
            const page = document.getElementById(pageId);

            if (page) {
                page.classList.add("active");
            }

            const handler = tabHandlers[pageId];
            if (handler) {
                await handler();
            }
        });
    });
}

async function ativarAbaInicial() {
    
    const abaAtiva = document.querySelector(".tab.active");
    if (!abaAtiva) return;

    const pageId = abaAtiva.dataset.tab;
    const handler = tabHandlers[pageId];

    if (handler) {
        await handler();
    }
}

export {
    initTabs,
    registerTab,
    ativarAbaInicial
};