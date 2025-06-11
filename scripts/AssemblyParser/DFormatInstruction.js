/**
 * Represents a D-Format (Data Transfer / Load-Store) instruction.
 */
class DFormatInstruction extends Instruction {

    // Private fields using #

    /**
     * Constructor for DFormatInstruction.
     * @param {boolean[]} bytecode The bytecode of the instruction as an array of booleans.
     * @param {InstructionDefinition} definition The InstructionDefinition for this instruction.
     */
    constructor(bytecode, definition) {
        // Call the parent (Instruction) constructor
        super(bytecode, definition);

        // Get values from the parent class's accessor methods for D-Format
        // and store them in the private fields of this instance.
        this.address = this.getAddress_D();
        this.rn = this.getRn_D(); // Base register
        this.rt = this.getRt_D();   // Target/Source register
    }

    /**
      * Creates a human-readable assembly string for the instruction.
     * @return {string} The instruction as an assembled string.
     *         The string is formatted as "mnemonic Xt, [Xn, #offset]".
     */
    disassemble() {
        const mnemonic = this.definition.getMnemonic();
        
        // NOTE: The original Java code does NOT call Extractor.extend() for the address.
        // We mirror that behaviour here. If sign-extension was required for display,
        // you would call: const extendedAddress = Extractor.extend(this.#address, 9); // Assuming 9 bits
       // and use extendedAddress in the template literal below.
        
        // Use template literal and padEnd for formatting.
        // The format "Xt, [Xn, #address]" is typical for load/store.
        return `${mnemonic.padEnd(6)} X${this.rt}, [X${this.rn}, #${this.address}]`;
    }
}


