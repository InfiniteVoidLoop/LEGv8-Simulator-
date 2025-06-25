var canvas = document.getElementById("ADD-ALU-RESULT");
var ctx = canvas.getContext("2d");
var initialPosX = 10;
var initialPosY = 10;
// Start a new path for the shape
ctx.beginPath();

// Move to the first point (starting point of the shape)
ctx.moveTo(initialPosX, initialPosY);

// Draw a line to the second point
ctx.lineTo(initialPosX, initialPosY + 35); // Giảm xuống 35

// Draw a line to the third point
ctx.lineTo(initialPosX + 15, initialPosY + 50); // Giảm kích thước
ctx.lineTo(initialPosX, initialPosY + 65); // Giảm xuống 65
ctx.lineTo(initialPosX, initialPosY + 90); // Giảm xuống 90
ctx.lineTo(initialPosX + 75, initialPosY + 65); // Giảm chiều rộng xuống 75
ctx.lineTo(initialPosX + 75, initialPosY + 25); // Điều chỉnh tương ứng
ctx.lineTo(initialPosX, initialPosY);

// Set the color of the shape's outline
ctx.lineWidth = 3; // Giảm từ 5 xuống 3
ctx.strokeStyle = "black";

// Draw the shape outline
ctx.stroke();
ctx.fillStyle = "#acb1b3"; // background color for this shape
ctx.fill();
ctx.font = "bold 12px Arial"; // Giảm font size xuống 12px
ctx.fillStyle = "black";
ctx.fillText("Add", initialPosX + 15, initialPosY + 50); // Điều chỉnh vị trí
ctx.font = "510 12px Arial"; // Giảm font size
ctx.fillText("ALU", initialPosX + 45, initialPosY + 48); // Điều chỉnh vị trí
ctx.fillText("result", initialPosX + 40, initialPosY + 62); // Điều chỉnh vị trí

console.log("ADD ALU RESULT drawn");
