function add4ToHexAddress(hexAddressString) {
    const cleanHex = hexAddressString.startsWith("0x")
        ? hexAddressString.slice(2)
        : hexAddressString;

    let addressAsBigInt;
    try {
        let value = BigInt(`0x${cleanHex}`);
        // Chuyển thành signed nếu bit cao là 1 (two's complement 64-bit)
        if (value >= 1n << 63n) {
            value -= 1n << 64n;
        }
        addressAsBigInt = value;
    } catch (error) {
        console.error(
            "Invalid hexadecimal address string:",
            hexAddressString,
            error
        );
        return "Invalid Address";
    }

    const newAddressAsBigInt = addressAsBigInt + 4n;

    // Chuyển lại two's complement hex string
    const resultBigInt =
        newAddressAsBigInt < 0n
            ? (1n << 64n) + newAddressAsBigInt
            : newAddressAsBigInt;

    return `0x${resultBigInt.toString(16).toUpperCase().padStart(16, "0")}`;
}

function addHexStrings(hexStr1, hexStr2) {
    const hexRegex = /^(0x)?[0-9a-fA-F]+$/;

    const normalizeHex = (str) => {
        if (typeof str !== "string" || !hexRegex.test(str)) {
            throw new Error(`Invalid hexadecimal string: '${str}'.`);
        }
        return str.startsWith("0x") ? str.slice(2) : str;
    };

    const toSignedBigInt = (hex) => {
        let val = BigInt(`0x${hex}`);
        return val >= 1n << 63n ? val - (1n << 64n) : val;
    };

    const hex1 = normalizeHex(hexStr1);
    const hex2 = normalizeHex(hexStr2);

    const sum = toSignedBigInt(hex1) + toSignedBigInt(hex2);

    const result = sum < 0n ? (1n << 64n) + sum : sum;

    return `0x${result.toString(16).toUpperCase().padStart(16, "0")}`;
}

function toExactBinary(decimalNum, n_bits) {
    if (decimalNum < 0) {
        throw new Error("Số thập phân phải là số không âm.");
    }

    let binaryString = decimalNum.toString(2);

    // Nếu chuỗi nhị phân quá dài, chỉ lấy n_bits cuối cùng
    if (binaryString.length > n_bits) {
        return binaryString.slice(-n_bits);
    }

    // Nếu chuỗi nhị phân ngắn hơn, thêm 0 vào đầu
    return binaryString.padStart(n_bits, "0");
}

function toExactSignBinary(decimalNum, n_bits) {
    if (n_bits <= 0 || !Number.isInteger(n_bits)) {
        throw new Error("Số bit (n_bits) phải là một số nguyên dương.");
    }

    const maxPositive = Math.pow(2, n_bits - 1) - 1; // Giá trị dương lớn nhất có thể biểu diễn
    const minNegative = -Math.pow(2, n_bits - 1); // Giá trị âm nhỏ nhất có thể biểu diễn

    if (decimalNum > maxPositive || decimalNum < minNegative) {
        // Tùy chọn: ném lỗi hoặc trả về một giá trị đặc biệt nếu số nằm ngoài phạm vi biểu diễn
        console.warn(
            `Cảnh báo: Số ${decimalNum} nằm ngoài phạm vi biểu diễn của ${n_bits} bit bù 2.`
        );
        // Đối với ví dụ này, chúng ta sẽ cho phép nó bị cắt bớt hoặc tràn số theo hành vi bù 2
        // nếu sử dụng phép toán bitwise 32-bit mặc định của JS.
    }

    if (decimalNum >= 0) {
        // Xử lý số dương
        let binaryString = decimalNum.toString(2);
        // Thêm padding và đảm bảo độ dài là n_bits.
        // Nếu binaryString dài hơn n_bits, padStart sẽ không cắt bớt,
        // do đó cần slice ở cuối để đảm bảo đúng n_bits.
        return binaryString.padStart(n_bits, "0").slice(-n_bits);
    } else {
       
        const absoluteVal = Math.abs(decimalNum);

        const twoComplementVal = Math.pow(2, n_bits) - absoluteVal;

        // Chuyển đổi giá trị này sang nhị phân
        let binaryString = twoComplementVal.toString(2);

        return binaryString.slice(-n_bits);
    }
}

function getBits(bitStr, startBit, endBit) {
    const len = bitStr.length;
    const start = len - 1 - endBit;
    const end = len - startBit;
    return bitStr.substring(start, end);
}

function jumpToAddress(PC, lst, address) {
    const obj = PC.getObjectAtAddress(address);
    if (!obj) {
        return;
    }
    if (obj.definition.format == "R") {
        lst.push(new RFormat(obj, PC));
    } else if (obj.definition.format == "I") {
        lst.push(new IFormat(obj, PC));
    } else if (
        obj.definition.format == "D" &&
        obj.definition.mnemonic == "STUR"
    ) {
        lst.push(new Store(obj, PC));
    } else if (
        obj.definition.format == "D" &&
        obj.definition.mnemonic == "LDUR"
    ) {
        lst.push(new Load(obj, PC));
    } else if (obj.definition.format == "C") {
        lst.push(new CBFormat(obj, PC));
    } else if (obj.definition.format == "B") {
        lst.push(new BFormat(obj, PC));
    }
}

function getControlSignals(instruction) {
    return {
        Reg2Loc: instruction.definition.controlSignals.reg2Loc,
        UncondBranch: instruction.definition.controlSignals.uncondBranch,
        MemRead: instruction.definition.controlSignals.memRead,
        MemtoReg: instruction.definition.controlSignals.memToReg,
        ALUOp1: LEGv8Registers.valueTo64BitBinary(
            instruction.definition.controlSignals.aluOp
        ).slice(-2, -1),
        ALUOp0: String(
            instruction.definition.controlSignals.aluOp % 2
        ),
        MemWrite: instruction.definition.controlSignals.memWrite,
        ALUSrc: instruction.definition.controlSignals.aluSrc,
        RegWrite: instruction.definition.controlSignals.regWrite,
        Branch: instruction.definition.controlSignals.zeroBranch,
        FlagBranch: instruction.definition.controlSignals.flagBranch,
        FlagWrite: instruction.definition.controlSignals.flagWrite,
    };
}

/**
 * Converts a binary string to unsigned decimal number
 * @param {string} binaryString - The binary string to convert
 * @returns {number} The decimal value
 */
function binaryToUnsignedDecimal(binaryString) {
    // Remove any spaces or other characters
    binaryString = binaryString.replace(/[^01]/g, '');
    
    let decimal = 0;
    
    // Convert each bit from right to left
    for (let i = binaryString.length - 1, power = 0; i >= 0; i--, power++) {
        if (binaryString[i] === '1') {
            decimal += Math.pow(2, power);
        }
    }
    
    return decimal;
}

