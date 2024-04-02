// Re-sorts to be toe to head or pull/push/legs

function sortIntoAreas() {

    fetch("assets/js/common-sense-view.html")
    .then(response => response.text())
    .then(html => {
        document.querySelector(".intro").innerHTML = html;
    })
} // sortIntoAreas