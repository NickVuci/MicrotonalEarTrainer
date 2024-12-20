// Settings 

// Event listener for root frequency input
document.getElementById('baseFrequencyInput').addEventListener('change', () => {
    const input = parseFloat(document.getElementById('baseFrequencyInput').value);
    if (isNaN(input) || input < 20 || input > 20000) {
        alert('Please enter a valid frequency between 20 Hz and 20,000 Hz.');
        // Reset to default if invalid
        baseFrequency = 220.0;
        document.getElementById('baseFrequencyInput').value = baseFrequency.toFixed(1);
    } else {
        baseFrequency = input;
    }
});

// Event listener for Waveform Selection Change
document.getElementById('waveformSelect').addEventListener('change', () => {
    waveform = document.getElementById('waveformSelect').value;
    saveSettings();
});

// Event listener for Root Frequency Input Change
document.getElementById('baseFrequencyInput').addEventListener('change', () => {
    const freq = parseFloat(document.getElementById('baseFrequencyInput').value);
    if (!isNaN(freq) && freq >= 20 && freq <= 20000) {
        baseFrequency = freq;
        saveSettings();
        generateIntervals();
        displayIntervals();
    }
});

// Event listener for label toggle
document.getElementById('labelToggle').addEventListener('change', () => {
    showCents = document.getElementById('labelToggle').checked;
    displayIntervals();
});

// Save Settings to localStorage
function saveSettings() {
    localStorage.setItem('rootNote', baseFrequency.toString());
    localStorage.setItem('waveform', waveform);
}

// Initialize Settings from localStorage
function loadSettings() {
    const savedRootNote = localStorage.getItem('rootNote');
    if (savedRootNote) {
        baseFrequency = parseFloat(savedRootNote);
        document.getElementById('baseFrequencyInput').value = baseFrequency;
    }

    const savedWaveform = localStorage.getItem('waveform');
    if (savedWaveform) {
        waveform = savedWaveform;
        const waveformSelect = document.getElementById('waveformSelect');
        waveformSelect.value = waveform;
        // Trigger the change event to update the waveform
        handleWaveformChange({ target: waveformSelect });
    }
}

// Load settings on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});