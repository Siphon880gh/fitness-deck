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
                    liEl.classList.add("folder")

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
                aEl.textContent = fileName.substr(0, fileName.length - 3);

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
                aEl.textContent = fileName.substr(0, fileName.length - 3);

                liEl.append(aEl);
                return liEl;
                })());
            }
            });
        } // renderListing
        } // initIndexUI
        initIndexUI();
})