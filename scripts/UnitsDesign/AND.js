var canvas = document.getElementById("AND-GATE");
var ctx = canvas.getContext("2d");
var initialPosX = 10;
var initialPosY = 10;

// Vẽ phần hình chữ nhật bên trái (thân cổng AND)

ctx.beginPath();
ctx.moveTo(initialPosX, initialPosY);
ctx.lineTo(initialPosX, initialPosY + 50);
ctx.lineTo(initialPosX + 20, initialPosY + 50);
ctx.lineWidth = 2; // thicker stroke
ctx.stroke();

ctx.beginPath();
ctx.moveTo(initialPosX, initialPosY);
ctx.lineTo(initialPosX + 20, initialPosY);
ctx.stroke();

// Vẽ phần cong bên phải (nửa hình tròn)
ctx.beginPath();
ctx.arc(
    initialPosX + 20,
    initialPosY + 25,
    25,
    -Math.PI / 2,
    Math.PI / 2,
    false
);
ctx.stroke();

console.log("AND gate drawn");
