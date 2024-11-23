// Modal JavaScript
const modal = document.getElementById("settingsModal");
const btn = document.getElementById("openSettingsButton");
const span = document.getElementsByClassName("close")[0];

// Increase touch target size for mobile
span.style.padding = "10px";
span.style.fontSize = "20px";
span.style.cursor = "pointer";

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}