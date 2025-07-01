class LEGv8Registers {
    constructor() {
        // Initialize all 32 registers with a 64-bit binary string representing 0
        this.registers = new Array(32).fill("0".repeat(64));

        // Map from register index to register name
        this.registerMap = {
            0: "X0",
            1: "X1",
            2: "X2",
            3: "X3",
            4: "X4",
            5: "X5",
            6: "X6",
            7: "X7",
            8: "X8",
            9: "X9",
            10: "X10",
            11: "X11",
            12: "X12",
            13: "X13",
            14: "X14",
            15: "X15",
            16: "IP0",
            17: "IP1",
            18: "X18",
            19: "X19",
            20: "X20",
            21: "X21",
            22: "X22",
            23: "X23",
            24: "X24",
            25: "X25",
            26: "X26",
            27: "X27",
            28: "SP", // Stack Pointer
            29: "FP", // Frame Pointer
            30: "LR", // Link Register
            31: "XZR", // Zero Register (always reads as zero)
        };

        // Map from register name to register index (case-insensitive)
        this.nameToIndex = {};
        for (const [index, name] of Object.entries(this.registerMap)) {
            this.nameToIndex[name.toUpperCase()] = parseInt(index);
        }
    }

    // === Base methods ===

    /**
     * Writes a value to a specified register index.
     * XZR (register 31) cannot be written to.
     * @param {number} index - The index of the register (0-31).
     * @param {number|BigInt|string} value - The value to write (will be converted to 64-bit binary).
     */
    write(index, value) {
        this.validateIndex(index);
        if (index === 31) {
            // XZR (Zero Register)
            console.warn(
                "Warning: Cannot write to XZR (X31), it always holds 0."
            );
            return;
        }
        this.registers[index] = LEGv8Registers.valueTo64BitBinary(value); // Ensure the value is stored as a 64-bit binary string
    }

    /**
     * Reads the 64-bit binary string value from a specified register index.
     * XZR (register 31) always returns the binary string for 0.
     * @param {number} index - The index of the register (0-31).
     * @returns {string} The 64-bit binary string value of the register.
     */
    read(index) {
        this.validateIndex(index);
        // XZR (X31) always reads as 0
        return index === 31 ? "0".repeat(64) : this.registers[index];
    }

    // === Name methods ===

    /**
     * Writes a value to a register specified by its name.
     * @param {string} name - The name of the register (e.g., 'X0', 'SP', 'LR'). Case-insensitive.
     * @param {number|BigInt|string} value - The value to write (will be converted to 64-bit binary).
     * @throws {Error} If the register name is invalid.
     */
    writeByName(name, value) {
        const index = this.nameToIndex[name.toUpperCase()];
        if (index === undefined) {
            throw new Error(`Invalid register name: ${name}`);
        }
        this.write(index, value);
    }

    /**
     * Reads the 64-bit binary string value from a register specified by its name.
     * @param {string} name - The name of the register. Case-insensitive.
     * @returns {string} The 64-bit binary string value of the register.
     * @throws {Error} If the register name is invalid.
     */
    readByName(name) {
        const index = this.nameToIndex[name.toUpperCase()];
        if (index === undefined) {
            throw new Error(`Invalid register name: ${name}`);
        }
        return this.read(index);
    }

    // --- Binary string methods ---
    /**
     * Writes a value to a register whose index is given as a binary string (e.g., '00000' for X0).
     * If the value itself is a binary string, it will be sign-extended to 64 bits using static signExtend.
     * @param {string} binStrIndex - The binary string representing the register index (e.g., '00000' for X0).
     * @param {number|BigInt|string} value - The value to write (will be converted to 64-bit binary, sign-extended if a binary string).
     */
    writeByBinary(binStrIndex, value) {
        // Renamed parameter from binStr to binStrIndex for clarity
        const index = parseInt(binStrIndex, 2);
        let valueToStore = value; // Default to the original value

        // If the value is a binary string, explicitly sign-extend it to 64 bits.
        // The _valueTo64BitBinary method called by this.write will then take this 64-bit string directly.
        if (typeof value === "string" && /^[01]+$/.test(value)) {
            valueToStore = LEGv8Registers.signExtend(value, 64);
        }
        this.write(index, valueToStore);
    }

    /**
     * Reads the 64-bit binary string value from a register whose index is given as a binary string.
     * @param {string} binStr - The binary string representing the register index.
     * @returns {string} The 64-bit binary string value of the register.
     */
    readByBinary(binStr) {
        const index = parseInt(binStr, 2);
        return this.read(index);
    }

    // === Utility ===

    /**
     * Finds the names of registers that currently hold a specific value.
     * The input value will be converted to its 64-bit binary representation for comparison.
     * @param {number|BigInt|string} value - The value to search for.
     * @returns {string[]} An array of register names that match the value,
     * or a message indicating no match.
     */
    findRegisterByValue(value) {
        const matches = [];
        const targetBinaryValue = this._valueTo64BitBinary(value);

        for (let i = 0; i < 32; i++) {
            // Use this.read(i) to ensure XZR is handled correctly
            if (this.read(i) === targetBinaryValue) {
                matches.push(this.registerMap[i]);
            }
        }
        return matches.length > 0
            ? matches
            : [`No register contains value ${value}`];
    }

    /**
     * Dumps the current state of all LEGv8 registers, showing both binary and decimal values.
     */
    dumpRegisters() {
        console.log("==== LEGv8 Register File ====");
        for (let i = 0; i < 32; i++) {
            const registerName = this.registerMap[i];
            const binaryValue = this.read(i); // Get the 64-bit binary string
            const decimalValue = this._binaryToBigInt(binaryValue); // Convert to BigInt for decimal display

            console.log(
                `${registerName.padEnd(
                    4
                )}: ${binaryValue} (Decimal: ${decimalValue})`
            );
        }
    }

    /**
     * Validates if a given index is within the valid range (0-31).
     * @param {number} index - The index to validate.
     * @throws {Error} If the index is out of range.
     */
    validateIndex(index) {
        if (index < 0 || index > 31) {
            throw new Error(
                `Invalid register index: ${index}. Must be between 0 and 31.`
            );
        }
    }

    /**
     * Converts a 64-bit two's complement binary string to a BigInt.
     * @param {string} binStr - The 64-bit binary string.
     * @returns {BigInt} The signed BigInt value.
     */
    static binaryToBigInt(binStr) {
        if (binStr.length != 64) {
            binStr = LEGv8Registers.signExtend(binStr, 64);
        }
        if (binStr.length !== 64 || !/^[01]+$/.test(binStr)) {
            throw new Error(
                `Invalid 64-bit binary string: ${binStr}. Must be exactly 64 bits and contain only '0' or '1'.`
            );
        }

        const isNegative = binStr[0] === "1"; // Check the sign bit
        let bigIntValue = BigInt("0b" + binStr);

        if (isNegative) {
            // Convert two's complement to signed BigInt
            const TWO_POWER_64 = 1n << 64n;
            bigIntValue = bigIntValue - TWO_POWER_64;
        }
        return bigIntValue;
    }

    /**
     * Chuyển một chuỗi nhị phân 64-bit (theo chuẩn two's complement) sang chuỗi hex 64-bit unsigned (two's complement).
     * @param {string} binStr - Chuỗi nhị phân 64-bit.
     * @returns {string} Chuỗi hex thập lục phân two's complement, ví dụ: '0xFFFFFFFFFFFFFFFE'.
     */
    static binaryToHex(binStr) {
        if (!/^[01]+$/.test(binStr) || binStr.length === 0) {
            throw new Error(
                `Invalid binary string: ${binStr}. Must contain only '0' or '1' and not be empty.`
            );
        }

        // Sign-extend nếu độ dài < 64
        if (binStr.length !== 64) {
            binStr = LEGv8Registers.signExtend(binStr, 64);
        }

        const signedBigInt = LEGv8Registers.binaryToBigInt(binStr); // signed BigInt từ two's complement

        // Nếu là số âm, cần cộng 2^64 để lấy two's complement unsigned hex
        const hexBigInt =
            signedBigInt < 0n ? (1n << 64n) + signedBigInt : signedBigInt;

        // Chuyển sang hex và bỏ các số 0 không có nghĩa ở đầu
        let hexStr = hexBigInt.toString(16).toUpperCase();

        // Đảm bảo có ít nhất 3 ký tự hex, đệm bằng '0' nếu cần
        if (hexStr.length < 3) {
            hexStr = hexStr.padStart(3, "0");
        }

        return `0x${hexStr}`;
    }

    /**
     * Static method to perform sign extension on a binary string.
     * It extends the given binary string to a specified target length by replicating its sign bit.
     * @param {string} binStr - The binary string to sign extend.
     * @param {number} [targetBits=64] - The desired length in bits. Defaults to 64 for LEGv8.
     * @returns {string} The sign-extended binary string.
     * @throws {Error} If the input binary string is invalid or targetBits is less than current length.
     */
    static signExtend(binStr, targetBits = 64) {
        if (!/^[01]+$/.test(binStr) || binStr.length === 0) {
            throw new Error(
                `Invalid binary string for sign extension: ${binStr}. Must contain only '0' or '1' and not be empty.`
            );
        }
        if (targetBits < binStr.length) {
            throw new Error(
                `Target bits (${targetBits}) cannot be less than the current binary string length (${binStr.length}).`
            );
        }

        const signBit = binStr[0]; // Get the most significant bit (sign bit)
        const extensionLength = targetBits - binStr.length;

        if (extensionLength === 0) {
            return binStr; // Already at target length
        }

        // Create the extension string by repeating the sign bit
        const extension = signBit.repeat(extensionLength);

        return extension + binStr;
    }

    /**
     * Converts a number, BigInt, or binary string value to a 64-bit two's complement binary string.
     * Handles positive and negative numbers within the 64-bit signed integer range.
     * @param {number|BigInt|string} value - The value to convert.
     * @returns {string} A 64-bit binary string.
     * @throws {Error} If the input value is invalid.
     */
    static valueTo64BitBinary(value) {
        let bigIntValue;

        // Try to convert string input to BigInt or validate as binary string
        if (typeof value === "string") {
            if (/^[01]+$/.test(value)) {
                // Looks like a binary string
                // Ensure it's not longer than 64 bits; pad with sign bit if shorter
                if (value.length > 64) {
                    throw new Error(
                        `Binary string too long (max 64 bits): ${value}`
                    );
                }
                // This part already does sign-extension/padding for binary strings
                return value.padStart(64, value[0] === "1" ? "1" : "0");
            }
            try {
                bigIntValue = BigInt(value);
            } catch (e) {
                throw new Error(
                    `Invalid string value for conversion: ${value}`
                );
            }
        } else if (typeof value === "number") {
            // Check if the number can be safely represented as a BigInt
            if (!Number.isInteger(value)) {
                throw new Error(
                    `Non-integer number value: ${value}. Only integers are supported for registers.`
                );
            }
            bigIntValue = BigInt(value);
        } else if (typeof value === "bigint") {
            bigIntValue = value;
        } else {
            throw new Error(
                `Invalid value type: ${typeof value}. Expected number, BigInt, or string.`
            );
        }

        // Define 64-bit limits for signed integers
        const TWO_POWER_63 = 1n << 63n; // 2^63
        const TWO_POWER_64 = 1n << 64n; // 2^64

        if (bigIntValue >= 0n) {
            bigIntValue = bigIntValue % TWO_POWER_64;
        } else {
            // For negative numbers, ensure it wraps correctly into the positive range
            // before converting to binary, then pad with '1's if it implies a negative number
            bigIntValue = bigIntValue % TWO_POWER_64;
            if (bigIntValue < 0n) {
                bigIntValue += TWO_POWER_64;
            }
        }

        let binaryString = bigIntValue.toString(2);

        return binaryString.padStart(64, "0");
    }

    /**
     * Calculate and return the NZCV flags based on the result of an operation
     * @param {string} result - The 64-bit binary result
     * @param {string} operand1 - The 64-bit binary first operand
     * @param {string} operand2 - The 64-bit binary second operand
     * @param {string} operation - The operation type ('ADD', 'SUB', etc.)
     * @returns {Object} Object containing the NZCV flags as strings ("0" or "1")
     */
    getStatusFlags(result, operand1, operand2, operation) {
        // Convert binary strings to BigInt for calculations
        const resultValue = BigInt('0b' + result);
        const op1Value = BigInt('0b' + operand1);
        const op2Value = BigInt('0b' + operand2);
        
        // Calculate Negative and Zero flags
        const isNegative = result[0] === '1';
        const isZero = resultValue === 0n;
        
        // Initialize Carry and Overflow
        let isCarry = false;
        let isOverflow = false;
        
        if (operation === 'ADD') {
            // Carry: Set if unsigned addition produces a carry
            const maxUnsigned = BigInt('0b' + '1'.repeat(64));
            isCarry = (op1Value + op2Value) > maxUnsigned;
            
            // Overflow: Set if signed addition produces a wrong sign
            const op1Negative = operand1[0] === '1';
            const op2Negative = operand2[0] === '1';
            const resultNegative = result[0] === '1';
            isOverflow = (op1Negative === op2Negative) && (op1Negative !== resultNegative);
        } 
        else if (operation === 'SUB') {
            // For subtraction, carry is set if there's no borrow
            isCarry = op1Value >= op2Value;
            
            // Overflow: Set if signed subtraction produces a wrong sign
            const op1Negative = operand1[0] === '1';
            const op2Negative = operand2[0] === '1';
            const resultNegative = result[0] === '1';
            isOverflow = (op1Negative !== op2Negative) && (op1Negative !== resultNegative);
        }
        
        // Return flags as strings "0" or "1"
        return {
            N: isNegative ? "1" : "0",  // Negative
            Z: isZero ? "1" : "0",      // Zero
            C: isCarry ? "1" : "0",     // Carry
            V: isOverflow ? "1" : "0"   // Overflow
        };
    }
}
