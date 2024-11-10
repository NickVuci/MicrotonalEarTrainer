// scaleUpload.js

// Listen for Scala file upload
document.getElementById('scalaFile').addEventListener('change', handleScalaFileUpload);

// Handle Scala file upload
function handleScalaFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        
        // Parse the file contents
        const intervals = parseScalaFile(contents);
        if (intervals.length > 0) {
            // Rotate intervals so the last one is at the top
            const adjustedIntervals = rotateIntervalsToTop(intervals);
            updateIntervalsWithScala(adjustedIntervals);

            // Save the file contents to localStorage for client-side persistence
            saveScalaDataToLocalStorage(contents);
        } else {
            alert("The Scala file did not contain valid intervals.");
        }
    };
    reader.readAsText(file);
}

// Function to save Scala file contents to localStorage
function saveScalaDataToLocalStorage(contents) {
    localStorage.setItem('scalaFileData', contents);
}

// Function to load Scala file contents from localStorage if available
function loadScalaDataFromLocalStorage() {
    const storedContents = localStorage.getItem('scalaFileData');
    if (storedContents) {
        const intervals = parseScalaFile(storedContents);
        if (intervals.length > 0) {
            const adjustedIntervals = rotateIntervalsToTop(intervals);
            updateIntervalsWithScala(adjustedIntervals);
        }
    }
}

// Parse Scala (.scl) file contents
function parseScalaFile(contents) {
    const lines = contents.split('\n');
    const intervals = [];

    let isValidScalaFile = false;

    lines.forEach((line) => {
        line = line.trim();
        
        // Skip comments and empty lines
        if (line.startsWith("!") || line === "") return;

        // Check for valid Scala file by recognizing the format line
        if (line.match(/^\d+\s*$/)) {
            isValidScalaFile = true;
            return;
        }

        // Parse each line for frequency ratios or cent values
        if (isValidScalaFile) {
            const ratioMatch = line.match(/^(\d+)\/(\d+)$/);
            const centsMatch = line.match(/^(\d+(\.\d+)?)$/);

            if (ratioMatch) {
                // Convert ratio to decimal
                const numerator = parseFloat(ratioMatch[1]);
                const denominator = parseFloat(ratioMatch[2]);
                const ratio = numerator / denominator;
                intervals.push({ ratio, label: `${numerator}/${denominator}` });
            } else if (centsMatch) {
                // Parse cents value
                const cents = parseFloat(centsMatch[1]);
                const ratio = Math.pow(2, cents / 1200);
                intervals.push({ ratio, label: `${cents.toFixed(2)} cents` });
            }
        }
    });

    return intervals;
}

// Rotate intervals to place the last interval at the top
function rotateIntervalsToTop(intervals) {
    if (intervals.length === 0) return intervals;
    const lastInterval = intervals.pop(); // Remove the last interval
    return [lastInterval, ...intervals]; // Place it at the beginning
}

// Pass Scala intervals to main app
function updateIntervalsWithScala(intervals) {
    if (typeof setIntervalsFromScala === 'function') {
        setIntervalsFromScala(intervals);
    } else {
        console.error("Function to set intervals from Scala file not found in app.js");
    }
}

// Load Scala data from localStorage when the page loads
document.addEventListener('DOMContentLoaded', loadScalaDataFromLocalStorage);
