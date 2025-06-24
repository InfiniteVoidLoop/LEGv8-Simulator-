const pcValue = document.getElementById("pcValue");
const executionSpeedInput = document.getElementById("executionSpeed");

// Zoom
let zoomLevel = 1;
const zoomStep = 0.1;
const zoomWrapper = document.getElementById("main-display");

function zoomIn() {
    zoomLevel += zoomStep;
    applyZoom();
}

function zoomOut() {
    zoomLevel = Math.max(zoomStep, zoomLevel - zoomStep);
    applyZoom();
}

function resetZoom() {
    zoomLevel = 1;
    applyZoom();
}

function applyZoom() {
    zoomWrapper.style.transform = `scale(${zoomLevel})`;
}

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    if (tabName === "registers") {
        document
            .getElementById("registers-tab")
            .classList.add("active", "bg-gray-100");
        document
            .getElementById("stack-tab")
            .classList.remove("active", "bg-gray-100");
        document
            .getElementById("registers-content")
            .classList.remove("hidden");
        document
            .getElementById("stack-content")
            .classList.add("hidden");
    } else {
        document
            .getElementById("stack-tab")
            .classList.add("active", "bg-gray-100");
        document
            .getElementById("registers-tab")
            .classList.remove("active", "bg-gray-100");
        document
            .getElementById("stack-content")
            .classList.remove("hidden");
        document
            .getElementById("registers-content")
            .classList.add("hidden");
    }
}

// Generate register items
function generateRegisters() {
    const container = document.getElementById("registers-content");

    for (let i = 0; i < 28; i++) {
        const regName = `X${i}`;
        const value = `0x${Math.floor(0)
            .toString(16)
            .padStart(8, "0")
            .toUpperCase()}`;

        const regElement = document.createElement("div");
        regElement.className =
            "bg-white border border-gray-200 p-1 text-xs text-center";
        regElement.innerHTML = `<span class="font-semibold">${regName}</span><br><span class="font-mono">${value}</span>`;
        regElement.id = `register-${regName}`;
        container.appendChild(regElement);
    }
}

// Generate stack items
function generateStack() {
    const container = document.getElementById("stack-content");

    // Add header row
    for (let i = 0; i < 30; i++) {
        const address = `0x${(i).toString(16).padStart(8, '0').toUpperCase()}`;
        const value = `0x${Math.floor(Math.random() * 100000000)
            .toString(16)
            .padStart(8, "0")
            .toUpperCase()}`;

        const addressElement = document.createElement("div");
        addressElement.className =
            "p-1 text-xs font-mono border-b border-gray-100";
        addressElement.textContent = address;

        const valueElement = document.createElement("div");
        valueElement.className =
            "p-1 text-xs font-mono border-b border-gray-100";
        valueElement.textContent = value;
        valueElement.id = `stack-${i}`;

        container.appendChild(addressElement);
        container.appendChild(valueElement);
    }
}

// Initialize when page loads
window.onload = function() {
    generateRegisters();
    generateStack();

    // Set default active tab
    document
        .getElementById("registers-tab")
        .classList.add("bg-gray-100");
    document.querySelector(".active").classList.add("bg-gray-100");
};
