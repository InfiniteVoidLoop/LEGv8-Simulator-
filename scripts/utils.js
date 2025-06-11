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
  return binaryString.padStart(n_bits, '0');
}

function toExactSignBinary(decimalNum, n_bits) {
    if (n_bits <= 0 || !Number.isInteger(n_bits)) {
        throw new Error("Số bit (n_bits) phải là một số nguyên dương.");
    }

    const maxPositive = Math.pow(2, n_bits - 1) - 1; // Giá trị dương lớn nhất có thể biểu diễn
    const minNegative = -Math.pow(2, n_bits - 1);   // Giá trị âm nhỏ nhất có thể biểu diễn

    if (decimalNum > maxPositive || decimalNum < minNegative) {
        // Tùy chọn: ném lỗi hoặc trả về một giá trị đặc biệt nếu số nằm ngoài phạm vi biểu diễn
        console.warn(`Cảnh báo: Số ${decimalNum} nằm ngoài phạm vi biểu diễn của ${n_bits} bit bù 2.`);
        // Đối với ví dụ này, chúng ta sẽ cho phép nó bị cắt bớt hoặc tràn số theo hành vi bù 2
        // nếu sử dụng phép toán bitwise 32-bit mặc định của JS.
    }

    if (decimalNum >= 0) {
        // Xử lý số dương
        let binaryString = decimalNum.toString(2);
        // Thêm padding và đảm bảo độ dài là n_bits.
        // Nếu binaryString dài hơn n_bits, padStart sẽ không cắt bớt,
        // do đó cần slice ở cuối để đảm bảo đúng n_bits.
        return binaryString.padStart(n_bits, '0').slice(-n_bits);
    } else {
        // Xử lý số âm (sử dụng bù 2)
        // Lưu ý: JavaScript thực hiện các phép toán bitwise trên số 32-bit có dấu.
        // Điều này có thể gây ra kết quả không mong muốn nếu n_bits > 32.
        // Để linh hoạt hơn với n_bits bất kỳ, chúng ta sẽ mô phỏng thủ công.

        // Bước 1: Lấy giá trị tuyệt đối của số âm, sau đó trừ đi 1
        // (Đây là một mẹo để xử lý bù 2 thủ công dễ hơn)
        // Ví dụ: -5 => 4. Chúng ta cần tính 2^n - |num|
        const absoluteVal = Math.abs(decimalNum);

        // Giá trị tương ứng trong biểu diễn bù 2 cho số âm
        // Là (2^n_bits - |decimalNum|)
        // Ví dụ: -5 (4 bit) => 2^4 - 5 = 16 - 5 = 11 (thập phân) => 1011 (nhị phân)
        // Hoặc: -5 (8 bit) => 2^8 - 5 = 256 - 5 = 251 (thập phân) => 11111011 (nhị phân)
        const twoComplementVal = Math.pow(2, n_bits) - absoluteVal;

        // Chuyển đổi giá trị này sang nhị phân
        let binaryString = twoComplementVal.toString(2);

        // Đảm bảo chuỗi nhị phân có đúng n_bits
        // Nếu n_bits quá nhỏ so với số âm, binaryString có thể dài hơn n_bits,
        // ví dụ: -1 (4 bit) -> 1111. Nếu tính ra 8 bit -> 11111111. slice(-n_bits) sẽ cắt đúng.
        return binaryString.slice(-n_bits);
    }
}