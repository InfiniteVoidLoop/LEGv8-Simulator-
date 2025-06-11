class ControlUnit {
    constructor(instructionBits) {
        this.instructionBits = instructionBits;
        this.controlSignals = this.decodeSignals();
    }

    decodeSignals() {
        const opcode = this.instructionBits;

        const patterns = {
            RFormat:  "1xx01011000", 
            IFormat:  "1001000100",
            LDUR:     "11111000010",
            STUR:     "11111000000",
            CBZ:      "1xx10100xxx",
            B:        "0xxxxxxx101"
        };

        let signals = {
            Reg2Loc: 0,
            ALUSrc: 0,
            MemtoReg: 0,
            RegWrite: 0,
            MemRead: 0,
            MemWrite: 0,
            Branch: 0,
            UncondBranch: 0,
            ALUOp1: 0,
            ALUOp0: 0
        };

        function matchPattern(pattern, opcode) {
            for (let i = 0; i < pattern.length; i++) {
                if (pattern[i] !== 'x' && pattern[i] !== opcode[i]) return false;
            }
            return true;
        }

        if (matchPattern(patterns.RFormat, opcode) || matchPattern(patterns.IFormat, opcode)) {
            signals = {
                Reg2Loc: 0,
                ALUSrc: 0,
                MemtoReg: 0,
                RegWrite: 1,
                MemRead: 0,
                MemWrite: 0,
                Branch: 0,
                UncondBranch: 0,
                ALUOp1: 1,
                ALUOp0: 0
            };
        } else if (matchPattern(patterns.LDUR, opcode)) {
            signals = {
                Reg2Loc: 0,
                ALUSrc: 1,
                MemtoReg: 1,
                RegWrite: 1,
                MemRead: 1,
                MemWrite: 0,
                Branch: 0,
                UncondBranch: 0,
                ALUOp1: 0,
                ALUOp0: 0
            };
        } else if (matchPattern(patterns.STUR, opcode)) {
            signals = {
                Reg2Loc: 1,
                ALUSrc: 1,
                MemtoReg: 0,
                RegWrite: 0,
                MemRead: 0,
                MemWrite: 1,
                Branch: 0,
                UncondBranch: 0,
                ALUOp1: 0,
                ALUOp0: 0
            };
        } else if (matchPattern(patterns.CBZ, opcode)) {
            signals = {
                Reg2Loc: 1,
                ALUSrc: 0,
                MemtoReg: 0,
                RegWrite: 0,
                MemRead: 0,
                MemWrite: 0,
                Branch: 1,
                UncondBranch: 0,
                ALUOp1: 0,
                ALUOp0: 1
            };
        } else if (matchPattern(patterns.B, opcode)) {
            signals = {
                Reg2Loc: 0,
                ALUSrc: 0,
                MemtoReg: 0,
                RegWrite: 0,
                MemRead: 0,
                MemWrite: 0,
                Branch: 0,
                UncondBranch: 1,
                ALUOp1: 0,
                ALUOp0: 0
            };
        } 
        
        else {
            console.warn("Unknown opcode pattern:", opcode);
        }
        return signals;
    }

    getControlSignals() {
        return this.controlSignals;
    }
}
