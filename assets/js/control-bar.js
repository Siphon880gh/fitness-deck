// Session accordion (mobile): one panel open at a time; bar height drives tool offset.

function isSessionBarMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
}

function syncSessionBarHeight() {
    const bar = document.getElementById("bar-controls");
    if (!bar) return;
    if (!isSessionBarMobile()) {
        document.documentElement.style.removeProperty("--bar-controls-height");
        return;
    }
    const h = Math.ceil(bar.getBoundingClientRect().height);
    if (h > 0) {
        document.documentElement.style.setProperty("--bar-controls-height", h + "px");
    }
}

function syncSessionAccordionExpanded() {
    document.querySelectorAll("#control-panels .session-accordion-item").forEach((item) => {
        const panel = item.querySelector(":scope > .control-panel");
        const chip = item.querySelector(".icon-inner");
        const open = panel && !panel.classList.contains("cp-hidden");
        if (chip) chip.setAttribute("aria-expanded", open ? "true" : "false");
        item.classList.toggle("is-open", !!open);
    });
}

function syncSessionBarHistoryExpanded() {
    const bar = document.getElementById("bar-controls");
    const tools = document.getElementById("toggle-btns");
    const historyPanel = document.getElementById("session-history-panel")
        || document.querySelector(".session-history-panel");
    const historyChip = document.getElementById("session-history-chip");
    const open = historyPanel && !historyPanel.classList.contains("cp-hidden");
    if (bar) bar.classList.toggle("history-expanded", !!open);
    if (tools) tools.classList.toggle("history-expanded", !!open);
    if (historyChip) {
        historyChip.classList.toggle("is-open", !!open);
        historyChip.setAttribute("aria-expanded", open ? "true" : "false");
    }
    syncSessionAccordionExpanded();
    // Wait a frame so open/close transitions settle into measured height
    requestAnimationFrame(() => {
        syncSessionBarHeight();
        requestAnimationFrame(syncSessionBarHeight);
    });
}

function closeAllSessionPanels(exceptPanel) {
    document.querySelectorAll(".control-panel").forEach((panel) => {
        if (panel !== exceptPanel) panel.classList.add("cp-hidden");
    });
}

function scrollSessionAccordionItemIntoView(panel) {
    const item = panel?.closest(".session-accordion-item");
    if (!item) return;
    requestAnimationFrame(() => {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
}

function toggleElementRelative(event, closest, relative) {
    const targetPanel = event.target.closest(closest)?.querySelector(relative);
    const wasHidden = targetPanel?.classList.contains("cp-hidden");

    closeAllSessionPanels(wasHidden ? targetPanel : null);

    if (targetPanel && wasHidden) {
        targetPanel.classList.remove("cp-hidden");
        scrollSessionAccordionItemIntoView(targetPanel);
    }
    syncSessionBarHistoryExpanded();
}

window.onresize = () => {
    syncSessionBarHeight();
};

window.matchMedia("(max-width: 768px)").addEventListener("change", () => {
    syncSessionBarHeight();
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#control-panels .control-panel").forEach((panel) => {
        panel.classList.add("cp-hidden");
    });
    document.getElementById("session-history-panel")?.classList.add("cp-hidden");

    const exerciseChip = document.getElementById("session-exercise-chip");
    if (exerciseChip) {
        exerciseChip.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                exerciseChip.click();
            }
        });
    }

    const bar = document.getElementById("bar-controls");
    if (bar && typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => syncSessionBarHeight());
        ro.observe(bar);
    }

    syncSessionBarHistoryExpanded();
    syncSessionBarHeight();
});
