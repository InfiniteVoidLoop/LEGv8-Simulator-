const pcValue = document.getElementById("pcValue");
const executionSpeedInput = document.getElementById("executionSpeed");
const currentState = document.getElementById("currentState");
const flagN = document.getElementById("flag-status-n");
const flagZ = document.getElementById("flag-status-z");
const flagV = document.getElementById("flag-status-v");
const flagC = document.getElementById("flag-status-c");

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
        document.getElementById("registers-content").classList.remove("hidden");
        document.getElementById("stack-content").classList.add("hidden");
    } else {
        document
            .getElementById("stack-tab")
            .classList.add("active", "bg-gray-100");
        document
            .getElementById("registers-tab")
            .classList.remove("active", "bg-gray-100");
        document.getElementById("stack-content").classList.remove("hidden");
        document.getElementById("registers-content").classList.add("hidden");
    }
}

// Generate register items
function generateRegisters() {
    const container = document.getElementById("registers-content");

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

        const regElement = document.createElement("div");
        regElement.className =
            "bg-white border border-gray-200 p-1 text-xs text-center hover:bg-blue-50 transition-colors";
        regElement.innerHTML = `<span class="font-semibold text-blue-700">${NAME}</span><br><span class="font-mono">${value}</span>`;
        regElement.id = `register-${regName}`;
        container.appendChild(regElement);
    }
}

// Generate stack items
function generateStack() {
    const container = document.getElementById("stack-content");

    // Add header row
    for (let i = 0; i < 1000; i++) {
        const address = `0x${i.toString(16).padStart(8, "0").toUpperCase()}`;
        const value = "0x00"; // Default value for stack

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
window.onload = function () {
    generateRegisters();
    generateStack();
    zoomLevel = 0.8;
    // Set default active tab

    document.getElementById("registers-tab").classList.add("bg-gray-100");
    document.querySelector(".active").classList.add("bg-gray-100");
};
