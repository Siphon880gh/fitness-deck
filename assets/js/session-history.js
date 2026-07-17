/**
 * Session bar: assign exercise, save reps/duration to IndexedDB history, edit/delete.
 * Depends on: getWebpageIdentifier, loadSessionHistory, saveSessionHistoryEntry,
 * deleteSessionHistoryEntry, newSessionHistoryId, animateSaved (tabularize-exercises.js),
 * resetRepsTable (reps.js), window.countdown (countdown.js).
 */
(function () {
    var editingId = null;
    var popoverHideTimer = null;
    var assignSwitchInFlight = false;

    function assignedExerciseName() {
        var el = document.getElementById("session-exercise-name");
        return (el && el.getAttribute("data-exercise") || "").trim();
    }

    function hasSessionDraft() {
        var table = document.getElementById("reps-sets-table");
        if (table) {
            var setCols = table.querySelector("tr")
                ? table.querySelector("tr").querySelectorAll("td").length - 1
                : 1;
            if (setCols > 1) return true;
            var inputs = table.querySelectorAll("input");
            for (var i = 0; i < inputs.length; i++) {
                if (String(inputs[i].value || "").trim() !== "") return true;
            }
        }
        if (!window.countdown) return false;
        var cap = parseInt(window.countdown.timeCap, 10);
        var at = parseInt(window.countdown.timeAt, 10);
        if (!isNaN(at) && at > 0) return true;
        if (!isNaN(cap) && cap > 0) return true;
        if (window.countdown.status === "PLAYING" || window.countdown.status === "PAUSED") return true;
        return false;
    }

    function applyAssignedExerciseUi(name) {
        var el = document.getElementById("session-exercise-name");
        var pick = document.getElementById("session-exercise-pick");
        if (!el) return;
        var value = (name || "").trim();
        el.setAttribute("data-exercise", value);
        if (value) {
            el.textContent = value;
            el.classList.remove("session-exercise-empty");
            hideExercisePopover();
            clearExerciseHighlight();
        } else {
            el.textContent = "No exercise assigned";
            el.classList.add("session-exercise-empty");
        }
        if (pick) {
            if (value && !Array.from(pick.options).some(function (o) { return o.value === value; })) {
                var opt = document.createElement("option");
                opt.value = value;
                opt.textContent = value;
                pick.appendChild(opt);
            }
            pick.value = value;
        }
        updateSessionGuards();
    }

    /**
     * Assign/clear exercise. When leaving an exercise that has time/sets draft,
     * ask to save first. Always resets duration + sets unless keepSessionData.
     * Confirm OK = save then switch+reset. Cancel = discard then switch+reset.
     * options: { keepSessionData, skipConfirm, onDone }
     */
    function setAssignedExercise(name, options) {
        options = options || {};
        var value = (name || "").trim();
        var current = assignedExerciseName();

        if (value === current) {
            applyAssignedExerciseUi(value);
            if (typeof options.onDone === "function") options.onDone();
            return;
        }

        if (assignSwitchInFlight) return;

        function finishSwitch() {
            applyAssignedExerciseUi(value);
            if (!options.keepSessionData) {
                clearEditing();
                resetDurationAndSets({ quiet: true });
            }
            if (!value) {
                document.querySelectorAll(".fd-ex.is-selected").forEach(function (el) {
                    el.classList.remove("is-selected");
                });
            }
            assignSwitchInFlight = false;
            if (typeof options.onDone === "function") options.onDone();
        }

        function finishSwitchAfterDialog() {
            // Defer past native confirm teardown so DOM resets reliably apply
            window.setTimeout(function () {
                finishSwitch();
                if (!options.keepSessionData) {
                    resetDurationAndSets({ quiet: true });
                }
            }, 0);
        }

        if (!options.skipConfirm && !options.keepSessionData && current && hasSessionDraft()) {
            var shouldSave = window.confirm(
                'Save session for "' + current + '" before continuing?\n\nOK = Save, Cancel = Discard'
            );
            if (shouldSave) {
                assignSwitchInFlight = true;
                saveCurrentSession({
                    onDone: finishSwitchAfterDialog,
                    keepAssignment: true
                });
                return;
            }
            // Cancel = discard draft, still switch exercise, force reset
            finishSwitchAfterDialog();
            return;
        }

        finishSwitch();
    }

    function updateSessionGuards() {
        var ok = !!assignedExerciseName();
        var btn = document.getElementById("session-save-btn");
        var timeChip = document.getElementById("session-time-chip");
        var timeItem = document.getElementById("session-time-item");
        var repsChip = document.getElementById("session-reps-chip");
        var repsItem = document.getElementById("session-reps-item");

        if (btn) {
            btn.classList.toggle("is-disabled", !ok);
            btn.setAttribute("aria-disabled", ok ? "false" : "true");
            btn.title = ok ? (editingId ? "Update history entry" : "Save to history") : "Assign an exercise first";
            var label = btn.querySelector("span");
            if (label) label.textContent = editingId ? "Update" : "Save";
        }
        if (timeChip) {
            timeChip.classList.toggle("is-disabled", !ok);
            timeChip.setAttribute("aria-disabled", ok ? "false" : "true");
            timeChip.title = ok ? "Session timer" : "Assign an exercise first";
        }
        if (timeItem) {
            timeItem.classList.toggle("is-locked", !ok);
            if (!ok) {
                document.getElementById("session-time-panel")?.classList.add("cp-hidden");
            }
        }
        if (repsChip) {
            repsChip.classList.toggle("is-disabled", !ok);
            repsChip.setAttribute("aria-disabled", ok ? "false" : "true");
            repsChip.title = ok ? "Reps and sets" : "Assign an exercise first";
        }
        if (repsItem) {
            repsItem.classList.toggle("is-locked", !ok);
            if (!ok) {
                document.getElementById("session-reps-panel")?.classList.add("cp-hidden");
            }
        }
    }

    function toggleWorkPanel(panelId) {
        var panel = document.getElementById(panelId);
        var wasHidden = panel?.classList.contains("cp-hidden");
        document.querySelectorAll(".control-panel").forEach(function (p) {
            if (p !== panel) p.classList.add("cp-hidden");
        });
        if (panel) panel.classList.toggle("cp-hidden", !wasHidden);
        if (panel && wasHidden) {
            var item = panel.closest(".session-accordion-item");
            if (item) {
                requestAnimationFrame(function () {
                    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
                });
            }
        }
        if (typeof syncSessionBarHistoryExpanded === "function") {
            syncSessionBarHistoryExpanded();
        }
    }

    function shakeElement(el) {
        if (!el) return;
        el.classList.remove("session-shake");
        void el.offsetWidth;
        el.classList.add("session-shake");
        window.setTimeout(function () {
            el.classList.remove("session-shake");
        }, 450);
    }

    function clearExerciseHighlight() {
        document.getElementById("session-exercise-item")?.classList.remove("is-attention");
        document.getElementById("session-exercise-panel")?.classList.remove("is-attention");
        document.getElementById("session-exercise-chip")?.classList.remove("is-attention");
    }

    function hideExercisePopover() {
        var pop = document.getElementById("session-exercise-popover");
        if (pop) pop.hidden = true;
        if (popoverHideTimer) {
            clearTimeout(popoverHideTimer);
            popoverHideTimer = null;
        }
    }

    function showExercisePopover() {
        var pop = document.getElementById("session-exercise-popover");
        if (!pop) return;
        pop.hidden = false;
        if (popoverHideTimer) clearTimeout(popoverHideTimer);
        popoverHideTimer = window.setTimeout(function () {
            hideExercisePopover();
            clearExerciseHighlight();
        }, 6000);
    }

    function openExercisePanel() {
        document.querySelectorAll(".control-panel").forEach(function (p) {
            p.classList.add("cp-hidden");
        });
        var panel = document.getElementById("session-exercise-panel");
        if (panel) {
            panel.classList.remove("cp-hidden");
            var item = panel.closest(".session-accordion-item");
            if (item) {
                requestAnimationFrame(function () {
                    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
                });
            }
        }
        if (typeof syncSessionBarHistoryExpanded === "function") {
            syncSessionBarHistoryExpanded();
        }
    }

    /** Blocked Save/Reps click: shake source, expand Exercise, popover + focus. */
    function promptAssignExercise(sourceEl) {
        shakeElement(sourceEl);
        openExercisePanel();

        var item = document.getElementById("session-exercise-item");
        var panel = document.getElementById("session-exercise-panel");
        var chip = document.getElementById("session-exercise-chip");
        var pick = document.getElementById("session-exercise-pick");

        clearExerciseHighlight();
        item?.classList.add("is-attention");
        panel?.classList.add("is-attention");
        chip?.classList.add("is-attention");
        shakeElement(chip);

        showExercisePopover();

        window.setTimeout(function () {
            if (pick) {
                pick.focus();
                pick.classList.add("session-pick-pulse");
                window.setTimeout(function () {
                    pick.classList.remove("session-pick-pulse");
                }, 1200);
            }
        }, 80);
    }

    function openRepsPanel() {
        document.querySelectorAll(".control-panel").forEach(function (p) {
            p.classList.add("cp-hidden");
        });
        var panel = document.getElementById("session-reps-panel");
        if (panel) {
            panel.classList.remove("cp-hidden");
            var item = panel.closest(".session-accordion-item");
            if (item) {
                requestAnimationFrame(function () {
                    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
                });
            }
        }
        if (typeof syncSessionBarHistoryExpanded === "function") {
            syncSessionBarHistoryExpanded();
        }
    }

    function collectSetsFromTable() {
        var rows = document.querySelectorAll("#reps-sets-table tr");
        if (rows.length < 3) return [];
        var repInputs = Array.from(rows[1].querySelectorAll("td")).slice(1).map(function (td) {
            var input = td.querySelector("input");
            return input ? input.value : "";
        });
        var wtInputs = Array.from(rows[2].querySelectorAll("td")).slice(1).map(function (td) {
            var input = td.querySelector("input");
            return input ? input.value : "";
        });
        var sets = [];
        for (var i = 0; i < repInputs.length; i++) {
            var reps = String(repInputs[i] || "").trim();
            var weight = String(wtInputs[i] || "").trim();
            if (!reps && !weight) continue;
            sets.push({ reps: reps, weight: weight });
        }
        return sets;
    }

    function formatSetsShort(sets) {
        if (!sets || !sets.length) return "—";
        return sets.map(function (s) {
            var r = s.reps || "0";
            var w = s.weight || "0";
            return r + "x" + w;
        }).join("/");
    }

    function formatDuration(sec) {
        var n = parseInt(sec, 10) || 0;
        var m = Math.floor(n / 60);
        var s = n % 60;
        return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }

    function formatDateLabel(iso) {
        if (!iso) return "";
        var d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        }) + " " + d.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function ensureSetColumns(count) {
        window.setsLimit = 4;
        var plus = document.getElementById("r-plus");
        resetRepsTable();
        var needed = Math.max(1, Math.min(count, window.setsLimit));
        for (var i = 1; i < needed; i++) {
            if (plus) plus.click();
        }
    }

    function loadSetsIntoTable(sets) {
        var list = sets && sets.length ? sets : [{ reps: "", weight: "" }];
        ensureSetColumns(list.length);
        var rows = document.querySelectorAll("#reps-sets-table tr");
        var repTds = Array.from(rows[1].querySelectorAll("td")).slice(1);
        var wtTds = Array.from(rows[2].querySelectorAll("td")).slice(1);
        for (var i = 0; i < list.length && i < repTds.length; i++) {
            var repInput = repTds[i].querySelector("input");
            var wtInput = wtTds[i].querySelector("input");
            if (repInput) repInput.value = list[i].reps || "";
            if (wtInput) wtInput.value = list[i].weight || "";
        }
    }

    function applyDuration(sec) {
        if (typeof window.countdown !== "object" || !window.countdown) {
            window.countdown = { loaded: false, status: "STOPPED", timeAt: 0, timeCap: 0 };
        }
        var n = parseInt(sec, 10);
        if (isNaN(n) || n < 0) n = 0;
        if (typeof pollerId !== "undefined" && pollerId) {
            clearInterval(pollerId);
            pollerId = null;
        }
        window.countdown.timeCap = n;
        window.countdown.timeAt = 0;
        window.countdown.status = "STOPPED";
        document.querySelectorAll("html.countdown-finished, #bar-controls.countdown-finished").forEach(function (el) {
            el.classList.remove("countdown-finished");
        });
        document.querySelectorAll("html, #bar-controls").forEach(function (el) {
            el.classList.remove("countdown-finished");
        });
        var op = document.getElementById("countdown-operator");
        if (op) op.classList.add("is-plus");
        var display = document.getElementById("countdown-display");
        if (display) {
            function pad(seconds) {
                var minutes = Math.floor(seconds / 60);
                var rem = seconds % 60;
                return String(minutes).padStart(2, "0") + ":" + String(rem).padStart(2, "0");
            }
            display.textContent = pad(0) + " / " + pad(n);
            display.setAttribute("data-color", "red");
            if (typeof controlViewColor === "function") controlViewColor("STOPPED");
        }
    }

    function resetDurationAndSets(options) {
        options = options || {};
        try {
            if (typeof resetRepsTable === "function") {
                resetRepsTable();
            } else {
                document.querySelectorAll("#reps-sets-table input").forEach(function (input) {
                    input.value = "";
                });
            }
        } catch (err) {
            document.querySelectorAll("#reps-sets-table input").forEach(function (input) {
                input.value = "";
            });
        }
        // Fresh session clock: 00:00, ready to add with +
        applyDuration(0);
    }

    function clearAssignedExercise() {
        setAssignedExercise("", {
            onDone: function () {
                // Guarantees wipe even when assign is a no-op (already cleared)
                resetDurationAndSets({ quiet: true });
            }
        });
        hideExercisePopover();
        clearExerciseHighlight();
    }

    function populateExercisePick() {
        var pick = document.getElementById("session-exercise-pick");
        if (!pick) return;
        var current = assignedExerciseName();
        pick.innerHTML = "";
        var blank = document.createElement("option");
        blank.value = "";
        blank.textContent = "Pick…";
        pick.appendChild(blank);
        document.querySelectorAll(".fd-ex").forEach(function (card) {
            var name = (card.dataset.exercise || "").trim();
            if (!name) return;
            var opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name;
            pick.appendChild(opt);
        });
        if (current) pick.value = current;
    }

    function clearEditing() {
        editingId = null;
        updateSessionGuards();
    }

    function saveCurrentSession(options) {
        options = options || {};
        var exerciseName = assignedExerciseName();
        if (!exerciseName) {
            assignSwitchInFlight = false;
            promptAssignExercise(document.getElementById("session-save-btn"));
            if (typeof options.onDone === "function") options.onDone();
            return;
        }
        var now = new Date().toISOString();
        var durationSec = window.countdown ? (parseInt(window.countdown.timeCap, 10) || 0) : 0;
        var base = {
            id: editingId || newSessionHistoryId(),
            pageKey: getWebpageIdentifier(),
            exerciseName: exerciseName,
            updatedAt: now,
            sets: collectSetsFromTable(),
            durationSec: durationSec
        };

        var finish = function (toSave) {
            saveSessionHistoryEntry(toSave).then(function () {
                if (!options.keepAssignment) clearEditing();
                if (typeof animateSaved === "function") animateSaved();
                renderHistoryList();
                if (typeof options.onDone === "function") options.onDone();
            }).catch(function () {
                assignSwitchInFlight = false;
                if (typeof options.onDone === "function") options.onDone();
            });
        };

        if (editingId) {
            loadSessionHistory().then(function (rows) {
                var prev = rows.find(function (r) { return r.id === editingId; });
                base.createdAt = prev && prev.createdAt ? prev.createdAt : now;
                finish(base);
            }).catch(function () {
                assignSwitchInFlight = false;
            });
        } else {
            base.createdAt = now;
            finish(base);
        }
    }

    function startEditEntry(entry) {
        editingId = entry.id;
        setAssignedExercise(entry.exerciseName || "", {
            skipConfirm: true,
            keepSessionData: true
        });
        loadSetsIntoTable(entry.sets || []);
        applyDuration(entry.durationSec || 0);
        updateSessionGuards();
        openRepsPanel();
    }

    function deleteEntry(id) {
        if (!id) return;
        if (!window.confirm("Delete this session from history?")) return;
        deleteSessionHistoryEntry(id).then(function () {
            if (editingId === id) clearEditing();
            renderHistoryList();
            if (typeof animateSaved === "function") animateSaved();
        });
    }

    function renderHistoryList() {
        var list = document.getElementById("session-history-list");
        if (!list || typeof loadSessionHistory !== "function") return;

        loadSessionHistory().then(function (rows) {
            list.innerHTML = "";
            if (!rows.length) {
                list.className = "session-history-empty";
                list.textContent = "No saved sessions yet";
                return;
            }
            list.className = "session-history-list";
            rows.forEach(function (entry) {
                var row = document.createElement("div");
                row.className = "session-history-row";
                row.dataset.id = entry.id;

                var main = document.createElement("div");
                main.className = "session-history-main";

                var dateEl = document.createElement("div");
                dateEl.className = "session-history-date";
                dateEl.textContent = formatDateLabel(entry.createdAt);

                var nameEl = document.createElement("div");
                nameEl.className = "session-history-exercise";
                nameEl.textContent = entry.exerciseName || "(unnamed)";

                var meta = document.createElement("div");
                meta.className = "session-history-meta";
                meta.textContent = formatSetsShort(entry.sets) + " · " + formatDuration(entry.durationSec);

                main.appendChild(dateEl);
                main.appendChild(nameEl);
                main.appendChild(meta);

                var actions = document.createElement("div");
                actions.className = "session-history-actions";

                var editBtn = document.createElement("button");
                editBtn.type = "button";
                editBtn.className = "session-history-edit";
                editBtn.textContent = "Edit";
                editBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    startEditEntry(entry);
                });

                var delBtn = document.createElement("button");
                delBtn.type = "button";
                delBtn.className = "session-history-delete";
                delBtn.textContent = "Delete";
                delBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    deleteEntry(entry.id);
                });

                actions.appendChild(editBtn);
                actions.appendChild(delBtn);
                row.appendChild(main);
                row.appendChild(actions);
                list.appendChild(row);
            });
        });
    }

    function syncBarHistoryExpanded() {
        if (typeof syncSessionBarHistoryExpanded === "function") {
            syncSessionBarHistoryExpanded();
            return;
        }
        var bar = document.getElementById("bar-controls");
        if (!bar) return;
        var historyPanel = document.getElementById("session-history-panel");
        var open = historyPanel && !historyPanel.classList.contains("cp-hidden");
        bar.classList.toggle("history-expanded", !!open);
        document.getElementById("toggle-btns")?.classList.toggle("history-expanded", !!open);
        document.getElementById("session-history-chip")?.classList.toggle("is-open", !!open);
    }

    function toggleHistoryPanel() {
        var panel = document.getElementById("session-history-panel");
        if (!panel) return;
        var willOpen = panel.classList.contains("cp-hidden");
        document.querySelectorAll(".control-panel").forEach(function (p) {
            if (p !== panel) p.classList.add("cp-hidden");
        });
        panel.classList.toggle("cp-hidden", !willOpen);
        syncBarHistoryExpanded();
        if (willOpen) renderHistoryList();
    }

    function onDeckReady() {
        populateExercisePick();
        renderHistoryList();
        var selected = document.querySelector(".fd-ex.is-selected");
        if (selected && selected.dataset.exercise && !assignedExerciseName()) {
            setAssignedExercise(selected.dataset.exercise);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        updateSessionGuards();

        document.getElementById("session-exercise-clear")?.addEventListener("click", function () {
            clearAssignedExercise();
        });

        document.getElementById("session-reset-btn")?.addEventListener("click", function () {
            if (!hasSessionDraft()) {
                resetDurationAndSets();
                return;
            }
            if (!window.confirm("Reset duration and sets?\n\nThis clears the timer and reps for the current session.")) {
                return;
            }
            resetDurationAndSets();
        });

        document.getElementById("session-exercise-pick")?.addEventListener("change", function (e) {
            var value = e.target.value;
            var previous = assignedExerciseName();
            if (!value) {
                // Revert pick until clear finishes (may prompt)
                e.target.value = previous;
                clearAssignedExercise();
                return;
            }
            if (value === previous) return;

            var match = Array.from(document.querySelectorAll(".fd-ex")).find(function (card) {
                return card.dataset.exercise === value;
            });

            // Revert until switch completes; setAssignedExercise updates pick
            e.target.value = previous;

            setAssignedExercise(value, {
                onDone: function () {
                    if (match) {
                        document.querySelectorAll(".fd-ex.is-selected").forEach(function (el) {
                            el.classList.remove("is-selected");
                        });
                        match.classList.add("is-selected");
                        match.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }
            });
        });

        var historyChip = document.getElementById("session-history-chip");
        if (historyChip) {
            historyChip.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleHistoryPanel();
            });
            historyChip.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleHistoryPanel();
                }
            });
        }

        var saveBtn = document.getElementById("session-save-btn");
        if (saveBtn) {
            saveBtn.addEventListener("click", function () {
                if (!assignedExerciseName()) {
                    promptAssignExercise(saveBtn);
                    return;
                }
                saveCurrentSession();
            });
            saveBtn.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!assignedExerciseName()) {
                        promptAssignExercise(saveBtn);
                        return;
                    }
                    saveCurrentSession();
                }
            });
        }

        var timeChip = document.getElementById("session-time-chip");
        if (timeChip) {
            function onTimeActivate(e) {
                e.preventDefault();
                e.stopPropagation();
                if (!assignedExerciseName()) {
                    promptAssignExercise(timeChip);
                    return;
                }
                toggleWorkPanel("session-time-panel");
            }
            timeChip.addEventListener("click", onTimeActivate);
            timeChip.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") onTimeActivate(e);
            });
        }

        var repsChip = document.getElementById("session-reps-chip");
        if (repsChip) {
            function onRepsActivate(e) {
                e.preventDefault();
                e.stopPropagation();
                if (!assignedExerciseName()) {
                    promptAssignExercise(repsChip);
                    return;
                }
                toggleWorkPanel("session-reps-panel");
            }
            repsChip.addEventListener("click", onRepsActivate);
            repsChip.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") onRepsActivate(e);
            });
        }

        document.getElementById("cp-countdown")?.addEventListener("click", function (e) {
            if (!assignedExerciseName()) {
                e.preventDefault();
                e.stopPropagation();
                promptAssignExercise(document.getElementById("session-time-chip"));
            }
        }, true);

        document.getElementById("reps-sets-wrapper")?.addEventListener("focusin", function (e) {
            if (!assignedExerciseName()) {
                e.target.blur();
                promptAssignExercise(document.getElementById("session-reps-chip"));
            }
        }, true);

        document.getElementById("control-panels")?.addEventListener("click", function () {
            setTimeout(syncBarHistoryExpanded, 0);
            setTimeout(function () {
                var historyPanel = document.querySelector(".session-history-panel");
                if (historyPanel && !historyPanel.classList.contains("cp-hidden")) {
                    renderHistoryList();
                }
            }, 0);
        });

        var deckObserver = new MutationObserver(function () {
            if (document.querySelector(".fd-ex")) {
                onDeckReady();
            }
        });
        var container = document.querySelector(".container");
        if (container) {
            deckObserver.observe(container, { childList: true, subtree: true });
        }

        document.addEventListener("fd-deck-ready", onDeckReady);

        document.querySelector(".fd-tool-session")?.addEventListener("click", function () {
            setTimeout(function () {
                populateExercisePick();
                var selected = document.querySelector(".fd-ex.is-selected");
                if (selected && selected.dataset.exercise && !assignedExerciseName()) {
                    setAssignedExercise(selected.dataset.exercise);
                }
                updateSessionGuards();
                syncBarHistoryExpanded();
            }, 0);
        });
    });

    window.sessionHistoryUi = {
        setAssignedExercise: setAssignedExercise,
        populateExercisePick: populateExercisePick,
        renderHistoryList: renderHistoryList,
        assignedExerciseName: assignedExerciseName,
        promptAssignExercise: promptAssignExercise
    };
})();
