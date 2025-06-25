var canvas = document.getElementById("ADD-ALU-RESULT-1");
var ctx = canvas.getContext("2d");
var initialPosX = 10;
var initialPosY = 10;
// Start a new path for the shape
ctx.beginPath();

// Move to the first point (starting point of the shape)
ctx.moveTo(initialPosX, initialPosY);

// Draw a line to the second point
ctx.lineTo(initialPosX, initialPosY + 50); // 10   60

// Draw a line to the third point
ctx.lineTo(initialPosX + 20, initialPosY + 70); // 30  80
ctx.lineTo(initialPosX, initialPosY + 90); // 10  100
ctx.lineTo(initialPosX, initialPosY + 140); // 10  150
ctx.lineTo(initialPosX + 105, initialPosY + 100); // 60  110
ctx.lineTo(initialPosX + 105, initialPosY + 40); // 60  50
ctx.lineTo(initialPosX, initialPosY); // 10  10

// Close the path by connecting back to the starting point
// ctx.closePath();

// Set the color of the shape's outline
ctx.lineWidth = 5; // thicker stroke
ctx.strokeStyle = "black";

// Draw the shape outline
ctx.stroke();
ctx.fillStyle = "#acb1b3"; // background color for this shape
ctx.fill();
ctx.font = "bold 17px Arial";
ctx.fillStyle = "black";
ctx.fillText("Add", initialPosX + 23, initialPosY + 78); // Adjust the position as needed
ctx.font = "510 17px Arial";
ctx.fillText("ALU", initialPosX + 63, initialPosY + 84);
ctx.fillText("result", initialPosX + 54, initialPosY + 99);
ctx.fillText("Zero", initialPosX + 60, initialPosY + 54);

console.log("ADD ALU RESULT 1 drawn");
