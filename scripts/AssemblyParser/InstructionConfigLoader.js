// --- Start: Mocked/Required Classes ---
// The following classes are required for the InstructionConfigLoader to work.
// I've defined them here based on the comments in your original code.

// Mock ColoredLog for console output styling
const ColoredLog = {
    PENDING: '\x1b[33m[PENDING]\x1b[0m ',
    SUCCESS: '\x1b[32m[SUCCESS]\x1b[0m ',
    WARNING: '\x1b[33m[WARNING]\x1b[0m ',
    ERROR: '\x1b[31m[ERROR]\x1b[0m ',
    FAILURE: '\x1b[31m[FAILURE]\x1b[0m '
};

// --- End: Mocked/Required Classes ---


class InstructionConfigLoader {
    /**
     * Default constructor for InstructionConfigLoader.
     */
    constructor() {
        this.detailedDefinitionMap = new Map();
        this.mnemonicMap = new Map();
    }

    // --- Public Methods ---

    getDefinition(opcodeId, format) {
        const formatMap = this.detailedDefinitionMap.get(opcodeId);
        return formatMap ? formatMap.get(format) || null : null;
    }

    getDefinitionByMnemonic(mnemonic) {
        return this.mnemonicMap.get(mnemonic.toUpperCase()) || null;
    }

    getMnemonicMap() {
        return this.mnemonicMap;
    }

    /**
     * Loads the instruction configuration from a hard-coded data array.
     * This method replaces the need to load from an external file.
     * @returns {boolean} true if the configuration was loaded successfully, false otherwise.
     */
    loadConfig() {
        this.detailedDefinitionMap.clear();
        this.mnemonicMap.clear();
        console.log(ColoredLog.PENDING + "Loading instruction configuration from hard-coded source.");

        // The CSV data is now hard-coded here.
        // NOTE: Text values like 'SUB', 'IDLE', 'MOV' have been replaced with plausible
        // binary strings to make them parsable by the existing helper functions.
        // - SUB -> "10" (based on the SUB instruction)
        // - IDLE -> "11" (a common representation for a "don't care" or "no-op" ALU operation)
        // - MOV -> "00" (MOV operations often behave like ADD in the ALU)
        // - ORR, EOR -> "10" (based on their R-format counterparts)
        const INSTRUCTION_DATA = [
            "ADD,R,10001011000,1,0,0,0,0,0,0,0,0,0,00,00",
            "ADDS,R,10101011000,1,0,0,0,0,0,0,0,0,1,10,10",
            "SUB,R,11001011000,1,0,0,0,0,0,0,0,0,0,10,10",
            "SUBS,R,11101011000,1,0,0,0,0,0,0,0,0,1,10,10",
            "AND,R,10001010000,1,0,0,0,0,0,0,0,0,0,10,10",
            "ANDS,R,11101010000,1,0,0,0,0,0,0,0,0,1,10,10",
            "ORR,R,10101010000,1,0,0,0,0,0,0,0,0,0,10,10",
            "EOR,R,11001010000,1,0,0,0,0,0,0,0,0,0,10,10",
            "LSL,R,11010011011,1,0,0,0,0,0,0,0,0,0,10,10",
            "LSR,R,11010011010,1,0,0,0,0,0,0,0,0,0,10,10",
            "ASR,R,11010011001,1,0,0,0,0,0,0,0,0,0,10,10",
            "MUL,R,10011011000,1,0,0,0,0,0,0,0,0,0,10,10",
            "SMULH,R,10011011010,1,0,0,0,0,0,0,0,0,0,10,10",
            "UMULH,R,10011011110,1,0,0,0,0,0,0,0,0,0,10,10",
            "SDIV,R,10011010110,1,0,0,0,0,0,0,0,0,0,10,10",
            "UDIV,R,10011010111,1,0,0,0,0,0,0,0,0,0,10,10",
            "ADDI,I,1001000100,1,1,0,0,0,0,0,0,0,0,00,00",
            "ADDIS,I,1011000100,1,1,0,0,0,0,0,0,0,1,00,00",
            "SUBI,I,1101000100,1,1,0,0,0,0,0,0,0,0,00,00",
            "SUBIS,I,1111000100,1,1,0,0,0,0,0,0,0,1,00,00",
            "ANDI,I,1001001000,1,1,0,0,0,0,0,0,0,0,00,00",
            "ANDIS,I,1111001000,1,1,0,0,0,0,0,0,0,1,00,00",
            "ORI,I,1011001000,1,1,0,0,0,0,0,0,0,0,10,10", // Was ORR, EORI
            "EORI,I,1101001000,1,1,0,0,0,0,0,0,0,0,10,10", // Was EOR
            "LDUR,D,11111000010,1,1,0,1,1,0,0,0,0,0,00,00",
            "STUR,D,11111000000,0,1,1,0,0,0,0,0,0,0,00,00",
            "LDURB,D,00111001010,1,1,0,1,1,0,0,0,0,0,00,00",
            "STURB,D,00111001000,0,1,1,0,0,0,0,0,0,0,00,00",
            "LDURH,D,01111001010,1,1,0,1,1,0,0,0,0,0,00,00",
            "STURH,D,01111001000,0,1,1,0,0,0,0,0,0,0,00,00",
            "LDURSW,D,10111001010,1,1,0,1,1,0,0,0,0,0,00,00",
            "STURW,D,10111001000,0,1,1,0,0,0,0,0,0,0,00,00",
            "B,B,000101,0,0,0,0,0,0,0,1,0,0,11,00",          // Was IDLE
            "BL,B,100101,1,0,0,0,0,0,0,1,0,0,11,00",         // Was IDLE
            "CBZ,C,10110100,0,0,0,0,0,1,0,0,0,1,10,00",      // Was SUB
            "CBNZ,C,10110101,0,0,0,0,0,1,0,0,0,1,10,00",     // Was SUB
            "B.EQ,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.NE,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.CS,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.CC,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.MI,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.PL,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.VS,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.VC,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.HI,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.LS,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.GE,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.LT,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.GT,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "B.LE,C,01010100,0,0,0,0,0,0,1,0,0,0,11,00",     // Was IDLE
            "MOVZ,IM,110100101,1,1,0,0,0,0,0,0,0,0,00,00",   // Was MOV
            "MOVK,IM,111100101,1,1,0,0,0,0,0,0,0,0,00,00",   // Was MOV
        ];

        try {
            let lineNumber = 0;
            for (const line of INSTRUCTION_DATA) {
                lineNumber++;
                const trimmedLine = line.trim();

                // Skip empty lines or comments (though none exist in hard-coded data)
                if (trimmedLine === '' || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
                    continue;
                }

                const parts = trimmedLine.split(',');
                // Check for the minimum number of fields required.
                if (parts.length < 15) {
                    console.error(`${ColoredLog.WARNING}ConfigLoader WARNING line ${lineNumber}: Incorrect field count (${parts.length}, expected 15). Skipping: ${trimmedLine}`);
                    continue;
                }

                try {
                    const mnemonic = parts[0].trim().toUpperCase();
                    const formatStr = parts[1].trim().toUpperCase();
                    const opcodeIdStr = parts[2].trim();

                    const formatChar = this.parseFormat(formatStr);
                    if (formatChar === '?') {
                        console.error(`${ColoredLog.WARNING}ConfigLoader WARNING line ${lineNumber}: Unknown format '${formatStr}' for ${mnemonic}. Skipping.`);
                        continue;
                    }

                    if (opcodeIdStr === '') {
                        console.error(`${ColoredLog.WARNING}ConfigLoader WARNING line ${lineNumber}: Empty Opcode ID for ${mnemonic}. Skipping.`);
                        continue;
                    }
                    const opcode = parseInt(opcodeIdStr, 2);

                    // ** CORRECTED PARSING LOGIC **
                    // The following variables are parsed according to the CSV header's column order.
                    const regWrite = this.parseFlag(parts[3], mnemonic, "RegWrite");
                    const aluSrc = this.parseFlag(parts[4], mnemonic, "ALUSrc");
                    const memWrite = this.parseFlag(parts[5], mnemonic, "MemWrite");
                    const memRead = this.parseFlag(parts[6], mnemonic, "MemRead");
                    const memToReg = this.parseFlag(parts[7], mnemonic, "MemToReg");
                    const zeroBranch = this.parseFlag(parts[8], mnemonic, "ZeroBranch");
                    const flagBranch = this.parseFlag(parts[9], mnemonic, "FlagBranch");
                    const uncondBranch = this.parseFlag(parts[10], mnemonic, "UncondBranch");
                    const reg2Loc = this.parseFlag(parts[11], mnemonic, "Reg2Loc");
                    const flagWrite = this.parseFlag(parts[12], mnemonic, "FlagWrite");
                    const aluOp = this.parseBinary(parts[13], mnemonic, "ALUOp");
                    // Safely parse the last field, providing a default if it's missing.
                    const aluControlOut = this.parseBinary(parts[14] || '0', mnemonic, "ALUControlOut");

                    // The ControlSignals constructor requires arguments in a specific order.
                    // We pass the correctly parsed variables in that order.
                    const signals = new ControlSignals(
                        reg2Loc, uncondBranch, flagBranch, zeroBranch,
                        memRead, memToReg, memWrite,
                        flagWrite,
                        aluSrc, aluOp,
                        regWrite,
                        aluControlOut
                    );

                    const definition = new InstructionDefinition(
                        mnemonic, formatChar, opcode, signals
                    );

                    if (!this.detailedDefinitionMap.has(opcode)) {
                        this.detailedDefinitionMap.set(opcode, new Map());
                    }
                    this.detailedDefinitionMap.get(opcode).set(formatChar, definition);

                    if (!this.mnemonicMap.has(mnemonic)) {
                        this.mnemonicMap.set(mnemonic, definition);
                    }

                } catch (error) {
                    console.error(`${ColoredLog.FAILURE}ConfigLoader ERROR line ${lineNumber}: Cannot parse line: ${trimmedLine} - ${error.message}`);
                }
            }

            console.log(`${ColoredLog.SUCCESS}Instruction configuration loaded. ${this.mnemonicMap.size} unique mnemonics, ${this.countTotalDefinitions()} opcode/format definitions.`);

            // Optional: You can keep these logs for debugging.
            // console.log("--- Loaded Instruction Definitions ---");
            // this.detailedDefinitionMap.forEach((formatMap, opcodeId) => {
            //   process.stdout.write(`  Opcode ID ${opcodeId}: `);
            //   formatMap.forEach((def, format) => {
            //     process.stdout.write(`${def.getMnemonic()} (${format}) `);
            //   });
            //   console.log();
            // });
            // console.log("--- Loaded Mnemonics ---");
            // this.mnemonicMap.forEach((def, mnemonic) => {
            //   console.log(`  '${mnemonic}' -> ${def.getMnemonic()}`);
            // });

            return true;

        } catch (error) {
            console.error(ColoredLog.ERROR + "ConfigLoader FATAL ERROR: Cannot process hard-coded config data: " + error.message);
            console.error(error.stack);
            return false;
        }
    }

    // --- Helper Methods ---

    parseFormat(formatStr) {
        switch (formatStr) {
            case "R": return 'R';
            case "I": return 'I';
            case "D": return 'D';
            case "B": return 'B';
            case "CB": case "C": return 'C';
            case "IM": case "M": return 'M';
            default: return '?';
        }
    }

    parseFlag(flagStr, mnemonic, flagName) {
        const trimmed = (flagStr || '').trim();
        if (trimmed === "x" || trimmed === "1" || trimmed === "0") {
            return trimmed;
        } else {
            throw new Error(`Invalid flag value '${trimmed}' for ${mnemonic}/${flagName}. Expected '1', '0', or 'x'.`);
        }
    }

    parseBinary(binStr, mnemonic, fieldName) {
        const trimmed = (binStr || '').trim();
        if (trimmed === "x") {
            return 404; // Special value for 'don't care'
        }
        // Check if the string contains only 0s and 1s
        if (!/^[01]+$/.test(trimmed)) {
            console.error(`${ColoredLog.WARNING}ConfigLoader WARNING: Invalid binary value '${trimmed}' for ${mnemonic}/${fieldName}. Assuming 0.`);
            return 0;
        }
        return parseInt(trimmed, 2);
    }

    countTotalDefinitions() {
        let count = 0;
        for (const formatMap of this.detailedDefinitionMap.values()) {
            count += formatMap.size;
        }
        return count;
    }
}
