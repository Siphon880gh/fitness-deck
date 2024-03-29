// Re-sorts to be toe to head or pull/push/legs

window.sortedByArea = false;

function sortIntoAreas() {

    window.sortedByArea = true;

    fetch("assets/js/common-sense-view.html")
    .then(response => response.text())
    .then(html => {
        document.querySelector(".intro").innerHTML = html;
    })
} // sortIntoAreas