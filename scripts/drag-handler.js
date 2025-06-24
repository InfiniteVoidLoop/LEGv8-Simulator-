document.addEventListener('DOMContentLoaded', function() {
    const mainDisplay = document.getElementById('main-display');
    const svg = document.getElementById('svg');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let scale = 1;

    // Set initial styles
    mainDisplay.style.cursor = 'grab';
    mainDisplay.style.userSelect = 'none';
    mainDisplay.style.transition = 'transform 0.1s ease-out';
    mainDisplay.style.touchAction = 'none'; // Disable browser touch actions

    // Initial position and constraints
    const position = {
        left: 0,
        top: 0
    };

    const constraints = {
        minX: -500,
        maxX: 500,
        minY: -300,
        maxY: 300
    };

    // Mouse event handlers
    function startDragging(e) {
        // Allow dragging when clicking on main-display or svg
        if (e.target !== mainDisplay && e.target !== svg && !svg.contains(e.target)) return;
        
        e.preventDefault();
        isDragging = true;
        mainDisplay.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing'; // Set cursor for entire page while dragging
        mainDisplay.style.transition = 'none'; // Disable transition while dragging
        
        initialX = e.clientX - position.left;
        initialY = e.clientY - position.top;
        
        // Capture pointer to improve dragging
        mainDisplay.setPointerCapture?.(e.pointerId);
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        // Calculate new position with constraints
        currentX = Math.min(Math.max(e.clientX - initialX, constraints.minX), constraints.maxX);
        currentY = Math.min(Math.max(e.clientY - initialY, constraints.minY), constraints.maxY);
        
        position.left = currentX;
        position.top = currentY;
        
        updatePosition();
    }    function stopDragging(e) {
        if (!isDragging) return;
        isDragging = false;
        mainDisplay.style.cursor = 'grab';
        document.body.style.cursor = 'default'; // Reset cursor for entire page
        mainDisplay.style.transition = 'transform 0.1s ease-out'; // Re-enable transition
        if (e && e.pointerId !== undefined) {
            mainDisplay.releasePointerCapture?.(e.pointerId);
        }
    }

    function updatePosition() {
        mainDisplay.style.transform = `translate(${position.left}px, ${position.top}px) scale(${scale})`;
    }

    // Touch event handlers
    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            startDragging({
                target: mainDisplay,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pointerId: touch.identifier,
                preventDefault: () => {}
            });
        }
    }

    function handleTouchMove(e) {
        if (isDragging && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            drag({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    }

    function handleTouchEnd(e) {
        if (isDragging) {
            e.preventDefault();
            stopDragging({
                pointerId: e.changedTouches[0].identifier
            });
        }
    }

    // Zoom handler with improved constraints
    function handleWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.min(Math.max(scale * delta, 0.5), 2);
            updatePosition();
        }
    }

    // Event listeners
    mainDisplay.style.cursor = 'grab';
    mainDisplay.addEventListener('pointerdown', startDragging);
    document.addEventListener('pointermove', drag);
    document.addEventListener('pointerup', stopDragging);
    document.addEventListener('pointercancel', stopDragging);

    // Touch events
    mainDisplay.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    // Zoom
    mainDisplay.addEventListener('wheel', handleWheel, { passive: false });
});
