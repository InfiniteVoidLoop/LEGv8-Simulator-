class RFormat {
    constructor(opcode, Rm, shamt, Rn, Rd, address) {
        this.opcode = opcode; // 11 bits
        this.Rm = Rm;         // 5 bits
        this.shamt = shamt;   // 6 bits
        this.Rn = Rn;         // 5 bits
        this.Rd = Rd;         // 5 bits
        this.address = address;
    }

    async instructionFetch() {
        const instruction = this.opcode + this.Rn + this.Rm + this.shamt + this.Rd; 
        const pathAndData = [
            { pathId: 'pc-alu', data: this.address },
            { pathId: 'pc-ins-mem', data: instruction },
            { pathId: 'pc-add-4', data: this.address }
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }

    async instructionDecode() {
        const instruction = this.opcode + this.Rn + this.Rm + this.shamt + this.Rd; // Concatenate all parts to form the instruction

        const pathAndData = [
            { pathId: 'Instruction-[31-21]', data: this.opcode },
            { pathId: 'Instruction-[9-5]', data: this.Rn },
            { pathId: 'Instruction-[20-16]', data: this.Rm },
            { pathId: 'Instruction-[4-0]', data: this.Rd },
            { pathId: 'Instruction-[4-0]-1', data: this.Rd },
            { pathId: 'Instruction-[31-0]', data: instruction },
            { pathId: 'Instruction-[31-21]-1', data: this.opcode },
        ];

        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);

        const controlUnit = new ControlUnit(this.opcode);

        const controlPathAndData = [
            { pathId: 'control-reg-loc', data: controlUnit.getControlSignals().Reg2Loc },
            { pathId: 'control-uncond-branch', data: controlUnit.getControlSignals().UncondBranch },
            { pathId: 'control-mem-read', data: controlUnit.getControlSignals().MemRead },
            { pathId: 'control-mem-reg', data: controlUnit.getControlSignals().MemtoReg },
            { pathId: 'control-ALU-op', data: controlUnit.getControlSignals().ALUOp1 + controlUnit.getControlSignals().ALUOp0 },
            { pathId: 'control-mem-write', data: controlUnit.getControlSignals().MemWrite },
            { pathId: 'control-ALU-src', data: controlUnit.getControlSignals().ALUSrc },
            { pathId: 'control-reg-write', data: controlUnit.getControlSignals().RegWrite },
            { pathId: 'control-branch', data: controlUnit.getControlSignals().Branch },
        ];
        const allControlRuns = controlPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allControlRuns);
        const muxToRegister = [
            { pathId: 'mux-read-res-2', data: this.Rm },  // 20-16 bits
        ];
        await Promise.all(muxToRegister.map(({ pathId, data }) => run(data, pathId)));
    }

    async execute() {
        const register1_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rn));
        const register2_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rm));
        const register1_decimal = LEGv8Registers.binaryToBigInt(registers.readByBinary(this.Rn));
        const register2_decimal = LEGv8Registers.binaryToBigInt(registers.readByBinary(this.Rm));

        const controlUnit = new ControlUnit(this.opcode);
        const aluControl = getAluControl(
            controlUnit.getControlSignals().ALUOp1,
            controlUnit.getControlSignals().ALUOp0,
            this.opcode
        );
        
        const newRegisterValue = {
            '0010': register1_decimal + register2_decimal, // ADD
            '0110': register1_decimal - register2_decimal, // SUB
            '0000': register1_decimal & register2_decimal, // AND
            '0001': register1_decimal | register2_decimal, // ORR
        }
        const newRegister_bin = LEGv8Registers.valueTo64BitBinary(newRegisterValue[aluControl]);
        registers.writeByBinary(this.Rd, newRegister_bin); // 4-0 bits

        const pathAndData = [
            { pathId: 'read-1-alu', data: register1_hexan },
            { pathId: 'read-data-2-mux', data: register2_hexan },
            { pathId: 'ALU-control-ALU', data: aluControl },
            { pathId: 'Sign-extend-mux', data: 0 }, // 4-0 bits
            { pathId: 'Sign-extend-shift', data: 0 }, // 4-0 bits
        ]
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);

        const anotherPathAndData = [
            { pathId: 'shift-add-alu', data: 0 }, // 9-5 bits
            { pathId: 'mux-alu', data: register2_hexan}, // 20-16 bits
        ];

        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
    }

    async memoryAccess() {
        const add4Address = add4ToHexAddress(this.address); // 4-0 bits
        const register2_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rm));
        const newRegister_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd)); // 4-0 bits
        const pathAndData = [
            { pathId: 'read-data-2-write-data', data: register2_hexan }, // 20-16 bits
            { pathId: 'ALU-mux', data: newRegister_hexan }, // 4-0 bits
            { pathId: 'ALU-address', data: newRegister_hexan }, // 4-0 bits !!!!
            { pathId: 'alu-add-4-mux', data: add4Address }, // 4-0 bits  !!! 
            { pathId: 'ALU-add-mux', data: this.address }, // 4-0 bits
            { pathId: 'ALU-and-gate', data: 0 }, // 4-0 bits

        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
        
        // This is the part where read adress register in memory
        const anotherPathAndData = [
            { pathId: 'read-data-mux', data: newRegister_hexan }, // 4-0 bits  !!!!! 
            { pathId: 'and-gate-or-gate', data: 0 },
        ];
        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);

        const orToMux = [
            { pathId: 'or-gate-mux', data: 0 }, // 4-0 bits
        ];
        const orRuns = orToMux.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(orRuns);
    }

    async registerWrite() {
        const newRegisterValue_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd));
        const pathAndData = [
            { pathId: 'mux-write-data', data: newRegisterValue_hexan }, 
            { pathId: 'ALU-back-PC', data: add4ToHexAddress(this.address) }, 
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }
}

const rformat = new RFormat('10001011000', '01010', '000000', '01001', '01000', '0x40000000');
const iformat = new IFormat('1001000100', '0101', '01001', '01010', '0x40000000');
const dformat = new Load('11111000010', '0', '00', '01001', '01010','0x40000000');
const d1format = new Store('11111000000', '0', '00', '01001', '01010','0x40000000');

const memory = new MemoryStorage();
const registers = new LEGv8Registers();

registers.writeByBinary('01001', '0101'); // X9 = 5
registers.writeByBinary('01010', '011'); // X10 = 3
memory.writeDoubleWord(5, BigInt(10)); // Memory[5] = 10
// Example usage
// startBtn.onclick = async () => {
//     console.log(registers.readByBinary('01001')); // X9 = 5
//     console.log(registers.readByBinary('01010')); // X10 = 3
//     console.log(LEGv8Registers.binaryToBigInt(registers.readByBinary('01001'))); // X9 = 5
//     console.log(LEGv8Registers.binaryToBigInt(registers.readByBinary('01010'))); // X10 = 3
//     console.log(LEGv8Registers.binaryToHex(registers.readByBinary('01001'))); // X9 = 5
//     console.log(LEGv8Registers.binaryToHex(registers.readByBinary('01010'))); // X10 = 3
//     resetBtn.click(); // Reset trước khi bắt đầu
//     running = true;
//     await rformat.instructionFetch();
//     await rformat.instructionDecode();
//     await rformat.execute();
//     await rformat.memoryAccess();
//     await rformat.registerWrite();
// }

// startBtn.onclick = async () => {
//     resetBtn.click(); // Reset trước khi bắt đầu
//     running = true;
//     await iformat.instructionFetch();
//     await iformat.instructionDecode();
//     await iformat.execute();
//     await iformat.memoryAccess();
//     await iformat.registerWrite();

// }

startBtn.onclick = async () => {
    resetBtn.click(); // Reset trước khi bắt đầu
    running = true;
    await dformat.instructionFetch();
    await dformat.instructionDecode();
    await dformat.execute();
    await dformat.memoryAccess();
    await dformat.registerWrite();
    // console.log(memory.readDoubleWord(5)); //  = 3
    console.log(registers.readByBinary('01010')); // = 5
    
}


// startBtn.onclick = async () => {
//     resetBtn.click(); // Reset trước khi bắt đầu
//     running = true;
//     await d1format.instructionFetch();
//     await d1format.instructionDecode();
//     await d1format.execute();
//     await d1format.memoryAccess();
//     await d1format.registerWrite();
//     console.log(memory.readDoubleWord(5)); //  = 3
//     // console.log(registers.readByBinary('01010')); // = 5
    
// }