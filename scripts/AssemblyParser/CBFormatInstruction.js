
class CBFormatInstruction extends Instruction {

    // Private field for the address offset. `#` is the JS equivalent of `private`.

    /**
     * Constructor for CBFormatInstruction.
     * @param {boolean[]} bytecode The bytecode of the instruction as an array of booleans.
     * @param {InstructionDefinition} definition The InstructionDefinition for this instruction.
     */
    constructor(bytecode, definition) {
        // Call the parent (Instruction) constructor
        super(bytecode, definition);

        // Get the address offset from the parent's accessor method and store it.
        this.addressOffset = this.getAddress_CB();
        this.rt = this.getRt_CB();
    }
    
    disassemble() {
        const mnemonic = this.definition.getMnemonic();
        const signExtendedOffset = Extractor.extend(this.addressOffset, 19);

        if (mnemonic.startsWith("B.")) {
            return `${mnemonic.padEnd(6)} #${signExtendedOffset}`;
        } else {
            return `${mnemonic.padEnd(6)} X${this.rt}, #${signExtendedOffset}`;
        }
    }
}