// score.js

// Initialize score variables
let correctCount = 0;
let incorrectCount = 0;

// Function to update the score display
function updateScoreDisplay() {
    document.getElementById('correctScore').textContent = `Correct: ${correctCount}`;
    document.getElementById('incorrectScore').textContent = `Incorrect: ${incorrectCount}`;
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

// Function to reset scores (optional)
// You can call this function if you want to provide a reset feature
function resetScores() {
    correctCount = 0;
    incorrectCount = 0;
    updateScoreDisplay();
}

// Expose functions to global scope for access from app.js
window.incrementCorrect = incrementCorrect;
window.incrementIncorrect = incrementIncorrect;
window.resetScores = resetScores;
