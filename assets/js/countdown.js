// Stateful
window.countdown = {
    loaded: false,
    status: "STOPPED", // PAUSED|STOPPED|PLAYING
    timeAt: 0,
    timeCap: 0
}
// Set defaults
window.countdown = {
    ...countdown, 
    timeAt: 0,
    timeCap: 5
}

document.addEventListener("DOMContentLoaded", ()=>{
    var display = document.querySelector("#countdown-display")
    document.querySelectorAll(".countdown-quant, #countdown-display, #countdown-stop-play").forEach(el=>{
        el.addEventListener("click",()=>{
                var wasFinished = document.querySelectorAll(".countdown-finished");
                if(wasFinished) {
                    wasFinished.forEach(el=> {
                        el.classList.remove("countdown-finished"); 
                    });
                }

                if(el.matches("#countdown-stop-play")) {
                window.countdown = {
                    ...countdown,
                    status: window.countdown.status==="PLAYING"?"STOPPED":"PLAYING"
                }
                console.log(window.countdown);

            } else if(el.matches("#countdown-display")) {
                window.countdown = {
                    ...countdown,
                    timeAt: window.countdown.status==="PLAYING"?0:window.timeCap,
                    status: window.countdown.status==="PLAYING"?"PAUSED":"PLAYING"
                }
                console.log(window.countdown);
            } else if(el.matches(".countdown-quant")) {
                window.countdown = {
                    ...countdown,
                    timeCap: (()=>{
                        var isPlus = document.querySelector("#countdown-operator").classList.contains("is-plus")
                        //console.log({isPlus})
                        var dataValue = el.getAttribute('data-value');
                        if(isPlus) {
                            return window.countdown.timeCap + parseInt(dataValue);
                        } else {
                            return window.countdown.timeCap - parseInt(dataValue)<0?0:window.countdown.timeCap - parseInt(dataValue);
                        }

                    })()
                }
                console.log(window.countdown);
            } // if,else's
        }) // click
    }); // any will be clicked


}) // DOMContentLoaded for countdown