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
            "1001000100" : "0010", // ADD (ALU control for addition, I-Format)
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

/**
 * Cộng hai chuỗi thập lục phân và trả về tổng dưới dạng chuỗi thập lục phân.
 * Hàm này sử dụng BigInt để xử lý các số có độ lớn tùy ý, đảm bảo độ chính xác.
 *
 * @param {string} hexStr1 - Chuỗi thập lục phân đầu tiên (có thể có hoặc không có tiền tố '0x').
 * @param {string} hexStr2 - Chuỗi thập lục phân thứ hai (có thể có hoặc không có tiền tố '0x').
 * @returns {string} Tổng của hai số dưới dạng chuỗi thập lục phân, có tiền tố '0x' và chữ cái viết hoa.
 * @throws {Error} Nếu bất kỳ chuỗi đầu vào nào không phải là định dạng thập lục phân hợp lệ.
 */
function addHexStrings(hexStr1, hexStr2) {
    // Regex để kiểm tra chuỗi hex hợp lệ (có thể có hoặc không có tiền tố '0x')
    // và chỉ chứa các ký tự hex (0-9, a-f, A-F).
    const hexRegex = /^(0x)?[0-9a-fA-F]+$/;

    // --- Bước 1: Xác thực và Chuẩn hóa Chuỗi Đầu vào ---
    // Kiểm tra kiểu dữ liệu và định dạng hex.
    // Nếu chuỗi không có tiền tố '0x', thêm vào để BigInt có thể phân tích cú pháp.
    const normalizeHex = (str) => {
        if (typeof str !== 'string' || !hexRegex.test(str)) {
            throw new Error(`Invalid hexadecimal string: '${str}'. Must be a valid hex string.`);
        }
        return str.startsWith('0x') ? str : `0x${str}`;
    };

    const normalizedHex1 = normalizeHex(hexStr1);
    const normalizedHex2 = normalizeHex(hexStr2);

    // --- Bước 2: Chuyển đổi Chuỗi Hex sang BigInt ---
    // Sử dụng BigInt để đảm bảo xử lý chính xác các số lớn.
    // BigInt có thể trực tiếp phân tích cú pháp chuỗi hex có tiền tố '0x'.
    let bigInt1;
    let bigInt2;
    try {
        bigInt1 = BigInt(normalizedHex1);
        bigInt2 = BigInt(normalizedHex2);
    } catch (error) {
        // Bắt lỗi nếu quá trình chuyển đổi sang BigInt thất bại (mặc dù regex đã lọc phần lớn).
        throw new Error(`Failed to convert one of the hex strings to BigInt: ${error.message}`);
    }

    // --- Bước 3: Thực hiện Phép Cộng trên BigInt ---
    const sumBigInt = bigInt1 + bigInt2;

    // --- Bước 4: Chuyển đổi Kết quả BigInt trở lại Chuỗi Hex ---
    // `toString(16)` sẽ chuyển BigInt về chuỗi hex, nhưng không có tiền tố '0x'
    // và các chữ cái sẽ là chữ thường.
    let resultHex = sumBigInt.toString(16);

    // --- Bước 5: Định dạng Đầu ra (Thêm '0x' và Chữ hoa) ---
    return `0x${resultHex.toUpperCase()}`;
}