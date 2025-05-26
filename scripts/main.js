const svgRef = document.getElementById("svg");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let textElement = null;
let textPath = null;

let running = false;
let started = false;
let progress = 0;
const speed = 1 / 3000;
let lastTimestamp = null;

const createTextElement = (text, path) => {
    const namespace = "http://www.w3.org/2000/svg";

    textElement = document.createElementNS(namespace, "text");
    textElement.setAttribute("font-size", "20");
    textElement.setAttribute("fill", "blue");

    textPath = document.createElementNS(namespace, "textPath");
    textPath.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "href",
    "#" + path,
    );
    textPath.setAttribute("startOffset", "0%");
    textPath.textContent = text;

    textElement.appendChild(textPath);
    svgRef.appendChild(textElement);
};

const animationLoop = (timestamp) => {
    if (!started) return;

    if (lastTimestamp === null) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (running && textPath) {
        progress += delta * speed;
        progress %= 1;
        textPath.setAttribute("startOffset", progress * 100 + "%");
    }
    animationLoop(timestamp + 100);

};

const anotherAnimationLoop = (timestamp) => {
    if (!started) return;

    if (lastTimestamp === null) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (running && textPath) {
        progress += delta * speed;
        progress %= 1;
        textPath.setAttribute("startOffset", progress * 100 + "%");
    }
    requestAnimationFrame(anotherAnimationLoop);
}

const start = () => {
    reset();
    createTextElement("010101", "pc-alu");
    started = true;
    running = true;
    progress = 0;
    lastTimestamp = null;

    updateButtons();
    requestAnimationFrame(animationLoop);
    

};

const pause = () => {
    running = false;
    updateButtons();
};

const resume = () => {
    if (started) {
    running = true;
    updateButtons();
    }
};

const reset = () => {
    running = false;
    progress = 0;
    lastTimestamp = null;

    if (textElement) {
    svgRef.removeChild(textElement);
    textElement = null;
    textPath = null;
    }

    started = false;
    updateButtons();
};

const updateButtons = () => {
    pauseBtn.disabled = !started || !running;
    resetBtn.disabled = !started;
};

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
resetBtn.addEventListener("click", reset);