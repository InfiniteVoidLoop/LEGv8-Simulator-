// ===================================================================
// CHƯƠNG TRÌNH TEST CÁC LỆNH NHẢY CÓ ĐIỀU KIỆN (B.COND, CBZ, CBNZ)
// ===================================================================

// Test 1: Lệnh B.EQ (Branch if Equal)
// Kiểm tra nhảy khi Z flag = 1
addi x1, xzr, #10    // x1 = 10
addi x2, xzr, #10    // x2 = 10
subs x3, x1, x2      // x3 = x1 - x2 = 0, Z flag = 1
b.eq label1          // Nhảy đến label1 vì Z = 1
addi x4, xzr, #99    // Lệnh này sẽ bị bỏ qua
label1:
addi x5, xzr, #50    // x5 = 50 (chỉ thực hiện nếu nhảy thành công)

// Test 2: Lệnh B.NE (Branch if Not Equal)  
        // Kiểm tra nhảy khi Z flag = 0
        addi x6, XZR, #15    // x6 = 15
        addi x7, XZR, #20    // x7 = 20
        subs x8, x6, x7      // x8 = x6 - x7 = -5, Z flag = 0
        b.ne label2          // Nhảy đến label2 vì Z = 0
        addi x9, XZR, #88    // Lệnh này sẽ bị bỏ qua
        label2:
        addi x10, XZR, #75   // x10 = 75

// Test 3: Lệnh CBZ (Compare and Branch if Zero)
// Nhảy nếu giá trị register = 0
addi x11, xzr, #0    // x11 = 0
cbz x11, label3      // Nhảy đến label3 vì x11 = 0
addi x12, xzr, #77   // Lệnh này sẽ bị bỏ qua
label3:
addi x13, xzr, #100  // x13 = 100

// Test 4: Lệnh CBNZ (Compare and Branch if Not Zero)
// Nhảy nếu giá trị register != 0
addi x14, xzr, #25   // x14 = 25
cbnz x14, label4     // Nhảy đến label4 vì x14 != 0
addi x15, xzr, #66   // Lệnh này sẽ bị bỏ qua
label4:
addi x16, xzr, #125  // x16 = 125

// Test 5: Lệnh B.LT (Branch if Less Than)
// Kiểm tra nhảy khi N flag = 1
addi x17, xzr, #5    // x17 = 5
addi x18, xzr, #15   // x18 = 15
subs x19, x17, x18   // x19 = x17 - x18 = -10, N flag = 1
b.lt label5          // Nhảy đến label5 vì N = 1 (5 < 15)
addi x20, xzr, #55   // Lệnh này sẽ bị bỏ qua
label5:
addi x21, xzr, #150  // x21 = 150

// Test 6: Lệnh B.GE (Branch if Greater or Equal)
// Kiểm tra không nhảy khi điều kiện sai
addi x22, xzr, #30   // x22 = 30
addi x23, xzr, #25   // x23 = 25
subs x24, x22, x23   // x24 = x22 - x23 = 5, N flag = 0
b.ge label6          // Nhảy đến label6 vì N = 0 (30 >= 25)
addi x25, xzr, #44   // Lệnh này sẽ bị bỏ qua
label6:
addi x26, xzr, #175  // x26 = 175

// Test 7: Test không nhảy với CBZ
addi x27, xzr, #42   // x27 = 42
cbz x27, label7      // KHÔNG nhảy vì x27 != 0
addi x28, xzr, #200  // x28 = 200 (sẽ được thực hiện)
label7:
addi x29, xzr, #225  // x29 = 225

// Test 8: Test không nhảy với CBNZ
addi x30, xzr, #0    // x30 = 0
cbnz x30, label8     // KHÔNG nhảy vì x30 = 0
addi x0, xzr, #250   // x0 = 250 (sẽ được thực hiện, nhưng x0 luôn = 0)
label8:
// Kết thúc chương trình
