/**
 * Represents an I-Format (Immediate) instruction in an ARM-like architecture.
 */
class IFormatInstruction extends Instruction {
    // In JavaScript, `#` denotes a private field, the direct equivalent of `private` in Java.
    // JavaScript doesn't have `final`, but making these private and only setting them in the
    // constructor achieves the same goal of making them immutable from the outside.

    /**
     * Constructor for IFormatInstruction.
     * @param {boolean[]} bytecode The bytecode of the instruction as an array of booleans.
     * @param {InstructionDefinition} definition The InstructionDefinition for this instruction.
     */
    constructor(bytecode, definition) {
        // Call the parent (Instruction) constructor
        super(bytecode, definition);

        // Get values from the parent class's accessor methods and store them
        // in the private fields of this instance.
        this.immediate = this.getImmediate_I();
        this.rn = this.getRn_I();
        this.rd = this.getRd_I();
    }

    /**
     * Creates a human-readable assembly string for the instruction.
     * @returns {string} The instruction as an assembled string, formatted as "mnemonic Xd, Xn, #immediate".
     */
    disassemble() {
        const mnemonic = this.definition.getMnemonic();

        // Use the static Extractor utility to sign-extend the 12-bit immediate value.
        const signExtendedImm = Extractor.extend(this.immediate, 12);

        // Use a template literal for clean and readable string formatting.
        // `padEnd(6)` achieves the `%-6s` effect from Java's String.format.
        return `${mnemonic.padEnd(6)} X${this.rd}, X${
            this.rn
        }, #${signExtendedImm}`;
    }
}
