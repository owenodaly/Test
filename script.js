// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mseValue = document.getElementById('mseValue');

let shapesVisible = true; // New state to track visibility

// Randomize target shape's initial position and orientation
let targetShape = {
    x: Math.random() * 200 - 100, // Random x between -100 and 100
    y: Math.random() * 200 - 100, // Random y between -100 and 100
    rotation: Math.random() * 360 // Random rotation between 0 and 360 degrees
};

let playerShape = { x: 0, y: 0, rotation: 0 };

function drawShape(shape, color) {
    if (shapesVisible) {
        ctx.fillStyle = color;
        ctx.save();
        ctx.translate(shape.x + canvas.width / 2, shape.y + canvas.height / 2);
        ctx.rotate(shape.rotation * Math.PI / 180);
        ctx.fillRect(-25, -25, 50, 50); // Draw a 50x50 square
        ctx.restore();
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateGame() {
    clearCanvas();
    drawShape(targetShape, 'red');
    drawShape(playerShape, 'blue');
    calculateMSE();
}

function calculateMSE() {
    const dx = targetShape.x - playerShape.x;
    const dy = targetShape.y - playerShape.y;
    const dr = Math.abs(targetShape.rotation - playerShape.rotation) % 360;
    const mse = (dx * dx + dy * dy + dr * dr) / 3;
    mseValue.textContent = mse.toFixed(2);
}

document.getElementById('moveX').addEventListener('input', function() {
    playerShape.x = parseInt(this.value);
    updateGame();
});

document.getElementById('moveY').addEventListener('input', function() {
    playerShape.y = parseInt(this.value);
    updateGame();
});

document.getElementById('rotate').addEventListener('input', function() {
    playerShape.rotation = parseInt(this.value);
    updateGame();
});

document.getElementById('hideShapes').addEventListener('click', function() {
    shapesVisible = !shapesVisible; // Toggle visibility
    updateGame();
    // Optionally, reset visibility and randomize target shape for a new round
    //if (!shapesVisible) {
    // targetShape.x = Math.random() * 200 - 100;
    //targetShape.y = Math.random() * 200 - 100;
    //targetShape.rotation = Math.random() * 360;
    //}
});

updateGame();
