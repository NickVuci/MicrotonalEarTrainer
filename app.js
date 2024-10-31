// app.js

// Immediately Invoked Function Expression (IIFE) to avoid polluting the global namespace
(() => {
    // --------------------------
    // Module: IntervalGenerator
    // --------------------------
    const IntervalGenerator = (() => {
        const getPrimesUpTo = (limit) => {
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
        };

        const getPrimeFactors = (n) => {
            const factors = {};
            let divisor = 2;
            while (n >= 2) {
                if (n % divisor === 0) {
                    factors[divisor] = (factors[divisor] || 0) + 1;
                    n /= divisor;
                } else {
                    divisor++;
                }
            }
            return factors;
        };

        const simplifyFraction = (numerator, denominator) => {
            const gcdValue = gcd(numerator, denominator);
            return {
                numerator: numerator / gcdValue,
                denominator: denominator / gcdValue
            };
        };

        const gcd = (a, b) => {
            return b === 0 ? a : gcd(b, a % b);
        };

        const isValidJIInterval = (numerator, denominator, primes) => {
            const factorsNum = getPrimeFactors(numerator);
            const factorsDen = getPrimeFactors(denominator);
            for (let factor in factorsNum) {
                if (!primes.includes(parseInt(factor))) return false;
            }
            for (let factor in factorsDen) {
                if (!primes.includes(parseInt(factor))) return false;
            }
            return true;
        };

        const generateEDOIntervals = (edo) => {
            const intervals = [];
            // Add the octave interval
            intervals.push({
                label: `${edo}\\${edo}`,
                ratio: 2,
                index: 0
            });
            // Add other intervals
            for (let i = 1; i < edo; i++) {
                intervals.push({
                    label: `${i}\\${edo}`,
                    ratio: Math.pow(2, i / edo),
                    index: i
                });
            }
            return intervals;
        };

        const generateJIIntervals = (primeLimit, oddLimit) => {
            const intervals = [];
            // Add the octave interval
            intervals.push({
                label: '2/1',
                ratio: 2,
                cents: 1200 * Math.log2(2) // 1200 cents
            });

            const primes = getPrimesUpTo(primeLimit);
            const fractions = [];

            for (let numerator = 2; numerator <= oddLimit * 2; numerator++) { // Ensure numerator > denominator
                for (let denominator = 1; denominator < numerator; denominator++) { // numerator > denominator
                    const ratioValue = numerator / denominator;
                    if (ratioValue > 2) continue; // Only within an octave

                    const simplified = simplifyFraction(numerator, denominator);
                    if (simplified.numerator <= simplified.denominator) continue; // Ensure numerator > denominator after simplification

                    // Skip if the simplified fraction is the octave (2/1) to prevent duplication
                    if (simplified.numerator === 2 && simplified.denominator === 1) continue;

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

            return intervals.concat(uniqueFractions);
        };

        return {
            generateIntervals: (tuning, params) => {
                if (tuning === 'edo') {
                    return generateEDOIntervals(params.edo);
                } else if (tuning === 'ji') {
                    return generateJIIntervals(params.primeLimit, params.oddLimit);
                }
                return [];
            }
        };
    })();

    // --------------------------
    // Module: AudioPlayer
    // --------------------------
    const AudioPlayer = (() => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const playTogether = (baseFrequency, intervalFrequency, duration = 1.5) => {
            const oscillator1 = audioCtx.createOscillator();
            const gainNode1 = audioCtx.createGain();
            const oscillator2 = audioCtx.createOscillator();
            const gainNode2 = audioCtx.createGain();

            // Configure Oscillator 1 (Root Note)
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(baseFrequency, audioCtx.currentTime);
            gainNode1.gain.setValueAtTime(0.1, audioCtx.currentTime);

            // Configure Oscillator 2 (Interval Note)
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(intervalFrequency, audioCtx.currentTime);
            gainNode2.gain.setValueAtTime(0.1, audioCtx.currentTime);

            // Connect Oscillators to Gain Nodes and then to Destination
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioCtx.destination);
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioCtx.destination);

            // Start Oscillators
            oscillator1.start();
            oscillator2.start();

            // Stop Oscillators after duration
            setTimeout(() => {
                oscillator1.stop();
                oscillator2.stop();
            }, duration * 1000);
        };

        const playAscending = (baseFrequency, intervalFrequency, duration = 1.5) => {
            const oscillator1 = audioCtx.createOscillator();
            const gainNode1 = audioCtx.createGain();
            const oscillator2 = audioCtx.createOscillator();
            const gainNode2 = audioCtx.createGain();

            // Configure Oscillator 1 (Root Note)
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(baseFrequency, audioCtx.currentTime);
            gainNode1.gain.setValueAtTime(0.1, audioCtx.currentTime);

            // Configure Oscillator 2 (Interval Note)
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(intervalFrequency, audioCtx.currentTime);
            gainNode2.gain.setValueAtTime(0.1, audioCtx.currentTime);

            // Connect Oscillators to Gain Nodes and then to Destination
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioCtx.destination);
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioCtx.destination);

            // Start Oscillator 1
            oscillator1.start();
            // Stop Oscillator 1 after half the duration
            oscillator1.stop(audioCtx.currentTime + duration / 2);

            // Start Oscillator 2 after half the duration
            oscillator2.start(audioCtx.currentTime + duration / 2);
            oscillator2.stop(audioCtx.currentTime + duration);

            // Ensure oscillators are stopped
            setTimeout(() => {
                oscillator1.stop();
                oscillator2.stop();
            }, duration * 1000);
        };

        const playDescending = (baseFrequency, intervalFrequency, duration = 1.5) => {
            const oscillator1 = audioCtx.createOscillator();
            const gainNode1 = audioCtx.createGain();
            const oscillator2 = audioCtx.createOscillator();
            const gainNode2 = audioCtx.createGain();

            // Configure Oscillator 1 (Root Note)
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(baseFrequency, audioCtx.currentTime);
            gainNode1.gain.setValueAtTime(0.1, audioCtx.currentTime);

            // Configure Oscillator 2 (Interval Note)
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(intervalFrequency, audioCtx.currentTime);
            gainNode2.gain.setValueAtTime(0.1, audioCtx.currentTime);

            // Connect Oscillators to Gain Nodes and then to Destination
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioCtx.destination);
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioCtx.destination);

            // Start Oscillator 2 first
            oscillator2.start();
            // Stop Oscillator 2 after half the duration
            oscillator2.stop(audioCtx.currentTime + duration / 2);

            // Start Oscillator 1 after half the duration
            oscillator1.start(audioCtx.currentTime + duration / 2);
            oscillator1.stop(audioCtx.currentTime + duration);

            // Ensure oscillators are stopped
            setTimeout(() => {
                oscillator1.stop();
                oscillator2.stop();
            }, duration * 1000);
        };

        const playInterval = (ratio, method, baseFrequency = 440, duration = 1.5) => {
            const intervalFrequency = baseFrequency * ratio;

            switch (method) {
                case 'together':
                    playTogether(baseFrequency, intervalFrequency, duration);
                    break;
                case 'ascending':
                    playAscending(baseFrequency, intervalFrequency, duration);
                    break;
                case 'descending':
                    playDescending(baseFrequency, intervalFrequency, duration);
                    break;
                default:
                    playTogether(baseFrequency, intervalFrequency, duration);
            }
        };

        return {
            playInterval
        };
    })();

    // --------------------------
    // Module: UIController
    // --------------------------
    const UIController = (() => {
        const settings = {
            tuning: 'edo',
            edo: 12,
            primeLimit: 5,
            oddLimit: 11
        };

        let intervals = [];
        let correctInterval = null;

        // Cache DOM elements
        const cacheDOM = () => {
            return {
                tuningRadios: document.querySelectorAll('input[name="tuning"]'),
                edoSettings: document.getElementById('edoSettings'),
                jiSettings: document.getElementById('jiSettings'),
                edoValueInput: document.getElementById('edoValue'),
                primeLimitInput: document.getElementById('primeLimit'),
                oddLimitInput: document.getElementById('oddLimit'),
                generateButton: document.getElementById('generateButton'),
                playbackOptions: {
                    together: document.getElementById('playTogether'),
                    ascending: document.getElementById('playAscending'),
                    descending: document.getElementById('playDescending')
                },
                container: document.getElementById('container'),
                playButton: document.getElementById('playButton'),
                feedback: document.getElementById('feedback'),
                correctInterval: document.getElementById('correctInterval')
            };
        };

        const dom = cacheDOM();

        // Bind events
        const bindEvents = () => {
            // Tuning selection
            dom.tuningRadios.forEach(radio => {
                radio.addEventListener('change', handleTuningChange);
            });

            // Generate intervals
            dom.generateButton.addEventListener('click', handleGenerateIntervals);

            // Play button
            dom.playButton.addEventListener('click', handlePlayInterval);
        };

        // Handle tuning system change
        const handleTuningChange = (event) => {
            const tuning = event.target.value;
            settings.tuning = tuning;

            if (tuning === 'edo') {
                dom.edoSettings.style.display = 'block';
                dom.jiSettings.style.display = 'none';
            } else if (tuning === 'ji') {
                dom.edoSettings.style.display = 'none';
                dom.jiSettings.style.display = 'block';
            }
        };

        // Handle interval generation
        const handleGenerateIntervals = () => {
            // Update settings based on user input
            settings.edo = parseInt(dom.edoValueInput.value) || 12;
            settings.primeLimit = parseInt(dom.primeLimitInput.value) || 5;
            settings.oddLimit = parseInt(dom.oddLimitInput.value) || 11;

            // Generate intervals using IntervalGenerator module
            intervals = IntervalGenerator.generateIntervals(settings.tuning, {
                edo: settings.edo,
                primeLimit: settings.primeLimit,
                oddLimit: settings.oddLimit
            });

            // Display intervals on the UI
            displayIntervals();
        };

        // Display intervals around the circle
        const displayIntervals = () => {
            // Clear existing interval points
            const existingPoints = dom.container.querySelectorAll('.interval-point');
            existingPoints.forEach(point => point.remove());

            const centerX = dom.container.offsetWidth / 2;
            const centerY = dom.container.offsetHeight / 2;
            const radius = dom.container.offsetWidth / 2 - 60;

            const totalIntervals = intervals.length;
            intervals.forEach((interval, index) => {
                const angle = (index / totalIntervals) * 2 * Math.PI - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                const point = document.createElement('div');
                point.className = 'interval-point';
                point.style.left = `${x}px`;
                point.style.top = `${y}px`;
                point.textContent = interval.label;
                point.dataset.index = index;
                point.addEventListener('click', handleIntervalClick);
                dom.container.appendChild(point);
            });
        };

        // Handle play interval
        const handlePlayInterval = () => {
            if (intervals.length === 0) {
                alert('Please generate intervals first.');
                return;
            }

            // Retrieve playback options
            const playbackMethods = [];
            if (dom.playbackOptions.together.checked) playbackMethods.push('together');
            if (dom.playbackOptions.ascending.checked) playbackMethods.push('ascending');
            if (dom.playbackOptions.descending.checked) playbackMethods.push('descending');

            // If no options are selected, default to 'together'
            if (playbackMethods.length === 0) playbackMethods.push('together');

            // Select a random interval (including the octave)
            const randomIndex = Math.floor(Math.random() * intervals.length);
            correctInterval = intervals[randomIndex];

            // Randomly select a playback method from the selected options
            const selectedMethod = playbackMethods[Math.floor(Math.random() * playbackMethods.length)];

            // Play the interval using AudioPlayer module
            AudioPlayer.playInterval(correctInterval.ratio, selectedMethod);

            // Clear previous feedback
            dom.feedback.textContent = '';
            dom.correctInterval.textContent = '';

            // Reset interval point colors
            resetIntervalPoints();
        };

        // Handle interval point click
        const handleIntervalClick = (event) => {
            const selectedIndex = parseInt(event.currentTarget.dataset.index);
            const selectedInterval = intervals[selectedIndex];

            if (correctInterval && selectedInterval.label === correctInterval.label) {
                event.currentTarget.style.backgroundColor = 'green';
                dom.feedback.textContent = '🎉 Correct!';
            } else {
                event.currentTarget.style.backgroundColor = 'red';
                dom.feedback.textContent = '❌ Incorrect.';
                // Highlight the correct interval
                const correctIndex = intervals.findIndex(interval => interval.label === correctInterval.label);
                if (correctIndex !== -1) {
                    const correctPoint = dom.container.querySelector(`.interval-point[data-index='${correctIndex}']`);
                    if (correctPoint) {
                        correctPoint.style.backgroundColor = 'green';
                    }
                }
                dom.correctInterval.textContent = `The correct interval was ${correctInterval.label}`;
            }
        };

        // Reset interval points to default color
        const resetIntervalPoints = () => {
            const points = dom.container.querySelectorAll('.interval-point');
            points.forEach(point => {
                point.style.backgroundColor = '#f0f0f0';
            });
        };

        // Initialize the UIController
        const init = () => {
            bindEvents();
        };

        return {
            init
        };
    })();

    // Initialize the app once the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        UIController.init();
    });
})();
