configloader = new InstructionConfigLoader();
configloader.loadConfig()
InstructionFactory.initialize(configloader)
const PC = new ProgramCounter();
ass = new Assembler(PC.getCurrentAddress());
const memory = new MemoryStorage();
const registers = new LEGv8Registers();

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
    vec = []
    for (let i = 0; i < ins.length; i++){
        if (ins[i].definition.format == 'R'){
            vec.push(new RFormat(ins[i], PC))
        }
        else if (ins[i].definition.format == 'I'){
            vec.push(new IFormat(ins[i], PC))
        }
        else if (ins[i].definition.format == 'D' && ins[i].definition.mnemonic == 'STUR'){
            vec.push(new Store(ins[i], PC))
        }
        else if (ins[i].definition.format == 'D' && ins[i].definition.mnemonic == 'LDUR'){
            vec.push(new Load(ins[i], PC))
        }
        else if (ins[i].definition.format == 'C'){
            vec.push(new CBFormat(ins[i], PC))
        }
        else if (ins[i].definition.format == 'B'){
            vec.push(new BFormat(ins[i], PC))
        }
    }
}

startBtn.onclick = async () => {
    resetBtn.click(); // Reset trước khi bắt đầu
    running = true;
    for (let i = 0; i < vec.length; i++){
        await vec[i].run()
    }
}

const assembleButton = document.getElementById('assembleBtn');

assembleButton.onclick = assemble

