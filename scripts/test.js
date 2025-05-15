  function resizeMainDisplayToFitChildren() {
    const container = document.getElementById('main-display');
    if (!container) return;

    const children = container.children;
    let maxRight = 0;
    let maxBottom = 0;

    for (let child of children) {
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const right = rect.right - containerRect.left;
      const bottom = rect.bottom - containerRect.top;

      if (right > maxRight) maxRight = right;
      if (bottom > maxBottom) maxBottom = bottom;
    }

    container.style.width = `${maxRight}px`;
    container.style.height = `${maxBottom}px`;
  }

  // Gọi hàm sau khi DOM đã load hoàn tất
  window.addEventListener('load', resizeMainDisplayToFitChildren);

const myDiv = document.getElementById("main-display");

// store firs click positionj
let firstClick = null;

myDiv.addEventListener("click", (e) => {
  const rect = myDiv.getBoundingClientRect(); // vùng của div
   let x = e.clientX - rect.left; // tọa độ click trong div
  let y = e.clientY - rect.top; // tọa độ click trong div

  if (firstClick === null) {
    firstClick = { x, y }; // lưu tọa độ click đầu tiên
    console.log(`Tọa độ click đầu tiên: (${x.toFixed(0)}, ${y.toFixed(0)})`);
  } else {
    // thay đổi đường đi của tag svg, path với 2 tọa độ click 
    const path = document.getElementById("linePath0");
    // cải thiện đường đi, lấy giá trị lêchj tuyệt đối giữa 2 x, và 2 y, nếu chêch lệch theo trục nào nhỏ hơn thì cả 2 tọa độ sẽ cùng giá trị của click đầu tiên trong trục còn lại 
    const deltaX = Math.abs(firstClick.x - x);
    const deltaY = Math.abs(firstClick.y - y);
    if (deltaX > deltaY) {
        y = firstClick.y;
    } else {
        x = firstClick.x;
    }
    const newPath = `M ${firstClick.x} ${firstClick.y} L ${x} ${y}`;
    path.setAttribute("d", newPath); // cập nhật đường đi của tag svg
    firstClick = null; // reset click đầu tiên
    console.log(`Tọa độ click thứ hai: (${x.toFixed(0)}, ${y.toFixed(0)})`);
  }
});
