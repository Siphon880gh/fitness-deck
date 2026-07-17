function resetRepsTable() {
    var table = document.getElementById("reps-sets-table");
    var plus = document.getElementById("r-plus");
    if (!table) return;

    // Keep only the label column + the first set column; drop any added sets.
    table.querySelectorAll("tr").forEach(function (tr) {
        var cells = Array.from(tr.querySelectorAll("td"));
        cells.forEach(function (td, index) {
            if (index >= 2) td.remove();
        });
    });

    var headerSet = table.querySelector("tr:nth-of-type(1) td:nth-of-type(2)");
    if (headerSet) headerSet.textContent = "1st";

    table.querySelectorAll("input").forEach(function (input) {
        input.value = "";
    });

    // Ensure first Rep / Wt cells still have empty number inputs
    [2, 3].forEach(function (rowIndex) {
        var tr = table.querySelector("tr:nth-of-type(" + rowIndex + ")");
        if (!tr) return;
        var cell = tr.querySelector("td:nth-of-type(2)");
        if (!cell) {
            cell = document.createElement("td");
            cell.className = "initial";
            tr.appendChild(cell);
        }
        var input = cell.querySelector("input");
        if (!input) {
            input = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("min", "0");
            cell.appendChild(input);
        }
        input.value = "";
    });

    if (plus) plus.classList.remove("hidden");
}

function lastSetInputValue(tr) {
    var inputs = tr.querySelectorAll("td input");
    if (!inputs.length) return "";
    return inputs[inputs.length - 1].value;
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

        return finalText;
    })(); // save to reps-text textarea value
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#r-plus").addEventListener("click", () => {
        // Configure the sets limit
        window.setsLimit = 4;

        // Number of sets is how many columns
        var setNum = document.querySelector("#reps-sets-table tr:nth-of-type(1)").querySelectorAll("td").length - 1;
        if (window.setsLimit === setNum + 1) {
            document.querySelector("#r-plus").classList.add("hidden")
        }

        // Snapshot previous set values before appending new columns
        var prevRep = "";
        var prevWt = "";
        var rows = document.querySelectorAll("#reps-sets-table tr");
        if (rows[1]) prevRep = lastSetInputValue(rows[1]);
        if (rows[2]) prevWt = lastSetInputValue(rows[2]);

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
                var tdRep = document.createElement("td");
                var inputRep = document.createElement("input");
                inputRep.setAttribute("type", "number");
                inputRep.setAttribute("min", "0");
                inputRep.value = prevRep;
                tdRep.appendChild(inputRep);
                tr.append(tdRep);
            } else if (rowNum === 2) {
                var tdWt = document.createElement("td");
                var inputWt = document.createElement("input");
                inputWt.setAttribute("type", "number");
                inputWt.setAttribute("min", "0");
                inputWt.value = prevWt;
                tdWt.appendChild(inputWt);
                tr.append(tdWt);
            }
        }); // iterating each tr
    })
})
