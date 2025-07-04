var cbzEqualZero;   // Variable to store the result of CBZ/CBNZ condition check
class CBFormat {
    constructor(CBFormatInstruction, PC) {
        this.bcond = CBFormatInstruction.definition.getMnemonic();
        this.opcode = toExactBinary(CBFormatInstruction.definition.opcode, 8); // 8 bits
        this.address = toExactBinary(CBFormatInstruction.addressOffset, 19); // 9 bits
        this.Rd = toExactBinary(CBFormatInstruction.rt, 5); // 5 bits
        this.address_instruction = LEGv8Registers.binaryToHex(
            LEGv8Registers.valueTo64BitBinary(PC.getCurrentAddress())
        );

        this.aluControl = toExactBinary(
            CBFormatInstruction.definition.controlSignals.operation,
            4
        ); // Placeholder for ALU control, will be set in execute method
        this.controlSignals = getControlSignals(CBFormatInstruction);
        this.lineNumber = CBFormatInstruction.lineNumber; // Line number for debugging
        this.controlSignals.FlagBranch = 1;
    }

    async instructionFetch() {
        const instruction = this.opcode + this.address + this.Rd;
        const pathAndData = [
            { pathId: "pc-alu", data: this.address_instruction },
            { pathId: "pc-add-4", data: this.address_instruction },
            { pathId: "pc-ins-mem", data: instruction },
        ];
        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);
    }

    async instructionDecode() {
        const instruction = this.opcode + this.address + this.Rd; // Concatenate all parts to form the instruction
        const instruction20_16 = getBits(instruction, 16, 20); // 20-16 bits
        const instruction9_5 = getBits(instruction, 5, 9); // 9-5 bits
        const pathAndData = [
            { pathId: "Instruction-[31-21]", data: this.opcode },
            { pathId: "Instruction-[9-5]", data: instruction9_5 },
            { pathId: "Instruction-[20-16]", data: instruction20_16 },
            { pathId: "Instruction-[4-0]", data: this.Rd },
            { pathId: "Instruction-[4-0]-1", data: this.Rd },
            { pathId: "Instruction-[31-0]", data: instruction },
            { pathId: "Instruction-[31-21]-1", data: this.opcode },
        ];

        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);

        // Control signals
        const controlPathAndData = [
            { pathId: "control-reg-loc", data: this.controlSignals.Reg2Loc },
            {
                pathId: "control-uncond-branch",
                data: this.controlSignals.UncondBranch,
            },
            { pathId: "control-mem-read", data: this.controlSignals.MemRead },
            { pathId: "control-mem-reg", data: this.controlSignals.MemtoReg },
            {
                pathId: "control-ALU-op",
                data: this.controlSignals.ALUOp1 + this.controlSignals.ALUOp0,
            },
            { pathId: "control-flag-branch", data: this.controlSignals.FlagBranch },
            { pathId: "control-mem-write", data: this.controlSignals.MemWrite },
            { pathId: "control-ALU-src", data: this.controlSignals.ALUSrc },
            { pathId: "control-reg-write", data: this.controlSignals.RegWrite },
            { pathId: "control-branch", data: this.controlSignals.Branch },
            { pathId: "control-flag-write", data: this.controlSignals.FlagWrite },
        ];
        const allControlRuns = controlPathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allControlRuns);
        controlUnitDisplay(this.controlSignals, 1); // Display control signals
        document.getElementById("mux0_1").style.color = "#007BFF";
        document.getElementById("mux1_0").style.color = "#007BFF";
        document.getElementById("mux3_0").style.color = "#007BFF";
        document.getElementById('mux-0').style.background = 'linear-gradient(to bottom, #acb1b3 50%, red 50%)';
        document.getElementById('mux-1').style.background = 'linear-gradient(to bottom, red 50%, #acb1b3 50%)';
        document.getElementById('mux-3').style.background = 'linear-gradient(to bottom, #acb1b3 50%, red 50%)';

        const muxToRegister = [
            { pathId: "mux-read-res-2", data: this.Rd }, // 20-16 bits
        ];
        await Promise.all(
            muxToRegister.map(({ pathId, data }) => run(data, pathId))
        );
    }

    async execute() {
        const instruction = this.opcode + this.address + this.Rd;
        const instruction9_5 = getBits(instruction, 5, 9); // 9-5 bits
        const register2_hexan = LEGv8Registers.binaryToHex(
            registers.readByBinary(this.Rd)
        );
        const extendAddress_hexan = LEGv8Registers.binaryToHex(
            LEGv8Registers.signExtend(this.address)
        );

        const pathAndData = [
            { pathId: "read-1-alu", data: instruction9_5 }, // 9-5 bits
            { pathId: "read-data-2-mux", data: register2_hexan },
            { pathId: "ALU-control-ALU", data: this.aluControl },
            { pathId: "Sign-extend-mux", data: extendAddress_hexan },
            { pathId: "Sign-extend-shift", data: extendAddress_hexan },
        ];
        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);

        const addressShifted_bin = LEGv8Registers.valueTo64BitBinary(
            LEGv8Registers.binaryToBigInt(
                LEGv8Registers.signExtend(this.address)
            ) << BigInt(2)
        );
        const addressShifted_hexan =
            LEGv8Registers.binaryToHex(addressShifted_bin); // Shift left by 2 bits
        const anotherPathAndData = [
            { pathId: "shift-add-alu", data: addressShifted_hexan }, // 9-5 bits
            { pathId: "mux-alu", data: extendAddress_hexan },
        ];

        const anotherRuns = anotherPathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(anotherRuns);
    }

    async memoryAccess() {
        const add4Address = add4ToHexAddress(this.address_instruction);
        const register2_hexan = LEGv8Registers.binaryToHex(
            registers.readByBinary(this.Rd)
        );

        const addressShifted_bin = LEGv8Registers.valueTo64BitBinary(
            LEGv8Registers.binaryToBigInt(
                LEGv8Registers.signExtend(this.address)
            ) << BigInt(2)
        );

        const addressShifted_hexan =
            LEGv8Registers.binaryToHex(addressShifted_bin); // Shift left by 2 bits
        const addressShifted_decimal = Number(
            LEGv8Registers.binaryToBigInt(addressShifted_bin)
        );

        if (this.opcode === "10110100") { // Check if the opcode is for CBZ
            // CBZ instruction
            cbzEqualZero =
                LEGv8Registers.binaryToBigInt(registers.readByBinary(this.Rd)) ===
                    BigInt(0) ? 1 : 0; // Check if the register value is zero
        }
        else if (this.opcode === "10110101") { // Check if the opcode is for CBNZ
            // CBNZ instruction
            cbzEqualZero =
                LEGv8Registers.binaryToBigInt(registers.readByBinary(this.Rd)) !==
                    BigInt(0) ? 1 : 0; // Check if the register value is not zero
        }
        else if (this.bcond == "B.EQ") {
            cbzEqualZero = (pstate.Z == 1) ? 1 : 0; // Check if Z flag is set
        }
        else if (this.bcond == "B.NE") {
            cbzEqualZero = (pstate.Z == 0) ? 1 : 0;
        }
        else if (this.bcond == "B.LT") {
            cbzEqualZero = (pstate.N != pstate.V) ? 1 : 0; // Check if N and V flags are different
        }
        else if (this.bcond == "B.LE") {
            cbzEqualZero = (pstate.Z == 1 || pstate.N != pstate.V) ? 1 : 0; // Check if Z flag is set or N and V flags are different
        }
        else if (this.bcond == "B.GT") {
            cbzEqualZero = (pstate.Z == 0 && pstate.N == pstate.V) ? 1 : 0; // Check if Z flag is not set and N and V flags are equal
        }
        else if (this.bcond == "B.GE") {
            cbzEqualZero = (pstate.N == pstate.V) ? 1 : 0; // Check if N and V flags are equal
        }
        else if (this.bcond == "B.LO") {
            cbzEqualZero = (pstate.C == 0) ? 1 : 0; // Check if C flag is not set
        }
        else if (this.bcond == "B.LS") {
            cbzEqualZero = (pstate.Z == 1 || pstate.C == 0) ? 1 : 0; // Check if Z flag is set or C flag is not set
        }
        else if (this.bcond == "B.HI") {
            cbzEqualZero = (pstate.Z == 0 && pstate.C == 1) ? 1 : 0; // Check if Z flag is not set and C flag is set
        }
        else if (this.bcond == "B.HS") {
            cbzEqualZero = (pstate.C == 1) ? 1 : 0; // Check if C flag is set
        }
        if (cbzEqualZero) {
            PC.setAddress(PC.getCurrentAddress() + addressShifted_decimal); // Update Program Counter
        } else PC.setAddress(PC.getCurrentAddress() + 4); // Increment PC by 4 if not zero

        jumpToAddress(PC, vec, PC.getCurrentAddress());

        var BFlag;
        var CBFlag;
        if (this.bcond != "CBZ" && this.bcond != "CBNZ") {
            BFlag = 0;
            CBFlag = cbzEqualZero;
        }
        else {
            BFlag = cbzEqualZero;
            CBFlag = 0;
        }
        const pathAndData = [
            { pathId: "read-data-2-write-data", data: register2_hexan },
            { pathId: "ALU-mux", data: "0x0" }, // 4-0 bits
            { pathId: "ALU-address", data: "0x0" }, // 4-0 bits !!!!
            { pathId: "alu-to-nzcv", data: "0000" },
            { pathId: "alu-add-4-mux", data: add4Address }, // 4-0 bits  !!!
            {
                pathId: "ALU-add-mux",
                data: addHexStrings(
                    this.address_instruction,
                    addressShifted_hexan
                ),
            },
            { pathId: "ALU-and-gate", data: CBFlag }, // 4-0 bits
        ];
        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);
        // This is the part where read address register in memory
        const anotherPathAndData = [
            { pathId: "read-data-mux", data: "0x0" }, // 4-0 bits  !!!!!
            { pathId: "and-gate-or-gate", data: CBFlag },
            { pathId: "add-2-or-gate", data: BFlag },
        ];
        const anotherRuns = anotherPathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(anotherRuns);
        const orToMux = [
            { pathId: "or-gate-mux", data: CBFlag | BFlag }, // 4-0 bits
        ];
        const orRuns = orToMux.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(orRuns);
        console.log("CBZ/CBNZ condition check:", cbzEqualZero);
        document.getElementById(`mux2_${cbzEqualZero}`).style.color = "#007BFF";
        if (cbzEqualZero) {
            document.getElementById('mux-2').style.background = 'linear-gradient(to bottom, #acb1b3 50%, red 50%)';
        } else {
            document.getElementById('mux-2').style.background = 'linear-gradient(to bottom, red 50%, #acb1b3 50%)';
        }
    }

    async registerWrite() {
        const backAddress = LEGv8Registers.binaryToHex(
            LEGv8Registers.valueTo64BitBinary(PC.getCurrentAddress())
        );
        const pathAndData = [
            { pathId: "mux-write-data", data: "0x0" }, // 4-0 bits
            { pathId: "ALU-back-PC", data: backAddress }, // 4-0 bits
        ];
        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);
        document.getElementById("mux0_1").style.color = "black";
        document.getElementById("mux1_0").style.color = "black";
        document.getElementById("mux3_0").style.color = "black";
        document.getElementById("mux2_0").style.color = "black";
        document.getElementById("mux2_1").style.color = "black";
        controlUnitDisplay(this.controlSignals, 0); // Reset control signals display
    }
    async run() {
        await this.instructionFetch();
        await this.instructionDecode();
        await this.execute();
        await this.memoryAccess();
        await this.registerWrite();
    }
}
