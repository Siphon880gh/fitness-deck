document.addEventListener("DOMContentLoaded", () => {
    var modal = document.getElementById('modal');

    var closeBtn = modal.getElementsByClassName('close')[0];
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" || event.keyCode === 27) {
            modal.style.display = 'none';
        }
      });
});