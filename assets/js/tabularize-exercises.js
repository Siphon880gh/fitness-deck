/** Database */

window.indexedDB;
window.dbVersion = 4;

// Database: Safari is not allowing my implementation of indexedDB without clearing cache.
if ('caches' in window) {
    caches.keys().then(function (cacheNames) {
        cacheNames.forEach(function (cacheName) {
            caches.delete(cacheName);
        });
    });
}

// getWebpageIdentifier
function getWebpageIdentifier() {
    const mdFile = (new URLSearchParams(window.location.search)).get("md-file")
    if (mdFile) return mdFile;
    else return "ERROR";
} // getWebpageIdentifier

// Database CRUD
function upgradeDb(event) {
    // alert("onupgradeneeded") // Fixing mobile Safari indexedDB bug
    const db = event.target.result;

    // Create missing stores only — never wipe existing user data on version bumps.
    if (!db.objectStoreNames.contains("FitnessAddressedStore")) {
        var addressedStore = db.createObjectStore("FitnessAddressedStore", { keyPath: "id" });
        addressedStore.createIndex("stateIndex", "state");
    }

    if (!db.objectStoreNames.contains("FitnessCommentStore")) {
        var commentStore = db.createObjectStore("FitnessCommentStore", { keyPath: "id" });
        commentStore.createIndex("commentIndex", "comment");
    }

    if (!db.objectStoreNames.contains("FitnessSessionHistoryStore")) {
        var historyStore = db.createObjectStore("FitnessSessionHistoryStore", { keyPath: "id" });
        historyStore.createIndex("pageKeyIndex", "pageKey", { unique: false });
        historyStore.createIndex("createdAtIndex", "createdAt", { unique: false });
    }

    // alert("upgraded") // Fixing mobile Safari indexedDB bug
} // upgradeDb

function openFitnessDb() {
    return new Promise(function (resolve, reject) {
        var open = indexedDB.open("fitness-deck", window.dbVersion);
        open.onupgradeneeded = upgradeDb;
        open.onsuccess = function () {
            resolve(open.result);
        };
        open.onerror = function () {
            reject(open.error);
        };
    });
}

function newSessionHistoryId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "sess-" + Date.now() + "-" + Math.floor(Math.random() * 1e9);
}

/** Load session history for a page (newest first). */
function loadSessionHistory(pageKey) {
    var key = pageKey || getWebpageIdentifier();
    return openFitnessDb().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction("FitnessSessionHistoryStore", "readonly");
            var store = tx.objectStore("FitnessSessionHistoryStore");
            var index = store.index("pageKeyIndex");
            var request = index.getAll(key);
            request.onsuccess = function () {
                var rows = request.result || [];
                rows.sort(function (a, b) {
                    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
                });
                resolve(rows);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}

/** Insert or update a session history entry. */
function saveSessionHistoryEntry(entry) {
    return openFitnessDb().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction("FitnessSessionHistoryStore", "readwrite");
            var store = tx.objectStore("FitnessSessionHistoryStore");
            var request = store.put(entry);
            request.onsuccess = function () {
                resolve(entry);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}

/** Delete one session history entry by id. */
function deleteSessionHistoryEntry(id) {
    return openFitnessDb().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction("FitnessSessionHistoryStore", "readwrite");
            var store = tx.objectStore("FitnessSessionHistoryStore");
            var request = store.delete(id);
            request.onsuccess = function () {
                resolve(id);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}

function loadAddressed() {
    let open = indexedDB.open("fitness-deck", window.dbVersion);
    //alert(open); // Fixing mobile Safari indexedDB bug

    // Create the schema if version number changes or if this is a fresh user visit

    open.onupgradeneeded = upgradeDb;

    open.onsuccess = function (event) {
        // alert("onsuccess") // Fixing mobile Safari indexedDB bug
        const db = event.target.result;
        let tx = db.transaction("FitnessAddressedStore", "readonly");
        let store = tx.objectStore("FitnessAddressedStore");
        var results = [];


        // alert("Ran -1") // Fixing mobile Safari indexedDB bug
        // store.openCursor().onsuccess = function (event) {
            // const cursor = event.target.result;
            // Continue all lines and push into results array
            // alert("Ran 0") // Fixing mobile Safari indexedDB bug
            // if (cursor) {
            //     results.push(cursor.value);
            //     // alert("Ran 1") // Fixing mobile Safari indexedDB bug
            //     cursor.continue();
            // } else {

        const request = store.get(getWebpageIdentifier());

        request.onsuccess = function () {
            const hasPrev = request.result?true:false;
            const prevData = hasPrev?request.result.value:{}
            console.log({prevData})
            Object.entries(prevData).forEach(([key, value]) => {
                const el = document.querySelector(`[data-id="${CSS.escape(key)}"]`)
                    || Array.from(document.querySelectorAll("[data-id]")).find(node => node.getAttribute("data-id") === key);
                if (!el) return;
                el.classList.remove("addressed-1", "addressed-2", "addressed-3", "addressed-4");
                const match = String(value).match(/addressed-[1-4]/);
                if (match) el.classList.add(match[0]);
            });

        } // on success


        /* This is the old way that works on all browsers except mobile Safari */
        // Get all data from store
        // let request = store.getAll();

        // request.onsuccess = function() {
        //     // Logs all data to console
        //     // console.log(request.result);
        //     request.result.forEach(cellModel=>{
        //         let {id, state} = cellModel;
        //         $(`[data-id="${id}"]`)[0].className = state;
        //     })
        // };

        tx.oncomplete = function () {
            db.close();
            rerenderAddressedStatistic();
            updateColorSwatchAvailability();
            applyExerciseFilters();
        };
    };

    open.onerror = function () {
        console.error("Error", open.error);
        // alert("Error", open.error); // Fixing mobile Safari indexedDB bug
    };
}; // loadAddressed

function clearAddressed() {

    $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i, el) => {
        $(el).removeClass("addressed-1")
            .removeClass("addressed-2")
            .removeClass("addressed-3")
            .removeClass("addressed-4")
    })
    saveAddressed();
}

async function saveAddressed() {
    // alert("savedAd // Fixing mobile Safari indexedDB bugdressed")

    let open = indexedDB.open("fitness-deck", window.dbVersion);
    open.onsuccess = function (event) {
        // alert("DB opened for saving") // Fixing mobile Safari indexedDB bug
        // Start a new transaction
        const db = event.target.result;
        // Fixing mobile Safari indexedDB bug
        // alert(db);
        // alert(db.transaction);
        // alert(db.objectStore);
        // alert(Array.from(db.objectStoreNames).join(", "));
        let tx = db.transaction("FitnessAddressedStore", "readwrite");
        let store = tx.objectStore("FitnessAddressedStore");

        tx.onerror = function (event) {
            console.error("Transaction error:", event.target.error);
            //   alert("Transaction error:", event.target.error); // Fixing mobile Safari indexedDB bug
        };
        store.onerror = function (event) {
            console.error("Store error:", event.target.error);
            //   alert("Store error:", event.target.error); // Fixing mobile Safari indexedDB bug
        };

        // alert("Tx and store opened for saving") // Fixing mobile Safari indexedDB bug


        // Clear all data from store
        // store.clear().onsuccess = function (event,a,b) {

            
            // request.onsuccess = function(event) {

                let refreshData = {};

                // alert("Store resetted to add current cells") // Fixing mobile Safari indexedDB bug
                $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i, el) => {
                    let cellId = $(el).attr("data-id");
                    let state = $(el).attr("class") || "";
                    const match = state.match(/addressed-[1-4]/);
                    if (cellId && match) refreshData[cellId] = match[0];
                });
                store.put({ id: getWebpageIdentifier(), value: refreshData });
            // };

        // };


        // Close the db when the transaction is done
        tx.oncomplete = function () {
            db.close();
        };
    };

    // console.group("A")
    $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i, el) => {
        let a = $(el).attr("data-id");
        let b = $(el).attr("class");
        // console.log({a,b})
    });
    // console.groupEnd();

    open.onerror = function () {
        console.error("Error", open.error);
    };

}; // saveAddressed



function loadComments() {
    let open = indexedDB.open("fitness-deck", window.dbVersion);
    //alert(open); // Fixing mobile Safari indexedDB bug

    // Create the schema if version number changes or if this is a fresh user visit

    open.onupgradeneeded = upgradeDb;


    open.onsuccess = function (event) {
        // alert("onsuccess") // Fixing mobile Safari indexedDB bug
        const db = event.target.result;
        let tx = db.transaction("FitnessCommentStore", "readonly");
        let store = tx.objectStore("FitnessCommentStore");
        var results = [];


        // alert("Ran -1") // Fixing mobile Safari indexedDB bug
        store.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            // Continue all lines and push into results array
            // alert("Ran 0") // Fixing mobile Safari indexedDB bug
            if (cursor) {
                results.push(cursor.value);
                // alert("Ran 1") // Fixing mobile Safari indexedDB bug
                cursor.continue();
            } else {
                console.log('All objects retrieved:', results);
                results.forEach(cellModel => {
                    let { id, comment } = cellModel;
                    console.log(cellModel)
                    $(`[data-id="${id}"]`).text(comment);
                    // alert("Ran 2") // Fixing mobile Safari indexedDB bug
                })
                syncNotesComments();
                applyExerciseFilters();
            }
        };

        /* This is the old way that works on all browsers except mobile Safari */
        // Get all data from store
        // let request = store.getAll();

        // request.onsuccess = function() {
        //     // Logs all data to console
        //     // console.log(request.result);
        //     request.result.forEach(cellModel=>{
        //         let {id, state} = cellModel;
        //         $(`[data-id="${id}"]`)[0].className = state;
        //     })
        // };

        tx.oncomplete = function () {
            db.close();
        };
    };

    open.onerror = function () {
        console.error("Error", open.error);
        // alert("Error", open.error); // Fixing mobile Safari indexedDB bug
    };
}; // loadComments

function saveComment(id, comment) {
    // alert("savedAd // Fixing mobile Safari indexedDB bugdressed")

    let open = indexedDB.open("fitness-deck", window.dbVersion);
    open.onsuccess = function (event) {
        // alert("DB opened for saving") // Fixing mobile Safari indexedDB bug
        // Start a new transaction
        const db = event.target.result;
        // Fixing mobile Safari indexedDB bug
        // alert(db);
        // alert(db.transaction);
        // alert(db.objectStore);
        // alert(Array.from(db.objectStoreNames).join(", "));
        let tx = db.transaction("FitnessCommentStore", "readwrite");
        let store = tx.objectStore("FitnessCommentStore");

        tx.onerror = function (event) {
            console.error("Transaction error:", event.target.error);
            //   alert("Transaction error:", event.target.error); // Fixing mobile Safari indexedDB bug
        };
        store.onerror = function (event) {
            console.error("Store error:", event.target.error);
            //   alert("Store error:", event.target.error); // Fixing mobile Safari indexedDB bug
        };

        // alert("Tx and store opened for saving") // Fixing mobile Safari indexedDB bug

        store.put(
            { id, comment }
        );


        // Close the db when the transaction is done
        tx.oncomplete = function () {
            db.close();
            syncNotesComments();
            applyExerciseFilters();
        };
    };


    open.onerror = function () {
        console.error("Error", open.error);
    };

}; // saveComments

function goRandomRow() {
    const cards = Array.from(document.querySelectorAll(".fd-ex:not(.hidden)")).filter(card => {
        return !card.querySelector(".addressed-1, .addressed-2, .addressed-3, .addressed-4");
    });
    if (!cards.length) return;

    const selected = cards[Math.floor(Math.random() * cards.length)];
    selected.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
        document.querySelectorAll(".fd-ex.is-selected").forEach(el => el.classList.remove("is-selected"));
        selected.classList.add("is-selected");
        if (window.sessionHistoryUi?.setAssignedExercise && selected.dataset.exercise) {
            window.sessionHistoryUi.setAssignedExercise(selected.dataset.exercise);
        }
    }, 400);
}


function isEmptyVariation(text) {
    const t = (text || "").trim().toLowerCase();
    return !t || t === "-" || t === "n/a" || t === ".." || t === "…";
}

function slugifyExercise(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
}

function normalizeExerciseMatch(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/\([^)]*\)/g, " ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function jumpToExerciseCard(card) {
    if (!card) return;
    closeNotesPanel();
    document.querySelectorAll(".fd-ex.is-selected, .fd-ex.is-jump-flash").forEach(el => {
        el.classList.remove("is-selected", "is-jump-flash");
    });
    card.classList.add("is-selected", "is-jump-flash");
    if (window.sessionHistoryUi?.setAssignedExercise && card.dataset.exercise) {
        window.sessionHistoryUi.setAssignedExercise(card.dataset.exercise);
    }
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => card.classList.remove("is-jump-flash"), 1400);
}

function getExerciseCommentText(exerciseName) {
    const card = Array.from(document.querySelectorAll(".fd-ex[data-exercise]")).find(
        el => el.dataset.exercise === exerciseName
    );
    return (card?.querySelector(".fd-ex-comment")?.textContent || "").trim();
}

function getCardMarkColor(card) {
    if (!card) return null;
    for (let n = 1; n <= 4; n++) {
        if (card.querySelector(`.fd-step.addressed-${n}`)) return n;
    }
    return null;
}

function syncNotesMarks() {
    const contentEl = document.getElementById("notes-panel-content");
    if (!contentEl || !window.notesPanelLoaded) return;

    contentEl.querySelectorAll("li.fd-notes-jump[data-exercise-name]").forEach(li => {
        const exerciseName = li.dataset.exerciseName;
        const card = Array.from(document.querySelectorAll(".fd-ex[data-exercise]"))
            .find(el => el.dataset.exercise === exerciseName);
        const mark = getCardMarkColor(card);
        let icon = li.querySelector(":scope > .fd-notes-mark-icon");

        if (!mark) {
            icon?.remove();
            return;
        }

        if (!icon) {
            icon = document.createElement("span");
            icon.className = "fd-notes-mark-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = '<i class="fas fa-paint-brush"></i>';
            const nested = li.querySelector(":scope > ul, :scope > ol, :scope > .fd-notes-user-comment");
            if (nested) li.insertBefore(icon, nested);
            else li.appendChild(icon);
        }

        icon.dataset.mark = String(mark);
        icon.title = "Marked";
    });
}

function syncNotesComments() {
    const contentEl = document.getElementById("notes-panel-content");
    if (!contentEl || !window.notesPanelLoaded) return;

    contentEl.querySelectorAll("li.fd-notes-jump[data-exercise-name]").forEach(li => {
        const exerciseName = li.dataset.exerciseName;
        const comment = getExerciseCommentText(exerciseName);
        let note = li.querySelector(":scope > .fd-notes-user-comment");

        if (!comment) {
            note?.remove();
            return;
        }

        if (!note) {
            note = document.createElement("div");
            note.className = "fd-notes-user-comment";
            const nested = li.querySelector(":scope > ul, :scope > ol");
            if (nested) li.insertBefore(note, nested);
            else li.appendChild(note);
        }
        note.textContent = comment;
    });

    applyNotesFilters();
}

function linkNotesToExercises() {
    const contentEl = document.getElementById("notes-panel-content");
    if (!contentEl) return;

    const byNorm = new Map();
    document.querySelectorAll(".fd-ex[data-exercise]").forEach(card => {
        const name = card.dataset.exercise;
        const key = normalizeExerciseMatch(name);
        if (key) byNorm.set(key, card);
    });
    if (!byNorm.size) return;

    contentEl.querySelectorAll("li").forEach(li => {
        // Prefer this item's own text, not nested list text
        const own = Array.from(li.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && !["UL", "OL", "DIV"].includes(n.tagName)))
            .map(n => n.textContent || "")
            .join(" ")
            .trim();
        if (!own) return;

        const card = byNorm.get(normalizeExerciseMatch(own));
        if (!card) return;

        li.classList.add("fd-notes-jump");
        li.dataset.exerciseName = card.dataset.exercise;
        li.setAttribute("role", "link");
        li.tabIndex = 0;
        li.title = "Jump to " + card.dataset.exercise;
        const go = (event) => {
            if (event.target.closest(".fd-notes-user-comment, .fd-notes-mark-icon")) return;
            event.preventDefault();
            event.stopPropagation();
            jumpToExerciseCard(card);
        };
        li.addEventListener("click", go);
        li.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") go(event);
        });
    });

    syncNotesComments();
    syncNotesMarks();
}

function shortDifficultyLabel(headerText, index) {
    const h = (headerText || "").toLowerCase();
    if (h.includes("easiest")) return "Easiest";
    if (h.includes("easier")) return "Easier";
    if (h.includes("standard")) return "Standard";
    if (h.includes("harder") && !h.includes("hardest")) return "Harder";
    if (h.includes("hardest")) return "Hardest";
    const fallback = ["Easiest", "Easier", "Standard", "Harder", "Hardest"];
    return fallback[index] || ("Step " + (index + 1));
}

function buildExerciseDeck(tableEl) {
    const headerCells = tableEl.querySelectorAll("thead th");
    let headers = Array.from(headerCells).map(th => th.textContent.trim());
    const bodyRows = tableEl.querySelectorAll("tbody tr");

    if (!headers.length && tableEl.querySelector("tr")) {
        headers = Array.from(tableEl.querySelectorAll("tr:first-child th, tr:first-child td")).map(c => c.textContent.trim());
    }

    const variationIndexes = [];
    const instructionIndexes = [];
    headers.forEach((h, i) => {
        if (/variation/i.test(h)) variationIndexes.push(i);
        if (/instruction/i.test(h)) instructionIndexes.push(i);
    });
    const commentIndex = headers.length ? headers.length - 1 : -1;
    const nameIndex = 0;
    const metaIndexes = headers.map((h, i) => {
        if (i === nameIndex || i === commentIndex) return -1;
        if (/variation/i.test(h)) return -1;
        if (/instruction/i.test(h)) return -1;
        return i;
    }).filter(i => i >= 0);

    const deck = document.createElement("div");
    deck.className = "fd-deck";
    deck.id = "fd-deck";

    const rows = bodyRows.length
        ? bodyRows
        : Array.from(tableEl.querySelectorAll("tr")).slice(headers.length ? 1 : 0);

    rows.forEach(tr => {
        const cells = Array.from(tr.querySelectorAll("td"));
        if (!cells.length) return;

        const nameCell = cells[nameIndex];
        const rawName = (nameCell?.textContent || "").trim();
        if (!rawName) return;

        const card = document.createElement("article");
        card.className = "fd-ex";
        card.dataset.exercise = rawName;
        card.id = "exercise-" + slugifyExercise(rawName);

        const mediaSlot = document.createElement("div");
        mediaSlot.className = "fd-ex-media";
        mediaSlot.hidden = true;
        card.appendChild(mediaSlot);

        const head = document.createElement("header");
        head.className = "fd-ex-head";

        const title = document.createElement("h3");
        title.className = "fd-ex-name";
        const hasParenDetail = /\([^)]+\)/.test(rawName);
        title.innerHTML = rawName.replace(/\((.*?)\)/g, '<span class="text-parentheses">($1)</span>');

        const titleWrap = document.createElement("div");
        titleWrap.className = "fd-ex-title-wrap";
        titleWrap.appendChild(title);

        if (hasParenDetail) {
            card.classList.add("has-detail");
            const detailBtn = document.createElement("button");
            detailBtn.type = "button";
            detailBtn.className = "fd-ex-detail-btn";
            detailBtn.textContent = "Detail";
            detailBtn.setAttribute("aria-expanded", "false");
            detailBtn.setAttribute("aria-label", "Show name details");
            detailBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                const open = card.classList.toggle("is-detail-open");
                detailBtn.setAttribute("aria-expanded", open ? "true" : "false");
                detailBtn.setAttribute("aria-label", open ? "Hide name details" : "Show name details");
                detailBtn.textContent = open ? "Hide" : "Detail";
            });
            titleWrap.appendChild(detailBtn);
        }

        const icons = document.createElement("div");
        icons.className = "ri-icon-hook";
        if (!rawName.includes("*Note") && !rawName.includes("* Note")) {
            let query = rawName + ((/stretch|exercise/i).test(rawName) ? "" : " exercise");
            query = query.replace(/^[\s\W]+/, "");
            query = query.replace(/\s*\([^)]*\)\s*/g, " ").trim();
            const g = document.createElement("a");
            g.className = "btn-action ri-google-fill";
            g.href = "https://www.google.com/search?q=" + encodeURIComponent(query) + "&tbm=isch";
            g.target = "_blank";
            g.rel = "noopener";
            g.setAttribute("aria-label", "Search images for " + rawName);
            g.addEventListener("click", e => e.stopPropagation());
            icons.appendChild(g);
        }

        head.appendChild(titleWrap);
        head.appendChild(icons);
        card.appendChild(head);

        const metaParts = metaIndexes.map(i => (cells[i]?.textContent || "").trim()).filter(t => !isEmptyVariation(t));
        if (metaParts.length) {
            const meta = document.createElement("p");
            meta.className = "fd-ex-meta";
            meta.textContent = metaParts.join(" · ");
            card.appendChild(meta);
        }

        const instructionParts = instructionIndexes
            .map(i => (cells[i]?.textContent || "").trim())
            .filter(t => !isEmptyVariation(t));
        if (instructionParts.length) {
            const instructions = document.createElement("p");
            instructions.className = "fd-ex-instructions";
            instructions.textContent = instructionParts.join(" ");
            card.appendChild(instructions);
        }

        const ladder = document.createElement("ol");
        ladder.className = "fd-ladder";

        variationIndexes.forEach((colIndex, stepIndex) => {
            const cell = cells[colIndex];
            const text = (cell?.textContent || "").trim();
            const step = document.createElement("li");
            step.className = "fd-step" + (isEmptyVariation(text) ? " is-empty" : "");
            step.dataset.id = `${rawName}-${colIndex}`;
            step.setAttribute("data-id", `${rawName}-${colIndex}`);

            const label = document.createElement("span");
            label.className = "fd-step-label";
            label.textContent = shortDifficultyLabel(headers[colIndex], stepIndex);

            const body = document.createElement("span");
            body.className = "fd-step-text";
            body.textContent = isEmptyVariation(text) ? "—" : text;

            step.appendChild(label);
            step.appendChild(body);
            ladder.appendChild(step);
        });

        card.appendChild(ladder);

        const comment = document.createElement("div");
        comment.className = "fd-ex-comment";
        comment.contentEditable = "true";
        comment.dataset.id = rawName;
        comment.setAttribute("data-id", rawName);
        comment.setAttribute("data-placeholder", "Comments");
        comment.addEventListener("blur", () => {
            saveComment(rawName, comment.textContent || "");
            animateSaved();
        });
        card.appendChild(comment);

        deck.appendChild(card);
    });

    return deck;
}

function hydrateDeckInteractions() {
    const DRAG_RESET_PX = 8;

    function clearAllAddressedFlags($el) {
        $el.removeClass("addressed-1 addressed-2 addressed-3 addressed-4");
    }

    function persistMarkClear($el) {
        clearAllAddressedFlags($el);
        rerenderAddressedStatistic();
        saveAddressed();
        animateSaved();
    }

    function causeColorChange(el) {
        if (el.classList.contains("is-empty")) return;
        const $el = $(el);
        const unaddressed = !el.className.includes("addressed");
        if (unaddressed) {
            $el.addClass("addressed-1");
        } else if ($el.hasClass("addressed-1")) {
            clearAllAddressedFlags($el);
            $el.addClass("addressed-2");
        } else if ($el.hasClass("addressed-2")) {
            clearAllAddressedFlags($el);
            $el.addClass("addressed-3");
        } else if ($el.hasClass("addressed-3")) {
            clearAllAddressedFlags($el);
            $el.addClass("addressed-4");
        } else if ($el.hasClass("addressed-4")) {
            clearAllAddressedFlags($el);
        }
        rerenderAddressedStatistic();
        saveAddressed();
        animateSaved();
    }

    document.querySelectorAll(".fd-step").forEach(step => {
        let dragReset = null;
        const ladder = step.closest(".fd-ladder");

        const abandonDragReset = () => {
            if (!dragReset) return;
            window.removeEventListener("pointermove", onWindowPointerMove, true);
            window.removeEventListener("pointerup", onWindowPointerUp, true);
            window.removeEventListener("pointercancel", onWindowPointerCancel, true);
            dragReset = null;
        };

        const onWindowPointerCancel = (event) => {
            if (!dragReset || event.pointerId !== dragReset.pointerId) return;
            step.dataset.fdDragCleared = "";
            abandonDragReset();
        };

        const onWindowPointerMove = (event) => {
            if (!dragReset || event.pointerId !== dragReset.pointerId) return;
            const under = document.elementFromPoint(event.clientX, event.clientY);
            // Page scroll moves the ladder out from under the pointer — do not clear
            if (!ladder || !under || !ladder.contains(under)) {
                dragReset.leftLadder = true;
            }
            const dx = event.clientX - dragReset.startX;
            const dy = event.clientY - dragReset.startY;
            if (Math.hypot(dx, dy) >= DRAG_RESET_PX) dragReset.moved = true;
        };

        const onWindowPointerUp = (event) => {
            if (!dragReset || event.pointerId !== dragReset.pointerId) return;
            let cleared = false;
            const under = document.elementFromPoint(event.clientX, event.clientY);
            const releasedInLadder = !!(under && ladder && ladder.contains(under));
            // Same UI = the variation ladder (covers both vertical list and 5-col grid)
            if (
                dragReset.moved &&
                !dragReset.leftLadder &&
                releasedInLadder &&
                step.className.includes("addressed")
            ) {
                persistMarkClear($(step));
                cleared = true;
            }
            step.dataset.fdDragCleared = cleared ? "1" : "";
            abandonDragReset();
        };

        step.addEventListener("pointerdown", event => {
            if (event.button !== 0) return;
            if (step.classList.contains("is-empty")) return;
            if (!step.className.includes("addressed")) return;
            abandonDragReset();
            dragReset = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                moved: false,
                leftLadder: false
            };
            window.addEventListener("pointermove", onWindowPointerMove, true);
            window.addEventListener("pointerup", onWindowPointerUp, true);
            window.addEventListener("pointercancel", onWindowPointerCancel, true);
        });

        step.addEventListener("click", event => {
            event.stopPropagation();
            if (step.dataset.fdDragCleared === "1") {
                step.dataset.fdDragCleared = "";
                return;
            }
            const card = step.closest(".fd-ex");
            document.querySelectorAll(".fd-ex.is-selected").forEach(el => el.classList.remove("is-selected"));
            card?.classList.add("is-selected");
            if (window.sessionHistoryUi?.setAssignedExercise && card?.dataset.exercise) {
                window.sessionHistoryUi.setAssignedExercise(card.dataset.exercise);
            }
            causeColorChange(step);
        });
        step.addEventListener("contextmenu", event => {
            if (!step.className.includes("addressed")) return;
            event.preventDefault();
            persistMarkClear($(step));
        });
    });

    document.querySelectorAll(".fd-ex").forEach(card => {
        card.addEventListener("click", event => {
            if (event.target.closest(".fd-step, .fd-ex-comment, .ri-icon-hook, .fd-ex-detail-btn, a")) return;
            document.querySelectorAll(".fd-ex.is-selected").forEach(el => el.classList.remove("is-selected"));
            card.classList.add("is-selected");
            if (window.sessionHistoryUi?.setAssignedExercise && card.dataset.exercise) {
                window.sessionHistoryUi.setAssignedExercise(card.dataset.exercise);
            }
        });
    });
}

window.rerenderAddressedStatistic = () => {
    const count = document.querySelectorAll(".fd-step.addressed-1, .fd-step.addressed-2, .fd-step.addressed-3, .fd-step.addressed-4").length;
    const total = document.querySelectorAll(".fd-ex").length;
    const el = document.getElementById("addressed");
    const countEl = el?.querySelector(".fd-addressed-count");
    if (countEl) countEl.textContent = `${count}/${total}`;
    else if (el) el.textContent = `${count}/${total}`;
    updateColorSwatchAvailability();
    syncNotesMarks();
    applyNotesFilters();
};

const animateSaved = () => {
    $("#save-status").stop(true, true).css("display", "inline-flex").hide().fadeIn(400, function () {
        $(this).delay(200).fadeOut(150);
    });
};

function getPageMediaKey() {
    const mdFile = (new URLSearchParams(window.location.search)).get("md-file") || "";
    return mdFile.replace(/\.md$/i, "");
}

window.__fdMediaIndexPromise = null;

function loadExerciseMediaIndex() {
    if (!window.__fdMediaIndexPromise) {
        window.__fdMediaIndexPromise = fetch("assets/data/exercise-media-index.json", { cache: "no-cache" })
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null);
    }
    return window.__fdMediaIndexPromise;
}

function mediaManifestPathForPage(pageKey, index) {
    const entry = index?.pages?.[pageKey];
    return entry?.manifest || null;
}

function attachExerciseMedia(manifest, root = document) {
    if (!manifest || !manifest.byExercise) return 0;
    const byExercise = manifest.byExercise;
    let attached = 0;
    const scope = root.querySelectorAll ? root : document;

    scope.querySelectorAll(".fd-ex").forEach(card => {
        const name = card.dataset.exercise;
        const media = byExercise[name];
        if (!media || !media.gifUrl) return;

        const slot = card.querySelector(".fd-ex-media");
        if (!slot || slot.querySelector(".fd-ex-figure")) return;

        const figure = document.createElement("figure");
        figure.className = "fd-ex-figure";

        const img = document.createElement("img");
        img.className = "fd-ex-gif";
        img.alt = (media.sourceName || name) + " demonstration";
        img.loading = "lazy";
        img.decoding = "async";
        // Static thumb first; swap to GIF when near viewport
        img.src = media.imageUrl || media.gifUrl;
        img.dataset.gifUrl = media.gifUrl;
        img.dataset.staticUrl = media.imageUrl || media.gifUrl;

        const cap = document.createElement("figcaption");
        cap.className = "fd-ex-media-cap";
        cap.textContent = media.sourceName ? ("Demo: " + media.sourceName) : "Demo";

        figure.appendChild(img);
        figure.appendChild(cap);
        slot.appendChild(figure);
        slot.hidden = false;
        card.classList.add("has-media");
        attached++;
    });

    return attached;
}

function bindExerciseGifLazyLoad(root = document) {
    const gifs = root.querySelectorAll(".fd-ex-gif");
    if (!gifs.length) return;

    // Promote to animated GIF when visible (saves bandwidth)
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                if (img.dataset.gifUrl && img.src !== img.dataset.gifUrl) {
                    img.src = img.dataset.gifUrl;
                }
                io.unobserve(img);
            });
        }, { rootMargin: "120px 0px" });
        gifs.forEach(img => io.observe(img));
    } else {
        gifs.forEach(img => {
            if (img.dataset.gifUrl) img.src = img.dataset.gifUrl;
        });
    }
}

function openCreditsModal() {
    const modal = document.getElementById("credits-modal");
    if (!modal) return;
    modal.hidden = false;
    modal.style.display = "block";
    document.getElementById("credits-modal-close")?.focus();
}

function closeCreditsModal() {
    const modal = document.getElementById("credits-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.style.display = "none";
}

function bindCreditsModalOnce() {
    if (window.__fdCreditsModalBound) return;
    window.__fdCreditsModalBound = true;

    document.getElementById("credits-modal-close")?.addEventListener("click", closeCreditsModal);
    document.getElementById("credits-modal")?.addEventListener("click", (event) => {
        if (event.target.id === "credits-modal") closeCreditsModal();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeCreditsModal();
    });
}

function renderMediaAttribution(attribution, count) {
    bindCreditsModalOnce();

    let bar = document.getElementById("fd-media-attribution");
    if (!bar) {
        bar = document.createElement("aside");
        bar.id = "fd-media-attribution";
        bar.className = "fd-media-attribution";
        document.querySelector(".container")?.appendChild(bar);
    }

    bar.innerHTML = "";
    const link = document.createElement("button");
    link.type = "button";
    link.className = "fd-credits-link";
    link.textContent = "Credits";
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", openCreditsModal);
    bar.appendChild(link);

    const body = document.getElementById("credits-modal-body");
    if (!body) return;

    const linksHtml = (attribution.links || []).map(l =>
        `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`
    ).join("");

    body.innerHTML = `
        <p class="fd-credits-lead">${attribution.text || ""}</p>
        <p class="fd-media-attr-meta">${count} exercises on this page matched to open demo media.</p>
        <p class="fd-credits-sources-label">Sources</p>
        <ul class="fd-credits-links">${linksHtml}</ul>
        <p class="fd-credits-note">Media © Gym visual via AscendAPI ExerciseDB. Intended for non-commercial use; credit required.</p>
    `;
}

function loadExerciseMediaManifest() {
    const pageKey = getPageMediaKey();
    return loadExerciseMediaIndex()
        .then(index => {
            const path = mediaManifestPathForPage(pageKey, index);
            if (!path) return null;
            return fetch(path, { cache: "force-cache" }).then(r => (r.ok ? r.json() : null));
        })
        .catch(err => {
            console.warn("Exercise media load failed", err);
            return null;
        });
}

function loadExerciseMediaForPage(root = document) {
    return loadExerciseMediaManifest()
        .then(manifest => {
            if (!manifest) return;
            const attached = attachExerciseMedia(manifest, root);
            bindExerciseGifLazyLoad(root);
            if (manifest.attribution && attached > 0) {
                renderMediaAttribution(manifest.attribution, attached);
            }
        });
}

// Render MD File as exercise cards with difficulty ladders
function renderMDFile() {
    const isFailed = (myMarkdown) => {
        return myMarkdown.substring(0, 70).toLowerCase().includes("file not found");
    };
    const getFailed = () => {
        return "ERROR: Not able to read. Has it been published? Contact author.";
    };

    // Fetch media in parallel so cards paint with the media layout already applied
    const mediaPromise = loadExerciseMediaManifest();

    fetch(encodeURI(filename), { cache: "no-cache" })
        .then(response => response.text())
        .then(async myMarkdown => {
            if (isFailed(myMarkdown)) {
                document.querySelector(".container").innerHTML = getFailed();
                return;
            }

            const md = window.markdownit({ linkify: true, breaks: true });
            let lines = myMarkdown.split("\n");
            lines[0] += "Edit Comments |";
            lines[1] += "--------------|";
            lines = lines.map((line, i) => (i <= 1 ? line : line + "  |"));
            myMarkdown = lines.join("\n");

            const result = md.render(myMarkdown, { html: true });
            const host = document.querySelector(".container");
            host.innerHTML = result.replaceAll("\\n", "<br/>");
            host.classList.add("fd-deck-host");

            const table = host.querySelector("table");
            if (!table) {
                host.textContent = "No exercise table found in this file.";
                return;
            }

            const deck = buildExerciseDeck(table);
            const manifest = await mediaPromise;
            let attached = 0;
            if (manifest) {
                attached = attachExerciseMedia(manifest, deck);
            }

            host.innerHTML = "";
            host.appendChild(deck);

            if (manifest) {
                bindExerciseGifLazyLoad(deck);
                if (manifest.attribution && attached > 0) {
                    renderMediaAttribution(manifest.attribution, attached);
                }
            }

            if (!document.getElementById("addressed")) {
                const addressed = document.createElement("div");
                addressed.id = "addressed";
                addressed.innerHTML =
                    '<i class="fas fa-paint-brush fd-mark-brush" aria-hidden="true"></i>' +
                    '<span class="fd-addressed-label">Marked</span>' +
                    '<span class="fd-addressed-count">0/0</span>';
                addressed.addEventListener("click", () => {
                    if (confirm("Clear all marked colors?")) {
                        clearAddressed();
                        rerenderAddressedStatistic();
                    }
                });
                const actions = document.querySelector(".fd-top-actions");
                const searchWrap = actions?.querySelector(".fd-search-wrap");
                if (actions && searchWrap) {
                    actions.insertBefore(addressed, searchWrap);
                } else {
                    document.getElementById("top-bar")?.appendChild(addressed);
                }
            }

            hydrateDeckInteractions();
            loadAddressed();
            loadComments();
            $("#count-rows").text(document.querySelectorAll(".fd-ex").length);
            rerenderAddressedStatistic();
            document.dispatchEvent(new CustomEvent("fd-deck-ready"));
        })
        .catch(err => {
            document.querySelector(".container").innerHTML = String(err);
        });
}

window.fdFilterState = {
    search: "",
    colorMode: 5, // 5 = no color filter
    commentMode: "all" // all | with | without
};

function cardHasComment(card) {
    return !!((card.querySelector(".fd-ex-comment")?.textContent || "").trim());
}

function applyExerciseFilters() {
    const { search, colorMode, commentMode } = window.fdFilterState;
    let visible = 0;

    document.querySelectorAll(".fd-ex").forEach(card => {
        const text = (card.textContent || "").toLowerCase();
        const matchesSearch = !search || text.includes(search);
        const matchesColor = colorMode === 5 || !!card.querySelector(`.fd-step.addressed-${colorMode}`);
        const hasComment = cardHasComment(card);
        const matchesComment =
            commentMode === "all" ||
            (commentMode === "with" && hasComment) ||
            (commentMode === "without" && !hasComment);
        const show = matchesSearch && matchesColor && matchesComment;
        card.classList.toggle("hidden", !show);
        if (show) visible++;
    });

    $("#count-rows").text(visible);
    return visible;
}

const FD_COLOR_FILTER_LABELS = {
    1: "Green",
    2: "Cyan",
    3: "Pink",
    4: "Purple"
};

const FD_COMMENT_FILTER_LABELS = {
    with: "With comments",
    without: "No comments"
};

function getNotesJumpCard(li) {
    const exerciseName = li.dataset.exerciseName;
    if (!exerciseName) return null;
    return Array.from(document.querySelectorAll(".fd-ex[data-exercise]"))
        .find(el => el.dataset.exercise === exerciseName) || null;
}

function notesFiltersActive() {
    const { commentMode, colorMode } = window.fdFilterState;
    return commentMode !== "all" || colorMode !== 5;
}

function getNotesFilterLabels() {
    const { commentMode, colorMode } = window.fdFilterState;
    const labels = [];
    if (commentMode !== "all" && FD_COMMENT_FILTER_LABELS[commentMode]) {
        labels.push(FD_COMMENT_FILTER_LABELS[commentMode]);
    }
    if (colorMode !== 5 && FD_COLOR_FILTER_LABELS[colorMode]) {
        labels.push(FD_COLOR_FILTER_LABELS[colorMode]);
    }
    return labels;
}

function syncNotesFilterBanner() {
    const contentEl = document.getElementById("notes-panel-content");
    if (!contentEl || !window.notesPanelLoaded) return;

    let banner = contentEl.querySelector(":scope > .fd-notes-filter-banner");
    const active = notesFiltersActive();

    if (!active) {
        banner?.remove();
        return;
    }

    if (!banner) {
        banner = document.createElement("div");
        banner.className = "fd-notes-filter-banner";
        banner.innerHTML =
            '<div class="fd-notes-filter-banner-text">' +
            '<span class="fd-notes-filter-banner-label">Filtered</span>' +
            '<span class="fd-notes-filter-banner-detail"></span>' +
            "</div>" +
            '<button type="button" class="fd-notes-filter-clear">Clear filter</button>';
        banner.querySelector(".fd-notes-filter-clear").addEventListener("click", clearAllFilters);
        contentEl.insertBefore(banner, contentEl.firstChild);
    }

    const detail = banner.querySelector(".fd-notes-filter-banner-detail");
    if (detail) detail.textContent = getNotesFilterLabels().join(" · ");
}

function applyNotesFilters() {
    const contentEl = document.getElementById("notes-panel-content");
    if (!contentEl || !window.notesPanelLoaded) return;

    const { commentMode, colorMode } = window.fdFilterState;
    const filtering = notesFiltersActive();

    contentEl.querySelectorAll("li.fd-notes-jump").forEach(li => {
        const hasComment = !!li.querySelector(":scope > .fd-notes-user-comment");
        const matchesComment =
            commentMode === "all" ||
            (commentMode === "with" && hasComment) ||
            (commentMode === "without" && !hasComment);
        const mark = getCardMarkColor(getNotesJumpCard(li));
        const matchesColor = colorMode === 5 || mark === colorMode;
        li.classList.toggle("hidden", !(matchesComment && matchesColor));
    });

    // When filtering, hide non-exercise list lines (variations, etc.)
    contentEl.querySelectorAll("li:not(.fd-notes-jump)").forEach(li => {
        li.classList.toggle("hidden", filtering);
    });

    syncNotesFilterBanner();
}

function syncFilterPanelUI() {
    const { commentMode, colorMode } = window.fdFilterState;

    document.querySelectorAll("#fd-filter-panel [data-comment-filter]").forEach(btn => {
        const active = btn.dataset.commentFilter === commentMode;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    document.querySelectorAll("#fd-filter-panel .fd-color-swatch").forEach(btn => {
        const value = Number(btn.dataset.colorFilter);
        const active = colorMode === value;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const filterBtn = document.getElementById("btn-filter");
    const hasActive = commentMode !== "all" || colorMode !== 5;
    filterBtn?.classList.toggle("has-active-filter", hasActive);
}

function updateColorSwatchAvailability() {
    let clearedColor = false;
    document.querySelectorAll("#fd-filter-panel .fd-color-swatch").forEach(btn => {
        const value = Number(btn.dataset.colorFilter);
        const count = document.querySelectorAll(`.fd-step.addressed-${value}`).length;
        const available = count > 0;
        btn.classList.toggle("is-unavailable", !available);
        btn.disabled = !available;
        if (!available && window.fdFilterState.colorMode === value) {
            window.fdFilterState.colorMode = 5;
            window.modeAt = 5;
            clearedColor = true;
        }
    });
    syncFilterPanelUI();
    if (clearedColor) {
        applyExerciseFilters();
        applyNotesFilters();
    }
}

function setCommentFilter(mode) {
    // Toggle off if the same chip is clicked again
    if (window.fdFilterState.commentMode === mode) {
        window.fdFilterState.commentMode = "all";
    } else {
        window.fdFilterState.commentMode = mode;
    }
    syncFilterPanelUI();
    applyExerciseFilters();
    applyNotesFilters();
}

function setColorFilter(mode) {
    const value = Number(mode);
    if (window.fdFilterState.colorMode === value) {
        window.fdFilterState.colorMode = 5;
        window.modeAt = 5;
    } else {
        window.fdFilterState.colorMode = value;
        window.modeAt = value;
    }
    syncFilterPanelUI();
    applyExerciseFilters();
    applyNotesFilters();
}

function clearAllFilters() {
    window.fdFilterState.commentMode = "all";
    window.fdFilterState.colorMode = 5;
    window.modeAt = 5;
    // Keep search as typed; clear means comment + color filters
    syncFilterPanelUI();
    applyExerciseFilters();
    applyNotesFilters();
}

function toggleFilterPanel() {
    const panel = document.getElementById("fd-filter-panel");
    const btn = document.getElementById("btn-filter");
    if (!panel || !btn) return;

    const opening = panel.hidden;
    if (opening) {
        updateColorSwatchAvailability();
        panel.hidden = false;
        btn.classList.add("active");
        btn.setAttribute("aria-expanded", "true");
    } else {
        panel.hidden = true;
        btn.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
    }
}

function closeFilterPanel() {
    const panel = document.getElementById("fd-filter-panel");
    const btn = document.getElementById("btn-filter");
    if (!panel) return;
    panel.hidden = true;
    btn?.classList.remove("active");
    btn?.setAttribute("aria-expanded", "false");
}

function bindFilterPanel() {
    document.querySelectorAll("#fd-filter-panel [data-comment-filter]").forEach(btn => {
        btn.addEventListener("click", () => setCommentFilter(btn.dataset.commentFilter || "all"));
    });
    document.querySelectorAll("#fd-filter-panel .fd-color-swatch").forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;
            setColorFilter(btn.dataset.colorFilter);
        });
    });
    document.getElementById("fd-filter-clear")?.addEventListener("click", clearAllFilters);

    document.addEventListener("click", (event) => {
        const panel = document.getElementById("fd-filter-panel");
        if (!panel || panel.hidden) return;
        if (event.target.closest("#fd-filter-panel, #btn-filter")) return;
        closeFilterPanel();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    bindFilterPanel();
    renderMDFile();
});

function bindToInnerSearch() {
    window.fdFilterState.search = ($("#bind-inner-search").val() || "").toLowerCase().trim();
    applyExerciseFilters();
}



/* Notes Panel Functions */
window.notesPanelLoaded = false;

function toggleNotesPanel() {
    const panel = document.getElementById('notes-panel');
    const overlay = document.getElementById('notes-overlay');
    const btnNotes = document.getElementById('btn-notes');
    
    if (!panel || !overlay) return;
    
    const isActive = panel.classList.contains('active');
    
    if (isActive) {
        closeNotesPanel();
    } else {
        panel.classList.add('active');
        overlay.classList.add('active');
        btnNotes?.classList.add('active');
        
        // Load content if not already loaded
        if (!window.notesPanelLoaded && window.upMdExists) {
            loadNotesContent();
        }
    }
}

function closeNotesPanel() {
    const panel = document.getElementById('notes-panel');
    const overlay = document.getElementById('notes-overlay');
    const btnNotes = document.getElementById('btn-notes');
    
    panel?.classList.remove('active');
    overlay?.classList.remove('active');
    btnNotes?.classList.remove('active');
}

function loadNotesContent() {
    const contentEl = document.getElementById('notes-panel-content');
    if (!contentEl) return;
    
    fetch(encodeURI(window.upMdFilename), { cache: "no-cache" })
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.text();
        })
        .then(markdown => {
            var md = window.markdownit({
                linkify: true,
                breaks: true
            });
            var rendered = md.render(markdown);
            contentEl.innerHTML = rendered;
            window.notesPanelLoaded = true;
            
            // Make links open in new window
            contentEl.querySelectorAll('a').forEach(a => {
                a.setAttribute('target', '_blank');
            });

            // List items that match deck exercises jump-scroll to that card
            linkNotesToExercises();
            
            // Build section navigation
            buildSectionNav();
        })
        .catch(err => {
            contentEl.innerHTML = '<p style="color: #bc6c25;">Unable to load notes file.</p>';
            console.error('Notes panel error:', err);
        });
}

/* Section Navigation for Notes Panel */
window.currentSectionIndex = 0;
window.noteSections = [];
window.isJumpingToSection = false;

function buildSectionNav() {
    const contentEl = document.getElementById('notes-panel-content');
    const h2s = contentEl.querySelectorAll('h2');
    
    if (h2s.length < 2) return; // Need at least 2 sections for nav
    
    // Store sections with their elements and titles
    window.noteSections = Array.from(h2s).map((h2, index) => ({
        element: h2,
        title: h2.textContent.trim(),
        index: index
    }));
    
    // Add IDs to h2s for scrolling
    window.noteSections.forEach((section, i) => {
        section.element.id = `notes-section-${i}`;
    });
    
    // Create section nav container
    const navContainer = document.createElement('div');
    navContainer.id = 'notes-section-nav';
    navContainer.className = 'collapsed'; // Start collapsed
    
    // Build all section items
    let navHTML = '<div class="section-nav-list">';
    
    // Previous sections (above current)
    navHTML += '<div class="section-nav-prev-list"></div>';
    
    // Current section indicator
    navHTML += '<div class="section-nav-current"></div>';
    
    // Next sections (below current)
    navHTML += '<div class="section-nav-next-list"></div>';
    
    navHTML += '</div>';
    
    // Add expand/collapse toggle
    navHTML += '<div class="section-nav-toggle" onclick="toggleSectionNav()"><span class="toggle-icon">▾</span></div>';
    
    navContainer.innerHTML = navHTML;
    
    // Insert nav after header
    const header = document.getElementById('notes-panel-header');
    header.parentNode.insertBefore(navContainer, header.nextSibling);
    
    // Set up scroll observer
    setupSectionObserver();
    updateSectionNav();
}

function setupSectionObserver() {
    const contentEl = document.getElementById('notes-panel-content');
    
    const observer = new IntersectionObserver((entries) => {
        // Skip observer updates during programmatic jumps
        if (window.isJumpingToSection) return;
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const index = parseInt(id.replace('notes-section-', ''));
                if (!isNaN(index)) {
                    window.currentSectionIndex = index;
                    updateSectionNav();
                }
            }
        });
    }, {
        root: contentEl,
        threshold: 0.5,
        rootMargin: '-20% 0px -60% 0px'
    });
    
    window.noteSections.forEach(section => {
        observer.observe(section.element);
    });
}

function updateSectionNav() {
    const sections = window.noteSections;
    const current = window.currentSectionIndex;
    
    const navContainer = document.getElementById('notes-section-nav');
    const prevList = document.querySelector('.section-nav-prev-list');
    const currentEl = document.querySelector('.section-nav-current');
    const nextList = document.querySelector('.section-nav-next-list');
    
    // Build previous sections
    let prevHTML = '';
    for (let i = 0; i < current; i++) {
        prevHTML += `<div class="section-item section-prev" onclick="jumpToSection(${i})">
            <span class="section-arrow">↑</span>
            <span class="section-title">${sections[i].title}</span>
        </div>`;
    }
    prevList.innerHTML = prevHTML;
    
    // Build current section
    currentEl.innerHTML = `<div class="section-item section-active">
        <span class="section-marker">●</span>
        <span class="section-title">${sections[current].title}</span>
    </div>`;
    
    // Build next sections
    let nextHTML = '';
    for (let i = current + 1; i < sections.length; i++) {
        nextHTML += `<div class="section-item section-next" onclick="jumpToSection(${i})">
            <span class="section-arrow">↓</span>
            <span class="section-title">${sections[i].title}</span>
        </div>`;
    }
    nextList.innerHTML = nextHTML;
    
    // Scroll nav to keep current section visible
    scrollNavToCurrentSection();
}

function scrollNavToCurrentSection() {
    const navList = document.querySelector('.section-nav-list');
    const currentEl = document.querySelector('.section-nav-current');
    
    if (!navList || !currentEl) return;
    
    // Get positions
    const listRect = navList.getBoundingClientRect();
    const currentRect = currentEl.getBoundingClientRect();
    
    // Calculate where current section is relative to the list container
    const currentTop = currentRect.top - listRect.top + navList.scrollTop;
    const listHeight = navList.clientHeight;
    
    // Scroll to center the current section in the list
    const targetScroll = currentTop - (listHeight / 2) + (currentRect.height / 2);
    
    navList.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
    });
}

function jumpToSection(index) {
    const section = window.noteSections[index];
    if (section) {
        // Pause observer during jump
        window.isJumpingToSection = true;
        window.currentSectionIndex = index;
        updateSectionNav();
        
        section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Re-enable observer after scroll completes
        setTimeout(() => {
            window.isJumpingToSection = false;
        }, 500);
    }
}

function toggleSectionNav() {
    const nav = document.getElementById('notes-section-nav');
    if (nav) {
        nav.classList.toggle('collapsed');
    }
}

// Close panel on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeNotesPanel();
        closeFilterPanel();
    }
});

window.modeAt = 0;
window.cycleMode = () => {
    // Kept for compatibility; Filter tool opens the panel instead.
    toggleFilterPanel();
};

function showFilterToast(message, colorClass) {
    let toast = document.getElementById('filter-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'filter-toast';
        toast.className = 'filter-toast';
        document.body.appendChild(toast);
    }
    
    toast.className = 'filter-toast ' + colorClass;
    toast.textContent = message;
    
    // Trigger reflow to restart animation
    toast.offsetHeight;
    toast.classList.add('show');
    
    clearTimeout(window.filterToastTimeout);
    window.filterToastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 1500);
}

/* First-run legend: teach colors/comments/tools once */
(function initFirstRunLegend() {
    const KEY = "FitnessDeck__legendDismissed";
    const legend = document.getElementById("first-run-legend");
    const dismissBtn = document.getElementById("dismiss-legend");
    if (!legend || !dismissBtn) return;

    if (localStorage.getItem(KEY) !== "1") {
        legend.hidden = false;
    }

    dismissBtn.addEventListener("click", () => {
        localStorage.setItem(KEY, "1");
        legend.hidden = true;
    });
})();