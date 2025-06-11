const wrapper = document.getElementById('app');
// const content

let isDragging = false;
let startX, startY;
let initialLeft, initialTop;

content.addEventListener("mousedown", function (e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = parseInt(content.style.left, 10) || 0;
    initialTop = parseInt(content.style.top, 10) || 0;
});

document.addEventListener("mouseup", function () {
    isDragging = false;
});

document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    // Limit movement within wrapper
    // const maxLeft = wrapper.clientWidth - content.clientWidth;
    // const maxTop = wrapper.clientHeight - content.clientHeight;

    // newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    // newTop = Math.max(0, Math.min(newTop, maxTop));

    content.style.left = newLeft + "px";
    content.style.top = newTop + "px";
});
