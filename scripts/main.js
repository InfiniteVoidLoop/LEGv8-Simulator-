configloader = new InstructionConfigLoader();
configloader.loadConfig();
InstructionFactory.initialize(configloader);
let PC = new ProgramCounter();
ass = new Assembler(PC.getCurrentAddress());
let memory = new MemoryStorage();
let registers = new LEGv8Registers();
let isStart = false;
vec = [];
const assemble = () => {
    if (running) {
        alert("Please reset the current execution before compiling new code.");
        return;
    }
    isStart = false;
    currentState.textContent = "Compiling";
    resetBtn.click();
    const code = assemblyCode.value;
    const lines = code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    if (lines.length === 0) {
        alert("No valid assembly code found.");
        return;
    }
    assemblyCode.value = lines.join("\n");
    try {
        ins = ass.assemble(lines);
    } catch (e) {
        alert(`Assemble code assembly error, check log for detail \n${e}`);
        return;
    }
    for (let i = 0; i < ins.length; i++) {
        PC.setObjectAtAddress(PC.getCurrentAddress(), ins[i]);
        PC.setAddress(PC.getCurrentAddress() + 4);
    }
    PC.setAddress(ProgramCounter.BASE_ADDRESS); // Reset PC to base address
    jumpToAddress(PC, vec, PC.getCurrentAddress());

    controlUnitDisplay(PC, 0);
    setTimeout(() => {}, 700);

    // Remove all animated data divs at the end of compilation
    document
        .querySelectorAll(".animated-data-div")
        .forEach((el) => el.remove());

    alert("Compile success");

    currentState.textContent = "Compile success";
};

const markLines = (textareaId, lineNumber) => {
    const textarea = document.getElementById(textareaId);
    const lines = textarea.value.split("\n");

    if (lineNumber < 1 || lineNumber > lines.length) return;

    // Avoid adding marker multiple times
    if (!lines[lineNumber - 1].startsWith("🔴")) {
        lines[lineNumber - 1] = "🔴" + " " + lines[lineNumber - 1];
    }

    textarea.value = lines.join("\n");
};
const removeMarkers = (textareaId, lineNumber) => {
    const textarea = document.getElementById(textareaId);
    const lines = textarea.value.split("\n");

    if (lineNumber < 1 || lineNumber > lines.length) return;

    // Remove marker if it exists
    const pattern = new RegExp(
        "^" + "🔴".replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*",
    );
    lines[lineNumber - 1] = lines[lineNumber - 1].replace(pattern, "");

    textarea.value = lines.join("\n");
};
const resetInstruction = (vec, i) => {
    removeMarkers("assemblyCode", vec[i].lineNumber);
    document.getElementById("mux-0").style.background = " #acb1b3";
    document.getElementById("mux-2").style.background = " #acb1b3";
    document.getElementById("mux-1").style.background = " #acb1b3";
    document.getElementById("mux-3").style.background = " #acb1b3";

    document.getElementById("flag-z").style.background = "#acb1b3";
    document.getElementById("flag-n").style.background = "#acb1b3";
    document.getElementById("flag-c").style.background = "#acb1b3";
    document.getElementById("flag-v").style.background = "#acb1b3";
    restore_path.forEach((item) => {
        const pathElement = document.getElementById(item.pathId);
        if (pathElement) {
            pathElement.setAttribute("stroke", item.originalColor);
            pathElement.setAttribute("stroke-width", item.originalStrokeWidth);
        }
    });
    restore_path = [];
};

startBtn.onclick = async () => {
    // If an execution is already in progress (started by either run or step)
    if (isStart) {
        // This handles transitioning from a paused state (from step or pause button) to a full run.
        currentState.textContent = "Running";
        isStep = false; // Ensure we are in continuous mode.

        // Clean up any divs left over from a paused step.
        remove_after_step.forEach((div) => {
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
        });
        remove_after_step = [];

        // If `running` is false, it means the pause button was used. We need to resume.
        if (!running) {
            running = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i> Pause';
            pauseBtn.classList.remove("bg-green-600", "hover:bg-green-700");
            pauseBtn.classList.add("bg-danger-600", "hover:bg-danger-700");
        }

        // Un-pause the execution.
        const timestamp = performance.now();
        resumeCallbacks.forEach((resolve) => resolve(timestamp));
        resumeCallbacks = [];

        return; // The existing loop (from stepBtn) will now run to completion.
    }

    // --- If no execution is in progress, start a new one. ---
    if (vec.length === 0) {
        alert("There are no compiled instructions.");
        return;
    }

    isStep = false;
    currentState.textContent = "Running";
    running = true;
    isStart = true;

    for (let i = 0; i < vec.length; i++) {
        pcValue.textContent = `0x${PC.getCurrentAddress()
            .toString(16)
            .padStart(8, "0")
            .toUpperCase()}`;
        markLines("assemblyCode", vec[i].lineNumber);
        await vec[i].run();
        resetInstruction(vec, i);
        remove_after_step.forEach((div) => {
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
        });
        remove_after_step = [];
        pcValue.textContent = `0x${PC.getCurrentAddress()
            .toString(16)
            .padStart(8, "0")
            .toUpperCase()}`;
    }

    currentState.textContent = "Done Running";
    isStart = false;
    running = false;
    vec = [];
};

const assembleButton = document.getElementById("assembleBtn");

assembleButton.onclick = assemble;
