class IFormat {
    constructor(opcode, immmediate, Rn, Rd, address){
        this.opcode = opcode; // 11 bits
        this.immediate = immmediate; // 12 bits
        this.Rn = Rn;         // 5 bits
        this.Rd = Rd;         // 5 bits
        this.address = address; // Address in hexadecimal format
    }

    async instructionFetch(){
        const instruction = this.opcode + this.Rn + this.immediate + this.Rd; // Concatenate all parts to form the instruction
        const pathAndData = [
            { pathId: 'pc-alu', data: this.address }, 
            { pathId: 'pc-add-4', data: this.address}, 
            { pathId: 'pc-ins-mem', data: instruction}, 
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }

    async instructionDecode() {
        const controlUnit = new ControlUnit(this.opcode);
        const instruction = this.opcode + this.Rn + this.immediate + this.Rd; // Concatenate all parts to form the instruction
        const instruction20_16 = instruction.substring(16, 20)       // 20-16 bits
    
        const pathAndData = [
            { pathId: 'Instruction-[31-21]', data: this.opcode},
            { pathId: 'Instruction-[9-5]', data: this.Rn},
            { pathId: 'Instruction-[20-16]', data: instruction20_16},
            { pathId: 'Instruction-[4-0]', data: this.Rd},
            { pathId: 'Instruction-[4-0]-1', data: this.Rd},
            { pathId: 'Instruction-[31-0]', data: instruction},
            { pathId: 'Instruction-[31-21]-1', data: this.opcode},
        ];

        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));

        await Promise.all(allRuns);
        // Control signals 
        const controlPathAndData = [
            { pathId: 'control-reg-loc', data: controlUnit.getControlSignals().Reg2Loc},
            { pathId: 'control-uncond-branch', data: controlUnit.getControlSignals().UncondBranch},
            { pathId: 'control-mem-read', data: controlUnit.getControlSignals().MemRead},
            { pathId: 'control-mem-reg', data: controlUnit.getControlSignals().MemtoReg},
            { pathId: 'control-ALU-op', data: controlUnit.getControlSignals().ALUOp1 + controlUnit.getControlSignals().ALUOp0},
            { pathId: 'control-mem-write', data: controlUnit.getControlSignals().MemWrite},
            { pathId: 'control-ALU-src', data: controlUnit.getControlSignals().ALUSrc},
            { pathId: 'control-reg-write', data: controlUnit.getControlSignals().RegWrite},
            { pathId: 'control-branch', data: controlUnit.getControlSignals().Branch},
        ];
        const allControlRuns = controlPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allControlRuns);
        const muxToRegister = [
            { pathId: 'mux-read-res-2', data: instruction20_16},  // 20-16 bits
        ];
        await Promise.all(muxToRegister.map(({ pathId, data }) => run(data, pathId)));
    }   

    async execute() {
        const instruction = this.opcode + this.Rn + this.immediate + this.Rd; // Concatenate all parts to form the instruction
        const register1_hexan= LEGv8Registers.binaryToHex(registers.readByBinary(this.Rn)); // 9-5 bits
        const register2_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(instruction.substring(16, 20)));
        const extendImmediate_hexan = LEGv8Registers.binaryToHex(LEGv8Registers.signExtend(this.immediate)); // 20-16 bits

        // Control Unit  !!!! 
        const controlUnit = new ControlUnit(this.opcode);
        
        const aluControl = getAluControl(
            controlUnit.getControlSignals().ALUOp1, 
            controlUnit.getControlSignals().ALUOp0,
            this.opcode
        );

        const register1_decimal = LEGv8Registers.binaryToBigInt(registers.readByBinary(this.Rn)); 
        const immediate_decimal = LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.immediate));
        const newRegisterValue = {
            '0010': register1_decimal + immediate_decimal, // ADD
            '0110': register1_decimal - immediate_decimal, // SUB
            '0000': register1_decimal & immediate_decimal, // AND
            '0001': register1_decimal | immediate_decimal, // ORR
        }
        const newRegister_bin = LEGv8Registers.valueTo64BitBinary(newRegisterValue[aluControl] || 0);
        registers.writeByBinary(this.Rd, newRegister_bin); // Write the result to the destination register

        const pathAndData = [
            { pathId: 'read-1-alu', data: register1_hexan },
            { pathId: 'read-data-2-mux', data: register2_hexan },
            { pathId: 'ALU-control-ALU', data: aluControl},         // fix alu control
            { pathId: 'Sign-extend-mux', data: extendImmediate_hexan }, // 4-0 bits
            { pathId: 'Sign-extend-shift', data: extendImmediate_hexan }, // 4-0 bits
        ]
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
        const immediateShifted_bin = LEGv8Registers.valueTo64BitBinary(LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.immediate)) << BigInt(2));
        const immediateShifted_hexan = LEGv8Registers.binaryToHex(immediateShifted_bin); // Shift left by 2 bits
        const anotherPathAndData = [
            { pathId: 'shift-add-alu', data: immediateShifted_hexan }, // 9-5 bits
            { pathId: 'mux-alu', data: register2_hexan}, // 20-16 bits
        ];

        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
        
    }
    async memoryAccess() {
        const instruction = this.opcode + this.Rn + this.immediate + this.Rd; // Concatenate all parts to form the instruction
        const add4Address = add4ToHexAddress(this.address);
        const register1_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rn)); // 9-5 bits
        const register2_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(instruction.substring(16, 20))); // 20-16 bits
        const newRegisterValue_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd)); // 4-0 bits
        const immediateShifted_bin = LEGv8Registers.valueTo64BitBinary(LEGv8Registers.binaryToBigInt(this.immediate) << BigInt(2));
        const immediateShifted_hexan = LEGv8Registers.binaryToHex(immediateShifted_bin); // Shift left by 2 bits

        const pathAndData = [
            { pathId: 'read-data-2-write-data', data: register2_hexan}, 
            { pathId: 'ALU-mux', data: newRegisterValue_hexan }, // 4-0 bits
            { pathId: 'ALU-address', data: newRegisterValue_hexan }, // 4-0 bits !!!!
            { pathId: 'alu-add-4-mux', data: add4Address }, // 4-0 bits  !!! 
            { pathId: 'ALU-add-mux', data: addHexStrings(this.address, immediateShifted_hexan)}, // 4-0 bits
            { pathId: 'ALU-and-gate', data: 0 }, // 4-0 bits

        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);

        // This is the part where read address register in memory
        const anotherPathAndData = [
            { pathId: 'read-data-mux', data: newRegisterValue_hexan }, // 4-0 bits  !!!!! 
            { pathId: 'and-gate-or-gate', data: 0 }, 
        ];
        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
        const orToMux = [
            { pathId: 'or-gate-mux', data: 0}, // 4-0 bits
        ];
        const orRuns = orToMux.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(orRuns);
    }
    async registerWrite() {
        const newRegister_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd)); // 4-0 bits
        const pathAndData = [
            { pathId: 'mux-write-data', data: newRegister_hexan }, // 4-0 bits
            { pathId: 'ALU-back-PC', data: add4ToHexAddress(this.address)}, // 4-0 bits
            // { pathId: 'write-data-alu-1', data: this.Rd } // 4-0 bits
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }
    
}