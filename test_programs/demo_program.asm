
// --- Arithmetic Instructions ---
// ADDI: Add immediate value
ADDI X1, XZR, #10      // X1 = 0 + 10 = 10
ADDI X2, XZR, #15      // X2 = 0 + 15 = 15

// ADD: Add registers
ADD X3, X1, X2         // X3 = X1 + X2 = 10 + 15 = 25

// SUB: Subtract registers
SUB X4, X2, X1         // X4 = X2 - X1 = 15 - 10 = 5

// ADDS: Add and set flags
ADDS X5, X4, XZR       // X5 = 5, Flags: N=0, Z=0

// SUBS: Subtract and set flags
SUBS XZR, X5, X5       // 5 - 5 = 0, Flags: N=0, Z=1


// --- Logical Instructions ---
// AND: Bitwise AND
ADDI X6, XZR, #0b1101  // X6 = 13
ADDI X7, XZR, #0b1011  // X7 = 11
AND X8, X6, X7         // X8 = 13 & 11 = 9 (0b1001)

// ORR: Bitwise OR
ORR X9, X6, X7         // X9 = 13 | 11 = 15 (0b1111)


// --- Memory Instructions ---
// STUR: Store register to memory
ADDI X10, XZR, #100    // Set a base address for memory operations
STUR X9, [X10, #0]     // Store value of X9 (15) at address 100

// LDUR: Load register from memory
LDUR X11, [X10, #0]    // Load value from address 100 into X11. X11 should be 15.


// --- Branch Instructions ---
// CBZ: Conditional Branch if Zero
// Since Z flag is 1 from the SUBS instruction, this branch will be taken.
CBZ X5, IS_ZERO        // Branch to IS_ZERO if X5 is 0. (It's not, but Z flag is set)
ADDI X12, XZR, #1      // This line should be skipped.
IS_ZERO:
ADDI X13, XZR, #2      // Execution continues here. X13 = 2.

// CBNZ: Conditional Branch if Not Zero
CBNZ X13, NOT_ZERO     // X13 is not zero, so branch is taken.
ADDI X14, XZR, #3      // This line is skipped.
NOT_ZERO:
ADDI X15, XZR, #4      // Execution continues here. X15 = 4.

// B.cond: Conditional Branch
SUBS XZR, X2, X1             // Compare X2 (15) and X1 (10). Sets flags for B.GT
B.GT TARGET_A          // Branch if Greater Than (15 > 10), so branch is taken.
ADDI X16, XZR, #5      // This line is skipped.
TARGET_A:
ADDI X17, XZR, #6      // Execution continues here. X17 = 6.

// B: Unconditional Branch
B END_PROGRAM          // Jump directly to the end.
ADDI X18, XZR, #99     // This instruction is skipped.

END_PROGRAM:
// Program ends here.
