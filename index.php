<?php
// nocache
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if(!isset($_GET["md-file"])) {
    // die("<span style='color:red'>Failed. No md-file URL query or GET url param.</span>");
    include("listing.php");
    die();
} else {
    if (substr($_GET["md-file"], -3) === ".md") {
        $_GET["md-file"] = substr($_GET["md-file"], 0, -3);
    }
}
// TODO: Instead of dieing if there's no md-file URL param, then show listing.php which will create the links based on files in md-file/
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <script>
        /** Change filename here */
        var filename = "md-file/<?php echo $_GET["md-file"]; ?>.md";
        console.log({filename})
    </script>

    <meta charset="utf-8" />
    <script type="text/javascript">
        window.indexedDB;
        window.dbVersion = 3;

        // Safari is not allowing my implementation of indexedDB without clearing cache.
        if ('caches' in window) {
        caches.keys().then(function (cacheNames) {
            cacheNames.forEach(function (cacheName) {
            caches.delete(cacheName);
            });
        });
        }
    </script>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fitness Deck - <?php echo $_GET["md-file"]; ?></title>

    <link href="https://cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css" rel="stylesheet"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedheader/3.1.9/css/fixedHeader.dataTables.css">
    <link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.2.0/fonts/remixicon.css" rel="stylesheet">

    <style>
        body {
            padding: 10px;
        }
        
        img {
            display: block;
            width: 100%;
            margin: 10px;
        }
        
        .container {
            font-size: 100%;
        }
        
        @media (min-width: 768px) {
            img {
                width: 50%;
                margin: 10px auto;
            }
            .container {
                font-size: 150%;
            }
        }

        .h2 {
            margin-left: 2ch;
        }
        
        .h2::before {
            content: "•\00a0";
        }
        
        .h3 {
            margin-left: 4ch;
        }
        
        .h3::before {
            content: "—";
        }
        
        .h4 {
            margin-left: 6ch;
        }
        
        .h4::before {
            content: "➣";
        }
        
        .h5 {
            margin-left: 8ch;
        }
        
        .h5::before {
            content: "➨";
        }
        
        .h6 {
            margin-left: 10ch;
        }
        
        .h6::before {
            content: "◦\00a0";
        }
        /* DataTable */
        .dataTables_length {
            float: right !important;
            margin-left: 20px !important;
            margin-bottom: 10px !important;
        }
        td {
            vertical-align: top;
        }
        /* Search external */
        .ri-icon-hook {
            display: flex;
            flex-flow: row nowrap;
            justify-content: space-between;
            margin-right: 30px;
        }
        .ri-icon-hook >* {
            cursor: pointer;
        }
        .ri-google-fill {
            background: -webkit-linear-gradient(left, rgba(66, 133, 244, 1), rgba(219, 68, 55,1 ), rgba(244, 180, 0, 1), rgba(66, 133, 244, 1), rgba(15, 157, 88,1), rgba(219, 68, 55,1 ));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: .7;
        }
        .ri-youtube-fill {
            color:rgba(255,0,0,1);
            opacity: .7;
        }
        #addressed::before {
            content: "Marked:\00A0";
        }
        #addressed {
            float: right;
            color: #333;
            padding: 10px;
            margin-left: 15px;
            transform: translateY(-10px);
            cursor:  pointer;
        }
        .addressed-1 {
            background-color: rgba(204, 255, 204, 1);
        }
        .addressed-2 {
            /* background-color: rgba(255, 255, 153, 1); */ /*night shift mode cant see yellow */

            background-color: rgba(0, 204, 204, 1);
        }
        .addressed-3 {
            background-color: rgba(255, 204, 204, 1);
        }
        .addressed-4 {
            background-color: rgba(204, 153, 255, 1);
        }

        @media screen and (max-width: 570px) {
            .dataTables_wrapper .dataTables_length, .dataTables_wrapper .dataTables_filter {
                float: none !important;
                display: block !important;
                margin: 10px auto !important;
            }
        }

        #save-status {
            position: fixed;
            bottom: 15px;
            right: 15px;
            font-size: 90%;
            border: 1px solid #28a745;
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            z-index: 10; /* DataTables get in the way */
            padding: 15px 30px;
            border-radius: 15px;
            letter-spacing: 2px;
            display: none;
        }

        #save-status > span {
            font-style: italic; /* Text "Saved" */
        }
    </style>
    <style>
        /*
        css-only-tooltip version 1.0.0
            ⓒ 2015 AHN JAE-HA http://github.com/eu81273
            MIT License
        */


        [data-tooltip-text]:hover {
            position: relative;
        }

        [data-tooltip-text]:hover:after {
            background-color: #000000;
            background-color: rgba(0, 0, 0, 0.8);

            -webkit-box-shadow: 0px 0px 3px 1px rgba(50, 50, 50, 0.4);
            -moz-box-shadow: 0px 0px 3px 1px rgba(50, 50, 50, 0.4);
            box-shadow: 0px 0px 3px 1px rgba(50, 50, 50, 0.4);

            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;

            color: #FFFFFF;
            font-size: 12px;
            content: attr(data-tooltip-text);

            margin-bottom: 10px;
            top: 130%;
            left: 0;    
            padding: 15px;
            position: absolute;
            width: 300px;
            word-wrap: break-word;

            z-index: 9999;
        }
    </style>
    <!-- Fixed visual defects from the header and column freeze plugins -->
    <style>
    /* 
      Fix plugin: Right columns can scroll underneath the left fixed column(s) but
      we make sure not a transparent background that allows beneath columns 
      to bleed through
    */
    th, td { 
        background-color: white;
    }

     /* Fix plugin: Fixed column classes will be added left of "Variation columns" */
     /* Make sure can scroll right columns underneath */
     thead th {
        z-index: 7 !important;
        background-color:white;
        padding: 0 15px !important;
     }
     thead th[fixed-column] {
        z-index: 10 !important;
     }

     /* When fixed header row is in sticky position, make sure is on top of other elements on the z-axis */
     .fixedHeader-floating {
        z-index: 7 !important;
     }
     
     
     /* Fix plugin: When scrolling columns to the left, gaps between the columns allow
     the beneat columns content to bleed through. We are using attributes instead of
     classes becausae the plugin reassigns the entire class list for the tbody tr td's
    */
     thead th[fixed-column], tbody td[fixed-column] {
        transform: scale(1.05);
        text-align:left;
        padding-left:5px !important; /* Plugin causes offset to the left about 5px */
     }

     /* Fix plugin: A duplicate table is made so that there's a scrollbody and that causes
     a duplicate thead that takes up space causing a gap below the header row */
     .dataTables_scrollBody thead {
        display: none;
     }

     /* Fixed plugin: Pagination dropdown gets offset with the header row when scrolling horizontally. Removed because I've set to 1000 which should be 
     sufficient. There is a page navigation at the bottom anyways */
     .dataTables_length, #DataTables_Table_0_length {
        display: none !important;
     }
     

     /* Hidden search from table because it gets dragged as you scroll horizontally */
     /* Now with our own custom search box and had to be positioned fixed */
     .container {
        margin-top: 75px;
     }

     /* Hidden records count from table because it gets dragged as you scroll horizontally */
     /* Now with our own custom records count */
     #count-rows {
        font-size:50%;
        transform: translateY(-2.5px);
        display: inline-block;
     }
     #count-rows::before {
        content: "(";
     }
     #count-rows::after {
        content: ")";
     }
    </style>
    <style>
        /* Using our own custom Search since detaching it breaks DataTable */
        #DataTables_Table_0_filter {
            display:none !important;
        }
        #DataTables_Table_0_info {
            display:none;
        }
        #DataTables_Table_0_previous {
            display:none;
        }
        #DataTables_Table_0_paginate {
            display:none;
        }
        #DataTables_Table_0_next {
            display:none;
        }
    </style>
    <script>
        function bindToInnerSearch() {
            let typed = $("#bind-inner-search").val();
            $("#DataTables_Table_0_filter input").val(typed).trigger("keyup");
            console.log(typed)
        }
    </script>
</head>

<body>
    <div id="back-to-directory" style="z-index:2; width:100vw; background-color:white;"><button onclick="window.location.href='index.php'" style="cursor:pointer;">🗂️ All Directories</button></div>
    <div id="save-status">💾 Saved</div>
    <div style="text-align:center; width:100%; z-index:0; position: fixed;left: 0; top:40px;">
        <label>Search:</label>
        <input id="bind-inner-search" type="text" oninput="bindToInnerSearch()">
        <small id="count-rows"></small>
    </div>
    <div class="container"></div>

    <script src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js"></script>

    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/fixedcolumns/4.2.2/js/dataTables.fixedColumns.min.js"></script>
    <script src="https://cdn.datatables.net/fixedheader/3.1.9/js/dataTables.fixedHeader.min.js"></script>
    <script>
        const isFailed = (myMarkdown) => {
            //return '<!DOCTYPE html> <html> <head> <title>File Not Found</title>".substring(0,70).toLowerCase().includes("file not found")'
            return myMarkdown.substring(0, 70).toLowerCase().includes("file not found");
        }
        const getFailed = () => {
            return 'ERROR: Not able to read. Has it been published? Contact author.'
        }
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
                lines[0]+="Edit Comments |";
                lines[1]+="--------------|";
                lines = lines.map((line,i)=>{
                    if(i<=1) return line;
                    else {
                        return line + "  |"
                    }
                })
                myMarkdown = lines.join("\n");
                window.fixedColumnCounts = (()=>{
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
                var result = md.render(myMarkdown);
                document.querySelector(".container").innerHTML = result.replaceAll("\\n","<br/>");
                document.querySelectorAll(".container a").forEach(a=>{
                    a.setAttribute("target", "_blank");
                })

                // Rerender with an interactive table
                window.tableHook = $( "table" ).DataTable({
                    fixedHeader: true,
                    fixedColumns: {
                        left: window.fixedColumnCounts
                    },
                    // scrollX:        true,
                    paging:         true,
                    "pageLength": 1000,

                    /* drawCallback: Gets called every row drawn or re-drawn, including changing the view by ascending/descending/filtering */
                    "drawCallback": function( settings ) {
                        $(".ri-icon-hook").remove();

                        /* Rerender social instruction icons and contenteditable comments if records found */
                        let recordsFound = !$("tbody tr").eq(0).text().includes("No matching records found");
                        if(recordsFound)
                        $("tr td:nth-child(1)").each((i,cellCol1)=>{
                            
                            // Create external icons
                            let $cell = $(cellCol1);
                            let textExercise = $cell.text();

                            let $iconGoogle = $(`<i class="ri-google-fill"></i>`);
                            let $iconYoutube = $(`<i class="ri-youtube-fill"></i>`);
                            let $iconInstagram = $(`<div style='background-image: url("./instagram.png"); height:1em; width:1em; background-repeat: no-repeat; background-size: contain;'></div>`);

                            $iconGoogle.click(()=>{
                                window.open(`https://www.google.com/search?q=exercise ${textExercise}`);
                            })
                            $iconYoutube.click(()=>{
                                window.open(`https://www.youtube.com/results?search_query=exercise ${textExercise}`);
                            })
                            $iconInstagram.click(()=>{
                                window.open(`https://www.instagram.com/explore/search/keyword/?q=exercise ${textExercise}`);
                            })

                            let $div = $(`<div class='ri-icon-hook'></div>`)

                            $div.append($iconGoogle, $iconYoutube, $iconInstagram);
                            $cell.append($div);

                            // Create modelable
                            $cell.attr("data-id", textExercise);

                            // Add id to each column
                            $cell.closest("tr").find("td:not(:nth-child(1))").each((i,cell)=>{
                                let $cell = $(cell)
                                $cell.attr("data-id", `${textExercise}-${i}`);
                            });

                            $cell.closest("tr").find("td:last-child").each((i,cell)=>{
                                let $cell = $(cell)
                                $cell.attr("contenteditable", `true`);
                                $cell.on("blur", (event)=>{
                                    const enteredText = $cell.text()
                                    console.log(enteredText);

                                    // Erased
                                    if($cell.attr("prev-contenteditable") & !enteredText.length) {
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
                        for(var i=0; i<fixedColumnCounts; i++) {
                            $("#DataTables_Table_0 th").eq(i).attr("fixed-column", true)
                        }

                        var $bodyRows = $("tbody tr");
                        for(var h = 0; h<$bodyRows.length; h++) {
                            let $td_s = $bodyRows.eq(h).find("td");

                            for(var i=0; i<fixedColumnCounts; i++) {
                                $td_s.eq(i).attr("fixed-column", true)
                            }
                        };

                        // Since we removed 1 of X, we have our own custom count:
                        $("#count-rows").text($("tbody tr").length)

                    }, // drawCallback

                    "initComplete": function(settings,json) {


                        // Create info tooltip at Search
                        let $infoIcon = $("<i class='ri-information-line'></i>");
                        $infoIcon.attr("data-tooltip-text", "Search Tip: Search for an exercise or instruction. Say you want exercises where you 'sit upright'");
                        $infoIcon.prependTo($("#DataTables_Table_0_filter label"))


                        // Create addressed statistic
                        let $addressed = $("<div id='addressed'><div/>")
                        $addressed.click(()=>{
                            let confirmed = confirm("Clear all marked colors?")
                            if(confirmed) {
                                clearAddressed();
                                rerenderAddressedStatistic();
                            }
                        })
                        // $("#DataTables_Table_0_wrapper").prepend($addressed);
                        $addressed.css("position", "fixed").css("top", "10px").css("right", "10px").css("z-index", "2");
                        $(".container").prepend($addressed)

                        loadAddressed();
                        loadComments();
        
                        setTimeout(rerenderAddressedStatistic, 100);
                        hydrateAddressingCells();
                        rerenderHeaders();

                        // Fix Plugin: Listen for the table scroll event
                        $('.dataTables_scrollBody').on('scroll', function() {
                            // Calculate the horizontal scroll offset
                            var scrollLeft = $(this).scrollLeft();
                            console.log("Scrolled", {scrollLeft, fixedHeader})
                            
                            // Apply the horizontal scroll offset to the fixed header
                            var fixedHeader = $('.fixedHeader-floating');
                            fixedHeader.css('transform', 'translateX(' + -scrollLeft + 'px)');
                        });

                        // $('#DataTables_Table_0_filter').clone().prependTo('.container');
                        // $('#DataTables_Table_0_info').detach().appendTo('.container');
                        // $('#DataTables_Table_0_paginate').detach().appendTo('.container');

                        rerenderAddressedStatistic(); // update the marked count

                    }, // initComplete
                });
            }).catch(err => {
                document.querySelector(".container").innerHTML = err;
            });

            function rerenderHeaders() {
                $("th:nth-of-type(1)").css("text-transform", "uppercase");
                $("th:last-child").css("font-style", "italic");

                window.$th_variations = [];

                $("th").each((i,el)=>{
                    const $th = $(el);
                    if(i==0) true;
                    if($th.text().indexOf("Variation")!==-1) {
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
                var text = th.text();
                th.text("");
                th.append($(`<div class='text-spaced'>${text}</div>`))
                th.append($(`<div class='bottom-strip bottom-strip-5'></div>`))
                
            } // rerenderHeaders

            function rerenderAddressedStatistic() {
                let count = $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").length;
                let total = $("tbody tr").length;
                $("#addressed").text(`${count} of ${total}`);
            }

            function hydrateAddressingCells() {
                function clearAllAddressedFlags($el) {
                    $el.removeClass("addressed-1")
                    .removeClass("addressed-2")
                    .removeClass("addressed-3")
                    .removeClass("addressed-4")
                }

                $("tr td:not(:nth-child(1)):not(:last-child)").on("click", event=>{
                    // alert("Will save") // Fixing mobile Safari indexedDB bug
                    let el = event.target;
                    let $el = $(el);

                    // let unaddressed = el.classList.length===0; // doesn't because if you had sorted on column, there's a new class .sorting_1
                    let unaddressed = !el.className.includes("addressed")
                    if(unaddressed) {
                        $el.addClass("addressed-1");
                    } else if($el.hasClass("addressed-1")) {
                        clearAllAddressedFlags($el);
                        $el.addClass("addressed-2");
                    } else if($el.hasClass("addressed-2")) {
                        clearAllAddressedFlags($el);
                        $el.addClass("addressed-3");
                    } else if($el.hasClass("addressed-3")) {
                        clearAllAddressedFlags($el);
                        $el.addClass("addressed-4");
                    } else if($el.hasClass("addressed-4")) {
                        clearAllAddressedFlags($el);
                    }
                    rerenderAddressedStatistic();

                    saveAddressed();
                    animateSaved();
                });
            } // hydrateAddressingCells

            function animateSaved() {
                $("#save-status").fadeIn(400, function() {
                    $(this).delay(200).fadeOut(150);
                });
            }

            function upgradeDb(event) {
                    // alert("onupgradeneeded") // Fixing mobile Safari indexedDB bug
                    const db = event.target.result;
                    
                    // Get all existing object store names
                    var objectStoreNames = Array.from(db.objectStoreNames);
                    
                    // Delete all object stores
                    objectStoreNames.forEach(function(objectStoreName) {
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
                
                
                open.onsuccess = function(event) {
                    // alert("onsuccess") // Fixing mobile Safari indexedDB bug
                    const db = event.target.result;
                    let tx = db.transaction("FitnessAddressedStore", "readonly");
                    let store = tx.objectStore("FitnessAddressedStore");
                    var results = [];

                    
                    // alert("Ran -1") // Fixing mobile Safari indexedDB bug
                    store.openCursor().onsuccess = function(event) {
                            const cursor = event.target.result;
                            // Continue all lines and push into results array
                            // alert("Ran 0") // Fixing mobile Safari indexedDB bug
                            if (cursor) {
                                results.push(cursor.value);
                                // alert("Ran 1") // Fixing mobile Safari indexedDB bug
                                cursor.continue();
                            } else {
                                console.log('All objects retrieved:', results);
                                results.forEach(cellModel=>{
                                    let {id, state} = cellModel;
                                    console.log(cellModel)
                                    $(`[data-id="${id}"]`)[0].className = state;
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

                    tx.oncomplete = function() {
                        db.close();
                    };
                };

                open.onerror = function() {
                    console.error("Error", open.error);
                    // alert("Error", open.error); // Fixing mobile Safari indexedDB bug
                };
            }; // loadAddressed
            
            function clearAddressed() {
                
                $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i,el)=>{
                    $(el).removeClass("addressed-1")
                        .removeClass("addressed-2")
                        .removeClass("addressed-3")
                        .removeClass("addressed-4")
                })
                saveAddressed();
            }

            function saveAddressed() {
                // alert("savedAd // Fixing mobile Safari indexedDB bugdressed")

                let open = indexedDB.open("fitness-deck", window.dbVersion);
                open.onsuccess = function(event) {
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

                    tx.onerror = function(event) {
                        console.error("Transaction error:", event.target.error);
                    //   alert("Transaction error:", event.target.error); // Fixing mobile Safari indexedDB bug
                    };
                    store.onerror = function(event) {
                        console.error("Store error:", event.target.error);
                    //   alert("Store error:", event.target.error); // Fixing mobile Safari indexedDB bug
                    };

                    // alert("Tx and store opened for saving") // Fixing mobile Safari indexedDB bug

                    
                    // Clear all data from store
                    store.clear().onsuccess = function(event) {
                        // alert("Store resetted to add current cells") // Fixing mobile Safari indexedDB bug
                        $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i,el)=>{
                            let id = $(el).attr("data-id");
                            let state = $(el).attr("class");
                            store.put({id,state});
                        });
                    };


                    // Close the db when the transaction is done
                    tx.oncomplete = function() {
                        db.close();
                    };
                };
                
                // console.group("A")
                $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i,el)=>{
                    let a = $(el).attr("data-id");
                    let b = $(el).attr("class");
                    // console.log({a,b})
                });
                // console.groupEnd();

                open.onerror = function() {
                    console.error("Error", open.error);
                };

            }; // saveAddressed



            function loadComments() {
                let open = indexedDB.open("fitness-deck", window.dbVersion);
                //alert(open); // Fixing mobile Safari indexedDB bug

                // Create the schema if version number changes or if this is a fresh user visit

                open.onupgradeneeded = upgradeDb;
                
                
                open.onsuccess = function(event) {
                    // alert("onsuccess") // Fixing mobile Safari indexedDB bug
                    const db = event.target.result;
                    let tx = db.transaction("FitnessCommentStore", "readonly");
                    let store = tx.objectStore("FitnessCommentStore");
                    var results = [];

                    
                    // alert("Ran -1") // Fixing mobile Safari indexedDB bug
                    store.openCursor().onsuccess = function(event) {
                            const cursor = event.target.result;
                            // Continue all lines and push into results array
                            // alert("Ran 0") // Fixing mobile Safari indexedDB bug
                            if (cursor) {
                                results.push(cursor.value);
                                // alert("Ran 1") // Fixing mobile Safari indexedDB bug
                                cursor.continue();
                            } else {
                                console.log('All objects retrieved:', results);
                                results.forEach(cellModel=>{
                                    let {id, comment} = cellModel;
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

                    tx.oncomplete = function() {
                        db.close();
                    };
                };

                open.onerror = function() {
                    console.error("Error", open.error);
                    // alert("Error", open.error); // Fixing mobile Safari indexedDB bug
                };
            }; // loadComments

            function saveComment(id, comment) {
                // alert("savedAd // Fixing mobile Safari indexedDB bugdressed")

                let open = indexedDB.open("fitness-deck", window.dbVersion);
                open.onsuccess = function(event) {
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

                    tx.onerror = function(event) {
                        console.error("Transaction error:", event.target.error);
                    //   alert("Transaction error:", event.target.error); // Fixing mobile Safari indexedDB bug
                    };
                    store.onerror = function(event) {
                        console.error("Store error:", event.target.error);
                    //   alert("Store error:", event.target.error); // Fixing mobile Safari indexedDB bug
                    };

                    // alert("Tx and store opened for saving") // Fixing mobile Safari indexedDB bug

                    store.put(
                        {id,comment}
                    );


                    // Close the db when the transaction is done
                    tx.oncomplete = function() {
                        db.close();
                    };
                };
                

                open.onerror = function() {
                    console.error("Error", open.error);
                };

            }; // saveComments

            // Bug Fix: Fixed header plugin. When have the fixed header in sticky
            // position because the table has been scrolled down - that header
            // row would break if you resize the window. Solution: Redraw table
            // when user resizes window.
            window.addEventListener('resize', function(event) {
                window.tableHook.draw();
                // console.log("Redrawed table because resized window")
            });

    </script>
    <style>
        th {
            padding: 0 !important;
            padding-bottom: 5px !important;
        }
        th .text-spaced {
            margin-bottom: 7.5px;
        }
        th.header-variation {
            position: relative; /* So can position bottom strip */
            border-top: 5px solid ghostwhite;
            border-left: 5px solid ghostwhite;
            border-radius:7px;
        }
        th .bottom-strip {
            height:7.5px; 
            width:100%; 
            position:absolute; 
            bottom:0; 
            left:0;
        }
        th .bottom-strip-1 {
            background-image: linear-gradient(to right, #003300, #006600);
        }
        th .bottom-strip-2 {
            background-image: linear-gradient(to right, #006600, #66B366);
        }
        th .bottom-strip-3 {
            background-image: linear-gradient(to right, #66B366, #996600);
        }
        th .bottom-strip-4 {
            background-image: linear-gradient(to right, #996600, #cc3300);
        }
        th .bottom-strip-5 {
            background-image: linear-gradient(to right, #cc3300, #663300);
        }
    </style>
    <style>
        #back-to-directory{
            position:fixed; top:0; padding-top:10px; left:20px;
        } 
        #DataTables_Table_0_wrapper {
            margin-top:25px;
        }
        /*
        @media screen AND (max-width:844px) {
            
            #back-to-directory{
                position: static;
                margin-bottom: 13px;
            } 
        }
        @media screen AND (max-width:580px) {
            .dataTables_length {
                display: flex !important;
                text-align: left !important;
            }
            
            .dataTables_filter  {
                text-align: left !important;
            }
            .ri-information-line {
                display: none;
            }
        } */
    </style>
</body>

</html>