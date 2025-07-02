class Instruction {
    constructor(bytecode, definition) {
        if (!bytecode) {
            throw new Error(`WARNING: Bytecode cannot be null.`);
        }
        if (!definition) {
            throw new Error(
                `WARNING: InstructionDefinition cannot be null for standard instruction creation.`
            );
        }

        this.bytecode = bytecode.slice(); // Assuming bytecode has a clone method.
        this.definition = definition[0];
        this.lineNumber = definition[1];
        if (this.bytecode.length > 32) {
            console.error(
                `WARNING: Bytecode provided to Instruction constructor has length ${
                    this.bytecode.length
                } (> 32) for ${definition.getMnemonic()}.`
            );
        }
    }

    getBytecode() {
        return this.bytecode.slice();
    }

    getDefinition() {
        return this.definition;
    }

    // --- R-Format ---
    getOpcode_R() {
        return Instruction.extractBits(this.bytecode, 21, 31);
    }
    getRm_R() {
        return Instruction.extractBits(this.bytecode, 16, 20);
    }
    getShamt_R() {
        return Instruction.extractBits(this.bytecode, 10, 15);
    }
    getRn_R() {
        return Instruction.extractBits(this.bytecode, 5, 9);
    }
    getRd_R() {
        return Instruction.extractBits(this.bytecode, 0, 4);
    }

    // --- I-Format ---
    getOpcode_I() {
        return Instruction.extractBits(this.bytecode, 22, 31);
    }
    getImmediate_I() {
        return Instruction.extractBits(this.bytecode, 10, 21);
    }
    getRn_I() {
        return Instruction.extractBits(this.bytecode, 5, 9);
    }
    getRd_I() {
        return Instruction.extractBits(this.bytecode, 0, 4);
    }

    // --- D-Format ---
    getOpcode_D() {
        return Instruction.extractBits(this.bytecode, 21, 31);
    }
    getAddress_D() {
        return Instruction.extractBits(this.bytecode, 12, 20);
    }
    getOp2_D() {
        return Instruction.extractBits(this.bytecode, 10, 11);
    }
    getRn_D() {
        return Instruction.extractBits(this.bytecode, 5, 9);
    }
    getRt_D() {
        return Instruction.extractBits(this.bytecode, 0, 4);
    }

    // --- B-Format ---
    getOpcode_B() {
        return Instruction.extractBits(this.bytecode, 26, 31);
    }
    getAddress_B() {
        return Instruction.extractBits(this.bytecode, 0, 25);
    }

    // --- CB-Format ---
    getOpcode_CB() {
        return Instruction.extractBits(this.bytecode, 24, 31);
    }
    getAddress_CB() {
        return Instruction.extractBits(this.bytecode, 5, 23);
    }
    getRt_CB() {
        return Instruction.extractBits(this.bytecode, 0, 4);
    }
    getCond_CB() {
        return Instruction.extractBits(this.bytecode, 0, 3);
    }

    // --- I-Format Immediate ---
    getOpcode_IM() {
        return Instruction.extractBits(this.bytecode, 23, 31);
    }
    getShift_IM() {
        return Instruction.extractBits(this.bytecode, 21, 22);
    }
    getImmediate_IM() {
        return Instruction.extractBits(this.bytecode, 5, 20);
    }
    getRd_IM() {
        return Instruction.extractBits(this.bytecode, 0, 4);
    }

    // --- Static Utility Methods ---

    static setBits(bits, value, startBit, endBit) {
        if (startBit < 0 || endBit < startBit || endBit >= 32) {
            console.error(
                `WARNING: Invalid bit range for setting: ${startBit} to ${endBit}`
            );
            return;
        }

        let mask = 1;
        for (let i = startBit; i <= endBit; i++) {
            bits[i] = (value & mask) !== 0;
            mask <<= 1;
        }
    }

    static extractBits(bits, startBit, endBit) {
        if (startBit < 0 || endBit < startBit || endBit >= 32) {
            console.error(
                `WARNING: Invalid bit range requested: ${startBit} to ${endBit}`
            );
            throw new Error(
                `Invalid bit range requested: ${startBit} to ${endBit}`
            );
        }

        let value = 0;
        for (let i = startBit; i <= endBit; i++) {
            if (bits[i] == 1) {
                value |= 1 << (i - startBit);
            }
        }

        return value;
    }

    static formatBitSet(bits) {
        let sb = "";
        for (let i = 31; i >= 0; i--) {
            sb += bits[i] ? "1" : "0";
            if (i > 0 && i % 8 === 0) {
                sb += " ";
            }
        }
        return sb;
    }

    // --- Abstract Methods ---

    disassemble() {
        throw new Error(
            'Abstract method "disassemble()" must be implemented by subclasses.'
        );
    }

    toString() {
        return (
            this.disassemble() + "\n" + Instruction.formatBitSet(this.bytecode)
        );
    }
}
