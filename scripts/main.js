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
    // check if vec is empty then alert there are no compiled instruction
    if (isStart == true) {
        alert("There no compiled instruction");
        return;
    }
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
        await vec[i].run();
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
