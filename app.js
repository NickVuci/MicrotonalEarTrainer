// app.js

// Initialize Audio Context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let intervals = [];
let correctInterval = null;
let showCents = false; // Toggle to switch between n\edo and cents labels

// Function to update intervals with Scala data
function setIntervalsFromScala(scalaIntervals) {
    intervals = scalaIntervals;
    displayIntervals(); // Update the displayed intervals
}

// Playback Control Variables
let isPlaying = false; // Flag to track playback state
let currentOscillators = []; // Array to store current oscillators
let playbackTimeout = null; // Reference to the playback timeout

// Guess Control Variable
let hasGuessed = false; // Flag to track if the user has made a guess

// Default base frequency
let baseFrequency = 440.0; // A4

// Debounce Function to Limit the Rate of Function Calls
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

// Event listeners for tuning selection
document.querySelectorAll('input[name="tuning"]').forEach((elem) => {
    elem.addEventListener('change', debounce(() => {
        if (elem.value === 'edo') {
            document.getElementById('edoSettings').style.display = 'block';
            document.getElementById('jiSettings').style.display = 'none';
        } else {
            document.getElementById('edoSettings').style.display = 'none';
            document.getElementById('jiSettings').style.display = 'block';
        }
        generateIntervals();
        displayIntervals();
    }, 300));
});

// Event listener for EDO Value Change
document.getElementById('edoValue').addEventListener('input', debounce(() => {
    const edoValueInput = document.getElementById('edoValue').value;

    // Allow empty input without an error
    if (edoValueInput === '') {
        // Do nothing to allow user to delete all numbers
        return;
    }

    const edoValue = parseInt(edoValueInput);
    if (edoValue < 1 || isNaN(edoValue)) {
        alert('Please enter a valid EDO value (minimum 1).');
        // Reset to default if invalid
        document.getElementById('edoValue').value = '12';
        baseFrequency = 440.0;
    } else {
        // Update baseFrequency is already handled via existing event listener
        generateIntervals();
        displayIntervals();
    }
}, 300));

// Event listener for JI Prime Limit Change
document.getElementById('primeLimit').addEventListener('input', debounce(() => {
    const primeLimit = parseInt(document.getElementById('primeLimit').value);
    if (primeLimit < 2 || isNaN(primeLimit)) {
        alert('Please enter a valid Prime Limit (minimum 2).');
        // Reset to default if invalid
        document.getElementById('primeLimit').value = '5';
    } else {
        generateIntervals();
        displayIntervals();
    }
}, 300));

// Event listener for JI Odd Limit Change
document.getElementById('oddLimit').addEventListener('input', debounce(() => {
    const oddLimit = parseInt(document.getElementById('oddLimit').value);
    if (oddLimit < 3 || isNaN(oddLimit)) {
        alert('Please enter a valid Odd Limit (minimum 3).');
        // Reset to default if invalid
        document.getElementById('oddLimit').value = '15';
    } else {
        generateIntervals();
        displayIntervals();
    }
}, 300));

// Event listener for waveform selection change
document.getElementById('waveformSelect').addEventListener('change', () => {
    // No need to regenerate intervals, playback will use the new waveform
    // Optional: Provide visual feedback if necessary
});

// Event listener for root frequency input
document.getElementById('baseFrequencyInput').addEventListener('change', () => {
    const input = parseFloat(document.getElementById('baseFrequencyInput').value);
    if (isNaN(input) || input < 20 || input > 20000) {
        alert('Please enter a valid frequency between 20 Hz and 20,000 Hz.');
        // Reset to default if invalid
        baseFrequency = 440.0;
        document.getElementById('baseFrequencyInput').value = baseFrequency.toFixed(1);
    } else {
        baseFrequency = input;
    }
});

// Event listener for label toggle
document.getElementById('labelToggle').addEventListener('change', () => {
    showCents = document.getElementById('labelToggle').checked;
    displayIntervals();
});

// Function to generate intervals based on current settings
function generateIntervals() {
    const tuning = document.querySelector('input[name="tuning"]:checked').value;
    intervals = [];
    if (tuning === 'edo') {
        const edoValue = parseInt(document.getElementById('edoValue').value);
        if (edoValue < 1 || isNaN(edoValue)) {
            alert('Please enter a valid EDO value.');
            return;
        }
        generateEDOIntervals(edoValue);
    } else {
        const primeLimit = parseInt(document.getElementById('primeLimit').value);
        const oddLimit = parseInt(document.getElementById('oddLimit').value);
        if (primeLimit < 2 || oddLimit < 3 || isNaN(primeLimit) || isNaN(oddLimit)) {
            alert('Please enter valid prime and odd limits.');
            return;
        }
        generateJIIntervals(primeLimit, oddLimit);
    }
    // No need to call displayIntervals() here as it's called in the event listeners
}

// Function to generate EDO intervals with dynamic octave labeling
function generateEDOIntervals(edo) {
    // Add the octave interval with "n\edo" notation
    intervals.push({
        label: `${edo}\\${edo}`, // e.g., "12\12" for 12-EDO
        ratio: 2,
        cents: 1200, // 2/1 is always 1200 cents
        index: 0
    });
    // Add other EDO intervals with "n\edo" notation
    for (let i = 1; i < edo; i++) {
        const ratio = Math.pow(2, i / edo);
        const cents = 1200 * i / edo;
        intervals.push({
            label: `${i}\\${edo}`, // e.g., "1\12", "2\12", etc.
            ratio: ratio,
            cents: cents,
            index: i
        });
    }
}

// Function to calculate the odd limit of a number
function getOddLimit(number) {
    while (number % 2 === 0) {
        number /= 2;
    }
    return number;
}

function generateJIIntervals(primeLimit, oddLimit) {
    // Add the octave interval
    intervals.push({
        label: '2/1',
        ratio: 2,
        cents: 1200 // 2/1 is always 1200 cents
    });

    const primes = getPrimesUpTo(primeLimit);
    const fractions = [];

    for (let numerator = 2; numerator <= oddLimit * 2; numerator++) {
        for (let denominator = 1; denominator < numerator; denominator++) {
            const ratioValue = numerator / denominator;
            if (ratioValue > 2) continue; // Only within an octave

            const simplified = simplifyFraction(numerator, denominator);
            if (simplified.numerator <= simplified.denominator) continue; // Ensure numerator > denominator after simplification

            // Skip if the simplified fraction is the octave (2/1) to prevent duplication
            if (simplified.numerator === 2 && simplified.denominator === 1) continue;

            // Calculate the odd limit according to the given definition
            const oddLimitNumerator = getOddLimit(simplified.numerator);
            const oddLimitDenominator = getOddLimit(simplified.denominator);
            const actualOddLimit = Math.max(oddLimitNumerator, oddLimitDenominator);

            if (actualOddLimit > oddLimit) continue; // Skip if it exceeds the defined odd limit

            if (isValidJIInterval(simplified.numerator, simplified.denominator, primes)) {
                const ratio = simplified.numerator / simplified.denominator;
                const cents = 1200 * Math.log2(ratio);
                fractions.push({
                    label: `${simplified.numerator}/${simplified.denominator}`,
                    ratio: ratio,
                    cents: cents
                });
            }
        }
    }

    // Remove duplicates based on ratio
    const uniqueFractions = [];
    const seenRatios = new Set();
    fractions.forEach(fraction => {
        if (!seenRatios.has(fraction.ratio.toFixed(5))) {
            uniqueFractions.push(fraction);
            seenRatios.add(fraction.ratio.toFixed(5));
        }
    });

    // Sort by cents
    uniqueFractions.sort((a, b) => a.cents - b.cents);

    intervals = intervals.concat(uniqueFractions);
}

// Function to check if a JI interval is valid based on prime factors
function isValidJIInterval(numerator, denominator, primes) {
    const factorsNum = getPrimeFactors(numerator);
    const factorsDen = getPrimeFactors(denominator);
    for (let factor in factorsNum) {
        if (!primes.includes(parseInt(factor))) return false;
    }
    for (let factor in factorsDen) {
        if (!primes.includes(parseInt(factor))) return false;
    }
    return true;
}

// Function to get prime numbers up to a limit
function getPrimesUpTo(limit) {
    const sieve = [];
    const primes = [];
    for (let i = 2; i <= limit; i++) {
        if (!sieve[i]) {
            primes.push(i);
            for (let j = i * 2; j <= limit; j += i) {
                sieve[j] = true;
            }
        }
    }
    return primes;
}

// Function to get prime factors of a number
function getPrimeFactors(n) {
    const factors = {};
    let divisor = 2;
    while (n >= 2) {
        if (n % divisor === 0) {
            factors[divisor] = (factors[divisor] || 0) + 1;
            n = n / divisor;
        } else {
            divisor++;
        }
    }
    return factors;
}

// Function to simplify a fraction
function simplifyFraction(numerator, denominator) {
    const gcdValue = gcd(numerator, denominator);
    return {
        numerator: numerator / gcdValue,
        denominator: denominator / gcdValue
    };
}

// Function to compute the Greatest Common Divisor (GCD)
function gcd(a, b) {
    if (!b) return a;
    return gcd(b, a % b);
}

// Function to display intervals around the circle with minimal touch between circles
function displayIntervals() {
    const container = document.getElementById('container');
    // Remove existing interval points
    const oldPoints = document.querySelectorAll('.interval-point');
    oldPoints.forEach(point => point.remove());

    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;  
    const totalIntervals = intervals.length;

    // Calculate the radius of the container circle
    const containerRadius = container.offsetWidth / 2;

    // Calculate the diameter of each interval circle so they almost touch each other
    const angleBetweenCircles = (2 * Math.PI) / totalIntervals;
    const circleDiameter = Math.min(
        containerRadius * Math.sin(angleBetweenCircles / 2) * 1.8, // Reduce slightly to add a small gap
        80 // Optional: Limit maximum diameter to 80px for readability
    );

    // Adjust radius so that circles are positioned near the edge of the container
    const radius = containerRadius - circleDiameter / 2;

    // Start from the angle that places the last interval at the top (90 degrees or -π/2 radians)
    const startAngle = -Math.PI / 2;

    intervals.forEach((interval, index) => {
        // Calculate the angle for positioning each interval point
        const angle = (index / totalIntervals) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const point = document.createElement('div');
        point.className = 'interval-point';
        point.style.left = `${x}px`;
        point.style.top = `${y}px`;
        point.textContent = showCents ? `${interval.cents.toFixed(2)}` : interval.label;
        point.dataset.index = index;
        
        // Differentiate EDO and JI intervals based on label format
        if (interval.label.includes('\\')) {
            point.classList.add('edo-interval');
        } else {
            point.classList.add('ji-interval');
        }

        // Set slightly reduced diameter to create a small gap
        point.style.width = `${circleDiameter}px`;
        point.style.height = `${circleDiameter}px`;
        point.style.marginLeft = `-${circleDiameter / 2}px`; // Center horizontally
        point.style.marginTop = `-${circleDiameter / 2}px`;  // Center vertically

        // Adjust font size based on circle size for readability
        const fontSize = Math.min(16, circleDiameter / 5);
        point.style.fontSize = `${fontSize}px`;

        point.addEventListener('click', handleIntervalClick);
        container.appendChild(point);
    });
}

// Play Button Event
document.getElementById('playButton').addEventListener('click', () => {
    if (intervals.length === 0) {
        alert('Please generate intervals first.');
        return;
    }

    // Prevent initiating a new playback if one is already in progress
    if (isPlaying) {
        alert('Playback is already in progress. Please wait until it finishes.');
        return;
    }

    // Disable the Play button
    const playButton = document.getElementById('playButton');
    playButton.disabled = true;

    // Retrieve playback options
    const playTogether = document.getElementById('playTogether').checked;
    const playAscending = document.getElementById('playAscending').checked;
    const playDescending = document.getElementById('playDescending').checked;

    // Collect selected playback methods
    const playbackMethods = [];
    if (playTogether) playbackMethods.push('together');
    if (playAscending) playbackMethods.push('ascending');
    if (playDescending) playbackMethods.push('descending');

    // If no options are selected, default to 'together'
    if (playbackMethods.length === 0) playbackMethods.push('together');

    // Select a random playback method from the selected options
    const selectedMethod = playbackMethods[Math.floor(Math.random() * playbackMethods.length)];

    // Select a random interval (including the octave)
    const randomIndex = Math.floor(Math.random() * intervals.length);
    correctInterval = intervals[randomIndex];

    // Reset guess state
    hasGuessed = false;
    // Enable interval points (ensure they are clickable)
    enableIntervalPoints();

    // Start playback
    playInterval(correctInterval.ratio, selectedMethod);
    document.getElementById('feedback').textContent = '';
    document.getElementById('correctInterval').textContent = '';
    resetIntervalPoints();
});

// Function to play the selected interval based on the chosen method
function playInterval(ratio, method) {
    const duration = 1.5;
    const frequency = baseFrequency * ratio;

    // Retrieve the selected waveform from waveform.js
    const waveform = getSelectedWaveform(); // Function from waveform.js

    // Create Oscillators and Gain Nodes
    const oscillator1 = audioCtx.createOscillator();
    const gainNode1 = audioCtx.createGain();
    const oscillator2 = audioCtx.createOscillator();
    const gainNode2 = audioCtx.createGain();

    // Configure Oscillator 1 (Root Note)
    oscillator1.type = waveform; // Set waveform type
    oscillator1.frequency.setValueAtTime(baseFrequency, audioCtx.currentTime);
    gainNode1.gain.setValueAtTime(0.1, audioCtx.currentTime);

    // Configure Oscillator 2 (Interval Note)
    oscillator2.type = waveform; // Set waveform type
    oscillator2.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode2.gain.setValueAtTime(0.1, audioCtx.currentTime);

    // Connect Oscillators to Gain Nodes and then to Destination
    oscillator1.connect(gainNode1);
    gainNode1.connect(audioCtx.destination);
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioCtx.destination);

    if (method === 'together') {
        // Play both notes simultaneously
        oscillator1.start();
        oscillator2.start();
    } else if (method === 'ascending') {
        // Play root first, then interval
        oscillator1.start();
        oscillator1.stop(audioCtx.currentTime + duration / 2);
        oscillator2.start(audioCtx.currentTime + duration / 2);
        oscillator2.stop(audioCtx.currentTime + duration);
    } else if (method === 'descending') {
        // Play interval first, then root
        oscillator2.start();
        oscillator2.stop(audioCtx.currentTime + duration / 2);
        oscillator1.start(audioCtx.currentTime + duration / 2);
        oscillator1.stop(audioCtx.currentTime + duration);
    }

    // Store oscillators for potential future control
    currentOscillators.push(oscillator1, oscillator2);

    // Update playback state
    isPlaying = true;

    // Schedule stopping the oscillators after the duration
    playbackTimeout = setTimeout(() => {
        oscillator1.stop();
        oscillator2.stop();
        isPlaying = false;
        currentOscillators = [];
        // Re-enable the Play button
        const playButton = document.getElementById('playButton');
        playButton.disabled = false;
    }, duration * 1000);
}

// Handle Interval Clicks
function handleIntervalClick(event) {
    // If the user has already guessed, ignore further clicks
    if (hasGuessed) {
        return;
    }

    hasGuessed = true; // Set the guess flag

    const selectedIndex = parseInt(event.currentTarget.dataset.index);
    const selectedInterval = intervals[selectedIndex];

    if (correctInterval && selectedInterval.label === correctInterval.label) {
        event.currentTarget.style.backgroundColor = 'green';
        document.getElementById('feedback').textContent = '🎉 Correct!';
        // Display cent value and name of the correct interval
        document.getElementById('correctInterval').textContent = `${correctInterval.label} (${correctInterval.cents.toFixed(2)} cents)`;
        // Increment correct score
        if (typeof incrementCorrect === 'function') {
            incrementCorrect();
        }
    } else {
        event.currentTarget.style.backgroundColor = 'red';
        document.getElementById('feedback').textContent = '❌ Incorrect.';
        // Highlight the correct interval
        const correctIndex = intervals.findIndex(interval => interval.label === correctInterval.label);
        if (correctIndex !== -1) {
            const correctPoint = document.querySelector(`.interval-point[data-index='${correctIndex}']`);
            correctPoint.style.backgroundColor = 'green';
        }
        // Display cent value and name of the correct interval
        document.getElementById('correctInterval').textContent = `${correctInterval.label} (${correctInterval.cents.toFixed(2)} cents)`;
        // Increment incorrect score
        if (typeof incrementIncorrect === 'function') {
            incrementIncorrect();
        }
    }

    // Disable further guesses by disabling all interval points
    disableIntervalPoints();
}

// Function to disable interval points (prevent further clicks)
function disableIntervalPoints() {
    const points = document.querySelectorAll('.interval-point');
    points.forEach(point => {
        point.style.pointerEvents = 'none'; // Disable pointer events
        point.style.opacity = '0.6'; // Optional: reduce opacity to indicate disabled state
    });
}

// Function to enable interval points (allow clicks)
function enableIntervalPoints() {
    const points = document.querySelectorAll('.interval-point');
    points.forEach(point => {
        point.style.pointerEvents = 'auto'; // Enable pointer events
        point.style.opacity = '1'; // Restore opacity
    });
}

// Reset Interval Points to Default Color
function resetIntervalPoints() {
    const points = document.querySelectorAll('.interval-point');
    points.forEach(point => {
        point.style.backgroundColor = '#f0f0f0';
    });
}

// Event listener for Reset Score button
document.getElementById('resetScoreButton').addEventListener('click', () => {
    if (typeof resetScores === 'function') {
        resetScores();
    }
});