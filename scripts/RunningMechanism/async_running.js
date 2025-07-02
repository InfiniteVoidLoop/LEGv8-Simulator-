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

/**
 * Animates an HTML div along an SVG path.
 * @param {string} text The text content for the div.
 * @param {string} pathId The ID of the SVG path to follow.
 */
async function run(text, pathId) {
    const pathElement = document.getElementById(pathId);
    if (!pathElement) {
        console.error(`Path with ID "${pathId}" not found.`);
        return;
    }

    const originalColor = pathElement.getAttribute("stroke");
    const originalStrokeWidth = pathElement.getAttribute("stroke-width");

    // Change path color and width for animation
    pathElement.setAttribute("stroke", "#DC3545");
    pathElement.setAttribute("stroke-width", "3");

    // --- Create an HTML div element instead of SVG text ---
    const divElement = document.createElement("div");
    divElement.textContent = text;
    divElement.classList.add("animated-data-div"); // Add class for easy cleanup

    // --- Apply CSS styles for a better look ---
    divElement.style.position = "absolute"; // Crucial for positioning
    divElement.style.backgroundColor = "rgba(0, 123, 255, 0.9)"; // Blue background
    divElement.style.color = "white";
    divElement.style.fontWeight = "bold";
    divElement.style.fontFamily = "'Courier New', monospace";
    divElement.style.padding = "2px 8px";
    divElement.style.borderRadius = "5px";
    divElement.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
    divElement.style.zIndex = "9999"; // Ensure it's on top of everything
    divElement.style.whiteSpace = "nowrap"; // Prevent text from wrapping
    divElement.style.pointerEvents = "none"; // Prevent div from blocking mouse events

    // The div must be a child of a positioned container (e.g., main-display)
    const container = document.getElementById("main-display");
    if (container) {
        container.appendChild(divElement);
    } else {
        document.body.appendChild(divElement); // Fallback to body
    }

    const pathLength = pathElement.getTotalLength();
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

        // Calculate linear progress (no acceleration)
        const progress = Math.min(elapsedTime / duration, 1);

        const currentLength = progress * pathLength;

        // Get the (x, y) coordinates at the current position on the path
        const point = pathElement.getPointAtLength(currentLength);

        // --- Coordinate Transformation ---
        // Get the SVG's position relative to the viewport
        const svgRect = pathElement.ownerSVGElement.getBoundingClientRect();
        // Get the container's position relative to the viewport
        const containerRect = container.getBoundingClientRect();

        // Calculate the correct position for the div
        // 1. Start with the point in SVG coordinates (point.x, point.y)
        // 2. Add the SVG's top-left corner position (svgRect.left, svgRect.top)
        // 3. Subtract the container's top-left corner position (containerRect.left, containerRect.top)
        // This gives the position of the point relative to the container.
        const xPos = point.x + svgRect.left - containerRect.left;
        const yPos = point.y + svgRect.top - containerRect.top;

        // Update the div's position using top/left. 
        // Using transform can be slightly faster, but top/left is more robust with complex layouts.
        // We also center the div on the point.
        const divRect = divElement.getBoundingClientRect();
        divElement.style.left = `${xPos - divRect.width / 2}px`;
        divElement.style.top = `${yPos - divRect.height / 2}px`;
    }

    // Wait for 1 second at the end of the path before removing the div
    if (!isStep) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    // Remove the div element after the effect is complete
    if (divElement.parentNode && !isStep) {
        divElement.parentNode.removeChild(divElement);
    }

    // Restore original path color and width
    pathElement.setAttribute("stroke", originalColor);
    pathElement.setAttribute("stroke-width", originalStrokeWidth);

    if (isStep) {
        await waitForGlobalResume();
    }

    console.log(`✅ DIV animation completed on path ${pathId}`);
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
        pauseBtn.classList.add("bg-danger-600", "hover:bg-danger-700");
    } else {
        currentState.textContent = "Paused";
        running = false;
        pauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Continue';
        pauseBtn.classList.remove("bg-danger-600", "hover:bg-danger-700");
        pauseBtn.classList.add("bg-green-600", "hover:bg-green-700");
    }
};
resetBtn.onclick = () => {
    pauseBtn.innerHTML = 'Pause';
    pauseBtn.classList.remove("bg-green-600", "hover:bg-green-700");
    pauseBtn.classList.add("bg-danger-600", "hover:bg-danger-700");
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
    controlUnitDisplay(pcValue, 0);
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

    // Also remove all animated divs
    const animatedDivs = document.querySelectorAll(".animated-data-div");
    animatedDivs.forEach(div => div.remove());


    // remove all markers from assemblyCode
    const lines = assemblyCode.value.split("\n");
    lines.forEach((line, index) => {
        const lineNumber = index + 1; // Line numbers are 1-based
        removeMarkers("assemblyCode", lineNumber);
    })
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
