document.addEventListener('DOMContentLoaded', function() {
    const interceptSlider = document.getElementById('intercept');
    const amplitudeSlider = document.getElementById('amplitude');
    const interceptValueDisplay = document.getElementById('interceptValue');
    const amplitudeValueDisplay = document.getElementById('amplitudeValue');
    const mseValueDisplay = document.getElementById('mseValue');
    const canvas = document.getElementById('BoldPlot');
    const ctx = canvas.getContext('2d');

    let myChart;
    let scaleFactor = 1000000000;
    const design = generateDesign(300, 30); // 300s total, 30s on/off
    const hrfSignal = convolveWithHRF(design);
    let convolvedAdjustedSignal = hrfSignal.map(v => v);
    let noisySignal = addNoise(convolvedAdjustedSignal, 5, 20); // Add noise with amplitude of 0.5

    function generateDesign(totalDuration, onDuration) {
        let signal = new Array(totalDuration).fill(0);
        for (let i = onDuration; i < signal.length; i += 60) {
            signal.fill(1, i, i + onDuration);
        }
        return signal;
    }

    function hrf(t) {
        const n1 = 5, lamda1 = 1, n2 = 15, lamda2 = 1, c = 0.1;
        return ((Math.pow(t / lamda1, n1) * Math.exp(-t / lamda1)) - c * (Math.pow(t / lamda2, n2) * Math.exp(-t / lamda2))) / Math.exp(1);
    }

    function convolveWithHRF(signal) {
        const result = new Array(signal.length).fill(0);
        for (let t = 0; t < signal.length; t++) {
            for (let h = 0; h <= t; h++) {
                if (t - h < 35) { // HRF duration
                    result[t] += (signal[h] * hrf(t - h)*-1)/scaleFactor;
                }
            }
        }
        return result;
    }

function addNoise(signal, amplitude, interceptVal) {
    return signal.map(s => s + (Math.random() - 0.5) * amplitude + interceptVal);
}

function updatePlots() {
    const intercept = parseFloat(interceptSlider.value);
    const amplitude = parseFloat(amplitudeSlider.value);

    interceptValueDisplay.textContent = intercept;
    amplitudeValueDisplay.textContent = amplitude;

    const adjustedSignal = convolvedAdjustedSignal.map(v => v * amplitude + intercept);
    const residuals = noisySignal.map((value, index) => value - adjustedSignal[index]);

    const mse = calculateMSE(noisySignal, adjustedSignal);
    mseValueDisplay.textContent = mse.toFixed(4);

    updateBoldPlot(ctx,noisySignal, adjustedSignal);
    updateResidualsPlot(residuals);
}

function updateBoldPlot(ctx, noisySignal, adjustedSignal) { // Assuming ctx is passed here
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 300 }, (_, i) => i + 1),
            datasets: [{
                label: 'Noisy BOLD',
                data: noisySignal, // Renamed for consistency
                borderColor: 'rgb(255, 99, 132)',
                fill: false,
            }, {
                label: 'Adjusted BOLD',
                data: adjustedSignal, // Renamed for consistency
                borderColor: 'rgb(54, 162, 235)',
                fill: false,
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    beginAtZero: false,
                    min: -40,
                    max: 90,
                    title: {
                        display: true,
                        text: 'BOLD signal'
                    }
                }
            }
        }
    });
}

function updateResidualsPlot(residuals) {
    // Utilize 'residualsPlot' canvas
    const ctx = document.getElementById('residualsPlot').getContext('2d');
    if (window.residualsChart) {
        window.residualsChart.destroy(); // Ensure we're starting fresh if this isn't the first call
    }
    window.residualsChart = new Chart(ctx, {
        type: 'bar', // Or 'line', depending on your preference for displaying residuals
        data: {
            labels: Array.from({length: residuals.length}, (_, i) => i + 1),
            datasets: [{
                label: 'Residuals',
                data: residuals,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Residuals'
                    }
                }
            }
        }
    });
}

    function calculateMSE(noisy, adjusted) {
        return noisy.reduce((sum, current, i) => sum + Math.pow(current - adjusted[i], 2), 0) / noisy.length;
    }

    interceptSlider.addEventListener('input', updatePlots);
    amplitudeSlider.addEventListener('input', updatePlots);

    updatePlots(); // Initial plot
})
