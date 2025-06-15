const namespace = "http://www.w3.org/2000/svg";
const textInput = { value: "0101010" };
const startBtn = document.getElementById("runBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const stepBtn = document.getElementById("stepBtn");

const speedInput = document.querySelector(
    'input[type="range"][min="1"][max="10"]'
);
let executionSpeed = speedInput ? parseInt(speedInput.value, 10) : 1;

speedInput.addEventListener("input", () => {
    executionSpeed = parseInt(speedInput.value, 10);
});

let duration = 10000 / executionSpeed;
speedInput.addEventListener("input", () => {
    duration = 10000 / executionSpeed;
});

let running = false;
let resumeCallbacks = [];
let stepCallbacks = [];
let isStep = false;
function nextFrame() {
    return new Promise((r) => requestAnimationFrame(r));
}

function waitForGlobalResume() {
    return new Promise((resolve) => {
        resumeCallbacks.push(resolve);
    });
}
function waitForGlobalStep() {
    return new Promise((resolve) => {
        stepCallbacks.push(resolve);
    });
}

async function run(text, pathId) {
    if (isStep) {
        await waitForGlobalResume();
    }
    // add text to path
    const pathElement = document.getElementById(pathId);

    const textElement = document.createElementNS(namespace, "text");
    textElement.setAttribute("font-size", "20");
    textElement.setAttribute("fill", "#000");
    // textElement.setAttribute("font-weight", "bold");
    textElement.setAttribute("class", "instruction-text");
    textElement.setAttribute("font-family", "Courier New, monospace");
    const textPath = document.createElementNS(namespace, "textPath");
    textPath.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
        `#${pathId}`
    );
    textPath.textContent = text;
    textPath.setAttribute("startOffset", `0%`);
    textElement.appendChild(textPath);
    pathElement.parentNode.appendChild(textElement);

    let elapsedTime = 0;
    let lastStartTime = null;

    while (elapsedTime < duration) {
        if (!running) {
            const resumeTimestamp = await waitForGlobalResume();
            lastStartTime = resumeTimestamp;
        }

        if (lastStartTime === null) {
            lastStartTime = performance.now();
        }

        await nextFrame();
        const now = performance.now();
        const delta = now - lastStartTime;
        elapsedTime += delta;
        lastStartTime = now;

        const progress = Math.min(elapsedTime / duration, 1);
        textPath.setAttribute("startOffset", `${progress * 100}%`);
    }

    console.log(`✅ run() hoàn tất trên path ${pathId}`);
}

pauseBtn.onclick = () => {
    if (!running) {
        running = true;
        const timestamp = performance.now();
        // Resolve tất cả callbacks đang chờ
        resumeCallbacks.forEach((resolve) => resolve(timestamp));
        // Reset mảng
        resumeCallbacks = [];

        pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i> Pause';
        pauseBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        pauseBtn.classList.add("bg-red-600", "hover:bg-red-700");
    } else {
        running = false;
        pauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Continue';
        pauseBtn.classList.remove("bg-red-600", "hover:bg-red-700");
        pauseBtn.classList.add("bg-green-600", "hover:bg-green-700");
    }
};
resetBtn.onclick = () => {
    // reset pcvalue
    pcValue.textContent = "0x00000000";
    running = false;
    console.log("🔄 Reset");
    resumeCallbacks = [];
    // Xoá tất cả element co class la instruction-text đã thêm
    const instructionTexts = document.querySelectorAll(".instruction-text");
    instructionTexts.forEach((text) => text.remove());
    // const texts = document.querySelectorAll("text");
    // texts.forEach((text) => text.remove());
};

stepBtn.onclick = () => {
    isStep = true;
    stepCallbacks.forEach((resolve) => resolve());
    const timestamp = performance.now();
    resumeCallbacks.forEach((resolve) => resolve(timestamp));
}
