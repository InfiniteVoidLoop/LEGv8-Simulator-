document.addEventListener('DOMContentLoaded', () => {
    const footer = document.getElementById('footer');
    const dragHandle = footer.querySelector('.footer-drag-handle');
    let isDragging = false;
    let startY;
    let startHeight;

    // Function to handle the resize
    function handleResize(e) {
        if (!isDragging) return;
        
        const dy = e.clientY - startY;
        let newHeight = Math.max(100, startHeight - dy); // Minimum height of 100px
        newHeight = Math.min(newHeight, window.innerHeight * 0.5); // Maximum 50% of viewport height
        
        footer.style.height = `${newHeight}px`;
        
        // Update grid template rows
        const mainGrid = document.querySelector('.main-grid');
        mainGrid.style.gridTemplateRows = `60px 1fr ${newHeight}px`;
    }

    // Mouse down event handler
    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startHeight = footer.offsetHeight;
        dragHandle.classList.add('dragging');
        
        // Prevent text selection while dragging
        document.body.style.userSelect = 'none';
    });

    // Mouse move event handler
    document.addEventListener('mousemove', handleResize);

    // Mouse up event handler
    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        dragHandle.classList.remove('dragging');
        document.body.style.userSelect = '';
    });

    // Tab switching functionality
    window.switchTab = function(tabName) {
        const registerContent = document.getElementById('registers-content');
        const stackContent = document.getElementById('stack-content');
        const registerTab = document.getElementById('registers-tab');
        const stackTab = document.getElementById('stack-tab');
        
        if (tabName === 'registers') {
            registerContent.style.display = 'grid';
            stackContent.style.display = 'none';
            registerTab.classList.add('active');
            stackTab.classList.remove('active');
        } else {
            registerContent.style.display = 'none';
            stackContent.style.display = 'grid';
            registerTab.classList.remove('active');
            stackTab.classList.add('active');
        }
    };
    
    // Initialize with registers tab active
    switchTab('registers');
});
