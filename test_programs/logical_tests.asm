// ===================================================================
// CHƯƠNG TRÌNH TEST CÁC PHÉP TOÁN LOGIC VÀ BIT
// ===================================================================

// Test 1: Phép AND
addi x1, xzr, #15    // x1 = 15 (1111 trong binary)
addi x2, xzr, #7     // x2 = 7  (0111 trong binary)
and x3, x1, x2       // x3 = x1 & x2 = 7 (0111)

// Test 2: Phép OR  
addi x4, xzr, #8     // x4 = 8  (1000 trong binary)
or x5, x1, x4        // x5 = x1 | x4 = 15 (1111)

// Test 3: Phép EOR (XOR)
addi x6, xzr, #10    // x6 = 10 (1010 trong binary)
eor x7, x1, x6       // x7 = x1 ^ x6 = 5 (0101)

// Test 4: Phép NOT (thông qua EOR với -1)
addi x8, xzr, #-1    // x8 = -1 (tất cả bit = 1)
eor x9, x1, x8       // x9 = ~x1 (đảo bit của x1)

// Test 5: Phép dịch trái (LSL)
lsl x10, x1, #2      // x10 = x1 << 2 = 15 << 2 = 60

// Test 6: Phép dịch phải logic (LSR)
addi x11, xzr, #64   // x11 = 64 (1000000)
lsr x12, x11, #3     // x12 = x11 >> 3 = 64 >> 3 = 8

// Test 7: Phép dịch phải số học (ASR)
addi x13, xzr, #-64  // x13 = -64
asr x14, x13, #2     // x14 = x13 >> 2 = -64 >> 2 = -16

// Test 8: Phép AND với immediate
andi x15, x1, #12    // x15 = x1 & 12 = 15 & 12 = 12

// Test 9: Phép OR với immediate
orri x16, x2, #8     // x16 = x2 | 8 = 7 | 8 = 15

// Test 10: Phép EOR với immediate
eori x17, x1, #5     // x17 = x1 ^ 5 = 15 ^ 5 = 10

// Test 11: Kiểm tra bit mask
addi x18, xzr, #255  // x18 = 255 (11111111)
and x19, x18, #15    // x19 = x18 & 15 = 255 & 15 = 15

// Test 12: Tạo pattern bit
addi x20, xzr, #85   // x20 = 85 (01010101)
addi x21, xzr, #170  // x21 = 170 (10101010)
or x22, x20, x21     // x22 = x20 | x21 = 255 (11111111)

// Test 13: Test với số 0
and x23, x1, x0      // x23 = x1 & 0 = 0
or x24, x1, x0       // x24 = x1 | 0 = 15
eor x25, x1, x0      // x25 = x1 ^ 0 = 15

// Test 14: Phép dịch với số lớn
addi x26, xzr, #1    // x26 = 1
lsl x27, x26, #10    // x27 = 1 << 10 = 1024
lsr x28, x27, #5     // x28 = 1024 >> 5 = 32
