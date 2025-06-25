// Khởi tạo biến pstate để lưu trạng thái NZCV
var pstate = {
    N: "0",
    Z: "0",
    C: "0",
    V: "0",
};

configloader = new InstructionConfigLoader();
configloader.loadConfig();
InstructionFactory.initialize(configloader);
let PC = new ProgramCounter();
ass = new Assembler(PC.getCurrentAddress());
let memory = new MemoryStorage();
let registers = new LEGv8Registers();
vec = [];
const assemble = () => {
    currentState.textContent = "Compiling";
    resetBtn.click();
    const code = assemblyCode.value;
    const lines = code
        .split("\n")
        .map((line) => line.trim())
        .map((line) => {
            // split the line from the first syntax comment '//', and get the first part
            const commentIndex = line.indexOf("//");
            if (commentIndex !== -1) {
                return line.substring(0, commentIndex).trim();
            }
            return line;
        })
        .filter((line) => line.length > 0 && !line.startsWith("//"));
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
    alert("Compile success");
    currentState.textContent = "Compile success";
};

startBtn.onclick = async () => {
    currentState.textContent = "Running";
    running = true;
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
    currentState.textContent = "Done Running";
};

const assembleButton = document.getElementById("assembleBtn");

assembleButton.onclick = assemble;
