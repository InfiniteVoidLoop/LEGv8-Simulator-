class BFormat {
    constructor(BFormatInstruction, PC){
        this.opcode = toExactBinary(BFormatInstruction.definition.opcode, 6); // 8 bits
        this.address = toExactBinary(BFormatInstruction.addressOffset, 26); // 9 bits
        this.address_instruction = LEGv8Registers.binaryToHex(LEGv8Registers.valueTo64BitBinary(PC.getCurrentAddress())); // Program Counter address
 // Address in hexadecimal format

        // ALU CONTROL
        this.aluControl = toExactBinary(BFormatInstruction.definition.controlSignals.operation, 4); // Placeholder for ALU control, will be set in execute method
        this.controlSignals = {
            Reg2Loc: BFormatInstruction.definition.controlSignals.reg2Loc,
            UncondBranch: BFormatInstruction.definition.controlSignals.uncondBranch,
            MemRead: BFormatInstruction.definition.controlSignals.memRead,
            MemtoReg: BFormatInstruction.definition.controlSignals.memToReg,
            ALUOp1: LEGv8Registers.valueTo64BitBinary(BFormatInstruction.definition.controlSignals.aluOp)[1],
            ALUOp0: String(BFormatInstruction.definition.controlSignals.aluOp % 2),
            MemWrite: BFormatInstruction.definition.controlSignals.memWrite,
            ALUSrc: BFormatInstruction.definition.controlSignals.aluSrc,
            RegWrite: BFormatInstruction.definition.controlSignals.regWrite,
            Branch: BFormatInstruction.definition.controlSignals.flagBranch,
        }
    }

    async instructionFetch(){
        const instruction = this.opcode + this.address;
        const pathAndData = [
            { pathId: 'pc-alu', data: this.address_instruction }, 
            { pathId: 'pc-add-4', data: this.address_instruction}, 
            { pathId: 'pc-ins-mem', data: instruction}, 
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }

    async instructionDecode() {
        const instruction = this.opcode + this.address; // Concatenate all parts to form the instruction
        const instruction20_16 = instruction.substring(16, 20);       // 20-16 bits
        const pathAndData = [
            { pathId: 'Instruction-[31-21]', data: this.opcode},
            { pathId: 'Instruction-[9-5]', data: 0},
            { pathId: 'Instruction-[20-16]', data: instruction20_16},
            { pathId: 'Instruction-[4-0]', data: 0},
            { pathId: 'Instruction-[4-0]-1', data: this.Rd},
            { pathId: 'Instruction-[31-0]', data: instruction},
            { pathId: 'Instruction-[31-21]-1', data: this.opcode},
        ];

        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);

        // Control signals 
        const controlPathAndData = [
            { pathId: 'control-reg-loc', data: this.controlSignals.Reg2Loc },
            { pathId: 'control-uncond-branch', data: this.controlSignals.UncondBranch },
            { pathId: 'control-mem-read', data: this.controlSignals.MemRead },
            { pathId: 'control-mem-reg', data: this.controlSignals.MemtoReg },
            { pathId: 'control-ALU-op', data: this.controlSignals.ALUOp1 + this.controlSignals.ALUOp0 },
            { pathId: 'control-mem-write', data: this.controlSignals.MemWrite },
            { pathId: 'control-ALU-src', data: this.controlSignals.ALUSrc },
            { pathId: 'control-reg-write', data: this.controlSignals.RegWrite },
            { pathId: 'control-branch', data: this.controlSignals.Branch },
        ];
        const allControlRuns = controlPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allControlRuns);
       
        const muxToRegister = [
            { pathId: 'mux-read-res-2', data: this.Rd},  // 20-16 bits
        ];
        await Promise.all(muxToRegister.map(({ pathId, data }) => run(data, pathId)));
    }   

    async execute() {
        const instruction = this.opcode + this.address; // Concatenate all parts to form the instruction

        const extendAddress_hexan = LEGv8Registers.binaryToHex(LEGv8Registers.signExtend(this.address)); 

        const pathAndData = [
            { pathId: 'read-1-alu', data: 0 },
            { pathId: 'read-data-2-mux', data: 0 },
            { pathId: 'ALU-control-ALU', data: this.aluControl},         
            { pathId: 'Sign-extend-mux', data: extendAddress_hexan }, 
            { pathId: 'Sign-extend-shift', data: extendAddress_hexan }, 
        ]
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
       
        const addressShifted_bin = LEGv8Registers.valueTo64BitBinary(LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.address)) << BigInt(2));
        const addressShifted_hexan = LEGv8Registers.binaryToHex(addressShifted_bin); // Shift left by 2 bits
        const anotherPathAndData = [
            { pathId: 'shift-add-alu', data: addressShifted_hexan }, // 9-5 bits
            { pathId: 'mux-alu', data: extendAddress_hexan}, // 20-16 bits
        ];

        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
        
    }

    async memoryAccess() {
        const instruction = this.opcode + this.address; // Concatenate all parts to form the instruction
        const add4Address = add4ToHexAddress(this.address);

        const addressShifted_bin = LEGv8Registers.valueTo64BitBinary(LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.address)) << BigInt(2));
        const addressShifted_hexan = LEGv8Registers.binaryToHex(addressShifted_bin); // Shift left by 2 bits

        const pathAndData = [
            { pathId: 'read-data-2-write-data', data: 0}, 
            { pathId: 'ALU-mux', data: 0}, // 4-0 bits
            { pathId: 'ALU-address', data: 0}, // 4-0 bits !!!!
            { pathId: 'alu-add-4-mux', data: add4Address }, // 4-0 bits  !!! 
            { pathId: 'ALU-add-mux', data: addHexStrings(this.address_instruction, addressShifted_hexan)}, // 4-0 bits
            { pathId: 'ALU-and-gate', data:  0}, // 4-0 bits

        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);

        // This is the part where read address register in memory
        const anotherPathAndData = [
            { pathId: 'read-data-mux', data: 0 }, // 4-0 bits  !!!!! 
            { pathId: 'and-gate-or-gate', data: 0 }, 
        ];
        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
        const orToMux = [
            { pathId: 'or-gate-mux', data: 1}, // 4-0 bits
        ];
        const orRuns = orToMux.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(orRuns);
    }

    async registerWrite() {
        const addressShifted_bin = LEGv8Registers.valueTo64BitBinary(LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.address)) << BigInt(2));
        const addressShifted_hexan = LEGv8Registers.binaryToHex(addressShifted_bin); // Shift left by 2 bits
        const backAddress = addHexStrings(this.address_instruction, addressShifted_hexan); // 4-0 bits
        const pathAndData = [
            { pathId: 'mux-write-data', data: 0 }, // 4-0 bits
            { pathId: 'ALU-back-PC', data: backAddress}, // 4-0 bits
            // { pathId: 'write-data-alu-1', data: this.Rd } // 4-0 bits
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }
    async run() {
        await this.instructionFetch();
        await this.instructionDecode();
        await this.execute();
        await this.memoryAccess();
        await this.registerWrite();
    }
}