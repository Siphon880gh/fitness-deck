function resetRepsTable() {
    document.querySelectorAll("#reps-sets-table td:not(.initial)").forEach(td => { td.remove(); });
    document.querySelector("#r-plus").classList.remove("hidden");
    document.querySelectorAll("#reps-sets-table input").forEach(input => { input.value = "" });
}
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#r-plus").addEventListener("click", () => {
        // Configure the sets limit
        window.setsLimit = 4;

        // Number of sets is how many columns
        var setNum = document.querySelector("#reps-sets-table tr:nth-of-type(1)").querySelectorAll("td").length - 1;
        console.log(window.setsLimit === setNum + 1)
        if (window.setsLimit === setNum + 1) {
            document.querySelector("#r-plus").classList.add("hidden")
        }


        document.querySelectorAll("#reps-sets-table tr").forEach((tr, rowNum) => {
            if (rowNum === 0) {
                var td = document.createElement("td");
                td.textContent = (() => {
                    if (setNum + 1 === 2)
                        return "2nd";
                    else if (setNum + 1 === 3)
                        return "3rd";
                    else
                        return `${setNum + 1}th`;
                })()
                tr.append(td);
            } else if (rowNum === 1) {
                var td = document.createElement("td");
                td.appendChild((() => {
                    var input = document.createElement("input");
                    input.setAttribute("type", "number")
                    input.setAttribute("min", "0");
                    input.value = (() => {
                        var trAllTd = Array.from(tr.querySelectorAll("td"));
                        var prevTd = trAllTd[setNum]
                        var prevInputValue = prevTd.querySelector("input").value
                        return prevInputValue;
                    })()
                    return input;
                })())
                tr.append(td);
            } else if (rowNum === 2) {
                var td = document.createElement("td");
                td.appendChild((() => {
                    var input = document.createElement("input");
                    input.setAttribute("type", "number")
                    input.setAttribute("min", "0");
                    input.value = (() => {
                        var trAllTd = Array.from(tr.querySelectorAll("td"));
                        var prevTd = trAllTd[setNum]
                        var prevInputValue = prevTd.querySelector("input").value
                        return prevInputValue;
                    })()
                    return input;
                })())
                tr.append(td);
            }
        });
    })
})