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

/* View controller you pass the new status to and it'll color the countdown color */
var controlViewColor = (newStatus) => {
    switch (newStatus) {
        case "PLAYING":
            document.querySelector("#countdown-display").setAttribute("data-color", "green");
            break;
        case "STOPPED":
            document.querySelector("#countdown-display").setAttribute("data-color", "red");
            break;
        case "PAUSED":
            document.querySelector("#countdown-display").setAttribute("data-color", "iceblue");
            break;
    }
}

var poller = () => {
    console.log("Poller")
    if (window.countdown.status === "PLAYING") {
        if (window.countdown.timeAt < window.countdown.timeCap) {
            window.countdown.timeAt = window.countdown.timeAt + 1;
            // debugger;


            function formatSecs_MMSS(seconds) {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;

                const formattedMinutes = String(minutes).padStart(2, '0');
                const formattedSeconds = String(remainingSeconds).padStart(2, '0');

                return `${formattedMinutes}:${formattedSeconds}`;
            }


            document.querySelector("#countdown-display").innerHTML = `${formatSecs_MMSS(window.countdown.timeAt)} / ${formatSecs_MMSS(window.countdown.timeCap)}`;

        } else {
            document.querySelectorAll("html, #bar-controls").forEach(el => { el.classList.add("countdown-finished"); });
            if (pollerId)
                clearInterval(pollerId);
        }

    }
}
pollerId = null;
document.addEventListener("DOMContentLoaded", () => {
    var display = document.querySelector("#countdown-display")
    document.querySelectorAll(".countdown-quant, #countdown-display, #countdown-stop-play").forEach(el => {
        el.addEventListener("click", () => {
            var wasFinished = document.querySelectorAll(".countdown-finished");
            if (wasFinished) {
                wasFinished.forEach(el => {
                    el.classList.remove("countdown-finished");
                });
            }

            if (el.matches("#countdown-stop-play")) {
                window.countdown = {
                    ...countdown,
                    status: window.countdown.status === "PLAYING" ? "STOPPED" : "PLAYING"
                }
                console.log(window.countdown);

                // After wanting Play
                controlViewColor(window.countdown.status);

                // After wanting Play
                if (window.countdown.status === "PLAYING") {
                    window.countdown.timeAt = 0;
                    pollerId = setInterval(poller, 1000);
                }

            } else if (el.matches("#countdown-display")) {
                window.countdown = {
                    ...countdown,
                    timeAt: window.countdown.status === "PLAYING" ? 0 : window.timeCap,
                    status: window.countdown.status === "PLAYING" ? "PAUSED" : "PLAYING"
                }
                console.log(window.countdown);

                // After wanting Play
                controlViewColor(window.countdown.status);

                // After wanting Play
                if (window.countdown.status === "PLAYING") {
                    window.countdown.timeAt = 0;
                    pollerId = setInterval(poller, 1000);
                }
            } else if (el.matches(".countdown-quant")) {
                window.countdown = {
                    ...countdown,
                    timeCap: (() => {
                        var isPlus = document.querySelector("#countdown-operator").classList.contains("is-plus")
                        //console.log({isPlus})
                        var dataValue = el.getAttribute('data-value');
                        if (isPlus) {
                            return window.countdown.timeCap + parseInt(dataValue);
                        } else {
                            return window.countdown.timeCap - parseInt(dataValue) < 0 ? 0 : window.countdown.timeCap - parseInt(dataValue);
                        }

                    })()
                }
                console.log(window.countdown);
            } // if,else's
        }) // click
    }); // any will be clicked


}) // DOMContentLoaded for countdown