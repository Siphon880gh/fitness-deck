// Keep session panels collapsed by default; user opens one at a time.
window.onresize = () => {
    // no-op: panels stay user-controlled
};

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
}

function toggleElementRelative(event, closest, relative) {
    const allCp = Array.from(document.querySelectorAll(".control-panel"));
    const targetPanel = event.target.closest(closest)?.querySelector(relative);
    const wasHidden = targetPanel?.classList.contains("cp-hidden");

    for (let i = 0; i < allCp.length; i++) {
        allCp[i].classList.add("cp-hidden");
    }

    // Toggle: if it was hidden, open it; if it was open, leave all closed
    if (targetPanel && wasHidden) {
        targetPanel.classList.remove("cp-hidden");
    }
    syncSessionBarHistoryExpanded();
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#control-panels .control-panel").forEach((panel) => {
        panel.classList.add("cp-hidden");
    });
    syncSessionBarHistoryExpanded();
});
