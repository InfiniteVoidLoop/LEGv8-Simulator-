class InstructionDefinition {
    // --- Constructor ---
    
    /**
     * Constructor for InstructionDefinition.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} format The format of the instruction (R: R-format, I: I-format, D: D-format, B: B-format, C: CB-format, M: IM-format).
     * @param {number|string} opcodeOrString The opcode of the instruction as integer, or opcode identifier string in binary format.
     * @param {ControlSignals} controlSignals The control signals associated with the instruction.
     */
    constructor(mnemonic, format, opcodeOrString, controlSignals) {
        this.mnemonic = mnemonic;
        this.format = format;
        
        // Handle both constructor signatures
        if (typeof opcodeOrString === 'string') {
            // String constructor - parse binary string to integer
            this.opcode = parseInt(opcodeOrString, 2);
        } else {
            // Integer constructor
            this.opcode = opcodeOrString;
        }
        
        this.controlSignals = controlSignals;
    }

    // --- Getters ---

    /**
     * @returns {string} The mnemonic of the instruction.
     */
    getMnemonic() {
        return this.mnemonic;
    }

    /**
     * @returns {string} The format of the instruction.
     */
    getFormat() {
        return this.format;
    }

    /**
     * @returns {number} The opcode of the instruction as an integer.
     */
    getOpcode() {
        return this.opcode;
    }

    /**
     * @returns {string} The opcode identifier string in binary format.
     */
    getOpcodeIdentifierString() {
        return this.opcode.toString(2);
    }

    /**
     * @returns {ControlSignals} The control signals associated with the instruction.
     */
    getControlSignals() {
        return this.controlSignals;
    }
    
    // --- Utility Methods ---
    
    /**
     * @returns {string} A string representation of the InstructionDefinition object.
     *         This includes the mnemonic, format, opcode identifier string, and control signals.
     */
    toString() {
        const mnemonicPadded = this.mnemonic.padEnd(6);
        const opcodeStringPadded = this.getOpcodeIdentifierString().padEnd(11);
        
        return `InstructionDefinition [mnemonic=${mnemonicPadded}, format=${this.format}, opcodeIdentifierString=${opcodeStringPadded}, controlSignals={${this.controlSignals}}]`;
    }
}