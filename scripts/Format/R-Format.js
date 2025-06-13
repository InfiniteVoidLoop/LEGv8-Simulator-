class RFormat {
    constructor(RFormatInstruction, PC) {
        this.opcode = toExactBinary(RFormatInstruction.definition.opcode, 11);
        this.Rm = toExactBinary(RFormatInstruction.rm, 5);
        this.shamt = toExactBinary(RFormatInstruction.shamt, 6);
        this.Rn = toExactBinary(RFormatInstruction.rn, 5);
        this.Rd = toExactBinary(RFormatInstruction.rd, 5);
        this.address = LEGv8Registers.binaryToHex(
            LEGv8Registers.valueTo64BitBinary(PC.getCurrentAddress())
        ); // Program Counter address

        // ALU Control
        this.aluControl = toExactBinary(
            RFormatInstruction.definition.controlSignals.operation,
            4
        ); // Placeholder for ALU control, will be set in execute method
        this.controlSignals = {
            Reg2Loc: RFormatInstruction.definition.controlSignals.reg2Loc,
            UncondBranch:
                RFormatInstruction.definition.controlSignals.uncondBranch,
            MemRead: RFormatInstruction.definition.controlSignals.memRead,
            MemtoReg: RFormatInstruction.definition.controlSignals.memToReg,
            ALUOp1: LEGv8Registers.valueTo64BitBinary(
                RFormatInstruction.definition.controlSignals.aluOp
            ).slice(-2, -1),
            ALUOp0: String(
                RFormatInstruction.definition.controlSignals.aluOp % 2
            ),
            MemWrite: RFormatInstruction.definition.controlSignals.memWrite,
            ALUSrc: RFormatInstruction.definition.controlSignals.aluSrc,
            RegWrite: RFormatInstruction.definition.controlSignals.regWrite,
            Branch: RFormatInstruction.definition.controlSignals.flagBranch,
        };
    }

    async instructionFetch() {
        const instruction =
            this.opcode + this.Rn + this.Rm + this.shamt + this.Rd;
        const pathAndData = [
            { pathId: "pc-alu", data: this.address },
            { pathId: "pc-ins-mem", data: instruction },
            { pathId: "pc-add-4", data: this.address },
        ];
        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);
    }

    async instructionDecode() {
        const instruction =
            this.opcode + this.Rn + this.Rm + this.shamt + this.Rd; // Concatenate all parts to form the instruction

        const pathAndData = [
            { pathId: "Instruction-[31-21]", data: this.opcode },
            { pathId: "Instruction-[9-5]", data: this.Rn },
            { pathId: "Instruction-[20-16]", data: this.Rm },
            { pathId: "Instruction-[4-0]", data: this.Rd },
            { pathId: "Instruction-[4-0]-1", data: this.Rd },
            { pathId: "Instruction-[31-0]", data: instruction },
            { pathId: "Instruction-[31-21]-1", data: this.opcode },
        ];

        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);

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
            { pathId: "control-mem-write", data: this.controlSignals.MemWrite },
            { pathId: "control-ALU-src", data: this.controlSignals.ALUSrc },
            { pathId: "control-reg-write", data: this.controlSignals.RegWrite },
            { pathId: "control-branch", data: this.controlSignals.Branch },
        ];
        const allControlRuns = controlPathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allControlRuns);

        // change document
        document.getElementById("mux0_0").style.color = "#007BFF";
        document.getElementById("mux1_0").style.color = "#007BFF";
        document.getElementById("mux2_0").style.color = "#007BFF";
        document.getElementById("mux3_0").style.color = "#007BFF";
        document.getElementById("register-handler").style.borderColor =
            "#007BFF";
        document.getElementById("register-handler-write").style.color =
            "#007BFF";
        const muxToRegister = [
            { pathId: "mux-read-res-2", data: this.Rm }, // 20-16 bits
        ];
        await Promise.all(
            muxToRegister.map(({ pathId, data }) => run(data, pathId))
        );
    }

    async execute() {
        const register1_hexan = LEGv8Registers.binaryToHex(
            registers.readByBinary(this.Rn)
        );
        const register2_hexan = LEGv8Registers.binaryToHex(
            registers.readByBinary(this.Rm)
        );
        const register1_decimal = LEGv8Registers.binaryToBigInt(
            registers.readByBinary(this.Rn)
        );
        const register2_decimal = LEGv8Registers.binaryToBigInt(
            registers.readByBinary(this.Rm)
        );

        const newRegisterValue = {
            "0010": register1_decimal + register2_decimal, // ADD
            "0110": register1_decimal - register2_decimal, // SUB
            "0000": register1_decimal & register2_decimal, // AND
            "0001": register1_decimal | register2_decimal, // ORR
        };

        const newRegister_bin = LEGv8Registers.valueTo64BitBinary(
            newRegisterValue[this.aluControl] || 0n
        );
        registers.writeByBinary(this.Rd, newRegister_bin); // 4-0 bits

        const pathAndData = [
            { pathId: "read-1-alu", data: register1_hexan },
            { pathId: "read-data-2-mux", data: register2_hexan },
            { pathId: "ALU-control-ALU", data: this.aluControl },
            { pathId: "Sign-extend-mux", data: "0x0" }, // 4-0 bits
            { pathId: "Sign-extend-shift", data: "0x0" }, // 4-0 bits
        ];
        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);

        const anotherPathAndData = [
            { pathId: "shift-add-alu", data: "0x0" }, // 9-5 bits
            { pathId: "mux-alu", data: register2_hexan }, // 20-16 bits
        ];

        const anotherRuns = anotherPathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(anotherRuns);
    }

    async memoryAccess() {
        const add4Address = add4ToHexAddress(this.address); // 4-0 bits
        const register2_hexan = LEGv8Registers.binaryToHex(
            registers.readByBinary(this.Rm)
        );
        const newRegister_hexan = LEGv8Registers.binaryToHex(
            registers.readByBinary(this.Rd)
        ); // 4-0 bits
        const pathAndData = [
            { pathId: "read-data-2-write-data", data: register2_hexan }, // 20-16 bits
            { pathId: "ALU-mux", data: newRegister_hexan }, // 4-0 bits
            { pathId: "ALU-address", data: newRegister_hexan }, // 4-0 bits !!!!
            { pathId: "alu-add-4-mux", data: add4Address }, // 4-0 bits  !!!
            { pathId: "ALU-add-mux", data: this.address }, // 4-0 bits
            { pathId: "ALU-and-gate", data: 0 }, // 4-0 bits
        ];
        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);

        // This is the part where read adress register in memory
        const anotherPathAndData = [
            { pathId: "read-data-mux", data: "0x0000" }, // 4-0 bits  !!!!!
            { pathId: "and-gate-or-gate", data: "0" },
        ];
        const anotherRuns = anotherPathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(anotherRuns);

        const orToMux = [
            { pathId: "or-gate-mux", data: "0" }, // 4-0 bits
        ];
        const orRuns = orToMux.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(orRuns);
    }

    async registerWrite() {
        const newRegisterValue_hexan = LEGv8Registers.binaryToHex(
            registers.readByBinary(this.Rd)
        );

        const pathAndData = [
            { pathId: "mux-write-data", data: newRegisterValue_hexan },
            { pathId: "ALU-back-PC", data: add4ToHexAddress(this.address) },
        ];

        // Update the Program Counter to the next instruction address
        PC.setAddress(PC.getCurrentAddress() + 4);
        jumpToAddress(PC, vec, PC.getCurrentAddress()); // Update the address in the UI

        const allRuns = pathAndData.map(({ pathId, data }) =>
            run(data, pathId)
        );
        await Promise.all(allRuns);
        const pos = LEGv8Registers.binaryToBigInt(this.Rd); // Convert binary Rd to decimal position
        document
            .getElementById(`register-X${pos}`)
            .querySelector("span:last-child").textContent =
            newRegisterValue_hexan;
        document.getElementById("mux0_0").style.color = "black";
        document.getElementById("mux1_0").style.color = "black";
        document.getElementById("mux2_0").style.color = "black";
        document.getElementById("mux3_0").style.color = "black";
        document.getElementById("register-handler").style.borderColor = "black";
        document.getElementById("register-handler-write").style.color = "black";
    }

    async run() {
        await this.instructionFetch();
        await this.instructionDecode();
        await this.execute();
        await this.memoryAccess();
        await this.registerWrite();
    }
}
