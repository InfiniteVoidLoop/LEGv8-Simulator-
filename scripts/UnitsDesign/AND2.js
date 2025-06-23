var canvas = document.getElementById("AND-GATE-2");
var ctx = canvas.getContext("2d");
var initialPosX = 10;
var initialPosY = 10;

// Vẽ phần hình chữ nhật bên trái (thân cổng AND)
ctx.beginPath();
ctx.moveTo(initialPosX, initialPosY);
ctx.lineTo(initialPosX, initialPosY + 35); // Chiều cao 35px
ctx.lineTo(initialPosX + 15, initialPosY + 35); // Chiều rộng 15px
ctx.lineWidth = 2;
ctx.stroke();

ctx.beginPath();
ctx.moveTo(initialPosX, initialPosY);
ctx.lineTo(initialPosX + 15, initialPosY); // Chiều rộng 15px
ctx.stroke();

// Vẽ phần cong bên phải (nửa hình tròn)
ctx.beginPath();
ctx.arc(
    initialPosX + 15, // Tâm x
    initialPosY + 17.5, // Tâm y
    17.5, // Bán kính
    -Math.PI / 2,
    Math.PI / 2,
    false
);
ctx.stroke();

console.log("AND gate 2 drawn");
