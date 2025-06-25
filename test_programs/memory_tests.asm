// ===================================================================
// CHƯƠNG TRÌNH TEST CÁC LỆNH MEMORY (LOAD/STORE)
// ===================================================================

// Test 1: Store và Load Word (64-bit)
addi x1, xzr, #1000  // Base address = 1000
addi x2, xzr, #123   // Data to store = 123
stur x2, [x1, #0]    // Store x2 vào memory[1000]
ldur x3, [x1, #0]    // Load từ memory[1000] vào x3

// Test 2: Store và Load với offset
addi x4, xzr, #456   // Data = 456
stur x4, [x1, #8]    // Store vào memory[1008]
ldur x5, [x1, #8]    // Load từ memory[1008]

// Test 3: Store và Load Byte
addi x6, xzr, #255   // Data = 255 (max byte value)
sturb x6, [x1, #16]  // Store byte vào memory[1016]
ldurb x7, [x1, #16]  // Load byte từ memory[1016]

// Test 4: Store và Load Half Word (16-bit)
addi x8, xzr, #1234  // Data = 1234
sturh x8, [x1, #24]  // Store half word vào memory[1024]
ldurh x9, [x1, #24]  // Load half word từ memory[1024]

// Test 5: Chuỗi store liên tiếp
addi x10, xzr, #2000 // Base address = 2000
addi x11, xzr, #11   // Data 1
addi x12, xzr, #22   // Data 2  
addi x13, xzr, #33   // Data 3
stur x11, [x10, #0]  // Store vào 2000
stur x12, [x10, #8]  // Store vào 2008
stur x13, [x10, #16] // Store vào 2016

// Test 6: Load lại dữ liệu đã store
ldur x14, [x10, #0]  // Load từ 2000
ldur x15, [x10, #8]  // Load từ 2008
ldur x16, [x10, #16] // Load từ 2016

// Test 7: Test với offset âm
addi x17, xzr, #3000 // Base = 3000
addi x18, xzr, #777  // Data = 777
stur x18, [x17, #-8] // Store vào memory[2992]
ldur x19, [x17, #-8] // Load từ memory[2992]

// Test 8: Overwrite data
addi x20, xzr, #888  // New data = 888
stur x20, [x1, #0]   // Overwrite memory[1000]
ldur x21, [x1, #0]   // Load lại để kiểm tra

// Test 9: Test với địa chỉ 0
addi x22, xzr, #999  // Data = 999
stur x22, [x0, #0]   // Store vào memory[0]
ldur x23, [x0, #0]   // Load từ memory[0]

// Test 10: Store/Load với giá trị âm
addi x24, xzr, #-100 // Negative data
addi x25, xzr, #4000 // Base address
stur x24, [x25, #0]  // Store negative value
ldur x26, [x25, #0]  // Load negative value

// Test 11: Test boundary values
addi x27, xzr, #5000 // Base = 5000
addi x28, xzr, #0    // Data = 0
stur x28, [x27, #0]  // Store 0
ldur x29, [x27, #0]  // Load 0

// Test 12: Multiple stores to same location
addi x30, xzr, #6000 // Base = 6000
addi x1, xzr, #111   // First data
addi x2, xzr, #222   // Second data
stur x1, [x30, #0]   // First store
stur x2, [x30, #0]   // Overwrite với second data
ldur x3, [x30, #0]   // Should get 222
