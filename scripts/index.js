const simulatorState = document.getElementById("simulatorState");
const pcValue = document.getElementById("pcValue");
const cycleCount = document.getElementById("cycleCount");
const executionSpeedInput = document.getElementById("executionSpeed");
const cursorPosition = document.getElementById("cursorPosition");

let currentLine = 1;
let currentCol = 1;

const updateCursorPosition = () => {
    const cursorPos = assemblyCode.selectionStart;
    const textLines = assemblyCode.value.substr(0, cursorPos).split("\n");
    currentLine = textLines.length;
    currentCol = textLines[textLines.length - 1].length + 1;
    cursorPosition.textContent = `Line: ${currentLine}, Col: ${currentCol}`;
};

const loadCode = () => {
    assemblyCode.value = `// Sample LEGv8 code
ADD X0, X1, X2
SUB X3, X4, X5
LDUR X6, [X7, #0]
STUR X8, [X9, #8]`;
};

const saveCode = () => {
    alert("Code saved (simulated)");
};

const clearCode = () => {
    assemblyCode.value = "";
};

const showHelp = () => {
    alert(
        "LEGv8 Simulator Help\n\nUse the controls to assemble and run your code.",
    );
};

const assemblyCode = document.getElementById("assemblyCode");
assemblyCode.addEventListener("input", updateCursorPosition);

document.getElementById("loadCodeBtn").addEventListener("click", loadCode);
document.getElementById("saveCodeBtn").addEventListener("click", saveCode);
document.getElementById("clearCodeBtn").addEventListener("click", clearCode);

configLoader = new InstructionConfigLoader();
configLoader.loadConfig(); 

InstructionFactory.initialize(configLoader); 



