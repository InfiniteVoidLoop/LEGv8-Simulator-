var canvas = document.getElementById("ADD-4");
var ctx = canvas.getContext("2d");
var initialPosX = 10;
var initialPosY = 10;
// Start a new path for the shape
ctx.beginPath();

// Move to the first point (starting point of the shape)
ctx.moveTo(initialPosX, initialPosY);

// Draw a line to the second point
ctx.lineTo(initialPosX, initialPosY + 30); // Giảm từ 50 xuống 30

// Draw a line to the third point
ctx.lineTo(initialPosX + 15, initialPosY + 45); // Giảm từ 20,70 xuống 15,45
ctx.lineTo(initialPosX, initialPosY + 60); // Giảm từ 90 xuống 60
ctx.lineTo(initialPosX, initialPosY + 90); // Giảm từ 140 xuống 90
ctx.lineTo(initialPosX + 45, initialPosY + 65); // Giảm từ 65,100 xuống 45,65
ctx.lineTo(initialPosX + 45, initialPosY + 25); // Giảm từ 65,40 xuống 45,25
ctx.lineTo(initialPosX, initialPosY);

// Set the color of the shape's outline
ctx.lineWidth = 3; // Giảm độ dày từ 5 xuống 3
ctx.strokeStyle = "black";

// Draw the shape outline
ctx.stroke();

ctx.fillStyle = "#acb1b3"; // background color for this shape
ctx.fill();

ctx.font = "bold 14px Arial"; // Giảm font size từ 17px xuống 14px
ctx.fillStyle = "black";
ctx.fontweight = "bold";
ctx.fillText("Add", initialPosX + 15, initialPosY + 50); // Điều chỉnh vị trí text cho phù hợp với kích thước mới
console.log("ADD-4");
