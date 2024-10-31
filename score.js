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

    // Remove 'updated' class after animation completes
    setTimeout(() => {
        correctScoreElem.classList.remove('updated');
        incorrectScoreElem.classList.remove('updated');
    }, 300); // Duration matches the CSS animation duration
}

// Function to increment correct score
function incrementCorrect() {
    correctCount += 1;
    updateScoreDisplay();
    saveScores();
}

// Function to increment incorrect score
function incrementIncorrect() {
    incorrectCount += 1;
    updateScoreDisplay();
    saveScores();
}

// Function to reset scores
function resetScores() {
    correctCount = 0;
    incorrectCount = 0;
    updateScoreDisplay();
    localStorage.removeItem('correctCount');
    localStorage.removeItem('incorrectCount');
}

// Load scores when the script is loaded
loadScores();
