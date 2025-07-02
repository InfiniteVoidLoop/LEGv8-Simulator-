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

    isStart = false;
    currentState.textContent = "Compiling";
    resetBtn.click();
    const code = assemblyCode.value;
    const lines = code
        .split("\n")
        .map((line) => line.trim())
    if (lines.length === 0) {
        alert("No valid assembly code found.");
        return;
    }
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

    // Xoá tất cả element co class la instruction-text đã thêm
    const instructionTexts = document.querySelectorAll(".animated-data-div");
    instructionTexts.forEach((text) => text.remove());
    controlUnitDisplay(PC, 0);
    alert("Compile success");
    currentState.textContent = "Compile success";
};

const markLines = (textareaId, lineNumber) => {
    const textarea = document.getElementById(textareaId);
    const lines = textarea.value.split('\n');

    if (lineNumber < 1 || lineNumber > lines.length) return;

    // Avoid adding marker multiple times
    if (!lines[lineNumber - 1].startsWith("🔴")) {
        lines[lineNumber - 1] = "🔴" + ' ' + lines[lineNumber - 1];
    }

    textarea.value = lines.join('\n');
}
const removeMarkers = (textareaId, lineNumber) => {
    const textarea = document.getElementById(textareaId);
    const lines = textarea.value.split('\n');

    if (lineNumber < 1 || lineNumber > lines.length) return;

    // Remove marker if it exists
    const pattern = new RegExp('^' + "🔴".replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*');
    lines[lineNumber - 1] = lines[lineNumber - 1].replace(pattern, '');

    textarea.value = lines.join('\n');
}
const resetInstruction = (vec, i) => {
    removeMarkers("assemblyCode", vec[i].lineNumber);
    document.getElementById('mux-0').style.background = ' #acb1b3';
    document.getElementById('mux-2').style.background = ' #acb1b3';
    document.getElementById('mux-1').style.background = ' #acb1b3';
    document.getElementById('mux-3').style.background = ' #acb1b3';

    document.getElementById("flag-z").style.background =  '#acb1b3';
    document.getElementById("flag-n").style.background =  '#acb1b3';
    document.getElementById("flag-c").style.background =  '#acb1b3';
    document.getElementById("flag-v").style.background =  '#acb1b3';
    restore_path.forEach((item) => {
        const pathElement = document.getElementById(item.pathId);
        if (pathElement) {
            pathElement.setAttribute("stroke", item.originalColor);
            pathElement.setAttribute("stroke-width", item.originalStrokeWidth);
        }
    });
    restore_path = [];
}

startBtn.onclick = async () => {
    // check if vec is empty then alert there are no compiled instruction
    if (isStart == true || vec.length == 0) {
        alert("There no compiled instruction");
        return;
    }

    remove_after_step.forEach((div) => {
        if (div.parentNode) {
            div.parentNode.removeChild(div);
        }
    });
    currentState.textContent = "Running";
    running = true;
    isStart = true;
    // let vec1 = vec;
    // vec = [];
    for (let i = 0; i < vec.length; i++) {
        pcValue.textContent = `0x${PC.getCurrentAddress()
            .toString(16)
            .padStart(8, "0")
            .toUpperCase()}`;
        // mark text at line vec[i].lineNumber yellow from element textarea with id assemblyCode
        markLines("assemblyCode", vec[i].lineNumber);
        await vec[i].run();
        resetInstruction(vec, i);
        pcValue.textContent = `0x${PC.getCurrentAddress()
            .toString(16)
            .padStart(8, "0")
            .toUpperCase()}`;
    }
    currentState.textContent = "Done Running";
    isStart = false;
    vec = [];
};

const assembleButton = document.getElementById("assembleBtn");

assembleButton.onclick = assemble;
