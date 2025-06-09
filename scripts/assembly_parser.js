const assemblyCode = document.getElementById("assemblyCode");
assemblyCode.addEventListener("input", updateCursorPosition);

// Mapping instruction mnemonics to their kind of format
const mnemonicToFormat = {
    add: "R",
    adds: "R",
    sub: "R",
    subs: "R",
    ldur: "R",
    stur: "R",
    // Add more mnemonics as needed
};

// R-format: first 11 bits
const OpCodesR = {
    add: "10001011000", // ADD
    adds: "10101011000", // ADDS
    sub: "11001011000", // SUB
    subs: "11101011000", // SUBS
    ldur: "11111000000", // LDUR
    stur: "11111000001", // STUR
    mov: "11010010111", // MOV (example)
    cmp: "10110010111", // CMP (example)
    // Add more opcodes as needed
};

let assemblyInstructions = [];
const assemble = () => {
    // real assembly logic
    simulatorState.textContent = "Assembling...";
    // get text from assemblyCode
    const code = assemblyCode.value.trim();
    if (!code) {
        alert("Please enter some assembly code.");
        return;
    }
    // split code into lines, ignore lines start with "//" or empty lines
    const lines = code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("//"));
    if (lines.length === 0) {
        alert("No valid assembly code found.");
        return;
    }
    // in each line, find the first word (opcode) and determine its format
    // and convert the rest of the line to binary base on the format
    // r-format: 11 bits for opcode, 5 bits for first source register, 6 bits for shift amount, 5 bits for second source register, 5 bits for destination register
    const binaryInstructions = lines
        .map((line) => {
            const parts = line.split(/\s+/);
            const mnemonic = parts[0].toLowerCase();
            const format = mnemonicToFormat[mnemonic];
            if (!format) {
                alert(`Unknown instruction: ${mnemonic}`);
                return null;
            }

            if (format === "R") {
                // R-format: ADD, SUB, etc.
                const opcode = OpCodesR[mnemonic];
                if (!opcode) {
                    alert(`Unknown opcode for instruction: ${mnemonic}`);
                    return null;
                }
                const shmt =
                    parts[1].toLowerCase() === "xzr" ? "00000" : "00001"; // Shift amount, default to 0
                const rd = parseInt(parts[1].replace("X", ""), 10)
                    .toString(2)
                    .padStart(5, "0");
                const rn = parseInt(parts[2].replace("X", ""), 10)
                    .toString(2)
                    .padStart(5, "0");
                const rm = parseInt(parts[3].replace("X", ""), 10)
                    .toString(2)
                    .padStart(5, "0");
                return `${opcode}${rn}${shmt}${rm}${rd}`;
            }
            // Add more formats as needed
            return null;
        })
        .filter(Boolean);
    if (binaryInstructions.length === 0) {
        alert("No valid assembly instructions found.");
        return;
    }
    // Update the assemblyInstructions array
    assemblyInstructions = binaryInstructions;
    simulatorState.textContent = "Ready";
};
