// ===================================================================
// CHƯƠNG TRÌNH TEST TỔNG HÔP - SORTING ALGORITHM (BUBBLE SORT)
// ===================================================================

// Sắp xếp mảng [64, 34, 25, 12, 22, 11, 90] bằng thuật toán Bubble Sort

// Khởi tạo dữ liệu
addi x1, xzr, #2000  // Base address cho mảng
addi x2, xzr, #7     // Kích thước mảng

// Nhập dữ liệu vào mảng
addi x3, xzr, #64    // arr[0] = 64
stur x3, [x1, #0]
addi x3, xzr, #34    // arr[1] = 34  
stur x3, [x1, #8]
addi x3, xzr, #25    // arr[2] = 25
stur x3, [x1, #16]
addi x3, xzr, #12    // arr[3] = 12
stur x3, [x1, #24]
addi x3, xzr, #22    // arr[4] = 22
stur x3, [x1, #32]
addi x3, xzr, #11    // arr[5] = 11
stur x3, [x1, #40]
addi x3, xzr, #90    // arr[6] = 90
stur x3, [x1, #48]

// Bubble Sort Algorithm
// for (i = 0; i < n-1; i++)
//   for (j = 0; j < n-i-1; j++)
//     if (arr[j] > arr[j+1])
//       swap(arr[j], arr[j+1])

addi x4, xzr, #0     // i = 0 (outer loop counter)
addi x5, x2, #-1     // n-1 = 6

outer_loop:
    subs x6, x4, x5      // Compare i with n-1
    b.ge sort_done       // If i >= n-1, sorting done
    
    addi x7, xzr, #0     // j = 0 (inner loop counter)
    sub x8, x5, x4       // n-1-i
    
    inner_loop:
        subs x9, x7, x8      // Compare j with n-1-i
        b.ge inner_done      // If j >= n-1-i, inner loop done
        
        // Load arr[j] and arr[j+1]
        lsl x10, x7, #3      // j * 8
        add x11, x1, x10     // address of arr[j]
        ldur x12, [x11, #0]  // arr[j]
        ldur x13, [x11, #8]  // arr[j+1]
        
        // Compare arr[j] and arr[j+1]
        subs x14, x12, x13   // arr[j] - arr[j+1]
        b.le no_swap         // If arr[j] <= arr[j+1], no swap needed
        
        // Swap arr[j] and arr[j+1]
        stur x13, [x11, #0]  // arr[j] = arr[j+1]
        stur x12, [x11, #8]  // arr[j+1] = arr[j]
        
        no_swap:
        addi x7, x7, #1      // j++
        b inner_loop
    
    inner_done:
    addi x4, x4, #1      // i++
    b outer_loop

sort_done:

// Đọc lại mảng đã sắp xếp để kiểm tra
ldur x15, [x1, #0]   // arr[0] - should be 11
ldur x16, [x1, #8]   // arr[1] - should be 12
ldur x17, [x1, #16]  // arr[2] - should be 22
ldur x18, [x1, #24]  // arr[3] - should be 25
ldur x19, [x1, #32]  // arr[4] - should be 34
ldur x20, [x1, #40]  // arr[5] - should be 64
ldur x21, [x1, #48]  // arr[6] - should be 90

// Kết thúc chương trình
// Kết quả mong đợi: [11, 12, 22, 25, 34, 64, 90]
