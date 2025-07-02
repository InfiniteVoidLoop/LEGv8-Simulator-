const namespace = "http://www.w3.org/2000/svg";
var pstate = {
    N: "0",
    Z: "0",
    C: "0",
    V: "0",
};
const textInput = { value: "0101010" };
const startBtn = document.getElementById("runBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const stepBtn = document.getElementById("stepBtn");
const assemblyCode = document.getElementById("assemblyCode");
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
    // add text to path
    const pathElement = document.getElementById(pathId);

    const textElement = document.createElementNS(namespace, "text");
    textElement.setAttribute("font-size", "21"); // Kích thước font
    textElement.setAttribute("fill", "#black"); // Màu xanh dương cho chữ
    textElement.setAttribute("font-weight", "bold"); // In đậm
    textElement.setAttribute("class", "instruction-text");
    textElement.setAttribute("font-family", "Courier New, monospace");

    // --- Hiệu ứng "khuôn bao" ---
    // Vẽ một đường viền dày màu trắng mờ xung quanh text
    textElement.setAttribute("stroke", "rgba(255, 255, 255, 0.8)");
    // Độ dày của đường viền
    textElement.setAttribute("stroke-width", "6");
    // Đảm bảo đường viền được vẽ phía sau, không che chữ
    textElement.setAttribute("paint-order", "stroke");
    // Bo tròn các góc của đường viền
    textElement.setAttribute("stroke-linejoin", "round");

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

    if (isStep) {
        await waitForGlobalResume();
    }

    console.log(`✅ run() hoàn tất trên path ${pathId}`);
}

pauseBtn.onclick = () => {
    if (!running) {
        running = true;
        currentState.textContent = "Running";
        const timestamp = performance.now();
        // Resolve tất cả callbacks đang chờ
        resumeCallbacks.forEach((resolve) => resolve(timestamp));
        // Reset mảng
        resumeCallbacks = [];

        pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i> Pause';
        pauseBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        pauseBtn.classList.add("bg-red-600", "hover:bg-red-700");
    } else {
        currentState.textContent = "Paused";
        running = false;
        pauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Continue';
        pauseBtn.classList.remove("bg-red-600", "hover:bg-red-700");
        pauseBtn.classList.add("bg-green-600", "hover:bg-green-700");
    }
};
resetBtn.onclick = () => {
    // reset pcvalue
    pcValue.textContent = "0x40000000";
    running = false;
    resumeCallbacks = [];

    configloader = new InstructionConfigLoader();
    configloader.loadConfig();
    InstructionFactory.initialize(configloader);
    PC = new ProgramCounter();
    ass = new Assembler(PC.getCurrentAddress());
    memory = new MemoryStorage();
    registers = new LEGv8Registers();
    pstate.N = 0;
    pstate.C = 0;
    pstate.V = 0;
    pstate.Z = 0;

    isStep = false;
    quickColorReset();
    vec = [];

    // reset gia tri cho tat ca cac register
    const registerMap = {
        16: "IP0",
        17: "IP1",
        28: "SP", // Stack Pointer
        29: "FP", // Frame Pointer
        30: "LR", // Link Register
        31: "XZR", // Zero Register
    };

    for (let i = 0; i <= 31; i++) {
        const regName = `X${i}`; // Use special name if exists, otherwise X[i]
        const NAME = registerMap[i] || `X${i}`;
        const value = `0x${Math.floor(0)
            .toString(16)
            .padStart(16, "0")
            .toUpperCase()}`; // Changed to padStart(16) for 64-bit
        document.getElementById(
            `register-${regName}`
        ).innerHTML = `<span class="font-semibold text-blue-700">${NAME}</span><br><span class="font-mono">${value}</span>`;
        document.getElementById(`register-${regName}`);
    }
    // Xoá tất cả element co class la instruction-text đã thêm
    const instructionTexts = document.querySelectorAll(".instruction-text");
    instructionTexts.forEach((text) => text.remove());
    console.log("🔄 Reset");
};

stepBtn.onclick = async () => {
    currentState.textContent = "Running Step";
    if (running == false) {
        running = true;
        isStep = true;
        for (let i = 0; i < vec.length; i++) {
            pcValue.textContent = `0x${PC.getCurrentAddress()
                .toString(16)
                .padStart(8, "0")
                .toUpperCase()}`;
            await vec[i].run();
            pcValue.textContent = `0x${PC.getCurrentAddress()
                .toString(16)
                .padStart(8, "0")
                .toUpperCase()}`;
        }
    } else {
        isStep = true;
        stepCallbacks.forEach((resolve) => resolve());
        const timestamp = performance.now();
        resumeCallbacks.forEach((resolve) => resolve(timestamp));
    }
};
