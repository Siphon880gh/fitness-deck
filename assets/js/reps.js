function resetRepsTable() {
    document.querySelectorAll("#reps-sets-table td:not(.initial)").forEach(td => { td.remove(); });
    document.querySelector("#r-plus").classList.remove("hidden");
    document.querySelectorAll("#reps-sets-table input").forEach(input => { input.value = "" });
}
function optionsRepsTable() {
    var modal = document.getElementById('modal');
    modal.style.display = 'block';
    document.getElementById("reps-text").value = (() => {
        // Convert td into array of arrays
        var multiArray = [];
        document.querySelectorAll("#reps-sets-table tr").forEach((tr, rowNum) => {
            if (rowNum === 1) {
                var trAllTd = Array.from(tr.querySelectorAll("td"));
                var trNonheaderTd = trAllTd.slice(1);
                var values = trNonheaderTd.map(td => td.querySelector("input").value);
                multiArray.push(values);
            } else if (rowNum === 2) {
                var trAllTd = Array.from(tr.querySelectorAll("td"));
                var trNonheaderTd = trAllTd.slice(1);
                var values = trNonheaderTd.map(td => td.querySelector("input").value);
                multiArray.push(values);
            }
        }); // iterating each tr
        console.log({ multiArray })

        var sets = multiArray[0].length;

        var finalText = "";
        // Iterate set columns
        for (var i = 0; i < sets; i++) {
            if (multiArray[0][i].length && parseInt(multiArray[0][i]) !== 0) {
                finalText += multiArray[0][i] // Rep
                finalText += "x" // Rep
                finalText += multiArray[1][i] // Wt
                finalText += "/"
            }
        }

        console.log(finalText);

        return finalText;
    })(); // save to reps-text textarea value
}
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#r-plus").addEventListener("click", () => {
        // Configure the sets limit
        window.setsLimit = 4;

        // Number of sets is how many columns
        var setNum = document.querySelector("#reps-sets-table tr:nth-of-type(1)").querySelectorAll("td").length - 1;
        // console.log(window.setsLimit===setNum+1)
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
        }); // iterating each tr
    })
})