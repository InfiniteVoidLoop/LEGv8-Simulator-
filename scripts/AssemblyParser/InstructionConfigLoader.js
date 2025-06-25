// Hard-coded CSV data
const INSTRUCTION_DATA = `Mnemonic,Format,OpcodeID(Bin),Rec2Loc,UncondBranch,FlagBranch,ZeroBranch,MemRead,MemToReg,MemWrite,FlagWrite,ALUSrc,ALUOp,RegWrite,ALUControlOut,Note
# R-Format
ADD,R,10001011000,0,0,0,0,0,0,0,0,0,10,1,0010,add
ADDS,R,10101011000,0,0,0,0,0,0,0,1,0,10,1,0010,add
AND,R,10001010000,0,0,0,0,0,0,0,0,0,10,1,0000,and
ANDS,R,11101010000,0,0,0,0,0,0,0,1,0,10,1,0000,and
SUB,R,11001011000,0,0,0,0,0,0,0,0,0,10,1,0110,sub
SUBS,R,11101011000,0,0,0,0,0,0,0,1,0,10,1,0110,sub
ORR,R,10101010000,0,0,0,0,0,0,0,0,0,10,1,0001,or
EOR,R,11101010000,0,0,0,0,0,0,0,0,0,10,1,0011, xor
LSR,R,11010011010,0,0,0,0,0,0,0,0,1,10,1,1001,shift right
LSL,R,11010011011,0,0,0,0,0,0,0,0,1,10,1,1000,shift left
BR,R,11010110000,0,1,0,0,0,0,0,0,0,0,0,0,RET ~ BR X30
# I-Format
ORRI,I,1011001000,0,0,0,0,0,0,0,0,1,10,1,0001,or
EORI,I,1101001000,0,0,0,0,0,0,0,0,1,10,1,0011,xor
ADDI,I,1001000100,0,0,0,0,0,0,0,0,1,10,1,0010,add
ADDIS,I,1011000100,0,0,0,0,0,0,0,1,1,10,1,0010,add
ANDI,I,1001001000,0,0,0,0,0,0,0,0,1,10,1,0000,and
ANDIS,I,1111001000,0,0,0,0,0,0,0,1,1,10,1,0000,and
SUBI,I,1101000100,0,0,0,0,0,0,0,0,1,10,1,0110,sub
SUBIS,I,1111000100,0,0,0,0,0,0,0,1,1,10,1,0110,sub
# D-Format
STURB,D,00111000000,1,0,0,0,0,0,1,0,1,00,0,0010,byte(8bits)
LDURB,D,00111000010,0,0,0,0,1,1,0,0,1,00,1,0010,byte(8bits)
STURH,D,01111000000,1,0,0,0,0,0,1,0,1,00,0,0010,halfword(16bits)
LDURH,D,01111000010,0,0,0,0,1,1,0,0,1,00,1,0010,halfword(16bits)
STURW,D,10111000000,1,0,0,0,0,0,1,0,1,00,0,0010,word(32bits)
LDURSW,D,10111000100,0,0,0,0,1,1,0,0,1,00,1,0010,word(32bits)
STUR,D,11111000000,1,0,0,0,0,0,1,0,1,00,0,0010,1984
LDUR,D,11111000010,0,0,0,0,1,1,0,0,1,00,1,0010,1986
# IM-Format
MOVZ,IM,110100101,0,0,0,0,0,0,0,0,1,11,1,1111,Nap 0 + immediate
MOVK,IM,111100101,0,0,0,0,0,0,0,0,1,11,1,1110,ghi immediate vao bit thich hop
# B-Format
B,B,000101,0,1,0,0,0,0,0,0,0,0,0,0,null
BL,B,100101,0,1,0,0,0,0,0,0,0,0,0,0,"// Luu dia chi quay lai vao X30, dung RET de quay lai"
# CB-Format
CBZ,C,10110100,1,0,0,1,0,0,0,0,0,01,0,0111,null
CBNZ,C,10110101,1,0,0,1,0,0,0,0,0,01,0,0111,null
B.EQ,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,Z=1
B.NE,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,Z=0
B.MI,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,N=1
B.PL,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,N=0
B.VS,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,V=1
B.VC,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,V=0
B.HI,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,(Z=0 & C=1)
B.LS,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,~(Z=0 & C=1)
B.GE,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,N=V
B.LT,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,N!=V
B.GT,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,(Z=0 & N=V)
B.LE,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,~(Z=0 & N=V)
B.HS,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,C=1
B.LO,C,01010100,1,0,0,1,0,0,0,0,0,0,0,0,C=0`;

/**
 * Console logging colors (simplified version)
 */
const ColoredLog = {
    PENDING: "\x1b[33m[PENDING] \x1b[0m",
    SUCCESS: "\x1b[32m[SUCCESS] \x1b[0m",
    WARNING: "\x1b[33m[WARNING] \x1b[0m",
    ERROR: "\x1b[31m[ERROR] \x1b[0m",
    FAILURE: "\x1b[31m[FAILURE] \x1b[0m",
};

/**
 * JavaScript version of InstructionConfigLoader
 */
class InstructionConfigLoader {
    /**
     * Constructor initializes the maps
     */
    constructor() {
        /**
         * A map that stores instruction definitions based on their opcode ID and format.
         * The key is the opcode ID, and the value is a map of format characters to InstructionDefinition objects.
         */
        this.detailedDefinitionMap = new Map();

        /**
         * A map that stores instruction definitions based on their mnemonic.
         * The key is the mnemonic string, and the value is the corresponding InstructionDefinition object.
         */
        this.mnemonicMap = new Map();
    }

    /**
     * Retrieves the InstructionDefinition based on the opcode ID and format.
     * @param {number} opcodeId The opcode ID of the instruction.
     * @param {string} format The format character of the instruction (e.g., 'R', 'I', 'D', etc.).
     * @returns {InstructionDefinition|null} The InstructionDefinition object corresponding to the given opcode ID and format, or null if not found.
     */
    getDefinition(opcodeId, format) {
        const formatMap = this.detailedDefinitionMap.get(opcodeId);
        return formatMap ? formatMap.get(format) || null : null;
    }

    /**
     * Retrieves the InstructionDefinition based on the mnemonic.
     * @param {string} mnemonic The mnemonic string of the instruction.
     * @returns {InstructionDefinition|null} The InstructionDefinition object corresponding to the given mnemonic, or null if not found.
     */
    getDefinitionByMnemonic(mnemonic) {
        return this.mnemonicMap.get(mnemonic.toUpperCase()) || null;
    }

    /**
     * Retrieves the mnemonic map.
     * @returns {Map<string, InstructionDefinition>} The map of mnemonics to their corresponding InstructionDefinition objects.
     */
    getMnemonicMap() {
        return this.mnemonicMap;
    }

    /**
     * Loads the instruction configuration from the hard-coded CSV data.
     * @returns {boolean} true if the configuration was loaded successfully, false otherwise.
     */
    loadConfig() {
        this.detailedDefinitionMap.clear();
        this.mnemonicMap.clear();
        console.log(
            ColoredLog.PENDING +
                "Loading instruction configuration from hard-coded data"
        );

        try {
            const lines = INSTRUCTION_DATA.split("\n");
            let lineNumber = 0;
            let headerSkipped = false;

            for (const line of lines) {
                lineNumber++;
                const trimmedLine = line.trim();

                // Skip empty lines and comments
                if (
                    !trimmedLine ||
                    trimmedLine.startsWith("#") ||
                    trimmedLine.startsWith("//")
                ) {
                    continue;
                }

                // Skip header line
                if (
                    !headerSkipped &&
                    (trimmedLine.toLowerCase().includes("mnemonic") ||
                        trimmedLine.toLowerCase().includes("opcode"))
                ) {
                    headerSkipped = true;
                    continue;
                }

                const parts = trimmedLine.split(",");
                if (parts.length !== 16) {
                    console.warn(
                        `${ColoredLog.WARNING}ConfigLoader WARNING line ${lineNumber}: Incorrect field count (${parts.length}, expected 16). Skipping: ${trimmedLine}`
                    );
                    continue;
                }

                try {
                    const mnemonic = parts[0].trim().toUpperCase();

                    const formatStr = parts[1].trim().toUpperCase();
                    const formatChar = this.parseFormat(formatStr);
                    if (formatChar === "?") {
                        console.warn(
                            `${ColoredLog.WARNING}ConfigLoader WARNING line ${lineNumber}: Unknown format '${formatStr}' for ${mnemonic}. Skipping.`
                        );
                        continue;
                    }

                    const opcodeIdStr = parts[2].trim();
                    if (!opcodeIdStr) {
                        console.warn(
                            `${ColoredLog.WARNING}ConfigLoader WARNING line ${lineNumber}: Empty Opcode ID for ${mnemonic}. Skipping.`
                        );
                        continue;
                    }
                    const opcode = parseInt(opcodeIdStr, 2);

                    const reg2Loc = this.parseFlag(
                        parts[3],
                        mnemonic,
                        "Reg2Loc"
                    );
                    const uncondBranch = this.parseFlag(
                        parts[4],
                        mnemonic,
                        "UncondBranch"
                    );
                    const flagBranch = this.parseFlag(
                        parts[5],
                        mnemonic,
                        "FlagBranch"
                    );
                    const zeroBranch = this.parseFlag(
                        parts[6],
                        mnemonic,
                        "ZeroBranch"
                    );
                    const memRead = this.parseFlag(
                        parts[7],
                        mnemonic,
                        "MemRead"
                    );
                    const memToReg = this.parseFlag(
                        parts[8],
                        mnemonic,
                        "MemToReg"
                    );
                    const memWrite = this.parseFlag(
                        parts[9],
                        mnemonic,
                        "MemWrite"
                    );
                    const flagWrite = this.parseFlag(
                        parts[10],
                        mnemonic,
                        "FlagWrite"
                    );
                    const aluSrc = this.parseFlag(
                        parts[11],
                        mnemonic,
                        "ALUSrc"
                    );
                    const aluOp = this.parseBinary(
                        parts[12],
                        mnemonic,
                        "ALUOp"
                    );
                    const regWrite = this.parseFlag(
                        parts[13],
                        mnemonic,
                        "RegWrite"
                    );
                    const aluControlOut = this.parseBinary(
                        parts[14],
                        mnemonic,
                        "ALUControlOut"
                    );

                    const signals = new ControlSignals(
                        reg2Loc,
                        uncondBranch,
                        flagBranch,
                        zeroBranch,
                        memRead,
                        memToReg,
                        memWrite,
                        flagWrite,
                        aluSrc,
                        aluOp,
                        regWrite,
                        aluControlOut
                    );

                    const definition = new InstructionDefinition(
                        mnemonic,
                        formatChar,
                        opcode,
                        signals
                    );

                    // Add to detailed definition map
                    if (!this.detailedDefinitionMap.has(opcode)) {
                        this.detailedDefinitionMap.set(opcode, new Map());
                    }
                    this.detailedDefinitionMap
                        .get(opcode)
                        .set(formatChar, definition);

                    // Add to mnemonic map if not already present
                    if (!this.mnemonicMap.has(mnemonic)) {
                        this.mnemonicMap.set(mnemonic, definition);
                    }
                } catch (error) {
                    if (error.message.includes("Invalid number format")) {
                        console.error(
                            `${ColoredLog.FAILURE}ConfigLoader ERROR line ${lineNumber}: Invalid number format (OpcodeID?). Skipping: ${trimmedLine} - ${error.message}`
                        );
                    } else {
                        console.error(
                            `${ColoredLog.FAILURE}ConfigLoader ERROR line ${lineNumber}: Cannot parse line: ${trimmedLine} - ${error.message}`
                        );
                    }
                }
            }

            console.log(
                `${ColoredLog.SUCCESS}Instruction configuration loaded. ${
                    this.mnemonicMap.size
                } unique mnemonics, ${this.countTotalDefinitions()} opcode/format definitions.`
            );

            // console.log("--- Loaded Instruction Definitions ---");
            // this.detailedDefinitionMap.forEach((formatMap, opcodeId) => {
            //     let output = `  Opcode ID ${opcodeId}: `;
            //     formatMap.forEach((def, format) => {
            //         output += `${def.getMnemonic()} (${format}) `;
            //     });
            //     console.log(output);
            // });
            // console.log("-------------------------------------");

            // console.log("--- Loaded Mnemonics ---");
            // this.mnemonicMap.forEach((def, mnemonic) => {
            //     console.log(`  '${mnemonic}' -> ${def.getMnemonic()}`);
            // });
            // console.log("-----------------------");

            return true;
        } catch (error) {
            console.error(
                ColoredLog.ERROR +
                    "ConfigLoader FATAL ERROR: Cannot process config data: " +
                    error.message
            );
            console.error(error);
            return false;
        }
    }

    /**
     * Parses the format string and returns the corresponding format character.
     * @param {string} formatStr The format string to parse.
     * @returns {string} The corresponding format character ('R', 'I', 'D', 'B', 'C', 'M') or '?' if unknown.
     */
    parseFormat(formatStr) {
        switch (formatStr) {
            case "R":
                return "R";
            case "I":
                return "I";
            case "D":
                return "D";
            case "B":
                return "B";
            case "CB":
            case "C":
                return "C";
            case "IM":
            case "M":
                return "M";
            default:
                return "?";
        }
    }

    /**
     * Parses a flag string and returns its character value.
     * @param {string} flagStr The flag string to parse.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} flagName The name of the flag (for error messages).
     * @returns {string} The character value of the flag ('1', '0', or '0').
     */
    parseFlag(flagStr, mnemonic, flagName) {
        const trimmed = flagStr.trim();
        if (trimmed === "0" || trimmed === "1" || trimmed === "0") {
            return trimmed;
        } else {
            throw new Error(
                `ConfigLoader ERROR: Invalid flag value '${trimmed}' for ${mnemonic}/${flagName}. Expected '1', '0', or '0'.`
            );
        }
    }

    /**
     * Parses a binary string and returns its integer value.
     * @param {string} binStr The binary string to parse.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} fieldName The name of the field (for error messages).
     * @returns {number} The parsed integer value.
     */
    parseBinary(binStr, mnemonic, fieldName) {
        try {
            if (binStr === "0") {
                return 404; // Treat 0 as 404 not found
            }
            return parseInt(binStr.trim(), 2);
        } catch (error) {
            console.warn(
                `${ColoredLog.WARNING}ConfigLoader WARNING: Invalid binary value '${binStr}' for ${mnemonic}/${fieldName}. Assuming 0.`
            );
            return 0;
        }
    }

    /**
     * Counts the total number of instruction definitions loaded.
     * @returns {number} The total count of instruction definitions.
     */
    countTotalDefinitions() {
        let count = 0;
        this.detailedDefinitionMap.forEach((formatMap) => {
            count += formatMap.size;
        });
        return count;
    }
}

// Example usage:
// const loader = new InstructionConfigLoader();
// if (loader.loadConfig()) {
//     console.log("Configuration loaded successfully!");
//
//     // Get definition by mnemonic
//     const addDef = loader.getDefinitionByMnemonic("ADD");
//     console.log("ADD instruction:", addDef);
//
//     // Get definition by opcode and format
//     const def = loader.getDefinition(1099, 'R'); // ADD instruction opcode in decimal
//     console.log("Definition by opcode:", def);
// }

// Export for use in other modules (Node.js style)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        InstructionConfigLoader,
        InstructionDefinition,
        ControlSignals,
    };
}
