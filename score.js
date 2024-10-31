// score.js

// Initialize score variables
let correctCount = 0;
let incorrectCount = 0;

// Function to update the score display
function updateScoreDisplay() {
    document.getElementById('correctScore').textContent = `Correct: ${correctCount}`;
    document.getElementById('incorrectScore').textContent = `Incorrect: ${incorrectCount}`;
    // Save to Local Storage (optional, for persistence)
    localStorage.setItem('correctCount', correctCount);
    localStorage.setItem('incorrectCount', incorrectCount);
}

// Function to increment correct score
function incrementCorrect() {
    correctCount++;
    updateScoreDisplay();
}

// Function to increment incorrect score
function incrementIncorrect() {
    incorrectCount++;
    updateScoreDisplay();
}

// Function to reset scores
function resetScores() {
    correctCount = 0;
    incorrectCount = 0;
    updateScoreDisplay();
}

// Expose functions to global scope for access from app.js
window.incrementCorrect = incrementCorrect;
window.incrementIncorrect = incrementIncorrect;
window.resetScores = resetScores;

// Initialize scores from Local Storage on load (optional)
window.onload = function() {
    const savedCorrect = parseInt(localStorage.getItem('correctCount'));
    const savedIncorrect = parseInt(localStorage.getItem('incorrectCount'));
    if (!isNaN(savedCorrect)) correctCount = savedCorrect;
    if (!isNaN(savedIncorrect)) incorrectCount = savedIncorrect;
    updateScoreDisplay();
}
