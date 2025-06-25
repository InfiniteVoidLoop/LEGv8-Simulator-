// ===================================================================
// CHƯƠNG TRÌNH TEST TỔNG HÔP - THUẬT TOÁN FIBONACCI
// ===================================================================

// Tính dãy Fibonacci: F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)
// Sẽ tính 10 số Fibonacci đầu tiên và lưu vào memory

// Khởi tạo
addi x1, xzr, #1000  // Base address để lưu kết quả
addi x2, xzr, #0     // F(0) = 0
addi x3, xzr, #1     // F(1) = 1
addi x4, xzr, #10    // Số lượng số Fibonacci cần tính
addi x5, xzr, #0     // Counter = 0

// Lưu F(0) và F(1)
stur x2, [x1, #0]    // memory[1000] = F(0) = 0
stur x3, [x1, #8]    // memory[1008] = F(1) = 1

// Cập nhật counter
addi x5, x5, #2      // counter = 2

// Vòng lặp tính Fibonacci
loop:
    // Kiểm tra điều kiện dừng
    subs x6, x5, x4      // x6 = counter - 10
    b.ge end_loop        // Nếu counter >= 10 thì thoát

    // Tính F(n) = F(n-1) + F(n-2)
    add x7, x2, x3       // x7 = F(n-2) + F(n-1) = F(n)
    
    // Lưu F(n) vào memory
    lsl x8, x5, #3       // x8 = counter * 8 (offset)
    add x9, x1, x8       // x9 = base + offset
    stur x7, [x9, #0]    // memory[base + counter*8] = F(n)
    
    // Cập nhật F(n-2) và F(n-1)
    add x2, x3, x0       // F(n-2) = F(n-1)
    add x3, x7, x0       // F(n-1) = F(n)
    
    // Tăng counter
    addi x5, x5, #1      // counter++
    
    // Tiếp tục vòng lặp
    b loop

end_loop:

// Đọc lại kết quả để kiểm tra
ldur x10, [x1, #0]   // F(0) = 0
ldur x11, [x1, #8]   // F(1) = 1
ldur x12, [x1, #16]  // F(2) = 1
ldur x13, [x1, #24]  // F(3) = 2
ldur x14, [x1, #32]  // F(4) = 3
ldur x15, [x1, #40]  // F(5) = 5
ldur x16, [x1, #48]  // F(6) = 8
ldur x17, [x1, #56]  // F(7) = 13
ldur x18, [x1, #64]  // F(8) = 21
ldur x19, [x1, #72]  // F(9) = 34

// Kết thúc chương trình
// Kết quả mong đợi:
// F(0) = 0, F(1) = 1, F(2) = 1, F(3) = 2, F(4) = 3
// F(5) = 5, F(6) = 8, F(7) = 13, F(8) = 21, F(9) = 34
