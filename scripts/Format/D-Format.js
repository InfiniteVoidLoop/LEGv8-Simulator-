class Load {
    constructor(DFormatInstruction, PC){
        this.opcode = toExactBinary(DFormatInstruction.definition.opcode, 11); // 11 bits
        this.address = toExactBinary(DFormatInstruction.address, 9); // 9 bits
        this.op2 = "00";
        this.Rn = toExactBinary(DFormatInstruction.rn, 5); // 5 bits
        this.Rd = toExactBinary(DFormatInstruction.rt, 5); // 5 bits
        this.address_instruction = LEGv8Registers.binaryToHex(LEGv8Registers.valueTo64BitBinary(PC.getCurrentAddress())); // Program Counter address
 // Address in hexadecimal format

        // ALU CONTROL
        this.aluControl = toExactBinary(DFormatInstruction.definition.controlSignals.operation, 4); // Placeholder for ALU control, will be set in execute method
        this.controlSignals = {
            Reg2Loc: DFormatInstruction.definition.controlSignals.reg2Loc,
            UncondBranch: DFormatInstruction.definition.controlSignals.uncondBranch,
            MemRead: DFormatInstruction.definition.controlSignals.memRead,
            MemtoReg: DFormatInstruction.definition.controlSignals.memToReg,
            ALUOp1: LEGv8Registers.valueTo64BitBinary(DFormatInstruction.definition.controlSignals.aluOp)[1],
            ALUOp0: String(DFormatInstruction.definition.controlSignals.aluOp % 2),
            MemWrite: DFormatInstruction.definition.controlSignals.memWrite,
            ALUSrc: DFormatInstruction.definition.controlSignals.aluSrc,
            RegWrite: DFormatInstruction.definition.controlSignals.regWrite,
            Branch: DFormatInstruction.definition.controlSignals.flagBranch,
        }
    }

    async instructionFetch(){
        const instruction = this.opcode + this.Rn + this.address + this.Rd; // Concatenate all parts to form the instruction
        const pathAndData = [
            { pathId: 'pc-alu', data: this.address_instruction }, 
            { pathId: 'pc-add-4', data: this.address_instruction}, 
            { pathId: 'pc-ins-mem', data: instruction}, 
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }

    async instructionDecode() {
        const instruction = this.opcode + this.Rn + this.address + this.Rd; // Concatenate all parts to form the instruction
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
            { pathId: 'mux-read-res-2', data: instruction20_16},  // 20-16 bits
        ];
        await Promise.all(muxToRegister.map(({ pathId, data }) => run(data, pathId)));
    }   

    async execute() {
        const instruction = this.opcode + this.Rn + this.address + this.Rd; // Concatenate all parts to form the instruction
        const register1_hexan= LEGv8Registers.binaryToHex(registers.readByBinary(this.Rn)); // 9-5 bits
        const register2_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(instruction.substring(16, 20)));
        const extendAddress_hexan = LEGv8Registers.binaryToHex(LEGv8Registers.signExtend(this.address)); 

        // Control Unit  !!!! 

        const pathAndData = [
            { pathId: 'read-1-alu', data: register1_hexan },
            { pathId: 'read-data-2-mux', data: register2_hexan },
            { pathId: 'ALU-control-ALU', data: this.aluControl},         // fix alu control
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
        const instruction = this.opcode + this.Rn + this.address + this.Rd; // Concatenate all parts to form the instruction
        const add4Address = add4ToHexAddress(this.address);
        const register2_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(instruction.substring(16, 20))); // 20-16 bits


        const addressShifted_bin = LEGv8Registers.valueTo64BitBinary(LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.address)) << BigInt(2));
        const addressShifted_hexan = LEGv8Registers.binaryToHex(addressShifted_bin); // Shift left by 2 bits

        const register1_decimal = LEGv8Registers.binaryToBigInt(registers.readByBinary(this.Rn)); 
        const address_decimal = LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.address));

        const newRegisterValue = {
            '0010': register1_decimal + address_decimal, // ADD
            '0110': register1_decimal - address_decimal, // SUB
            '0000': register1_decimal & address_decimal, // AND
            '0001': register1_decimal | address_decimal, // ORR
        }
        // load value Rd to memory
        const memoryAddress_bin = LEGv8Registers.valueTo64BitBinary(newRegisterValue[this.aluControl] || 0);
        const memoryAddress_dec = LEGv8Registers.binaryToBigInt(memoryAddress_bin);
        const memoryAddress_hexan = LEGv8Registers.binaryToHex(memoryAddress_bin); // 4-0 bits
        const registerSource_decimal = memory.readDoubleWord(memoryAddress_dec); // Read the value from memory
        registers.writeByBinary(this.Rd, LEGv8Registers.valueTo64BitBinary(registerSource_decimal)); // Write the value to the destination register
        const newRegisterValue_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd)); // 4-0 bits

        const pathAndData = [
            { pathId: 'read-data-2-write-data', data: register2_hexan}, 
            { pathId: 'ALU-mux', data: memoryAddress_hexan}, // 4-0 bits
            { pathId: 'ALU-address', data: memoryAddress_hexan}, // 4-0 bits !!!!
            { pathId: 'alu-add-4-mux', data: add4Address }, // 4-0 bits  !!! 
            { pathId: 'ALU-add-mux', data: addHexStrings(this.address_instruction, addressShifted_hexan)}, // 4-0 bits
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
        const memoryValue_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd)); // 4-0 bits
        const pathAndData = [
            { pathId: 'mux-write-data', data: memoryValue_hexan }, // 4-0 bits
            { pathId: 'ALU-back-PC', data: add4ToHexAddress(this.address)}, // 4-0 bits
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

class Store {
     constructor(DFormatInstruction, PC){
        this.opcode = toExactBinary(DFormatInstruction.definition.opcode, 11); // 11 bits
        this.address = toExactBinary(DFormatInstruction.address, 9); // 9 bits
        this.op2 = "00"
        this.Rn = toExactBinary(DFormatInstruction.rn, 5); // 5 bits
        this.Rd = toExactBinary(DFormatInstruction.rt, 5); // 5 bits
        this.address_instruction = LEGv8Registers.binaryToHex(LEGv8Registers.valueTo64BitBinary(PC.getCurrentAddress())); // Program Counter address

        // ALU CONTROL
        this.aluControl = toExactBinary(DFormatInstruction.definition.controlSignals.operation, 4); // Placeholder for ALU control, will be set in execute method
        this.controlSignals = {
            Reg2Loc: DFormatInstruction.definition.controlSignals.reg2Loc,
            UncondBranch: DFormatInstruction.definition.controlSignals.uncondBranch,
            MemRead: DFormatInstruction.definition.controlSignals.memRead,
            MemtoReg: DFormatInstruction.definition.controlSignals.memToReg,
            ALUOp1: LEGv8Registers.valueTo64BitBinary(DFormatInstruction.definition.controlSignals.aluOp)[1],
            ALUOp0: String(DFormatInstruction.definition.controlSignals.aluOp % 2),
            MemWrite: DFormatInstruction.definition.controlSignals.memWrite,
            ALUSrc: DFormatInstruction.definition.controlSignals.aluSrc,
            RegWrite: DFormatInstruction.definition.controlSignals.regWrite,
            Branch: DFormatInstruction.definition.controlSignals.flagBranch,
        }
    }

    async instructionFetch(){
        const instruction = this.opcode + this.Rn + this.address + this.Rd; // Concatenate all parts to form the instruction
        const pathAndData = [
            { pathId: 'pc-alu', data: this.address_instruction }, 
            { pathId: 'pc-add-4', data: this.address_instruction}, 
            { pathId: 'pc-ins-mem', data: instruction}, 
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }

    async instructionDecode() {
        const instruction = this.opcode + this.Rn + this.address + this.Rd; // Concatenate all parts to form the instruction
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
        const instruction = this.opcode + this.Rn + this.address + this.Rd; // Concatenate all parts to form the instruction
        const register1_hexan= LEGv8Registers.binaryToHex(registers.readByBinary(this.Rn)); // 9-5 bits
        const register2_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd));
        const extendAddress_hexan = LEGv8Registers.binaryToHex(LEGv8Registers.signExtend(this.address)); 

        const pathAndData = [
            { pathId: 'read-1-alu', data: register1_hexan },
            { pathId: 'read-data-2-mux', data: register2_hexan },
            { pathId: 'ALU-control-ALU', data: this.aluControl},         // fix alu control
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
        const instruction = this.opcode + this.Rn + this.address + this.Rd; // Concatenate all parts to form the instruction
        const add4Address = add4ToHexAddress(this.address);
        const register2_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(instruction.substring(16, 20))); // 20-16 bits


        const addressShifted_bin = LEGv8Registers.valueTo64BitBinary(LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.address)) << BigInt(2));
        const addressShifted_hexan = LEGv8Registers.binaryToHex(addressShifted_bin); // Shift left by 2 bits

        const register1_decimal = LEGv8Registers.binaryToBigInt(registers.readByBinary(this.Rn)); 
        const address_decimal = LEGv8Registers.binaryToBigInt(LEGv8Registers.signExtend(this.address));
        const newRegisterValue = {
            '0010': register1_decimal + address_decimal, // ADD
            '0110': register1_decimal - address_decimal, // SUB
            '0000': register1_decimal & address_decimal, // AND
            '0001': register1_decimal | address_decimal, // ORR
        }
        // load value Rd to memory
        const memoryAddress_bin = LEGv8Registers.valueTo64BitBinary(newRegisterValue[this.aluControl] || 0);
        const memoryAddress_dec = LEGv8Registers.binaryToBigInt(memoryAddress_bin);
        const memoryAddress_hexan = LEGv8Registers.binaryToHex(memoryAddress_bin); // 4-0 bits

        
        const registerSource_decimal = LEGv8Registers.binaryToBigInt(registers.readByBinary(this.Rd)); // Read the value from the source register
        console.log("Register Source Decimal:", registerSource_decimal);
        console.log("Memory Address Decimal:", memoryAddress_dec);
        memory.writeDoubleWord(memoryAddress_dec, registerSource_decimal); 


        const newRegisterValue_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd)); // 4-0 bits

        const pathAndData = [
            { pathId: 'read-data-2-write-data', data: register2_hexan}, 
            { pathId: 'ALU-mux', data: memoryAddress_hexan }, // 4-0 bits
            { pathId: 'ALU-address', data: memoryAddress_hexan}, // 4-0 bits !!!!
            { pathId: 'alu-add-4-mux', data: add4Address }, // 4-0 bits  !!! 
            { pathId: 'ALU-add-mux', data: addHexStrings(this.address_instruction, addressShifted_hexan)}, // 4-0 bits
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
        const memoryValue_hexan = LEGv8Registers.binaryToHex(registers.readByBinary(this.Rd)); // 4-0 bits
        const pathAndData = [
            { pathId: 'mux-write-data', data: memoryValue_hexan }, // 4-0 bits
            { pathId: 'ALU-back-PC', data: add4ToHexAddress(this.address)}, // 4-0 bits
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
