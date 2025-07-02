function add4ToHexAddress(address) {
    const add4Address = PC.getCurrentAddress() + 4; 
    return LEGv8Registers.binaryToHex(
        LEGv8Registers.valueTo64BitBinary(add4Address)
    );
}

function addHexStrings(hexStr1, hexStr2) {
    // Hàm nội bộ để chuyển đổi một chuỗi hex (có thể có "0x") thành BigInt
    const hexToBigInt = (hex) => {
        if (typeof hex !== 'string' || !/^(0x)?[0-9a-fA-F]+$/.test(hex)) {
            throw new Error(`Invalid hexadecimal string provided: ${hex}`);
        }
        return BigInt(hex.startsWith('0x') ? hex : `0x${hex}`);
    };

    const val1 = hexToBigInt(hexStr1);
    const val2 = hexToBigInt(hexStr2);

    // Thực hiện phép cộng trên BigInt
    const sum = val1 + val2;

    // Tạo một mặt nạ 32-bit (32 bit 1)
    const mask = (1n << 32n) - 1n;

    // Áp dụng mặt nạ để chỉ giữ lại 32 bit cuối cùng, mô phỏng tràn số
    const result = sum & mask;

    // Chuyển kết quả về chuỗi hex, đệm 8 ký tự và thêm "0x"
    return `0x${result.toString(16).toUpperCase().padStart(8, '0')}`;
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
    }

    if (decimalNum >= 0) {
        // Xử lý số dương
        let binaryString = decimalNum.toString(2);
        return binaryString.padStart(n_bits, "0").slice(-n_bits);
    } else {
       
        const absoluteVal = Math.abs(decimalNum);

        const twoComplementVal = Math.pow(2, n_bits) - absoluteVal;

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

function controlUnitDisplay(obj, state){
    //  controlSignalIds.forEach(id => {
    //     if (element) {
    //         element.textContent = state === 1 ? values[id] : "";
            
    //         // Apply styles when showing, remove when hiding
    //         if (state === 1) {
    //             element.style.fontSize = "21px";
    //             element.style.color = "#007BFF";
    //             element.style.fontWeight = "bold";
    //             element.style.fontFamily = "'Courier New', monospace";
    //             // Simulate stroke with text-shadow
    //             element.style.textShadow = 
    //                 "0 0 6px rgba(255, 255, 255, 0.8), 0 0 6px rgba(255, 255, 255, 0.8), " +
    //                 "0 0 6px rgba(255, 255, 255, 0.8), 0 0 6px rgba(255, 255, 255, 0.8)";
    //             element.classList.add("instruction-text");
    //         } else {
    //             // Reset styles
    //             element.style.fontSize = "";
    //             element.style.color = "";
    //             element.style.fontWeight = "";
    //             element.style.fontFamily = "";
    //             element.style.textShadow = "";
    //             element.classList.remove("instruction-text");
    //         }
    //     }
    // });
    

    if (state == 1){
        document.getElementById("control-uncond-branch-value").textContent = obj.UncondBranch;
        document.getElementById("control-flag-branch-value").textContent = obj.FlagBranch;
        document.getElementById("control-branch-value").textContent = obj.Branch;
        document.getElementById("control-mem-read-value").textContent = obj.MemRead;
        document.getElementById("control-mem-reg-value").textContent = obj.MemtoReg;
        document.getElementById("control-mem-write-value").textContent = obj.MemWrite;
        document.getElementById("control-flag-write-value").textContent = obj.FlagWrite;
        document.getElementById("control-alu-src-value").textContent = obj.ALUSrc;
        document.getElementById("control-alu-op-value").textContent = obj.ALUOp1 + obj.ALUOp0;
        document.getElementById("control-reg-write-value").textContent = obj.RegWrite;
        document.getElementById("control-reg-2-loc").textContent = obj.Reg2Loc;
    }
    else if (state == 0){
        document.getElementById("control-uncond-branch-value").textContent = "";
        document.getElementById("control-flag-branch-value").textContent = "";
        document.getElementById("control-branch-value").textContent = "";
        document.getElementById("control-mem-read-value").textContent = "";
        document.getElementById("control-mem-reg-value").textContent = "";
        document.getElementById("control-mem-write-value").textContent = "";
        document.getElementById("control-flag-write-value").textContent = "";
        document.getElementById("control-alu-src-value").textContent = "";
        document.getElementById("control-alu-op-value").textContent = "";
        document.getElementById("control-reg-write-value").textContent = "";
        document.getElementById("control-reg-2-loc").textContent = "";
    }
}