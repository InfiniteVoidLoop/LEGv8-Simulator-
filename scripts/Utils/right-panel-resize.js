document.addEventListener('DOMContentLoaded', () => {
    const rightPanel = document.getElementById('right-panel');
    const resizeHandle = document.getElementById('right-panel-resize-handle');
    const mainGrid = document.querySelector('.main-grid');

    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const newWidth = window.innerWidth - e.clientX;
        
        // Enforce min and max width constraints
        if (newWidth > 250 && newWidth < 600) {
            rightPanel.style.width = `${newWidth}px`;
            mainGrid.style.gridTemplateColumns = `0px 1fr ${newWidth}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    });
});
