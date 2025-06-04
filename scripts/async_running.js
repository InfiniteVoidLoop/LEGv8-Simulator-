const namespace = "http://www.w3.org/2000/svg";
const textInput = { value: "0101010" };
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const speedInput = document.querySelector(
    'input[type="range"][min="1"][max="10"]',
);
let executionSpeed = speedInput ? parseInt(speedInput.value, 10) : 1;

speedInput.addEventListener("input", () => {
    executionSpeed = parseInt(speedInput.value, 10);
});

let duration = 6000 / executionSpeed;
speedInput.addEventListener("input", () => {
    duration = 6000 / executionSpeed;
});

let running = false;
let resumeCallbacks = [];

function nextFrame() {
    return new Promise((r) => requestAnimationFrame(r));
}

function waitForGlobalResume() {
    return new Promise((resolve) => {
        resumeCallbacks.push(resolve);
    });
}

async function run(text, pathId) {
    // add text to path
    const pathElement = document.getElementById(pathId);
    console.log(`🔄 Bắt đầu run() trên path ${pathElement}`);

    const textElement = document.createElementNS(namespace, "text");
    textElement.setAttribute("font-size", "20");
    textElement.setAttribute("fill", "red");
    const textPath = document.createElementNS(namespace, "textPath");
    textPath.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
        `#${pathId}`,
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

async function bigrun() {
    console.log("=== ⏯️ Bắt đầu bigrun ===");

    const text = textInput.value || "Xin chào";

    const pathIds = ["pc-alu", "pc-ins-mem", "pc-add-4"];

    const allRuns = pathIds.map((pathId) => run(text, pathId));

    await Promise.all(allRuns);

    console.log("✅ ✅ ✅ Kết thúc bigrun: tất cả run() xong");
}

startBtn.onclick = () => {
    resetBtn.click(); // Reset trước khi bắt đầu
    running = true;
    bigrun();
};

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
    running = false;
    console.log("🔄 Reset");
    resumeCallbacks = [];
    // Xoá tất cả text đã thêm
    const texts = document.querySelectorAll("text");
    texts.forEach((text) => text.remove());
};
