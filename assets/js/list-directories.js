function getLastOpened() {
    const raw = localStorage.getItem("FitnessDeck__lastOpened");
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
}

function formatPathLabel(path) {
    if (!path) return "";
    const parts = path.replace(/\.md$/i, "").split("/");
    if (parts.length < 2) return parts[0] || path;
    return parts[1] + " · " + parts[0];
}

function renderContinueSession() {
    const section = document.getElementById("continue-session");
    const link = document.getElementById("continue-link");
    if (!section || !link) return;

    const lastOpened = getLastOpened();
    if (!lastOpened.length) {
        section.hidden = true;
        return;
    }

    const latest = lastOpened[0];
    const titleEl = link.querySelector(".fd-continue-title");
    const metaEl = link.querySelector(".fd-continue-meta");
    const label = formatPathLabel(latest.path);

    titleEl.textContent = label;
    metaEl.textContent = latest.shortDate ? "Opened " + latest.shortDate : "Resume your last table";
    link.href = "?md-file=" + latest.path;
    link.dataset.path = latest.path;
    section.hidden = false;

    link.onclick = handleLastOpened;
}

function handleLastOpened(event) {
    const path = event.currentTarget.dataset.path;
    if (!path) return;

    const shortDate = (new Date()).getMonth() + 1 + "/" + (new Date()).getDate();
    let lastOpened = getLastOpened();
    lastOpened = lastOpened.filter(item => item.path !== path);
    if (lastOpened.length >= 8) lastOpened.pop();
    lastOpened = [{ path, shortDate }, ...lastOpened];
    localStorage.setItem("FitnessDeck__lastOpened", JSON.stringify(lastOpened));
}

window.hydrateDirectoryLinks = function hydrateDirectoryLinks() {
    document.querySelectorAll('a[data-path]').forEach(aEl => {
        aEl.onclick = handleLastOpened;
    });
};

window.annotateLastOpenedOnLinks = function annotateLastOpenedOnLinks() {
    document.querySelectorAll(".last-opened").forEach(el => el.remove());
    const lastOpened = getLastOpened();
    lastOpened.forEach((obj, zIndex) => {
        const link = Array.from(document.querySelectorAll("ul.dirs a[data-path]")).find(
            el => el.dataset.path === obj.path
        );
        if (!link) return;
        const spanEl = document.createElement("span");
        spanEl.textContent = obj.shortDate;
        spanEl.className = "last-opened";
        spanEl.style.zIndex = zIndex;
        link.insertAdjacentElement("afterend", spanEl);
    });
};

function syncModeButtons(mode) {
    const areasBtn = document.getElementById("mode-areas");
    const alphabBtn = document.getElementById("mode-alphab");
    if (!areasBtn || !alphabBtn) return;
    areasBtn.setAttribute("aria-pressed", mode === "AREAS" ? "true" : "false");
    alphabBtn.setAttribute("aria-pressed", mode === "ALPHAB" ? "true" : "false");
}

function initIndexAllUI() {
    const dirsEl = document.querySelector(".dirs");
    if (!dirsEl) return;
    dirsEl.innerHTML = "";

    fetch("icons.config.js")
        .then(response => (response.ok ? response.json() : { icons: [] }))
        .then(customIconsConfig => {
            renderListing(customIconsConfig.icons || []);
        })
        .catch(() => {
            renderListing([]);
        });

    function renderListing(customIcons) {
        const dirs = (window.dirs || []).slice().sort();

        dirs.forEach(dir => {
            const segments = dir.split("/");
            if (segments.length >= 2) {
                let folderName = segments[0];
                if (folderName.length && folderName[0] === "-") {
                    folderName = folderName.split(" ").slice(1).join(" ");
                }
                const fileName = segments[1];
                const isFirstListing = !Boolean(document.querySelector(`[data-folder="${folderName}"]`));

                if (isFirstListing) {
                    const liEl = document.createElement("li");
                    liEl.textContent = folderName;
                    liEl.classList.add("folder");

                    const idFolderName = folderName.replace(/[^a-zA-Z0-9\-]/g, "").toLowerCase();
                    liEl.id = idFolderName;
                    liEl.onclick = () => {
                        window.location.hash = idFolderName;
                    };

                    const matchedCustomIcon = customIcons.filter(customIcon => customIcon.displayName === folderName);
                    if (matchedCustomIcon.length) {
                        liEl.classList.add("custom-icon");
                        liEl.innerHTML = matchedCustomIcon[0].replaceIcon + "&nbsp;" + liEl.textContent;
                    }
                    liEl.setAttribute("data-folder", folderName);
                    dirsEl.append(liEl);
                }

                const fileLi = document.createElement("li");
                fileLi.classList.add("file");
                const aEl = document.createElement("a");
                aEl.href = "?md-file=" + dir;
                aEl.dataset.path = dir;
                aEl.textContent = fileName.replace(/\.md$/i, "");
                aEl.onclick = handleLastOpened;
                fileLi.append(aEl);
                dirsEl.append(fileLi);
            } else {
                const fileLi = document.createElement("li");
                fileLi.classList.add("file");
                const aEl = document.createElement("a");
                aEl.href = "?md-file=" + dir;
                aEl.dataset.path = dir;
                aEl.textContent = dir.replace(/\.md$/i, "");
                aEl.onclick = handleLastOpened;
                fileLi.append(aEl);
                dirsEl.append(fileLi);
            }
        });

        annotateLastOpenedOnLinks();
    }
}

const intIndexBinnedUI = () => sortIntoAreas();

const setIndexMode = (mode) => {
    localStorage.setItem("FitnessDeck__indexMode", mode);
    syncModeButtons(mode);
    if (mode === "ALPHAB") {
        // Ensure .dirs exists if AREAS previously replaced .intro
        const intro = document.querySelector(".intro");
        if (intro && !intro.querySelector(".dirs")) {
            intro.innerHTML = '<section class="dirs-wrapper"><ul class="dirs"></ul></section>';
        }
        initIndexAllUI();
    } else {
        intIndexBinnedUI();
    }
};

const loadIndexInitial = () => {
    let initMode = localStorage.getItem("FitnessDeck__indexMode");
    if (initMode !== "ALPHAB" && initMode !== "AREAS") {
        initMode = "AREAS";
        localStorage.setItem("FitnessDeck__indexMode", "AREAS");
    }
    syncModeButtons(initMode);
    if (initMode === "ALPHAB") {
        initIndexAllUI();
    } else {
        intIndexBinnedUI();
    }
};

function bindGoalChips() {
    document.querySelectorAll(".fd-chip").forEach(chip => {
        chip.addEventListener("click", event => {
            const href = chip.getAttribute("href");
            if (!href || href.charAt(0) !== "#") return;
            event.preventDefault();

            document.querySelectorAll(".fd-chip").forEach(c => c.classList.remove("is-active"));
            chip.classList.add("is-active");

            // Goal headings only exist in AREAS mode
            if (localStorage.getItem("FitnessDeck__indexMode") !== "AREAS") {
                setIndexMode("AREAS");
                setTimeout(() => {
                    const target = document.querySelector(href);
                    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 120);
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

function bindModeToggle() {
    document.getElementById("mode-areas")?.addEventListener("click", () => setIndexMode("AREAS"));
    document.getElementById("mode-alphab")?.addEventListener("click", () => setIndexMode("ALPHAB"));
}

document.addEventListener("DOMContentLoaded", () => {
    renderContinueSession();
    bindGoalChips();
    bindModeToggle();
    loadIndexInitial();
});
