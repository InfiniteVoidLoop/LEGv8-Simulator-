// Assume ColoredLog is globally available or imported, e.g.:

class RegisterStorage {
    // --- Constants ---
    static NUM_REGISTERS = 32;

    // SP: Stack Pointer, FP: Frame Pointer, LR: Link Register, XZR: Zero Register
    static STACK_POINTER_INDEX = 28;
    static FRAME_POINTER_INDEX = 29;
    static LINK_REGISTER_INDEX = 30;
    static ZERO_REGISTER_INDEX = 31;

    // Mask for 64-bit value using BigInt
    static VALUE_MASK = 0xFFFFFFFFFFFFFFFFn;

    // Private instance field for the register storage array
    #registers;

    /**
     * Constructor for RegisterStorage.
     * Initializes a new set of registers or copies from another RegisterStorage instance.
     * @param {RegisterStorage} [other] - Optional. The RegisterStorage object to copy from.
     */
    constructor(other) {
        if (other instanceof RegisterStorage) {
            // --- Copy constructor logic ---
            // Validate the object being copied
            if (other.#registers.length !== RegisterStorage.NUM_REGISTERS) {
                throw new Error(`Invalid RegisterStorage size: ${other.#registers.length}`);
            }
            // Create a deep copy of the registers array using spread syntax
            this.#registers = [...other.#registers];
        } else {
            // --- Default constructor logic ---
            // Initialize a new array and fill it with the BigInt value 0n
            this.#registers = new Array(RegisterStorage.NUM_REGISTERS).fill(0n);
            console.log(`${ColoredLog.SUCCESS}Register Storage initialized (${RegisterStorage.NUM_REGISTERS} registers).`);
        }
    }

    // --- Register Access Methods ---

    /**
     * Gets the value of a register.
     * @param {number} regNum - The register number (0-31).
     * @returns {BigInt} The 64-bit value of the register.
     */
    getValue(regNum) {
        this.#validateRegisterNumber(regNum, "read");
        if (regNum === RegisterStorage.ZERO_REGISTER_INDEX) {
            return 0n; // The zero register always reads as 0.
        }
        return this.#registers[regNum];
    }

    /**
     * Sets the value of a register.
     * @param {number} regNum - The register number (0-31).
     * @param {BigInt} value - The 64-bit value to set.
     */
    setValue(regNum, value) {
        // Ensure the value is a BigInt before proceeding
        const bigIntValue = BigInt(value);

        // Apply the 64-bit mask to ensure the value fits
        const maskedValue = bigIntValue & RegisterStorage.VALUE_MASK;

        this.#validateRegisterNumber(regNum, "write");

        if (regNum === RegisterStorage.ZERO_REGISTER_INDEX) {
            console.log(`${ColoredLog.WARNING}RegisterStorage Info: Ignored write to XZR.`);
            return; // Writes to the zero register are ignored.
        }

        this.#registers[regNum] = maskedValue;

        // Log the write operation
        const hexValue = maskedValue.toString(16).toUpperCase().padStart(16, '0');
        console.log(`${ColoredLog.INFO}RegisterStorage Write: X${regNum} <= 0x${hexValue}`);
    }

    /**
     * Clears the values of all registers by setting them to 0.
     */
    clear() {
        this.#registers.fill(0n);
    }

    /**
     * Validates the register number is within the acceptable range [0-31].
     * @private
     * @param {number} regNum - The register number to validate.
     * @param {string} operation - The operation being performed (e.g., "read" or "write").
     */
    #validateRegisterNumber(regNum, operation) {
        if (regNum < 0 || regNum >= RegisterStorage.NUM_REGISTERS) {
            // RangeError is the idiomatic error type for this in JavaScript.
            throw new RangeError(`Invalid register number for ${operation}: ${regNum}. Must be 0-${RegisterStorage.NUM_REGISTERS - 1}`);
        }
    }

    // --- Utility Methods ---

    /**
     * Returns a formatted string representation of the entire register bank.
     * @returns {string} A string showing all register names and their hex values.
     */
    toString() {
        const lines = [];
        for (let i = 0; i < RegisterStorage.NUM_REGISTERS; i += 2) {
            // Helper to format one register's display string
            const formatReg = (regNum) => {
                let name;
                switch (regNum) {
                    case RegisterStorage.STACK_POINTER_INDEX: name = "SP"; break;
                    case RegisterStorage.ZERO_REGISTER_INDEX: name = "XZR"; break;
                    default: name = `X${regNum}`;
                }

                const value = this.getValue(regNum); // Use getter to handle XZR correctly
                const hexValue = value.toString(16).toUpperCase().padStart(16, '0');

                // Replicate Java's String.format("%-3s(%-2d): %016X")
                const namePart = name.padEnd(3, ' ');
                const numPart = String(regNum).padEnd(2, ' ');

                return `${namePart}(${numPart}): ${hexValue}`;
            };

            // Format a line with two registers
            const part1 = formatReg(i);
            const part2 = (i + 1 < RegisterStorage.NUM_REGISTERS) ? formatReg(i + 1) : '';

            lines.push(` ${part1}   ${part2}`);
        }
        return lines.join('\n');
    }
}
