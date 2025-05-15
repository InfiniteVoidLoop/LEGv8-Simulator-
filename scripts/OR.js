var canvas = document.getElementById("OR-GATE");
var ctx = canvas.getContext("2d");

// Vẽ đường cong bên trái (gốc OR)
ctx.beginPath();
ctx.moveTo(10, 10);
ctx.quadraticCurveTo(40, 45, 10, 80);
ctx.lineWidth = 2; // thicker stroke
ctx.strokeStyle = 'black';
ctx.stroke();
  
// Vẽ đường cong phía trên (phần trên của OR)
ctx.beginPath();
ctx.moveTo(10, 10);
ctx.quadraticCurveTo(130, 45, 10, 80);
ctx.stroke();

console.log("OR gate drawn");


