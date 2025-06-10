class ControlUnit {
    constructor(instructionBits) {
        this.instructionBits = instructionBits;
        this.controlSignals = this.decodeSignals();
    }

    decodeSignals() {
        const opcode = this.instructionBits;

        const patterns = {
            RFormat:  "1xx01011000",  // I[31]=1, I[28]=0, I[27]=1, I[25]=1, I[24]=x, ...
            LDUR:     "1xx11100010",
            STUR:     "1xx11100000",
            CBZ:      "1xx10100xxx",
            B:        "0xxxxxxx101"
        };

        let signals = {
            Reg2Loc: 0,
            ALUSrc: 0,
            MemtoReg: 0,
            RegWrite: 0,
            MemRead: 0,
            MemWrite: 0,
            Branch: 0,
            UncondBranch: 0,
            ALUOp1: 0,
            ALUOp0: 0
        };

        function matchPattern(pattern, opcode) {
            for (let i = 0; i < pattern.length; i++) {
                if (pattern[i] !== 'x' && pattern[i] !== opcode[i]) return false;
            }
            return true;
        }

        if (matchPattern(patterns.RFormat, opcode)) {
            signals = {
                Reg2Loc: 0,
                ALUSrc: 0,
                MemtoReg: 0,
                RegWrite: 1,
                MemRead: 0,
                MemWrite: 0,
                Branch: 0,
                UncondBranch: 0,
                ALUOp1: 1,
                ALUOp0: 0
            };
        } else if (matchPattern(patterns.LDUR, opcode)) {
            signals = {
                Reg2Loc: 0,
                ALUSrc: 1,
                MemtoReg: 1,
                RegWrite: 1,
                MemRead: 1,
                MemWrite: 0,
                Branch: 0,
                UncondBranch: 0,
                ALUOp1: 0,
                ALUOp0: 0
            };
        } else if (matchPattern(patterns.STUR, opcode)) {
            signals = {
                Reg2Loc: 1,
                ALUSrc: 1,
                MemtoReg: 0,
                RegWrite: 0,
                MemRead: 0,
                MemWrite: 1,
                Branch: 0,
                UncondBranch: 0,
                ALUOp1: 0,
                ALUOp0: 0
            };
        } else if (matchPattern(patterns.CBZ, opcode)) {
            signals = {
                Reg2Loc: 1,
                ALUSrc: 0,
                MemtoReg: 0,
                RegWrite: 0,
                MemRead: 0,
                MemWrite: 0,
                Branch: 1,
                UncondBranch: 0,
                ALUOp1: 0,
                ALUOp0: 1
            };
        } else if (matchPattern(patterns.B, opcode)) {
            signals = {
                Reg2Loc: 0,
                ALUSrc: 0,
                MemtoReg: 0,
                RegWrite: 0,
                MemRead: 0,
                MemWrite: 0,
                Branch: 0,
                UncondBranch: 1,
                ALUOp1: 0,
                ALUOp0: 0
            };
        } else {
            console.warn("Unknown opcode pattern:", opcode);
        }

        return signals;
    }

    getControlSignals() {
        return this.controlSignals;
    }
}

function getAluControl(aluop1, aluop2, opcodeBin) {
    if (aluop1 == "0" && aluop2 == "0") {
        return "0010"; // ADD
    }
  
    else if (aluop1 == "0" && aluop2 == "1") {
        return "0111"; // Pass Input B (or similar for branch condition)
    }
  
    else if (aluop1 == "1" && aluop2 == "0") {
      
        const rtypeLookup = {
            "10001011000": "0010", // ADD (ALU control for addition)
            "11001011000": "0110", // SUB (ALU control for subtraction)
            "10001010000": "0000", // AND (ALU control for bitwise AND)
            "10101010000": "0001"  // ORR (ALU control for bitwise OR)
           
        };

        return rtypeLookup[opcodeBin] || "????"; // Unknown opcode
    }
    else {
        return "????"; // Invalid ALUOp combination
    }
}

function addTwoHexStrings(hexString1, hexString2) {
  let num1AsBigInt;
  let num2AsBigInt;

  // Function to clean and validate a single hex string and convert to BigInt
  const parseHexToBigInt = (hexInput) => {
    // Remove "0x" prefix if present for consistent parsing
    const cleanHex = hexInput.startsWith("0x") ? hexInput.substring(2) : hexInput;

    // Validate that the string contains only valid hex characters
    if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
      throw new Error(`Chuỗi "${hexInput}" không phải là định dạng thập lục phân hợp lệ.`);
    }

    // Convert the hexadecimal string to a BigInt
    return BigInt(`0x${cleanHex}`);
  };

  try {
    num1AsBigInt = parseHexToBigInt(hexString1);
    num2AsBigInt = parseHexToBigInt(hexString2);
  } catch (error) {
    console.error("Lỗi đầu vào:", error.message);
    return `Lỗi: ${error.message}`; // Return specific error message
  }

  // Add the two BigInt numbers
  const sumAsBigInt = num1AsBigInt + num2AsBigInt;

  // Convert the sum BigInt back to a hexadecimal string
  // .toString(16) converts a BigInt to a hexadecimal string (without "0x" prefix)
  let resultHex = sumAsBigInt.toString(16);

  // Handle negative results (BigInt.toString(16) will prepend '-')
  if (sumAsBigInt < 0n) {
    // For negative numbers, resultHex will be like "-1a". We want "-0x1a".
    return `-0x${resultHex.substring(1)}`;
  } else {
    return `0x${resultHex}`;
  }
}

function add4ToHexAddress(hexAddressString) {
  const cleanHex = hexAddressString.startsWith("0x") ? hexAddressString.substring(2) : hexAddressString;

  let addressAsBigInt;
  try {
    addressAsBigInt = BigInt(`0x${cleanHex}`);
  } catch (error) {
    console.error("Invalid hexadecimal address string:", hexAddressString, error);
    return "Invalid Address"; // Return an error indicator for invalid input
  }

  const newAddressAsBigInt = addressAsBigInt + 4n; // 'n' suffix denotes a BigInt literal

  const newHex = newAddressAsBigInt.toString(16);


  return `0x${newHex}`;
}

function binaryToHexString(binaryString) {
  // Basic validation: Check if the input is a non-empty string containing only '0' and '1'.
  if (typeof binaryString !== 'string' || binaryString.length === 0 || !/^[01]+$/.test(binaryString)) {
    return "Lỗi: Đầu vào không phải chuỗi nhị phân hợp lệ hoặc rỗng.";
  }

  // Calculate the required number of hexadecimal digits.
  // Each hex digit represents 4 binary bits. We use Math.ceil to round up,
  // ensuring enough digits even if the binary string length isn't a multiple of 4.
  const requiredHexDigits = Math.ceil(binaryString.length / 4);

  let numAsBigInt;
  try {
    // Convert the binary string to a BigInt.
    // The '0b' prefix tells BigInt to interpret the string as binary.
    numAsBigInt = BigInt(`0b${binaryString}`);
  } catch (error) {
    // This catch might be redundant if the regex check already passes,
    // but it's good for robustness against unexpected BigInt parsing errors.
    console.error("Lỗi khi chuyển đổi chuỗi nhị phân sang BigInt:", error);
    return "Lỗi: Không thể chuyển đổi chuỗi nhị phân.";
  }

  // Convert the BigInt to a hexadecimal string.
  // BigInt.prototype.toString(16) converts to hex without a "0x" prefix.
  let hexString = numAsBigInt.toString(16);

  // Pad the hexadecimal string with leading zeros to meet the required length.
  hexString = hexString.padStart(requiredHexDigits, '0');

  // Add the "0x" prefix for conventional hexadecimal notation.
  return `0x${hexString}`;
}


function decimalToBinaryString(decimalNumber, bitLength) {
  // Validate bitLength
  if (typeof bitLength !== 'number' || bitLength <= 0 || !Number.isInteger(bitLength)) {
    return "Lỗi: Độ dài bit phải là một số nguyên dương.";
  }

  let numAsBigInt;
  try {
    numAsBigInt = BigInt(decimalNumber);
  } catch (error) {
    return "Lỗi: Đầu vào số thập phân không hợp lệ.";
  }

  const maxPositiveValue = (2n ** BigInt(bitLength - 1)) - 1n;
  const minNegativeValue = -(2n ** BigInt(bitLength - 1));
  const maxUnsignedValue = (2n ** BigInt(bitLength)) - 1n;

  // Check if the number fits within the signed range of the specified bitLength
  if (numAsBigInt > maxPositiveValue || numAsBigInt < minNegativeValue) {
    // If it's a positive number too large for signed, but fits unsigned
    if (numAsBigInt > maxPositiveValue && numAsBigInt <= maxUnsignedValue && bitLength >= 64) {
      // For very large unsigned numbers that fit in 64 bits but not signed 63 bits.
      // This path handles cases where the user might implicitly expect an unsigned representation
      // for large positive numbers that are outside the signed range but within the total bit length.
      // E.g., for 64-bit, 2^63 is represented as '1' followed by 63 '0's.
      // This is often treated as the smallest negative in signed 64-bit.
      // The `toString(2)` for BigInt directly on `numAsBigInt` might give the full unsigned string,
      // which is what we want here if it exceeds `maxPositiveValue` but fits the `bitLength` overall.
    } else {
        return `Lỗi: Số ${decimalNumber} không thể biểu diễn trong ${bitLength} bit có dấu. Phạm vi: [${minNegativeValue}, ${maxPositiveValue}].`;
    }
  }

  let binaryString;
  if (numAsBigInt >= 0n) {
    // For positive numbers, simply convert to binary and pad with leading zeros
    binaryString = numAsBigInt.toString(2);
    // Pad with leading zeros to reach the target bitLength
    binaryString = binaryString.padStart(bitLength, '0');
    // If the number is too large and was not caught by the range check,
    // ensure it's truncated to the bitLength if it exceeds it.
    if (binaryString.length > bitLength) {
        binaryString = binaryString.substring(binaryString.length - bitLength);
    }
    } else {
    // For negative numbers, use two's complement
    // 1. Get the positive magnitude
    const positiveMagnitude = -numAsBigInt;

    // 2. Convert magnitude to binary string.
    // We need to ensure this magnitude fits into (bitLength - 1) bits,
    // as the MSB will be '1' for the negative sign.
    const magnitudeBinary = positiveMagnitude.toString(2);

    // If magnitude binary is too long for (bitLength - 1) bits, it's an overflow
    if (magnitudeBinary.length > bitLength - 1) {
        // This case should ideally be caught by the initial range check,
        // but it's a secondary check.
        // For example, trying to represent -9 in 4 bits (range -8 to 7)
        return `Lỗi: Số âm ${decimalNumber} quá lớn để biểu diễn trong ${bitLength} bit.`;
    }

    // 3. Pad magnitude with leading zeros to (bitLength - 1)
    const paddedMagnitude = magnitudeBinary.padStart(bitLength, '0'); // Pad to full bitLength for easier inversion

    // 4. Invert all bits (one's complement)
    let invertedBinary = '';
    for (let i = 0; i < paddedMagnitude.length; i++) {
      invertedBinary += (paddedMagnitude[i] === '0' ? '1' : '0');
    }

    // 5. Add 1 to the one's complement
    // Convert to BigInt, add 1, then convert back to binary
    let twoComplementValue = BigInt(`0b${invertedBinary}`) + 1n;
    binaryString = twoComplementValue.toString(2);

    // If adding 1 resulted in a string longer than bitLength (e.g., 0111 -> 1000 after inversion+1 for -8),
    // we need to take the last `bitLength` bits. This typically happens for edge cases like the most negative number.
    if (binaryString.length > bitLength) {
      binaryString = binaryString.substring(binaryString.length - bitLength);
    }
  }

  return binaryString;
}

class LEGv8Registers {
    constructor() {
        this.registers = new Array(32).fill(0);

        this.registerMap = {
            0: 'X0',  1: 'X1',  2: 'X2',  3: 'X3',
            4: 'X4',  5: 'X5',  6: 'X6',  7: 'X7',
            8: 'X8',
            9: 'X9', 10: 'X10', 11: 'X11', 12: 'X12',
           13: 'X13', 14: 'X14', 15: 'X15',
           16: 'IP0', 17: 'IP1',
           18: 'X18',
           19: 'X19', 20: 'X20', 21: 'X21', 22: 'X22',
           23: 'X23', 24: 'X24', 25: 'X25', 26: 'X26',
           27: 'X27',
           28: 'SP',
           29: 'FP',
           30: 'LR',
           31: 'XZR'
        };

        this.nameToIndex = {};
        for (const [index, name] of Object.entries(this.registerMap)) {
            this.nameToIndex[name.toUpperCase()] = parseInt(index);
        }
    }

    // === Base methods ===

    write(index, value) {
        this.validateIndex(index);
        if (index === 31) {
            console.warn("Warning: Cannot write to XZR (always zero).");
            return;
        }
        this.registers[index] = value;
    }

    read(index) {
        this.validateIndex(index);
        return index === 31 ? 0 : this.registers[index];
    }

    // === Name methods ===

    writeByName(name, value) {
        const index = this.nameToIndex[name.toUpperCase()];
        if (index === undefined) {
            throw new Error(`Invalid register name: ${name}`);
        }
        this.write(index, value);
    }

    readByName(name) {
        const index = this.nameToIndex[name.toUpperCase()];
        if (index === undefined) {
            throw new Error(`Invalid register name: ${name}`);
        }
        return this.read(index);
    }

    // === Binary string methods ===

    writeByBinary(binStr, value) {
        const index = parseInt(binStr, 2);
        this.write(index, value);
    }

    readByBinary(binStr) {
        const index = parseInt(binStr, 2);
        return this.read(index);
    }

    // === Utility ===

    findRegisterByValue(value) {
        const matches = [];
        for (let i = 0; i < this.registers.length; i++) {
            if (this.read(i) === value) {
                matches.push(this.registerMap[i]);
            }
        }
        return matches.length > 0 ? matches : [`No register contains value ${value}`];
    }

    dumpRegisters() {
        console.log("==== LEGv8 Register File ====");
        for (let i = 0; i < 32; i++) {
            console.log(`${this.registerMap[i].padEnd(4)}: ${this.read(i)}`);
        }
    }

    validateIndex(index) {
        if (index < 0 || index > 31) {
            throw new Error(`Invalid register index: ${index}`);
        }
    }
}

const registers = new LEGv8Registers();
class RFormat {
    constructor(opcode, Rm, shamt, Rn, Rd, address) {
        this.opcode = opcode; // 11 bits
        this.Rm = Rm;         // 5 bits
        this.shamt = shamt;   // 6 bits
        this.Rn = Rn;         // 5 bits
        this.Rd = Rd;         // 5 bits
        this.address = address;
    }

  async instructionFetch(){
    const instruction = this.opcode + this.Rn + this.Rm + this.shamt + this.Rd; // Concatenate all parts to form the instruction
    const pathAndData = [
        { pathId: 'pc-alu', data: this.address }, 
        { pathId: 'pc-ins-mem', data: instruction}, 
        { pathId: 'pc-add-4', data: this.address} 
    ];
    const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
    await Promise.all(allRuns);
  }
    async instructionDecode() {
        const controlUnit = new ControlUnit(this.opcode);
        const instructionOpcode = this.opcode; // 31-21 bits
        const instructionRn = this.Rn;         // 9-5 bits
        const instructionRm = this.Rm;         // 20-16 bits
        const instructionRd = this.Rd;         // 4-0 bits
        
        const allInstruction = this.opcode + this.Rn + this.Rm + this.shamt + this.Rd; // Concatenate all parts to form the instruction
    
        const pathAndData = [
            { pathId: 'Instruction-[31-21]', data: instructionOpcode},
            { pathId: 'Instruction-[9-5]', data: instructionRn },
            { pathId: 'Instruction-[20-16]', data: instructionRm },
            { pathId: 'Instruction-[4-0]', data: instructionRd },
            { pathId: 'Instruction-[4-0]-1', data: instructionRd },
            { pathId: 'Instruction-[31-0]', data: allInstruction },
            { pathId: 'Instruction-[31-21]-1', data: instructionOpcode},
        ];

        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));

        await Promise.all(allRuns);
        const controlPathAndData = [
            { pathId: 'control-reg-loc', data: controlUnit.getControlSignals().Reg2Loc},
            { pathId: 'control-uncond-branch', data: controlUnit.getControlSignals().UncondBranch},
            { pathId: 'control-mem-read', data: controlUnit.getControlSignals().MemRead},
            { pathId: 'control-mem-reg', data: controlUnit.getControlSignals().MemtoReg},
            { pathId: 'control-ALU-op', data: controlUnit.getControlSignals().ALUOp0 + controlUnit.getControlSignals().ALUOp1},
            { pathId: 'control-mem-write', data: controlUnit.getControlSignals().MemWrite},
            { pathId: 'control-ALU-src', data: controlUnit.getControlSignals().ALUSrc},
            { pathId: 'control-reg-write', data: controlUnit.getControlSignals().RegWrite},
            { pathId: 'control-branch', data: controlUnit.getControlSignals().Branch},
        ];
        const allControlRuns = controlPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allControlRuns);
        const muxToRegister = [
            { pathId: 'mux-read-res-2', data: instructionRm },  // 20-16 bits
        ];
        await Promise.all(muxToRegister.map(({ pathId, data }) => run(data, pathId)));
    }   

    async execute() {
        // change to value !!!!! // 
        const register1_value = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rn), 64)); // 9-5 bits
        const register2_value = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rm), 64)); // 20-16 bits
        const controlUnit = new ControlUnit(this.opcode);
        const aluControl = getAluControl(
            controlUnit.getControlSignals().ALUOp1, 
            controlUnit.getControlSignals().ALUOp0,
            this.opcode
        );
        const register_1 = registers.readByBinary(this.Rn); 
        const register_2 = registers.readByBinary(this.Rm);
        const newRegisterValue = {
            '0010': register_1 + register_2, // ADD
            '0110': register_1 - register_2, // SUB
            '0000': register_1 & register_2, // AND
            '0001': register_1 | register_2, // ORR
        }
        registers.writeByBinary(this.Rd, newRegisterValue[aluControl] || 0); 
        const pathAndData = [
            { pathId: 'read-1-alu', data: register1_value },
            { pathId: 'read-data-2-mux', data: register2_value },
            { pathId: 'ALU-control-ALU', data: aluControl}, 
            { pathId: 'Sign-extend-mux', data: 0 }, // 4-0 bits
            { pathId: 'Sign-extend-shift', data: 0 }, // 4-0 bits
        ]
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);

        const anotherPathAndData = [
            { pathId: 'shift-add-alu', data: 0 }, // 9-5 bits
            { pathId: 'mux-alu', data: register2_value}, // 20-16 bits
        ];

        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
        
    }
    async memoryAccess() {
        const register1_value = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rn), 64)); // 9-5 bits
        const register2_value = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rm), 64)); // 20-16 bits
        const newRegisterValue = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rd), 64)); // 4-0 bits
        const add4Address = add4ToHexAddress(this.address); // 4-0 bits
        const pathAndData = [
            { pathId: 'read-data-2-write-data', data: register2_value}, // 20-16 bits
            { pathId: 'ALU-mux', data: this.address }, // 4-0 bits
            { pathId: 'ALU-address', data: newRegisterValue }, // 4-0 bits !!!!
            { pathId: 'alu-add-4-mux', data: add4Address }, // 4-0 bits  !!! 
            { pathId: 'ALU-add-mux', data: this.address}, // 4-0 bits
            { pathId: 'ALU-and-gate', data: 0 }, // 4-0 bits

        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
        const anotherPathAndData = [
            { pathId: 'read-data-mux', data: newRegisterValue }, // 4-0 bits  !!!!! 
            { pathId: 'and-gate-or-gate', data: 0 }, 
        ];
        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
        const orToMux = [
            { pathId: 'or-gate-mux', data: 0}, // 4-0 bits
        ];
        const orRuns = orToMux.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(orRuns);
    }

    async registerWrite() {
        const newRegisterValue = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rd), 64)); // 4-0 bits
        const pathAndData = [
            { pathId: 'mux-write-data', data: newRegisterValue }, // 4-0 bits
            { pathId: 'ALU-back-PC', data: add4ToHexAddress(this.address)}, // 4-0 bits
            // { pathId: 'write-data-alu-1', data: this.Rd } // 4-0 bits
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }
}

class IFormat {
    constructor(opcode, immmediate, Rn, Rd, address){
        this.opcode = opcode; // 11 bits
        this.immediate = immmediate; // 12 bits
        this.Rn = Rn;         // 5 bits
        this.Rd = Rd;         // 5 bits
        this.address = address; // Address in hexadecimal format
    }

    async instructionFetch(){
        const instruction = this.opcode + this.Rn + this.immediate + this.Rd; // Concatenate all parts to form the instruction
        const pathAndData = [
            { pathId: 'pc-alu', data: this.address }, 
            { pathId: 'pc-add-4', data: this.address}, 
            { pathId: 'pc-ins-mem', data: instruction}, 
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }
    async instructionDecode() {
        const controlUnit = new ControlUnit(this.opcode);
        const instructionOpcode = this.opcode; // 31-21 bits
        const instructionRn = this.Rn;         // 9-5 bits
        const immediate = this.immediate; // 20-16 bits
        const instructionRd = this.Rd;         // 4-0 bits
        const allInstruction = this.opcode + this.Rn + this.Rm + this.shamt + this.Rd; // Concatenate all parts to form the instruction
        const instruction20_16 = allInstruction.substring(16, 20)       // 20-16 bits
    
        const pathAndData = [
            { pathId: 'Instruction-[31-21]', data: instructionOpcode},
            { pathId: 'Instruction-[9-5]', data: instructionRn },
            { pathId: 'Instruction-[20-16]', data: instruction20_16 },
            { pathId: 'Instruction-[4-0]', data: instructionRd },
            { pathId: 'Instruction-[4-0]-1', data: instructionRd },
            { pathId: 'Instruction-[31-0]', data: allInstruction},
            { pathId: 'Instruction-[31-21]-1', data: instructionOpcode},
          
        ];

        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));

        await Promise.all(allRuns);
        const controlPathAndData = [
            { pathId: 'control-reg-loc', data: controlUnit.getControlSignals().Reg2Loc},
            { pathId: 'control-uncond-branch', data: controlUnit.getControlSignals().UncondBranch},
            { pathId: 'control-mem-read', data: controlUnit.getControlSignals().MemRead},
            { pathId: 'control-mem-reg', data: controlUnit.getControlSignals().MemtoReg},
            { pathId: 'control-ALU-op', data: controlUnit.getControlSignals().ALUOp0 + controlUnit.getControlSignals().ALUOp1},
            { pathId: 'control-mem-write', data: controlUnit.getControlSignals().MemWrite},
            { pathId: 'control-ALU-src', data: controlUnit.getControlSignals().ALUSrc},
            { pathId: 'control-reg-write', data: controlUnit.getControlSignals().RegWrite},
            { pathId: 'control-branch', data: controlUnit.getControlSignals().Branch},
        ];
        const allControlRuns = controlPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allControlRuns);
        const muxToRegister = [
            { pathId: 'mux-read-res-2', data: instruction20_16},  // 20-16 bits
        ];
        await Promise.all(muxToRegister.map(({ pathId, data }) => run(data, pathId)));
    }   

    async execute() {
        // change to value !!!!! // 
        const fullInstruction = this.opcode + this.Rn + this.immediate + this.Rd; // Concatenate all parts to form the instruction
        const register1_value = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rn), 64)); // 9-5 bits
        const register2_value = binaryToHexString(decimalToBinaryString(registers.readByBinary(fullInstruction.substring(16, 20)), 64)); // 20-16 bits
        const extendImmediate = binaryToHexString(decimalToBinaryString(parseInt(this.immediate, 2), 64)); 
        
        const controlUnit = new ControlUnit(this.opcode);
        
        const aluControl = getAluControl(
            controlUnit.getControlSignals().ALUOp1, 
            controlUnit.getControlSignals().ALUOp0,
            this.opcode
        );

        const register_1 = registers.readByBinary(this.Rn);
        const immediate = parseInt(this.immediate, 2);
        const newRegisterValue = {
            '0010': register_1 + immediate, // ADD
            '0110': register_1 - immediate, // SUB
            '0000': register_1 & immediate, // AND
            '0001': register_1 | immediate, // ORR
        }
        registers.writeByBinary(this.Rd, newRegisterValue[aluControl] || 0);

        const pathAndData = [
            { pathId: 'read-1-alu', data: register1_value },
            { pathId: 'read-data-2-mux', data: register2_value },
            { pathId: 'ALU-control-ALU', data: aluControl}, 

            { pathId: 'Sign-extend-mux', data: extendImmediate }, // 4-0 bits
            { pathId: 'Sign-extend-shift', data: extendImmediate }, // 4-0 bits
        ]
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);

        const immediateShifted = binaryToHexString(decimalToBinaryString(parseInt(this.immediate, 2) << 2, 64)); // Shift left by 2 bits
        const anotherPathAndData = [
            { pathId: 'shift-add-alu', data: immediateShifted }, // 9-5 bits
            { pathId: 'mux-alu', data: extendImmediate}, // 20-16 bits
        ];

        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
        
    }
    async memoryAccess() {
        const register1_value = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rn), 64)); // 9-5 bits
        const register2_value = binaryToHexString(decimalToBinaryString(registers.readByBinary(fullInstruction.substring(16, 20)), 64)); // 20-16 bits
        const add4Address = add4ToHexAddress(this.address); // 4-0 bits
        const newRegisterValue = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rd), 64)); // 4-0 bits
        const immediateShifted = binaryToHexString(decimalToBinaryString(parseInt(this.immediate, 2) << 2, 64)); // Shift left by 2 bits

        const pathAndData = [
            { pathId: 'read-data-2-write-data', data: register2_value}, // 20-16 bits
            { pathId: 'ALU-mux', data: this.address }, // 4-0 bits
            { pathId: 'ALU-address', data: newRegisterValue }, // 4-0 bits !!!!
            { pathId: 'alu-add-4-mux', data: add4Address }, // 4-0 bits  !!! 
            { pathId: 'ALU-add-mux', data: addTwoHexStrings(this.address, immediateShifted)}, // 4-0 bits
            { pathId: 'ALU-and-gate', data: 0 }, // 4-0 bits

        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
        const anotherPathAndData = [
            { pathId: 'read-data-mux', data: newRegisterValue }, // 4-0 bits  !!!!! 
            { pathId: 'and-gate-or-gate', data: 0 }, 
        ];
        const anotherRuns = anotherPathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(anotherRuns);
        const orToMux = [
            { pathId: 'or-gate-mux', data: 0}, // 4-0 bits
        ];
        const orRuns = orToMux.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(orRuns);
    }
    async registerWrite() {
        const newRegisterValue = binaryToHexString(decimalToBinaryString(registers.readByBinary(this.Rd), 64)); // 4-0 bits
        const pathAndData = [
            { pathId: 'mux-write-data', data: newRegisterValue }, // 4-0 bits
            { pathId: 'ALU-back-PC', data: add4ToHexAddress(this.address)}, // 4-0 bits
            // { pathId: 'write-data-alu-1', data: this.Rd } // 4-0 bits
        ];
        const allRuns = pathAndData.map(({ pathId, data }) => run(data, pathId));
        await Promise.all(allRuns);
    }
    
}

const rformat = new RFormat('10001011000', '01010', '000000', '01001', '01000', '0x40000000');
registers.writeByBinary('01001', 5); // X9 = 5
registers.writeByBinary('01010', 3); // X10 = 3
// Example usage
// startBtn.onclick = async () => {
//     resetBtn.click(); // Reset trước khi bắt đầu
//     running = true;
//     console.log("🔄 Bắt đầu chạy lệnh R-format");
//     // await rformat.memoryAccess();
//     await rformat.instructionFetch();
//     await rformat.instructionDecode();
//     await rformat.execute();
//     await rformat.memoryAccess();
//     await rformat.registerWrite();

//     console.log("✅ ✅ ✅ Kết thúc chạy lệnh R-format");
// }

const iformat = new IFormat('100100010', '10000000001', '10100', '10011', '0x40000000');
startBtn.onclick = async () => {
    resetBtn.click(); // Reset trước khi bắt đầu
    running = true;
    console.log("🔄 Bắt đầu chạy lệnh I-format");
    // await rformat.memoryAccess();
    await iformat.instructionFetch();
    await iformat.instructionDecode();
    await iformat.execute();
    await iformat.memoryAccess();
    await iformat.registerWrite();

    console.log("✅ ✅ ✅ Kết thúc chạy lệnh I-format");
}