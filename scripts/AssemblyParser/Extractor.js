class Extractor {
    /**
     * Private constructor to prevent instantiation of the utility class.
     */
    constructor() {
        throw new Error(
            "Extractor is a static utility class and should not be instantiated."
        );
    }

    /**
     * Extends the sign of a 32-bit integer value.
     * @param {number} value The integer value to extend.
     * @param {number} originalBits The number of bits in the original value (1-32).
     * @returns {number} The sign-extended 32-bit integer.
     */
    static extend(value, originalBits) {
        if (originalBits <= 0 || originalBits > 32) {
            throw new Error(
                `originalBits for number input must be 1-32, was: ${originalBits}`
            );
        }
        if (originalBits === 32) return value;

        const signBit = 1 << (originalBits - 1);
        // Check if the sign bit is set
        if ((value & signBit) !== 0) {
            // If negative, fill the upper bits with 1s.
            // `~0` is -1 (all 1s in 32-bit), shifting it creates the extension mask.
            const mask = ~0 << originalBits;
            return value | mask;
        }
        // If positive, it's already correct.
        return value;
    }

    /**
     * Extends the sign of a 64-bit BigInt value.
     * @param {bigint} value The BigInt value to extend.
     * @param {number} originalBits The number of bits in the original value (1-64).
     * @returns {bigint} The sign-extended 64-bit BigInt.
     */
    static extendBigInt(value, originalBits) {
        if (originalBits <= 0 || originalBits > 64) {
            throw new Error(
                `originalBits for BigInt input must be 1-64, was: ${originalBits}`
            );
        }
        if (originalBits === 64) return value;

        const signBit = 1n << (BigInt(originalBits) - 1n);
        // Check if the sign bit is set
        if ((value & signBit) !== 0n) {
            // If negative, fill the upper bits with 1s.
            const mask = -1n << BigInt(originalBits);
            return value | mask;
        }
        return value;
    }

    /**
     * Extracts and extends a value from a boolean array based on the specified format.
     * @param {boolean[]} instructionBits The boolean array representing the instruction.
     * @param {string} format The format character ('B', 'C', 'I', 'D', 'M', 'R').
     * @param {string} mnemonic The mnemonic of the instruction.
     * @returns {number | bigint} The extended value.
     */
    static extractAndExtend(instructionBits, format, mnemonic) {
        if (!instructionBits) {
            throw new Error("Instruction boolean array cannot be null.");
        }

        let rawValue = 0;
        let numBits;

        switch (format) {
            case "B":
                rawValue = Instruction.extractBits(instructionBits, 0, 25);
                numBits = 26;
                break;

            case "C":
                rawValue = Instruction.extractBits(instructionBits, 5, 23);
                numBits = 19;
                break;

            case "I":
                rawValue = Instruction.extractBits(instructionBits, 10, 21);
                numBits = 12;
                break;

            case "D":
                rawValue = Instruction.extractBits(instructionBits, 12, 20);
                numBits = 9;
                break;

            case "M": {
                // Use block scope for `let`/`const`
                const hw = Instruction.extractBits(instructionBits, 21, 22);
                const imm16 = Instruction.extractBits(instructionBits, 5, 20);
                const shiftAmount = hw * 16;
                // Use BigInt for potentially large shifts that exceed 32 bits
                return BigInt(imm16) << BigInt(shiftAmount);
            }

            case "R":
                if (mnemonic === "LSL" || mnemonic === "LSR") {
                    rawValue =
                        Instruction.extractBits(instructionBits, 10, 15) & 0x3f;
                    return rawValue; // No sign extension needed for these
                }
                return 0; // Default case for R-format without immediate

            default:
                throw new Error(
                    `Unsupported format for sign extension: ${format}`
                );
        }

        return this.extend(rawValue, numBits);
    }

    /**
     * Extracts and extends a value from an integer representation of an instruction.
     * @param {number} instruction The integer representing the instruction.
     * @param {string} format The format character ('B', 'C', 'I', 'D', 'M', 'R').
     * @param {string} mnemonic The mnemonic of the instruction.
     * @returns {number | bigint} The extended value.
     */
    static extractAndExtendFromInt(instruction, format, mnemonic) {
        let rawValue = 0;
        let numBits;

        switch (format) {
            case "B":
                rawValue = instruction & 0x3ffffff;
                numBits = 26;
                break;

            case "C": // CB
                rawValue = (instruction >>> 5) & 0x7ffff;
                numBits = 19;
                break;

            case "I":
                rawValue = (instruction >>> 10) & 0xfff;
                numBits = 12;
                break;

            case "D":
                rawValue = (instruction >>> 12) & 0x1ff;
                numBits = 9;
                break;

            case "M": {
                // IM
                const hw = (instruction >>> 21) & 0x3;
                const imm16 = (instruction >>> 5) & 0xffff;
                const shiftAmount = hw * 16;
                // Use BigInt as result can exceed 32-bit integer limit
                return BigInt(imm16) << BigInt(shiftAmount);
            }

            case "R":
                if (
                    mnemonic === "LSL" ||
                    mnemonic === "LSR" ||
                    mnemonic === "ASR"
                ) {
                    rawValue = (instruction >>> 10) & 0x3f;
                    return rawValue; // No sign extension needed for these shifts
                }
                return 0; // Default case

            default:
                throw new Error(
                    `Unsupported format for sign extension: ${format}`
                );
        }

        return this.extend(rawValue, numBits);
    }
}
