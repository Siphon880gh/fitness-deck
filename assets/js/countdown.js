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