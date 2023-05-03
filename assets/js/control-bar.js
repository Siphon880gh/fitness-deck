// Show panels have space for
window.onresize = window.onload = () => {
    const winWidth = document.documentElement.clientWidth;
    const allCp = Array.from(document.querySelectorAll(".control-panel"));
    let cumulWidth = 0;
    let gapEtc = 85; // width of icon+label, and width of gap
    for(let i = 0; i<allCp.length; i++) {
        allCp[i].classList.add("cp-hidden");
        cumulWidth += parseInt(allCp[i].attributes["data-width"].value) + gapEtc;
        if(cumulWidth<winWidth)
            allCp[i].classList.remove("cp-hidden")
    }
    
}

function toggleElementRelative(event, closest, relative) {
    // TODO: Will keep panels that were opened in an opened state if space permits
    // and otherwise close the left most panel if you are toggling on a current panel
    // without sufficient space. 
    // But for the interest of time I have for coding, it's only one toggling on at a time
    // debugger;

    const allCp = Array.from(document.querySelectorAll(".control-panel"));
    for(let i = 0; i<allCp.length; i++) {
        allCp[i].classList.add("cp-hidden");
    }

    event.target.closest(closest).querySelector(relative).classList.toggle('cp-hidden');
}