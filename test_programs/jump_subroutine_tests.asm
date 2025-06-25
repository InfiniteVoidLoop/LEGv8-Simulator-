// ===================================================================
// CHƯƠNG TRÌNH TEST CÁC LỆNH JUMP VÀ SUBROUTINE
// ===================================================================

// Test 1: Unconditional Branch (B)
addi x1, xzr, #10    // x1 = 10
b skip1              // Nhảy không điều kiện
addi x2, xzr, #999   // Lệnh này sẽ bị bỏ qua
skip1:
addi x3, xzr, #20    // x3 = 20

// Test 2: Subroutine Call và Return (BL và BR)
addi x4, xzr, #5     // x4 = 5
addi x5, xzr, #10    // x5 = 10
bl multiply          // Gọi subroutine multiply
addi x6, xzr, #100   // x6 = 100 (sau khi return)

b end_main           // Nhảy qua subroutine

// Subroutine: multiply x4 và x5, kết quả trong x7
multiply:
    mul x7, x4, x5       // x7 = x4 * x5 = 5 * 10 = 50
    br x30               // Return (x30 chứa return address)

end_main:

// Test 3: Nested subroutine calls
addi x8, xzr, #3     // x8 = 3
bl factorial         // Gọi factorial(3)
addi x9, xzr, #200   // x9 = 200

b end_program

// Subroutine: factorial(n) trong x8, kết quả trong x10
factorial:
    // Lưu return address và parameters
    addi sp, sp, #-16    // Allocate stack space
    stur x30, [sp, #8]   // Save return address
    stur x8, [sp, #0]    // Save parameter n
    
    // Base case: if n <= 1, return 1
    addi x11, xzr, #1    // x11 = 1
    subs x12, x8, x11    // Compare n with 1
    b.le base_case       // If n <= 1, go to base case
    
    // Recursive case: factorial(n-1)
    addi x8, x8, #-1     // n = n - 1
    bl factorial         // Recursive call
    
    // Multiply n * factorial(n-1)
    ldur x8, [sp, #0]    // Restore original n
    mul x10, x8, x10     // result = n * factorial(n-1)
    
    b factorial_return
    
base_case:
    addi x10, xzr, #1    // factorial(0) = factorial(1) = 1

factorial_return:
    // Restore stack and return
    ldur x30, [sp, #8]   // Restore return address
    addi sp, sp, #16     // Deallocate stack space
    br x30               // Return

end_program:

// Test 4: Forward và Backward jumps
addi x13, xzr, #0    // Counter = 0
addi x14, xzr, #5    // Limit = 5

loop_start:
    subs x15, x13, x14   // Compare counter with limit
    b.ge loop_end        // If counter >= limit, exit loop
    
    addi x13, x13, #1    // counter++
    b loop_start         // Jump back to loop start

loop_end:
    addi x16, xzr, #300  // x16 = 300

// Test 5: Complex branching pattern
addi x17, xzr, #15   // x17 = 15
addi x18, xzr, #10   // x18 = 10

subs x19, x17, x18   // x19 = 15 - 10 = 5
b.eq equal_branch    // Won't take this branch
b.gt greater_branch  // Will take this branch
b.lt less_branch     // Won't reach this

equal_branch:
    addi x20, xzr, #1    // x20 = 1
    b branch_end

greater_branch:
    addi x20, xzr, #2    // x20 = 2 (will execute this)
    b branch_end

less_branch:
    addi x20, xzr, #3    // x20 = 3

branch_end:
    addi x21, xzr, #400  // x21 = 400

// Final results:
// x7 = 50 (5 * 10)
// x10 = 6 (factorial of 3)
// x13 = 5 (loop counter final value)
// x20 = 2 (greater branch taken)
