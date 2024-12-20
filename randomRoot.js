// randomRoot.js

// Function to randomize the root note based on the input root note and tuning
function randomizeRootNote() {
    const rootNote = parseFloat(document.getElementById('baseFrequencyInput').value) // Get the root note from input
    const tuning = parseInt(document.getElementById('edoValue').value) // Get the tuning value from input
    const randomFactor = Math.floor(Math.random() * tuning);
    const newRootNote = rootNote * Math.pow(2, randomFactor / tuning);
    return newRootNote;
}

// Event listener for the play button
document.getElementById('playButton').addEventListener('click', () => {
    const randomizeCheckbox = document.getElementById('randomizeRootNote');
    if (randomizeCheckbox && randomizeCheckbox.checked) {
        const newRootNote = randomizeRootNote();
        console.log(`New randomized root note: ${newRootNote} Hz`);
        baseFrequency = newRootNote; // Update the base frequency
        generateIntervals(); // Regenerate intervals with the new root note
        displayIntervals(); // Update the display with new intervals
    }
});