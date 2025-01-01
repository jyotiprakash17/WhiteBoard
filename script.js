const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("color-picker");
const sizePicker = document.getElementById("size");
const toolPicker = document.getElementById("tool");
const bgColorPicker = document.getElementById("bg-color-picker");
const undoButton = document.getElementById("undo-button");
const redoButton = document.getElementById("redo-button");
const saveButton = document.getElementById("save-button");
const clearButton = document.getElementById("clear-button");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = "pen";
let lineStart = { x: 0, y: 0 };
let undoStack = [];
let redoStack = [];
let currentPath = [];

ctx.lineWidth = sizePicker.value;
ctx.strokeStyle = colorPicker.value;
ctx.lineJoin = "round";
ctx.lineCap = "round";

// Update stroke color and line width
colorPicker.addEventListener("change", (e) => {
    ctx.strokeStyle = e.target.value;
});
sizePicker.addEventListener("change", (e) => {
    ctx.lineWidth = e.target.value;
});
toolPicker.addEventListener("change", (e) => {
    currentTool = e.target.value;
});

// Handle canvas events
canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    lineStart = { x: e.offsetX, y: e.offsetY };
    currentPath = [{ x: lastX, y: lastY }];
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const newX = e.offsetX;
    const newY = e.offsetY;

    if (currentTool === "pen") {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(newX, newY);
        ctx.stroke();
        lastX = newX;
        lastY = newY;
    }

    if (currentTool === "line") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(newX, newY);
        ctx.stroke();
    }

    if (currentTool === "rect") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.rect(lineStart.x, lineStart.y, newX - lineStart.x, newY - lineStart.y);
        ctx.stroke();
    }

    if (currentTool === "circle") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        const radius = Math.sqrt(Math.pow(newX - lineStart.x, 2) + Math.pow(newY - lineStart.y, 2));
        ctx.arc(lineStart.x, lineStart.y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (currentTool === "eraser") {
        ctx.clearRect(newX - ctx.lineWidth / 2, newY - ctx.lineWidth / 2, ctx.lineWidth, ctx.lineWidth);
    }
});

// Stop drawing
canvas.addEventListener("mouseup", () => {
    drawing = false;
    if (currentTool === "pen" || currentTool === "line" || currentTool === "rect" || currentTool === "circle") {
        addToUndoStack();
    }
});

// Undo and Redo functionality
undoButton.addEventListener("click", () => {
    if (undoStack.length > 0) {
        redoStack.push(undoStack.pop());
        restoreState(undoStack[undoStack.length - 1]);
    }
});

redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        restoreState(undoStack[undoStack.length - 1]);
    }
});

// Clear canvas
clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
});

// Save canvas
saveButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
});

// Add background color change
bgColorPicker.addEventListener("change", (e) => {
    canvas.style.backgroundColor = e.target.value;
});

// Function to save canvas state to undo stack
function addToUndoStack() {
    if (undoStack.length >= 10) {
        undoStack.shift();
    }
    undoStack.push(canvas.toDataURL());
    redoStack = [];
}

// Function to restore canvas state from undo stack
function restoreState(dataURL) {
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}
