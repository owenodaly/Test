document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('boldSignalChart').getContext('2d');
    const cutoffFrequencySlider = document.getElementById('cutoffFrequency');
    
    let originalData = generateData(); // Simulate original BOLD time series
    let filteredData = applyHighPassFilter(originalData, cutoffFrequencySlider.value);

    // Initialize chart
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: originalData.length}, (_, i) => i),
            datasets: [{
                label: 'Original',
                data: originalData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }, {
                label: 'Filtered',
                data: filteredData,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {}
    });

    // Update chart on slider change
cutoffFrequencySlider.oninput = function() {
    let currentValue = parseFloat(this.value);
    document.getElementById('cutoffValue').textContent = currentValue.toFixed(2); // Update the cutoff value display
    let newFilteredData = applyHighPassFilter(originalData, currentValue);
    chart.data.datasets[1].data = newFilteredData;
    chart.update();
};


    function generateData() {
        // Simulate BOLD time series data with noise
        const dataLength = 300; // Length of the data
        const data = [];
        for (let i = 0; i < dataLength; i++) {
            const signal = Math.sin(i / 10); // Simple sine wave
            const noise = Math.random() * 0.5 - 0.25; // Random noise
            data.push(signal + noise);
        }
        return data;
    }

    function applyHighPassFilter(data, cutoff) {
        // Simplified high pass filter implementation
        // For demonstration purposes only
        const filteredData = [];
        const rc = 1.0 / (cutoff * 2 * Math.PI);
        const dt = 1; // Assuming uniform time step
        const alpha = rc / (rc + dt);
        let previous = data[0];
        for (let i = 0; i < data.length; i++) {
            filteredData[i] = alpha * (filteredData[i - 1] || 0) + alpha * (data[i] - previous);
            previous = data[i];
        }
        return filteredData;
    }
});
