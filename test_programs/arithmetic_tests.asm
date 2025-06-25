// ===================================================================
// CHƯƠNG TRÌNH TEST CÁC PHÉP TOÁN SỐ HỌC
// ===================================================================

// Test 1: Phép cộng cơ bản
addi x1, xzr, #100   // x1 = 100
addi x2, xzr, #50    // x2 = 50
add x3, x1, x2       // x3 = x1 + x2 = 150

// Test 2: Phép trừ
sub x4, x1, x2       // x4 = x1 - x2 = 50

// Test 3: Phép cộng với số âm
addi x5, xzr, #-25   // x5 = -25
add x6, x1, x5       // x6 = x1 + x5 = 75

// Test 4: Phép nhân (nếu hỗ trợ)
mul x7, x2, x3       // x7 = x2 * x3 = 50 * 150 = 7500

// Test 5: Kiểm tra overflow
addi x8, xzr, #2047  // x8 = 2047 (gần giới hạn 12-bit immediate)
addi x9, x8, #1      // x9 = x8 + 1 = 2048

// Test 6: Phép toán với register x0 (luôn = 0)
add x10, x0, x1      // x10 = 0 + x1 = 100
add x0, x1, x2       // x0 vẫn = 0 (không thể thay đổi)

// Test 7: Chuỗi phép toán liên tiếp
addi x11, xzr, #10   // x11 = 10
addi x12, xzr, #20   // x12 = 20
add x13, x11, x12    // x13 = 30
add x14, x13, x11    // x14 = 40
sub x15, x14, x12    // x15 = 20

// Test 8: Phép toán với số lớn
addi x16, xzr, #1000 // x16 = 1000
addi x17, xzr, #2000 // x17 = 2000
add x18, x16, x17    // x18 = 3000
sub x19, x18, x16    // x19 = 2000

// Test 9: Kiểm tra các flags
subs x20, x11, x12   // x20 = 10 - 20 = -10, N=1, Z=0
subs x21, x12, x12   // x21 = 20 - 20 = 0, N=0, Z=1
adds x22, x16, x17   // x22 = 1000 + 2000 = 3000, kiểm tra flags

// Test 10: Phép toán với immediate lớn
addi x23, xzr, #2047 // Immediate value tối đa trong 12-bit
addi x24, xzr, #-2048// Immediate value tối thiểu trong 12-bit
