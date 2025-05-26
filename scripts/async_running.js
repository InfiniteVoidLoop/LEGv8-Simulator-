const namespace = "http://www.w3.org/2000/svg";
const textInput = {value: "0101010"}
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const duration = 3000;

let running = false;
let resumed = null;

function nextFrame() {
    return new Promise((r) => requestAnimationFrame(r));
}

function waitUntilRunning() {
    return new Promise((r) => (resumed = r));
}

async function run(text, pathId) {
    const pathElement = document.getElementById(pathId);

    const textElement = document.createElementNS(namespace, "text");
    textElement.setAttribute("font-size", "20");
    textElement.setAttribute("fill", "red");

    const textPath = document.createElementNS(
        namespace,
        "textPath",
    );
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
            await waitUntilRunning();
            lastStartTime = performance.now(); // reset start time when resumed
        }

        if (lastStartTime === null) {
            lastStartTime = performance.now(); // on first start
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

    const pathIds = ["pc-alu", "pc-ins-memory", "pc-add-4"];

    const allRuns = pathIds.map((pathId) => run(text, pathId));

    await Promise.all(allRuns);

    console.log("✅ ✅ ✅ Kết thúc bigrun: tất cả run() xong");
}

startBtn.onclick = () => {
    if (!running) {
        running = true;
        bigrun();
    }
};

pauseBtn.onclick = () => {
    console.log("⏸️ Pause");
    running = false;
};

resetBtn.onclick = () => {
    running = false;
    progress = 0;
    lastTimestamp = null;

    let textElement = svgRef.textElement;
    svgRef.removeChild(textElement);

    started = false;
};
