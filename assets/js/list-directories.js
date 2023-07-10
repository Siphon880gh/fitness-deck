document.addEventListener("DOMContentLoaded", ()=>{

    function initIndexUI() {
        const dirsEl = document.querySelector(".dirs");
        dirsEl.innerHTML = ""; // So can be reinit

        fetch("icons.config.js")
            .then((response) => {
            let customIcons = { icons: [] };
            if (response.ok) {
                return response.json();
            }
            return customIcons;
            })
            .then((customIconsConfig) => {
                customIcons = customIconsConfig;
                renderListing(customIcons.icons);
            })
            .catch((error) => {
                renderListing([]);
            });


        function renderListing(customIcons) {

            const handleLastOpened = event => {
                //const textContent = event.target.textContent
                const href = event.target.dataset.href
                const shortDate = (new Date()).getMonth()+"/"+(new Date()).getDate()
                let lastOpened = localStorage.getItem("FitnessDeck__lastOpened");
                if(lastOpened) {
                    lastOpened = JSON.parse(lastOpened)
                    // lastOpened is an array of dates left to right: most recent, last recent, oldest
                    if(lastOpened.length===3) lastOpened.pop(); // self mutates removing the oldest date at the right side
                    lastOpened = [{href, shortDate}, ...lastOpened];
                    console.log("Clicked. Append date to LocalStorage");
                } else {
                    lastOpened = [{href, shortDate}];
                    console.log("Clicked. One date to LocalStorage");
                }
                localStorage.setItem("FitnessDeck__lastOpened", JSON.stringify(lastOpened))
            }

            // window.dirs = window.dirs.reverse();
            window.dirs = window.dirs.sort();
            window.dirs.forEach(dir => {
            const isSegmentedPath = dir.split("/").length;
            if (isSegmentedPath) {
                let folderName = dir.split("/")[0];
                // If was password protected, remove password from the folder name
                if (folderName.length && folderName[0] === '-') {
                folderName = folderName.split(" ").slice(1).join(" ");
                }
                // console.log(folderName);

                const fileName = dir.split("/")[1];
                const isFirstListing = !Boolean(document.querySelector(`[data-folder="${folderName}"]`));
                if (isFirstListing) {
                dirsEl.append((() => {
                    const liEl = document.createElement("li");
                    liEl.textContent = folderName;
                    liEl.classList.add("folder");

                    // Jumpable links
                    var idFolderName = (function extractAlphanumericHyphenable({inputString}) {
                        var extracted = inputString.replace(/[^a-zA-Z0-9\-]/g, '');
                        var lowercased = extracted.toLowerCase();
                        return lowercased;
                      })({
                        inputString: folderName
                    });
                    liEl.setAttribute("id", idFolderName)
                    liEl.onclick = (event)=>{ 
                        window.location.hash = idFolderName;
                    }

                    const matchedCustomIcon = customIcons.filter(customIcon => customIcon.displayName === folderName);
                    if (matchedCustomIcon.length) {
                    liEl.classList.add("custom-icon")
                    liEl.innerHTML = matchedCustomIcon[0].replaceIcon + "&nbsp;" + liEl.innerHTML
                    }
                    liEl.setAttribute("data-folder", folderName);
                    return liEl;
                })())
                }
                dirsEl.append((() => {
                const liEl = document.createElement("li");
                liEl.classList.add("file")

                const aEl = document.createElement("a");
                aEl.href = "?md-file=" + dir;
                aEl.dataset.href = "?md-file=" + dir;
                aEl.textContent = fileName.substr(0, fileName.length - 3);
                aEl.onclick = handleLastOpened;

                liEl.append(aEl);
                return liEl;
                })());
            } // isSegmentedPath
            else { // is not segmented with slashes, so is root file

                dirsEl.append((() => {
                const liEl = document.createElement("li");
                liEl.classList.add("file")

                const aEl = document.createElement("a");
                aEl.href = "?md-file=" + dir;
                aEl.dataset.href = "?md-file=" + dir;
                aEl.textContent = fileName.substr(0, fileName.length - 3);
                aEl.onclick = handleLastOpened;

                liEl.append(aEl);
                return liEl;
                })());
            }
            });
        } // renderListing
        } // initIndexUI
        initIndexUI();
})