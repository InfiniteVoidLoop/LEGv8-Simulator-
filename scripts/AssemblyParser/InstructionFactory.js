/**
 * InstructionFactory - Creates instruction objects from bytecode or assembly
 */
class InstructionFactory {
    // --- Constants ---
    // The opcode value for B.cond instructions is 0b01010100 (84 in decimal).
    static BCOND_OPCODE_VALUE = 0b01010100;

    // --- Fields ---
    // The InstructionConfigLoader instance used to load instruction definitions.
    static configLoader = null;

    // --- Constructor ---
    /**
     * Private constructor to prevent instantiation.
     */
    constructor() {
        throw new Error("InstructionFactory is a singleton and should not be instantiated directly.");
    }

    // --- Static Methods ---

    /**
     * Initializes the InstructionFactory with a given InstructionConfigLoader.
     * @param {Object} loader The InstructionConfigLoader to use for loading instruction definitions.
     * @throws {Error} if the loader is null.
     */
    static initialize(loader) {
        if (!loader) {
            throw new Error("ConfigLoader cannot be null for InstructionFactory.");
        }
        this.configLoader = loader;
        console.log("✓ InstructionFactory initialized.");
    }

    /**
     * Checks if the InstructionFactory has been initialized.
     * @returns {boolean} true if initialized, false otherwise.
     */
    static isInitialized() {
        return this.configLoader !== null;
    }

    /**
     * Creates an instruction object from the given bytecode.
     * @param {number[]} bytecode The bytecode of the instruction as a bit array.
     * @returns {Object} An Instruction object representing the instruction.
     * @throws {Error} if the factory is not initialized.
     * @throws {Error} if the bytecode is null.
     * @throws {InvalidInstructionException} if the bytecode cannot be decoded or no definition is found.
     */
    static createFromBytecode(bytecode) {
        if (!this.configLoader) {
            throw new Error("InstructionFactory not initialized.");
        }
        if (!bytecode) {
            throw new Error("Bytecode cannot be null.");
        }

        let definition = null;
        let identifiedFormat = '?';
        let opcodeId;

        // Check for B.cond instruction first
        opcodeId = Instruction.extractBits(bytecode, 24, 31);
        if (opcodeId === this.BCOND_OPCODE_VALUE) {
            const condCode = Instruction.extractBits(bytecode, 0, 3);
            const bCondMnemonic = "B." + this.getConditionMnemonic(condCode);
            definition = this.configLoader.getDefinitionByMnemonic(bCondMnemonic);

            console.log(`ℹ Factory Debug: B.cond detected. Mnem='${bCondMnemonic}'. Definition found: ${definition ? definition.getMnemonic() : "NULL"}`);
            
            if (definition && definition.getFormat() === 'C') {
                identifiedFormat = 'C';
                console.log(`ℹ Factory Decode Hint: Identified B.cond -> ${bCondMnemonic}`);
            } else {
                console.error(`❌ FATAL Factory Error: Missing or incorrect definition for ${bCondMnemonic} (Cond: ${condCode}) in config.`);
                throw new InvalidInstructionException(`Missing or invalid definition for ${bCondMnemonic}`);
            }
        } else {
            definition = this.configLoader.getDefinition(opcodeId, 'C');
            if (definition) {
                identifiedFormat = 'C';
            }
        }

        // Check for IM format 
        if (identifiedFormat === '?') {
            opcodeId = Instruction.extractBits(bytecode, 23, 31);
            definition = this.configLoader.getDefinition(opcodeId, 'M');
            if (definition) identifiedFormat = 'M';
        }

        // Check for I format
        if (identifiedFormat === '?') {
            opcodeId = Instruction.extractBits(bytecode, 22, 31);
            definition = this.configLoader.getDefinition(opcodeId, 'I');
            if (definition) identifiedFormat = 'I';
        }

        // Check for D format
        if (identifiedFormat === '?') {
            opcodeId = Instruction.extractBits(bytecode, 21, 31);
            definition = this.configLoader.getDefinition(opcodeId, 'D');
            if (definition) identifiedFormat = 'D';
        }

        // Check for R format
        if (identifiedFormat === '?') {
            opcodeId = Instruction.extractBits(bytecode, 21, 31);
            definition = this.configLoader.getDefinition(opcodeId, 'R');
            if (definition) identifiedFormat = 'R';
        }

        // Check for B format
        if (identifiedFormat === '?') {
            opcodeId = Instruction.extractBits(bytecode, 26, 31);
            definition = this.configLoader.getDefinition(opcodeId, 'B');
            if (definition) identifiedFormat = 'B';
        }

        // Definition not found
        if (!definition) {
            const bitsStr = Instruction.formatBitSet(bytecode);
            throw new InvalidInstructionException(`Could not decode instruction or find definition for bytecode: ${bitsStr}`);
        }

        try {
            switch (definition.getFormat()) {
                case 'R':
                    return new RFormatInstruction(bytecode, definition);
                case 'I':
                    return new IFormatInstruction(bytecode, definition);
                case 'D':
                    return new DFormatInstruction(bytecode, definition);
                case 'B':
                    return new BFormatInstruction(bytecode, definition);
                case 'C':
                    return new CBFormatInstruction(bytecode, definition);
                case 'M':
                    return new IMFormatInstruction(bytecode, definition);
                default:
                    throw new InvalidInstructionException(`Unsupported format '${definition.getFormat()}' found for mnemonic ${definition.getMnemonic()}`);
            }
        } catch (error) {
            throw new InvalidInstructionException(`Error creating instruction object for ${definition.getMnemonic()}: ${error.message}`, error);
        }
    }

    /**
     * Converts a condition code to its mnemonic representation.
     * @param {number} condCode The condition code (0-15).
     * @returns {string} The mnemonic representation of the condition code.
     */
    static getConditionMnemonic(condCode) {
        condCode &= 0xF;
        switch (condCode) {
            case 0b0000: return "EQ";
            case 0b0001: return "NE";
            case 0b0010: return "HS";
            case 0b0011: return "LO";
            case 0b0100: return "MI";
            case 0b0101: return "PL";
            case 0b0110: return "VS";
            case 0b0111: return "VC";
            case 0b1000: return "HI";
            case 0b1001: return "LS";
            case 0b1010: return "GE";
            case 0b1011: return "LT";
            case 0b1100: return "GT";
            case 0b1101: return "LE";
            default: return "??";
        }
    }

    /**
     * Creates an instruction object from the given assembly line.
     * @param {string} assemblyLine The assembly line to assemble.
     * @param {Map<string, number>} symbolTable The symbol table for label resolution.
     * @param {number} currentInstructionAddress The current instruction address for branch target resolution.
     * @returns {Object} An Instruction object representing the assembled instruction.
     * @throws {Error} if the factory is not initialized.
     * @throws {Error} if any of the parameters are null.
     * @throws {AssemblyException} if the assembly line cannot be assembled or contains errors.
     */
    static createFromAssembly(assemblyLine, symbolTable, currentInstructionAddress) {
        if (!this.configLoader) {
            throw new Error("InstructionFactory not initialized.");
        }
        if (!assemblyLine) {
            throw new Error("Assembly line cannot be null.");
        }
        if (!symbolTable) {
            throw new Error("Symbol table cannot be null.");
        }

        const trimmedLine = assemblyLine.trim();
        if (!trimmedLine) {
            throw new AssemblyException("Cannot assemble empty line.");
        }

        const parts = trimmedLine.split(/ (.+)/); // splits into [mnemonic, operands] or [mnemonic] if no operands
        const mnemonic = parts[0].toUpperCase();
        const operandsStr = parts.length > 1 ? parts[1].trim() : "";

        const def = this.configLoader.getDefinitionByMnemonic(mnemonic);
        if (!def) {
            throw new AssemblyException(`Unknown mnemonic: '${mnemonic}' in line: ${assemblyLine}`);
        }

        const bytecode = new Array(32).fill(0);
        const opcode = def.getOpcode();
        if (opcode === -1) {
            throw new AssemblyException(`Internal error: Invalid opcode identifier for ${mnemonic}`);
        }

        try {
            switch (def.getFormat()) {
                case 'R':
                    this.assembleRFormat(bytecode, opcode, mnemonic, operandsStr);
                    break;
                case 'I':
                    this.assembleIFormat(bytecode, opcode, mnemonic, operandsStr);
                    break;
                case 'D':
                    this.assembleDFormat(bytecode, opcode, mnemonic, operandsStr);
                    break;
                case 'B':
                    this.assembleBFormat(bytecode, opcode, mnemonic, operandsStr, symbolTable, currentInstructionAddress);
                    break;
                case 'C':
                    this.assembleCBFormat(bytecode, opcode, mnemonic, operandsStr, symbolTable, currentInstructionAddress);
                    break;
                case 'M':
                    this.assembleIMFormat(bytecode, opcode, mnemonic, operandsStr);
                    break;
                default:
                    throw new AssemblyException(`Assembly not implemented for format '${def.getFormat()}'`);
            }

            return this.createFromBytecode(bytecode);
        } catch (error) {
            if (error instanceof AssemblyException) {
                throw new AssemblyException(`Error assembling line: '${assemblyLine}' - ${error.message}`, error);
            } else {
                throw new AssemblyException(`Unexpected error assembling line: '${assemblyLine}' - ${error.message}`, error);
            }
        }
    }

    // --- Assembly Methods ---

    /**
     * Assembles an R-format instruction.
     * @param {number[]} bits The bit array to store the instruction bits.
     * @param {number} opcode The opcode value.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} operands The operands of the instruction.
     */
    static assembleRFormat(bits, opcode, mnemonic, operands) {
        let rd, rn, rm = 0, shamt = 0;
        const ops = this.splitOperands(operands);

        switch (mnemonic) {
            case "LSL":
            case "LSR":
                if (ops.length !== 3) {
                    throw new AssemblyException(`${mnemonic} requires 3 operands: Rd, Rn, #shamt`);
                }
                rd = this.parseRegister(ops[0]);
                rn = this.parseRegister(ops[1]);
                shamt = this.parseImmediate(ops[2]);
                if (shamt < 0 || shamt > 63) {
                    throw new AssemblyException(`Shift amount (#${shamt}) out of range (0-63)`);
                }
                rm = 0;
                break;
            case "BR":
                if (ops.length !== 1) {
                    throw new AssemblyException(`${mnemonic} requires 1 operand: Rn`);
                }
                rn = this.parseRegister(ops[0]);
                rd = 0;
                rm = 0;
                shamt = 0;
                break;
            default:
                if (ops.length !== 3) {
                    throw new AssemblyException(`${mnemonic} requires 3 operands: Rd, Rn, Rm`);
                }
                rd = this.parseRegister(ops[0]);
                rn = this.parseRegister(ops[1]);
                rm = this.parseRegister(ops[2]);
                shamt = 0;
                break;
        }

        Instruction.setBits(bits, opcode, 21, 31);
        Instruction.setBits(bits, rm, 16, 20);
        Instruction.setBits(bits, shamt, 10, 15);
        Instruction.setBits(bits, rn, 5, 9);
        Instruction.setBits(bits, rd, 0, 4);
    }

    /**
     * Assembles an I-format instruction.
     * @param {number[]} bits The bit array to store the instruction bits.
     * @param {number} opcode The opcode value.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} operands The operands of the instruction.
     */
    static assembleIFormat(bits, opcode, mnemonic, operands) {
        const ops = this.splitOperands(operands);
        if (ops.length !== 3) {
            throw new AssemblyException(`${mnemonic} requires 3 operands: Rd, Rn, #immediate`);
        }
        const rd = this.parseRegister(ops[0]);
        const rn = this.parseRegister(ops[1]);
        const imm12 = this.parseImmediate(ops[2]);

        if (imm12 < -2048 || imm12 > 2047) {
            throw new AssemblyException(`Immediate value (#${imm12}) out of 12-bit signed range [-2048, 2047]`);
        }

        Instruction.setBits(bits, opcode, 22, 31);
        Instruction.setBits(bits, imm12 & 0xFFF, 10, 21);
        Instruction.setBits(bits, rn, 5, 9);
        Instruction.setBits(bits, rd, 0, 4);
    }

    /**
     * Assembles a D-format instruction.
     * @param {number[]} bits The bit array to store the instruction bits.
     * @param {number} opcode The opcode value.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} operands The operands of the instruction.
     */
    static assembleDFormat(bits, opcode, mnemonic, operands) {
        const D_FORMAT_ADDR_PATTERN = /\s*\[\s*(\w+)\s*,\s*(#?-?\w+)\s*\]\s*/;
        const ops = this.splitOperands(operands, 2);
        if (ops.length !== 2) {
            throw new AssemblyException(`${mnemonic} requires 2 operands: Rt, [Rn, #imm]`);
        }
        const rt = this.parseRegister(ops[0]);

        const match = ops[1].match(D_FORMAT_ADDR_PATTERN);
        if (!match) {
            throw new AssemblyException(`Invalid D-format memory operand format: '${ops[1]}'. Expected [Rn, #imm]`);
        }

        const rn = this.parseRegister(match[1]);
        const imm9 = this.parseImmediate(match[2]);
        if (imm9 < 0 || imm9 > 511) {
            throw new AssemblyException(`D-format offset (#${imm9}) out of 9-bit unsigned range [0, 511]`);
        }

        Instruction.setBits(bits, opcode, 21, 31);
        Instruction.setBits(bits, imm9 & 0x1FF, 12, 20);
        Instruction.setBits(bits, 0, 10, 11); // Op2 field (unused for LDUR/STUR) set to 0
        Instruction.setBits(bits, rn, 5, 9);
        Instruction.setBits(bits, rt, 0, 4);
    }

    /**
     * Assembles a B-format instruction.
     * @param {number[]} bits The bit array to store the instruction bits.
     * @param {number} opcode The opcode value.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} operands The operands of the instruction.
     * @param {Map<string, number>} symbolTable The symbol table for label resolution.
     * @param {number} currentAddr The current instruction address for branch target resolution.
     */
    static assembleBFormat(bits, opcode, mnemonic, operands, symbolTable, currentAddr) {
        const target = operands.trim();
        if (!target) {
            throw new AssemblyException(`${mnemonic} requires a target label or offset`);
        }

        const offset26 = this.resolveBranchTarget(target, symbolTable, currentAddr, 26);

        Instruction.setBits(bits, opcode, 26, 31);
        Instruction.setBits(bits, offset26 & 0x3FFFFFF, 0, 25);
    }

    /**
     * Assembles a CB-format instruction.
     * @param {number[]} bits The bit array to store the instruction bits.
     * @param {number} opcode The opcode value.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} operands The operands of the instruction.
     * @param {Map<string, number>} symbolTable The symbol table for label resolution.
     * @param {number} currentAddr The current instruction address for branch target resolution.
     */
    static assembleCBFormat(bits, opcode, mnemonic, operands, symbolTable, currentAddr) {
        const ops = this.splitOperands(operands);
        let rt_or_cond;
        let targetStr;

        if (mnemonic.startsWith("B.")) {
            if (ops.length !== 1) {
                throw new AssemblyException(`${mnemonic} requires 1 operand: target`);
            }
            rt_or_cond = this.parseConditionCode(mnemonic);
            targetStr = ops[0];
        } else { // CBZ/CBNZ Rt, target
            if (ops.length !== 2) {
                throw new AssemblyException(`${mnemonic} requires 2 operands: Rt, target`);
            }
            rt_or_cond = this.parseRegister(ops[0]);
            targetStr = ops[1];
        }

        const offset19 = this.resolveBranchTarget(targetStr, symbolTable, currentAddr, 19);

        Instruction.setBits(bits, opcode, 24, 31);
        Instruction.setBits(bits, offset19 & 0x7FFFF, 5, 23);
        Instruction.setBits(bits, rt_or_cond & 0x1F, 0, 4);
    }

    /**
     * Assembles an IM-format instruction.
     * @param {number[]} bits The bit array to store the instruction bits.
     * @param {number} opcode The opcode value.
     * @param {string} mnemonic The mnemonic of the instruction.
     * @param {string} operands The operands of the instruction.
     */
    static assembleIMFormat(bits, opcode, mnemonic, operands) {
        const IM_FORMAT_SHIFT_PATTERN = /(.*?)(?:,\s*(LSL)\s*(#\d+))?\s*$/i;

        const ops = this.splitOperands(operands, 2);
        if (ops.length !== 2) {
            throw new AssemblyException(`${mnemonic} requires at least Rd, #imm operands`);
        }
        const rd = this.parseRegister(ops[0]);
        const immAndShiftPart = ops[1];

        const match = immAndShiftPart.match(IM_FORMAT_SHIFT_PATTERN);
        if (!match) {
            throw new AssemblyException(`Could not parse immediate/shift part for ${mnemonic}: '${immAndShiftPart}'`);
        }

        const immStr = match[1].trim();
        const imm16 = this.parseImmediate(immStr);
        let shiftVal = 0;
        let hw = 0;

        if (match[2]) {
            const shiftStr = match[3];
            shiftVal = this.parseImmediate(shiftStr);

            if (shiftVal !== 0 && shiftVal !== 16 && shiftVal !== 32 && shiftVal !== 48) {
                throw new AssemblyException(`Invalid LSL shift amount for ${mnemonic}: #${shiftVal}. Must be 0, 16, 32, or 48.`);
            }

            hw = shiftVal / 16;
        }

        if (imm16 < 0 || imm16 > 65535) {
            throw new AssemblyException(`Immediate value (#${imm16}) out of 16-bit unsigned range [0, 65535]`);
        }

        Instruction.setBits(bits, opcode, 23, 31);
        Instruction.setBits(bits, hw & 0x3, 21, 22);
        Instruction.setBits(bits, imm16 & 0xFFFF, 5, 20);
        Instruction.setBits(bits, rd, 0, 4);
    }

    // --- Helper Methods ---

    /**
     * Splits the operands string into an array of operands.
     * @param {string} operands The operands string to split.
     * @returns {string[]} An array of operands.
     */
    static splitOperands(operands) {
        if (!operands || !operands.trim()) {
            return [];
        }
        return operands.trim().split(/\s*,\s*/);
    }

    /**
     * Splits the operands string into an array of operands with a specified count.
     * @param {string} operands The operands string to split.
     * @param {number} count The expected number of operands.
     * @returns {string[]} An array of operands.
     * @throws {AssemblyException} if the number of operands does not match the expected count.
     */
    static splitOperands(operands, count) {
        if (!operands) {
            if (count === 0) return [];
            else throw new AssemblyException(`Expected ${count} operands, but got none.`);
        }

        const parts = operands.trim().split(/\s*,\s*/, count);
        if (parts.length !== count || (parts.length === 1 && parts[0] === '' && count > 0)) {
            if (parts.length === 1 && parts[0] === '' && count === 1) {
                throw new AssemblyException(`Expected ${count} operand, but got empty string.`);
            }

            if (parts.length < count) {
                throw new AssemblyException(`Expected ${count} operands, but found fewer in '${operands}'`);
            }

            if (parts.length === count && parts[count - 1].trim() === '' && count > 0) {
                throw new AssemblyException(`Trailing comma or missing operand detected in '${operands}'`);
            }
        }
        return parts;
    }

    /**
     * Parses a register operand and returns its index.
     * @param {string} reg The register operand string.
     * @returns {number} The index of the register.
     * @throws {AssemblyException} if the register format is invalid or out of range.
     */
    static parseRegister(reg) {
        if (!reg) {
            throw new AssemblyException("Register operand is null.");
        }
        reg = reg.trim().toUpperCase();
        if (reg === "XZR") return RegisterStorage.ZERO_REGISTER_INDEX;
        if (reg === "SP") return 28;

        if (!reg.startsWith("X") || reg.length <= 1) {
            throw new AssemblyException(`Invalid register format: '${reg}'. Expected X0-X30, XZR, or SP.`);
        }

        try {
            const n = parseInt(reg.substring(1));
            if (n < 0 || n > 31) {
                throw new AssemblyException(`Register number out of range (0-31): '${reg}'`);
            }

            if (n === RegisterStorage.ZERO_REGISTER_INDEX) {
                throw new AssemblyException("Use 'XZR' instead of 'X31' for the zero register.");
            }

            return n;
        } catch (error) {
            throw new AssemblyException(`Invalid register number format: '${reg}'`);
        }
    }

    /**
     * Parses an immediate operand and returns its value.
     * @param {string} imm The immediate operand string.
     * @returns {number} The integer value of the immediate operand.
     * @throws {AssemblyException} if the immediate format is invalid or out of range.
     */
    static parseImmediate(imm) {
        if (!imm) {
            throw new AssemblyException("Immediate operand is null.");
        }
        imm = imm.trim();
        if (!imm.startsWith("#")) {
            throw new AssemblyException(`Immediate value must start with '#': '${imm}'`);
        }

        let valueStr = imm.substring(1).trim();
        if (!valueStr) {
            throw new AssemblyException(`Empty immediate value after '#': '${imm}'`);
        }

        if (valueStr.toUpperCase().endsWith("L")) {
            valueStr = valueStr.substring(0, valueStr.length - 1);
        }

        try {
            // Handle different number formats
            if (valueStr.startsWith("0x") || valueStr.startsWith("0X")) {
                return parseInt(valueStr, 16);
            } else if (valueStr.startsWith("0") && valueStr.length > 1 && !valueStr.includes(".")) {
                return parseInt(valueStr, 8);
            } else {
                return parseInt(valueStr, 10);
            }
        } catch (error) {
            throw new AssemblyException(`Invalid immediate value format: '${valueStr}' from '${imm}'`, error);
        }
    }

    /**
     * Resolves the branch target address for a given label or immediate value.
     * @param {string} target The target label or immediate value.
     * @param {Map<string, number>} symbolTable The symbol table for label resolution.
     * @param {number} currentAddr The current instruction address for branch target resolution.
     * @param {number} offsetBits The number of bits for the offset (e.g., 26 for B-format).
     * @returns {number} The resolved branch target offset in terms of instructions (bytes/4).
     * @throws {AssemblyException} if the target cannot be resolved or is out of range.
     */
    static resolveBranchTarget(target, symbolTable, currentAddr, offsetBits) {
        target = target.trim();
        let instructionOffset; // Offset in terms of instructions (bytes/4)

        try {
            if (target.startsWith("#")) {
                instructionOffset = this.parseImmediate(target);
            } else {
                if (!symbolTable.has(target)) {
                    throw new AssemblyException(`Undefined label: '${target}'`);
                }

                const targetAddr = symbolTable.get(target);
                const byteOffset = targetAddr - currentAddr;

                if (byteOffset % 4 !== 0) {
                    throw new AssemblyException(`Branch target '${target}' (0x${targetAddr.toString(16)}) is not word-aligned relative to PC (0x${currentAddr.toString(16)})`);
                }
                instructionOffset = Math.floor(byteOffset / 4);
            }
        } catch (error) {
            if (error instanceof AssemblyException) {
                throw new AssemblyException(`Error resolving branch target '${target}': ${error.message}`, error);
            } else {
                throw error;
            }
        }

        const maxOffset = (1 << (offsetBits - 1)) - 1;
        const minOffset = -(1 << (offsetBits - 1));

        if (instructionOffset < minOffset || instructionOffset > maxOffset) {
            throw new AssemblyException(`Branch offset for target '${target}' (${instructionOffset}) exceeds ${offsetBits}-bit signed range [${minOffset}, ${maxOffset}].`);
        }

        return instructionOffset;
    }

    /**
     * Parses a condition code from a mnemonic string.
     * @param {string} mnemonic The mnemonic string (e.g., "B.EQ", "B.NE", etc.).
     * @returns {number} The condition code as an integer.
     * @throws {AssemblyException} if the mnemonic format is invalid or the condition code is unknown.
     */
    static parseConditionCode(mnemonic) {
        if (!mnemonic.startsWith("B.") || mnemonic.length <= 2) {
            throw new AssemblyException(`Invalid B.cond mnemonic format: ${mnemonic}`);
        }

        const cond = mnemonic.substring(2);
        switch (cond) {
            case "EQ": return 0b0000;
            case "NE": return 0b0001;
            case "CS":
            case "HS": return 0b0010; // Carry Set / Unsigned Higher or Same
            case "CC":
            case "LO": return 0b0011; // Carry Clear / Unsigned Lower
            case "MI": return 0b0100; // Minus / Negative
            case "PL": return 0b0101; // Plus / Positive or Zero
            case "VS": return 0b0110;
            case "VC": return 0b0111;
            case "HI": return 0b1000;
            case "LS": return 0b1001;
            case "GE": return 0b1010;
            case "LT": return 0b1011;
            case "GT": return 0b1100;
            case "LE": return 0b1101;
            default:
                throw new AssemblyException(`Unknown condition code suffix: '${cond}' in ${mnemonic}`);
        }
    }
}