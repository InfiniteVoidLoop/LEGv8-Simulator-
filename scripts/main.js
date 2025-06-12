configloader = new InstructionConfigLoader();
configloader.loadConfig()
InstructionFactory.initialize(configloader)
const PC = new ProgramCounter();
ass = new Assembler(PC.getCurrentAddress());
const memory = new MemoryStorage();
const registers = new LEGv8Registers();
vec = []
const assemble = () => {
    const code = assemblyCode.value;
    const lines = code.split("\n").map(line => line.trim()).
                    map(line => {
                        // split the line from the first syntax comment '//', and get the first part
                        const commentIndex = line.indexOf("//");
                        if (commentIndex !== -1) {
                            return line.substring(0, commentIndex).trim();
                        }
                        return line;
                    })
                    .filter(line => line.length > 0 && !line.startsWith("//"));
    if (lines.length === 0) {
        alert("No valid assembly code found.");
        return;
    }
    try {
        ins = ass.assemble(lines)
    } catch (e) {
        alert(`Assemble code assembly error, check log for detail \n${e}`);
        return 
    }
    for (let i = 0; i < ins.length; i++){
        PC.setObjectAtAddress(PC.getCurrentAddress(), ins[i]);
        PC.setAddress(PC.getCurrentAddress() + 4);
    }
    PC.setAddress(ProgramCounter.BASE_ADDRESS); // Reset PC to base address
    jumpToAddress(PC, vec, PC.getCurrentAddress());
}

startBtn.onclick = async () => {
    resetBtn.click(); // Reset trước khi bắt đầu
    running = true;
    for (let i = 0; i < vec.length; i++){
        document.getElementById('pcValue').textContent = `0x${PC.getCurrentAddress().toString(16).padStart(8, '0').toUpperCase()}`;
        await vec[i].run();
        document.getElementById('pcValue').textContent = `0x${PC.getCurrentAddress().toString(16).padStart(8, '0').toUpperCase()}`;

    }
}

const assembleButton = document.getElementById('assembleBtn');

assembleButton.onclick = assemble

