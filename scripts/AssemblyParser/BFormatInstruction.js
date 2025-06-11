/**
 * Represents a B-Format (Branch) instruction.
 */
class BFormatInstruction extends Instruction {

    // Private field for the address offset. `#` is the JS equivalent of `private`.

    /**
     * Constructor for BFormatInstruction.
     * @param {boolean[]} bytecode The bytecode of the instruction as an array of booleans.
     * @param {InstructionDefinition} definition The InstructionDefinition for this instruction.
     */
    constructor(bytecode, definition) {
        // Call the parent (Instruction) constructor
        super(bytecode, definition);

        // Get the address offset from the parent's accessor method and store it.
        this.addressOffset = this.getAddress_B();
    }

    /**
     * Creates a human-readable assembly string for the instruction.
     * @returns {string} The instruction as an assembled string, formatted as "mnemonic #offset".
     */
    disassemble() {
        const mnemonic = this.definition.getMnemonic();

        // Use the static Extractor utility to sign-extend the 26-bit address offset.
        // This is crucial for correctly displaying negative (backward) branches.
        const signExtendedOffset = Extractor.extend(this.addressOffset, 26);

        // Use a template literal for clean formatting.
        // `padEnd(6)` provides the left-aligned padding equivalent to `%-6s`.
        return `${mnemonic.padEnd(6)} #${signExtendedOffset}`;
    }
}
