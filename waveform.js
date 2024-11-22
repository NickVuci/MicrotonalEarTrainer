// waveform.js

// Initialize selected waveform with default value
let selectedWaveform = 'sine';

// Function to handle waveform selection changes
function handleWaveformChange(event) {
    selectedWaveform = event.target.value;
    console.log(`Selected Waveform: ${selectedWaveform}`);
    // Update the waveform in app.js
    waveform = selectedWaveform;
}

// Add event listener to the waveform selection dropdown
document.addEventListener('DOMContentLoaded', () => {
    const waveformSelect = document.getElementById('waveformSelect');
    if (waveformSelect) {
        waveformSelect.addEventListener('change', handleWaveformChange);
    }
});

// Expose a getter for the selected waveform to be used by app.js
function getSelectedWaveform() {
    return selectedWaveform;
}

// Attach the getter to the window object for global access
window.getSelectedWaveform = getSelectedWaveform;