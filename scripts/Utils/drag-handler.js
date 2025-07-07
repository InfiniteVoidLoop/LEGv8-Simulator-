// Merged Zoom and Drag System
document.addEventListener("DOMContentLoaded", () => {
    const mainDisplay = document.getElementById("main-display");
    const svg = document.getElementById("svg");
    const resetButton = document.getElementById("resetZoomButton");

    if (!mainDisplay || !svg) {
        console.error("Main display or SVG element not found!");
        return;
    }

    // Set initial styles
    mainDisplay.style.cursor = "grab";
    mainDisplay.style.userSelect = "none";
    mainDisplay.style.transition = "transform 0.1s ease-out";
    mainDisplay.style.touchAction = "none";

    // Initial values for reset
    const initialScale = 1;
    const initialOffsetX = 0;
    const initialOffsetY = 0;

    let scale = initialScale;
    let offsetX = initialOffsetX;
    let offsetY = initialOffsetY;

    // Zoom settings
    const minScale = 0.1;
    const maxScale = 5;
    const zoomIntensity = 0.1;
    const zoomStep = 0.1;

    // Drag settings
    let isDragging = false;
    let startX, startY;
    let initialOffsetXDrag, initialOffsetYDrag;

    // Constraints
    const constraints = {
        minX: -500,
        maxX: 500,
        minY: -300,
        maxY: 300,
    };

    function applyTransform() {
        // Apply constraints
        offsetX = Math.min(
            Math.max(offsetX, constraints.minX),
            constraints.maxX,
        );
        offsetY = Math.min(
            Math.max(offsetY, constraints.minY),
            constraints.maxY,
        );

        mainDisplay.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }

    // Reset function
    function resetZoom() {
        scale = initialScale;
        offsetX = initialOffsetX;
        offsetY = initialOffsetY;
        applyTransform();
    }

    // Zoom functions for external use
    function zoomIn() {
        const newScale = scale + zoomStep;
        scale = Math.max(minScale, Math.min(maxScale, newScale));
        applyTransform();
    }

    function zoomOut() {
        const newScale = scale - zoomStep;
        scale = Math.max(minScale, Math.min(maxScale, newScale));
        applyTransform();
    }

    // Make functions globally accessible
    window.zoomIn = zoomIn;
    window.zoomOut = zoomOut;
    window.resetZoom = resetZoom;

    // Wheel zoom with mouse position
    function handleWheel(event) {
        event.preventDefault();

        const rect = mainDisplay.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const mouseXOnContent = (mouseX - offsetX) / scale;
        const mouseYOnContent = (mouseY - offsetY) / scale;

        const delta = event.deltaY < 0 ? 1 : -1;
        const newScale = scale * (1 + delta * zoomIntensity);
        scale = Math.max(minScale, Math.min(maxScale, newScale));

        offsetX = mouseX - mouseXOnContent * scale;
        offsetY = mouseY - mouseYOnContent * scale;

        applyTransform();
    }

    // Mouse drag handlers
    function startDragging(event) {
        if (event.button !== 0) return;

        // Allow dragging when clicking on main-display or svg
        if (
            event.target !== mainDisplay &&
            event.target !== svg &&
            !svg.contains(event.target)
        )
            return;

        // Skip if clicking on buttons
        if (
            resetButton &&
            (event.target === resetButton ||
                event.target.closest("#resetZoomButton"))
        ) {
            return;
        }

        event.preventDefault();
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        initialOffsetXDrag = offsetX;
        initialOffsetYDrag = offsetY;

        mainDisplay.style.cursor = "grabbing";
        document.body.style.cursor = "grabbing";
        mainDisplay.style.transition = "none";
        mainDisplay.classList.add("dragging");

        // Capture pointer to improve dragging
        mainDisplay.setPointerCapture?.(event.pointerId);
    }

    function drag(event) {
        if (!isDragging) return;
        event.preventDefault();

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        offsetX = initialOffsetXDrag + dx;
        offsetY = initialOffsetYDrag + dy;

        applyTransform();
    }

    function stopDragging(event) {
        if (!isDragging) return;
        isDragging = false;

        mainDisplay.style.cursor = "grab";
        document.body.style.cursor = "default";
        mainDisplay.style.transition = "transform 0.1s ease-out";
        mainDisplay.classList.remove("dragging");

        if (event && event.pointerId !== undefined) {
            mainDisplay.releasePointerCapture?.(event.pointerId);
        }
    }

    // Touch handlers
    function handleTouchStart(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            const touch = event.touches[0];
            startDragging({
                target: mainDisplay,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pointerId: touch.identifier,
                preventDefault: () => {},
                button: 0,
            });
        }
    }

    function handleTouchMove(event) {
        if (isDragging && event.touches.length === 1) {
            event.preventDefault();
            const touch = event.touches[0];
            drag({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {},
            });
        }
    }

    function handleTouchEnd(event) {
        if (isDragging) {
            event.preventDefault();
            stopDragging({
                pointerId: event.changedTouches[0].identifier,
            });
        }
    }

    // Event listeners
    mainDisplay.addEventListener("pointerdown", startDragging);
    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", stopDragging);
    document.addEventListener("pointercancel", stopDragging);

    // Touch events
    mainDisplay.addEventListener("touchstart", handleTouchStart, {
        passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    // Wheel zoom
    mainDisplay.addEventListener("wheel", handleWheel, { passive: false });

    // Mouse events (fallback)
    mainDisplay.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDragging);

    // Handle mouse leaving window while dragging
    document.addEventListener("mouseleave", (event) => {
        if (isDragging && !event.relatedTarget) {
            stopDragging();
        }
    });

    // Reset button listener
    if (resetButton) {
        resetButton.addEventListener("click", resetZoom);
    }

    // Keyboard shortcut for reset
    document.addEventListener("keydown", (event) => {
        if (
            (event.key === "r" || event.key === "R") &&
            event.target.tagName !== "TEXTAREA"
        ) {
            resetZoom();
        }
    });

    // Initial transform apply
    applyTransform();
});
