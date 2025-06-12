function add4ToHexAddress(hexAddressString) {
    const cleanHex = hexAddressString.startsWith("0x") ? hexAddressString.slice(2) : hexAddressString;

    let addressAsBigInt;
    try {
        let value = BigInt(`0x${cleanHex}`);
        // Chuyển thành signed nếu bit cao là 1 (two's complement 64-bit)
        if (value >= (1n << 63n)) {
            value -= (1n << 64n);
        }
        addressAsBigInt = value;
    } catch (error) {
        console.error("Invalid hexadecimal address string:", hexAddressString, error);
        return "Invalid Address";
    }

    const newAddressAsBigInt = addressAsBigInt + 4n;

    // Chuyển lại two's complement hex string
    const resultBigInt = newAddressAsBigInt < 0n
        ? (1n << 64n) + newAddressAsBigInt
        : newAddressAsBigInt;

    return `0x${resultBigInt.toString(16).toUpperCase().padStart(16, '0')}`;
}

function addHexStrings(hexStr1, hexStr2) {
    const hexRegex = /^(0x)?[0-9a-fA-F]+$/;

    const normalizeHex = (str) => {
        if (typeof str !== 'string' || !hexRegex.test(str)) {
            throw new Error(`Invalid hexadecimal string: '${str}'.`);
        }
        return str.startsWith('0x') ? str.slice(2) : str;
    };

    const toSignedBigInt = (hex) => {
        let val = BigInt(`0x${hex}`);
        return val >= (1n << 63n) ? val - (1n << 64n) : val;
    };

    const hex1 = normalizeHex(hexStr1);
    const hex2 = normalizeHex(hexStr2);

    const sum = toSignedBigInt(hex1) + toSignedBigInt(hex2);

    const result = sum < 0n
        ? (1n << 64n) + sum
        : sum;

    return `0x${result.toString(16).toUpperCase().padStart(16, '0')}`;
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

function getBits(bitStr, startBit, endBit) {
    const len = bitStr.length;
    const start = len - 1 - endBit;
    const end = len - startBit;
    return bitStr.substring(start, end);
}

function jumpToAddress(PC, lst, address) {
    const obj = PC.getObjectAtAddress(address);
    if (obj.definition.format == 'R') {
        lst.push(new RFormat(obj, PC))
    }
    else if (obj.definition.format == 'I') {
        lst.push(new IFormat(obj, PC))
    }
    else if (obj.definition.format == 'D' && ins[i].definition.mnemonic == 'STUR') {
        lst.push(new Store(obj, PC))
    }
    else if (obj.definition.format == 'D' && ins[i].definition.mnemonic == 'LDUR') {
        lst.push(new Load(obj, PC))
    }
    else if (obj.definition.format == 'C') {
        lst.push(new CBFormat(obj, PC))
    }
    else if (obj.definition.format == 'B') {
        lst.push(new BFormat(obj, PC))
    }
}