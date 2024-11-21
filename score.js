// score.js

// Initialize score variables
let correctCount = 0;
let incorrectCount = 0;

// Function to load scores from Local Storage
function loadScores() {
    const savedCorrect = localStorage.getItem('correctCount');
    const savedIncorrect = localStorage.getItem('incorrectCount');

    correctCount = savedCorrect ? parseInt(savedCorrect) : 0;
    incorrectCount = savedIncorrect ? parseInt(savedIncorrect) : 0;

    updateScoreDisplay();
}

// Function to save scores to Local Storage
function saveScores() {
    localStorage.setItem('correctCount', correctCount);
    localStorage.setItem('incorrectCount', incorrectCount);
}

// Function to update the score display on the page with animation
function updateScoreDisplay() {
    const correctScoreElem = document.getElementById('correctScore');
    const incorrectScoreElem = document.getElementById('incorrectScore');

    correctScoreElem.textContent = `Correct: ${correctCount}`;
    incorrectScoreElem.textContent = `Incorrect: ${incorrectCount}`;

    // Add 'updated' class to trigger animation
    correctScoreElem.classList.add('updated');
    incorrectScoreElem.classList.add('updated');

    // Remove 'updated' class after animation completes (assuming 500ms)
    setTimeout(() => {
        correctScoreElem.classList.remove('updated');
        incorrectScoreElem.classList.remove('updated');
    }, 500);
}

// Function to increment correct count
function incrementCorrect() {
    correctCount++;
    saveScores();
    updateScoreDisplay();
}

// Function to increment incorrect count
function incrementIncorrect() {
    incorrectCount++;
    saveScores();
    updateScoreDisplay();
}

// Function to reset scores
function resetScores() {
    correctCount = 0;
    incorrectCount = 0;
    saveScores();
    updateScoreDisplay();
}

// Attach event listeners to handle score updates
function attachScoreListeners() {
    // Example: Assuming you have functions to call when user gets correct or incorrect
    // These should be called from your main app logic (e.g., app.js) when appropriate
    // For demonstration, let's assume buttons trigger score increments

    const incrementCorrectBtn = document.getElementById('incrementCorrect');
    const incrementIncorrectBtn = document.getElementById('incrementIncorrect');
    const resetScoreButton = document.getElementById('resetScoreButton');

    if (incrementCorrectBtn) {
        incrementCorrectBtn.addEventListener('click', incrementCorrect);
    }

    if (incrementIncorrectBtn) {
        incrementIncorrectBtn.addEventListener('click', incrementIncorrect);
    }

    if (resetScoreButton) {
        resetScoreButton.addEventListener('click', resetScores);
    }
}

// Initialize scores and attach listeners on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadScores();
    attachScoreListeners();
});
