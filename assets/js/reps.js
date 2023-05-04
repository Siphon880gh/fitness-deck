function resetRepsTable() {
}
document.addEventListener("DOMContentLoaded", ()=>{
    document.querySelector("#r-plus").addEventListener("click", ()=>{
        // Configure the sets limit
        window.setsLimit = 4;

        document.querySelectorAll("#reps-sets-table tr").forEach((tr,rowNum)=>{
            console.log({rowNum})
        });
    })
})