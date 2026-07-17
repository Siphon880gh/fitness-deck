// Loads goal-grouped listing markup into .intro

function sortIntoAreas() {
    return fetch("assets/js/common-sense-view.html")
        .then(response => response.text())
        .then(html => {
            document.querySelector(".intro").innerHTML = html;
            if (typeof window.hydrateDirectoryLinks === "function") {
                window.hydrateDirectoryLinks();
            }
            if (typeof window.annotateLastOpenedOnLinks === "function") {
                window.annotateLastOpenedOnLinks();
            }
        });
}
