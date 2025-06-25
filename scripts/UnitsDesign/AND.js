var canvas = document.getElementById("AND-GATE");
var ctx = canvas.getContext("2d");
var initialPosX = 10;
var initialPosY = 10;

// Vẽ phần hình chữ nhật bên trái (thân cổng AND)

ctx.beginPath();
ctx.moveTo(initialPosX, initialPosY);
ctx.lineTo(initialPosX, initialPosY + 35); // Giảm chiều cao từ 50 xuống 35
ctx.lineTo(initialPosX + 15, initialPosY + 35); // Giảm chiều rộng từ 20 xuống 15
ctx.lineWidth = 2;
ctx.stroke();

ctx.beginPath();
ctx.moveTo(initialPosX, initialPosY);
ctx.lineTo(initialPosX + 15, initialPosY); // Giảm chiều rộng từ 20 xuống 15
ctx.stroke();

// Vẽ phần cong bên phải (nửa hình tròn)
ctx.beginPath();
ctx.arc(
    initialPosX + 15, // Giảm vị trí tâm từ 20 xuống 15
    initialPosY + 17.5, // Giảm vị trí tâm từ 25 xuống 17.5
    17.5, // Giảm bán kính từ 25 xuống 17.5
    -Math.PI / 2,
    Math.PI / 2,
    false
);
ctx.stroke();

console.log("AND gate drawn");
