/** Database */

window.indexedDB;
window.dbVersion = 3;

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

    // alert("upgrade needed")

    // Get all existing object store names
    var objectStoreNames = Array.from(db.objectStoreNames);

    // Delete all object stores
    objectStoreNames.forEach(function (objectStoreName) {
        db.deleteObjectStore(objectStoreName);
    });

    // Addressed store
    var objectStore = db.createObjectStore("FitnessAddressedStore", { keyPath: "id" });
    objectStore.createIndex("stateIndex", "state");

    // Comment store
    var objectStore = db.createObjectStore("FitnessCommentStore", { keyPath: "id" });
    objectStore.createIndex("commentIndex", "comment");

    // alert("upgraded") // Fixing mobile Safari indexedDB bug
} // upgradeDb

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
                // console.log(`Key: ${key}, Value: ${value}`);
                if ($(`[data-id="${key}"]`)[0])
                    $(`[data-id="${key}"]`)[0].className = value;
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
                    let state = $(el).attr("class");
                    refreshData[cellId] = state;
                    // store.put({ id: getWebpageIdentifier(), cell:cellId, state });
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
        };
    };


    open.onerror = function () {
        console.error("Error", open.error);
    };

}; // saveComments

function goRandomRow() {

    var selTable = "#DataTables_Table_0 tbody"
    var selRow = "tr:not(:has(.addressed-1)):not(:has(.addressed-2)):not(:has(.addressed-3)):not(:has(.addressed-4))";
    exec(selTable, selRow);

    function exec(selTable, selRow) {
        var table = document.querySelector(selTable);
        var rows = table.querySelectorAll(selRow)
        if (rows.length <= 1) return; // Only header row present

        // Selecting a random row (excluding the header)
        var randomIndex = Math.floor(Math.random() * (rows.length - 1)) + 1;
        var selectedRow = rows[randomIndex];

        // Scrolling to the selected row
        selectedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait for scrolling to finish before clicking the row
        setTimeout(() => {
            // Triggering a click event on the selected row
            selectedRow.click();
        }, 500); // Adjust timeout based on your needs
    };

}


// Render MD File
function renderMDFile() {
    const isFailed = (myMarkdown) => {
        //return '<!DOCTYPE html> <html> <head> <title>File Not Found</title>".substring(0,70).toLowerCase().includes("file not found")'
        return myMarkdown.substring(0, 70).toLowerCase().includes("file not found");
    }
    const getFailed = () => {
        return 'ERROR: Not able to read. Has it been published? Contact author.'
    }

    const rerenderHeaders = () => {
        $(".dataTables_wrapper th:nth-of-type(1)").css("text-transform", "uppercase");
        $(".dataTables_wrapper th:last-child").css("font-style", "italic");

        window.$th_variations = [];

        $(".dataTables_wrapper th").each((i, el) => {
            const $th = $(el);
            if (i == 0) true;
            if ($th.text().indexOf("Variation") !== -1) {
                $th_variations.push($th);
            }

        });

        /* UIUX: Visual glancing progressions */
        /* Developer experience only. Will refactor to CSS once satisfied */

        /**
         *
            #cc3300
            #996600
            #663300
            #339900
            #006600
            #003300
            #000000
            */


        var th = null;
        /* Easiest Variation */ th = $th_variations[0];
        th.addClass("header-variation")
        th.css("font-weight", "");
        th.css("text-transform", "");
        th.css("text-decoration", "");
        th.css("font-style", "");
        th.css("letter-spacing", "");
        th.text("‹" + th.text());
        var text = th.text();
        th.text("");
        th.append($(`<div class='text-spaced'>${text}</div>`))
        th.append($(`<div class='bottom-strip bottom-strip-1'></div>`))


        /* Easier Variation */ th = $th_variations[1];
        th.addClass("header-variation")
        th.css("font-weight", "");
        th.css("text-transform", "");
        th.css("text-decoration", "");
        th.css("font-style", "");
        th.css("letter-spacing", "");
        th.text("«" + th.text());
        var text = th.text();
        th.text("");
        th.append($(`<div class='text-spaced'>${text}</div>`))
        th.append($(`<div class='bottom-strip bottom-strip-2'></div>`))


        /* Standard Variation */ th = $th_variations[2];
        th.addClass("header-variation")
        th.css("font-weight", "");
        th.css("text-transform", "");
        th.css("text-decoration", "");
        th.css("font-style", "");
        th.css("letter-spacing", "");
        // th.css("color", "ghostwhite");
        // th.text("≪" + th.text() + "≫");
        th.text("«" + th.text() + "»");
        // th.text("‹" + th.text() + "›");
        var text = th.text();
        th.text("");
        th.append($(`<div class='text-spaced'>${text}</div>`))
        th.append($(`<div class='bottom-strip bottom-strip-3'></div>`))


        /* Harder Variation */ th = $th_variations[3];
        th.addClass("header-variation")
        // th.css("font-weight", "bold"); 
        // th.css("text-transform", "none");
        th.css("text-decoration", "");
        th.css("font-style", "");
        th.css("letter-spacing", "");
        th.text(th.text() + "»");
        var text = th.text();
        th.text("");
        th.append($(`<div class='text-spaced'>${text}</div>`))
        th.append($(`<div class='bottom-strip bottom-strip-4'></div>`))


        /* Hardest Variation */ th = $th_variations[4];
        th.addClass("header-variation")
        // th.css("font-weight", "bolder"); 
        // th.css("text-transform", "uppercase");
        th.css("text-decoration", "");
        th.css("font-style", "");
        th.css("letter-spacing", "");
        th.text(th.text() + "›");
        var text = th.text();
        th.text("");
        th.append($(`<div class='text-spaced'>${text}</div>`))
        th.append($(`<div class='bottom-strip bottom-strip-5'></div>`))

    } // rerenderHeaders

    window.rerenderAddressedStatistic = () => {
        let count = $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").length;
        let total = $(".dataTables_wrapper tbody tr").length;
        $("#addressed").text(`${count}/${total}`);
    }

    const hydrateRowHighlight = () => {
        $(".dataTables_wrapper tr").on("click", event => {
            $("tr.selected").removeClass("selected");
            var tr = event.target;
            if (!event.target.matches("tr"))
                tr = event.target.closest("tr");
            $(tr).addClass("selected");
        });
    }

    const hydrateAddressingCells = () => {
        function clearAllAddressedFlags($el) {
            $el.removeClass("addressed-1")
                .removeClass("addressed-2")
                .removeClass("addressed-3")
                .removeClass("addressed-4")
        }

        $(".dataTables_wrapper tr td:not(:last-child)").on("contextmenu", event => {
            if (event.target.classList.toString().includes("addressed"))
                event.preventDefault();

            clearAllAddressedFlags($(event.target));

            rerenderAddressedStatistic();
            saveAddressed();
            animateSaved();
        });

        window.mode = "COLOR";
        window.prevSocial = "goog";
        window.setPrevSocial = function (newSocial) {
            window.prevSocial = newSocial;
            $(".btn-switch-mode").css("background-image", `url("./assets/icons/${newSocial}.png")`)
        };
        window.switchMode = function () {
            if (window.mode === "COLOR") {
                window.mode = "INSTRUCTIONS";
                $(".btn-switch-mode").addClass("active");
            } else {
                window.mode = "COLOR";
                $(".btn-switch-mode").removeClass("active");
            }
        }
        function openInstructions(event) {
            let el = event.target;
            let pattern = event.target.closest("tr").querySelector("td:first-child").querySelector(`#${window.prevSocial}`).getAttribute("pattern");
            let baseExerciseName = event.target.closest("tr").querySelector("td:first-child").textContent;
            pattern = pattern.replace("{query}", baseExerciseName + " " + el.textContent);
            window.open(pattern)
            // debugger;
        } // openInstructions

        function causeColorChange(event) {

            // alert("Will save") // Fixing mobile Safari indexedDB bug
            let el = event.target;
            if (el.matches(".ri-icon-hook") || el.matches(".btn-action")) return;

            let $el = $(el);

            // let unaddressed = el.classList.length===0; // doesn't because if you had sorted on column, there's a new class .sorting_1
            let unaddressed = !el.className.includes("addressed")
            if (!$el.closest("tr").hasClass("compact-row") && unaddressed) {
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
        } // causeColorChange
        $(".dataTables_wrapper tr td:not(:last-child)").on("click", event => {

            if (window.mode === "COLOR") {
                causeColorChange(event);
            } else if (window.mode === "INSTRUCTIONS") {
                openInstructions(event);
            }


        });
    } // hydrateAddressingCells

    const animateSaved = () => {
        $("#save-status").fadeIn(400, function () {
            $(this).delay(200).fadeOut(150);
        });
    }


    // window.rowCountRendering = 1;
    fetch(encodeURI(filename), {
        cache: "no-cache"
    }).then(response => response.text())
        .then(myMarkdown => {
            if (isFailed(myMarkdown)) {
                document.querySelector(".container").innerHTML = getFailed();
                return;
            }
            var md = window.markdownit({
                linkify: true,
                breaks: true
            });

            // Add Edit Comment column at the end
            let lines = myMarkdown.split("\n");
            lines[0] += "Edit Comments |";
            lines[1] += "--------------|";
            lines = lines.map((line, i) => {
                if (i <= 1) return line;
                else {
                    return line + "  |"
                }
            })
            myMarkdown = lines.join("\n");
            window.fixedColumnCounts = (() => {
                /*
                 Get number of non-variation columns to the left by 
                 counting number of vertical bars minus 1 left of first 
                 Variation column. Later will be fixed columns.
                */
                var charPosFirstVariation = lines[0].indexOf("Variation");
                var substrUpToCharPos = lines[0].substr(0, charPosFirstVariation);
                var charPosMinusOneVerticalBar = substrUpToCharPos.lastIndexOf("|")
                var substrUpToCharPos = lines[0].substr(0, charPosMinusOneVerticalBar);
                var stripDownToVerticalBars = substrUpToCharPos.replace(/[^|]/g, ""); // eg. ||
                var aFixedColumnCounts = stripDownToVerticalBars.length;
                return aFixedColumnCounts;
            })()
            // console.log({fixedColumnCounts})

            // Render, take care of \n breaks, and make sure links open in new windows
            var result = md.render(myMarkdown, { html: true });
            document.querySelector(".container").innerHTML = result.replaceAll("\\n", "<br/>");
            document.querySelectorAll(".container a").forEach(a => {
                a.setAttribute("target", "_blank");
            })

            // Rerender with an interactive table
            // Table is created by MD file rendering

            // debugger;
            window.tableHook = $("table:not(#reps-sets-table)").DataTable({
                responsive: true,
                fixedHeader: true,
                ordering: true, // This will disable sorting on all columns
                // fixedColumns: {
                //     left: window.fixedColumnCounts
                // },
                fixedColumns: {
                    left: 1
                },
                createdRow: function (row, data, dataIndex) {
                    $(row).addClass('compact-row');

                    // const commentColumn = $(row).find("td").length-1;
                    // $(row).find("td").each((i, td)=>{
                    //     if(i!==commentColumn)
                    //         // $(td).text(window.rowCountRendering + ". " + $(td).text().trim());
                    //         $(td).text($(row).index() + ". " + $(td).text().trim());
                    // })
                    // window.rowCountRendering++;

                    // Event listener for row clicks
                    $(row).on('click', function () {
                        setTimeout(() => {
                            $(".dataTables_wrapper tr:not(.compact-row)").addClass("compact-row");
                            if ($(this).hasClass('compact-row')) {
                                $(this).removeClass('compact-row');
                            }
                        }, 200);
                    });
                },
                // scrollX: true,
                paging: true,
                pageLength: 1000,

                /* drawCallback: Gets called every row drawn or re-drawn, including changing the view by ascending/descending/filtering */
                "drawCallback": function (settings) {
                    $(".ri-icon-hook").remove();

                    /* Rerender social instruction icons and contenteditable comments if records found */
                    let recordsFound = !$(".dataTables_wrapper tbody tr").eq(0).text().includes("No matching records found");
                    if (recordsFound)
                        $(".dataTables_wrapper tr td:nth-child(1)").each((i, cellCol1) => {

                            // Create external icons
                            let $cell = $(cellCol1);
                            let textExercise = $cell.text();

                            // If not a note row, then add social media exercise information icons
                            if (!textExercise.includes("*Note") && !textExercise.includes("* Note")) {

                                var mutedParenthesesComments = textExercise.replace(/\((.*?)\)/g, '<span class="text-parentheses">($1)</span>');
                                $cell.html(mutedParenthesesComments);

                                // Add the word "exercise" in the query if not a stretch
                                let query = textExercise + ((/stretch|exercise/i).test(textExercise) ? "" : " exercise");
                                query = query.replace(/^[\s\W]+/, ''); // Remove trailing " EXERCISE", "- EXERCISE", "-- EXERCISE", "-+ EXERCISE", etc so becomes "EXERCISE"
                                query = query.replace(/\s*\([^)]*\)\s*/g, ' ').trim(); // Remove one or more parentheses comments

                                let $iconGoogle = $(`<a onclick='setPrevSocial("goog")' id='goog' pattern="https://www.google.com/search?q={query}&tbm=isch" href="https://www.google.com/search?q=${query}&tbm=isch" target="_blank" class="btn-action ri-google-fill"></a>`);
                                let $iconYoutube = $(`<a onclick='setPrevSocial("yt")'  id='yt' pattern="https://www.youtube.com/results?search_query={query}" href="https://www.youtube.com/results?search_query=${query}" target="_blank" class="btn-action ri-youtube-fill"></a>`);
                                let $iconInstagram = $(`<a onclick='setPrevSocial("insta")' id='insta' pattern="https://www.instagram.com/explore/search/keyword/?q={query}" href="https://www.instagram.com/explore/search/keyword/?q=${query}" target="_blank" style="display:flex; flex-flow:column nowrap; justify-content:flex-end;"><div class="btn-action" style='background-image: url("./assets/icons/insta.png"); height:1em; width:1em; background-repeat: no-repeat; background-size: contain;'></div></a>`);
                                let $iconColorVsSocial = $(`<div class="btn-action btn-switch-mode" style='background-image: url("./assets/icons/goog.png"); position:absolute; transform:scale(.8); top:8px; right:12px; height:1em; width:1em; background-repeat: no-repeat; background-size: contain;' onClick='event.stopPropagation();event.preventDefault(); switchMode();'></div>`);

                                // $iconGoogle.click(()=>{
                                //     window.open(`https://www.google.com/search?q=exercise ${textExercise}`);
                                // })
                                // $iconYoutube.click(()=>{
                                //     window.open(`https://www.youtube.com/results?search_query=exercise ${textExercise}`);
                                // })
                                // $iconInstagram.click(()=>{
                                //     window.open(`https://www.instagram.com/explore/search/keyword/?q=exercise ${textExercise}`);
                                // })

                                let $div = $(`<div class='ri-icon-hook'></div>`)
                                // Low quality hits anyways:
                                // $div.append($iconGoogle, $iconYoutube, $iconInstagram, $iconColorVsSocial);
                                $div.append($iconGoogle);

                                $cell.append($div);
                            } // If not a note row

                            // Create modelable
                            $cell.attr("data-id", textExercise);

                            // Add id to each column so you can load color-marked cells
                            $cell.closest("tr").find("td:not(:last-child)").each((i, cell) => {
                                let $cell = $(cell)
                                $cell.attr("data-id", `${textExercise}-${i}`);
                            });

                            $cell.closest("tr").find("td:last-child").each((i, cell) => {
                                let $cell = $(cell)
                                $cell.attr("contenteditable", `true`);
                                $cell.on("blur", (event) => {
                                    const enteredText = $cell.text()
                                    console.log(enteredText);

                                    // Erased
                                    if ($cell.attr("prev-contenteditable") & !enteredText.length) {
                                        saveComment($cell.attr("data-id"), enteredText);
                                        animateSaved();
                                    } else {
                                        // Added or the same
                                        saveComment($cell.attr("data-id"), enteredText);
                                        animateSaved();
                                    }
                                    $cell.attr("prev-contenteditable", enteredText)
                                })
                            });

                        });
                    // console.log("drawn")


                    // Fix Plugin
                    // Fix visual defects that show up from the plugins that freeze header and columns
                    // We are using attributes because the classList gets plainly written over by the plugin
                    // We make sure this is in draw event because the table HTML
                    // gets redrawn
                    for (var i = 0; i < fixedColumnCounts; i++) {
                        $("#DataTables_Table_0 th").eq(i).attr("fixed-column", true)
                    }

                    var $bodyRows = $(".dataTables_wrapper tbody tr");
                    for (var h = 0; h < $bodyRows.length; h++) {
                        let $td_s = $bodyRows.eq(h).find("td");

                        for (var i = 0; i < fixedColumnCounts; i++) {
                            $td_s.eq(i).attr("fixed-column", true)
                        }
                    };

                    // Since we removed 1 of X, we have our own custom count:
                    $("#count-rows").text($(".dataTables_wrapper tbody tr").length);

                    // Load clicked colors and added comments
                    loadAddressed();
                    loadComments();

                }, // drawCallback

                "initComplete": function (settings, json) {

                    // Create info tooltip at Search
                    let $infoIcon = $("<i class='ri-information-line'></i>");
                    $infoIcon.attr("data-tooltip-text", "Search Tip: Search for an exercise or instruction. Say you want exercises where you 'sit upright'");
                    $infoIcon.prependTo($("#DataTables_Table_0_filter label"))


                    // Create addressed statistic
                    let $addressed = $("<div id='addressed'><div/>")
                    $addressed.click(() => {
                        let confirmed = confirm("Clear all marked colors?")
                        if (confirmed) {
                            clearAddressed();
                            rerenderAddressedStatistic();
                        }
                    })
                    // $("#DataTables_Table_0_wrapper").prepend($addressed);
                    // $addressed.css("position", "fixed").css("top", "10px").css("right", "10px").css("z-index", "2");
                    $("#top-bar").append($addressed)

                    // Moved to drawing because sometimes this loads before DOM is enriched with attributes
                    // loadAddressed();
                    // loadComments();

                    // setTimeout(rerenderAddressedStatistic, 100);
                    hydrateAddressingCells();
                    hydrateRowHighlight();
                    rerenderHeaders();

                    // Fix Plugin: Listen for the table scroll event
                    $('.dataTables_scrollBody').on('scroll', function () {
                        // Calculate the horizontal scroll offset
                        var scrollLeft = $(this).scrollLeft();
                        console.log("Scrolled", { scrollLeft, fixedHeader })

                        // Apply the horizontal scroll offset to the fixed header
                        var fixedHeader = $('.fixedHeader-floating');
                        fixedHeader.css('transform', 'translateX(' + -scrollLeft + 'px)');
                    });

                    // $('#DataTables_Table_0_filter').clone().prependTo('.container');
                    // $('#DataTables_Table_0_info').detach().appendTo('.container');
                    // $('#DataTables_Table_0_paginate').detach().appendTo('.container');

                    // rerenderAddressedStatistic(); // update the marked count

                }, // initComplete
            });
        }).catch(err => {
            document.querySelector(".container").innerHTML = err;
        });
}

document.addEventListener("DOMContentLoaded", () => {
    // Main entry
    renderMDFile();

    // Bug Fix: Fixed header plugin. When have the fixed header in sticky
    // position because the table has been scrolled down - that header
    // row would break if you resize the window. Solution: Redraw table
    // when user resizes window.
    window.addEventListener('resize', function (event) {
        window.tableHook.draw();
        // console.log("Redrawed table because resized window")
    });
})

/* Our own custom search so won't conclict with DataTables Plugins */
function bindToInnerSearch() {
    let typed = $("#bind-inner-search").val();
    $("#DataTables_Table_0_filter input").val(typed).trigger("keyup");
    console.log(typed)
}



window.modeAt = 0;
const cycleMode = () => {
    window.modeAt = (window.modeAt % 5) + 1 // Cycles through 1,2,3,4

    if (window.modeAt === 5) {
        document.querySelectorAll("tr.hidden").forEach(tr => {
            $(tr).removeClass("hidden")
        });
    } else {
        document.querySelectorAll("tr").forEach(tr => {
            if (!$(tr).find(`td.addressed-${modeAt}`).length) {
                $(tr).addClass("hidden")
            } else {
                $(tr).removeClass("hidden")
            }
        });

        if (document.querySelectorAll("tr:not(.hidden").length === 0) {
            // window.modeAt = 4;
            cycleMode();
        }
    }
}