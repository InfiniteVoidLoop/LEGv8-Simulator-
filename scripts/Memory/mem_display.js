document.addEventListener("DOMContentLoaded", function () {
    // Tab switching
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab");

            // Remove active class from all buttons and tabs
            tabButtons.forEach((btn) =>
                btn.classList.remove("active", "bg-gray-700")
            );
            document
                .querySelectorAll(".tab-content")
                .forEach((tab) => tab.classList.remove("active"));

            // Add active class to clicked button and corresponding tab
            this.classList.add("active", "bg-gray-700");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // Initialize registers display
    const registersContainer = document.querySelector(
        "#registers .grid.grid-cols-3.gap-1"
    );
    const registerTemplate =
        document.getElementById("registerTemplate").content;

    for (let i = 0; i <= 27; i++) {
        const registerClone = registerTemplate.cloneNode(true);
        const registerDiv = registerClone.querySelector(".register-cell");
        const registerName = registerDiv.querySelector("span:first-child");
        const registerValue = registerDiv.querySelector("span:last-child");

        registerName.textContent = `X${i}`;
        registerValue.textContent = `0x${(0).toString(16).padStart(8, "0")}`;
        registerDiv.id = `register-X${i}`;

        registersContainer.appendChild(registerClone);
    }

    const stackContainer = document.querySelector(".stack-view");

    for (let i = 0; i < 3; i++) {
        const addrHeader = document.createElement("div");
        addrHeader.className = "memory-header text-gray-400";
        addrHeader.textContent = "Address";
        stackContainer.appendChild(addrHeader);

        const valHeader = document.createElement("div");
        valHeader.className = "memory-header text-gray-400";
        valHeader.textContent = "Value";
        stackContainer.appendChild(valHeader);
    }

    const totalPairs = 30;

    for (let i = 0; i < totalPairs; i++) {
        const address = i;

        const addrCell = document.createElement("div");
        addrCell.className = "text-gray-400 w-100";
        addrCell.textContent = `0x${address.toString(16).padStart(8, "0")}`;
        stackContainer.appendChild(addrCell);

        const valueCell = document.createElement("div");
        valueCell.className = "bg-gray-700 text-white px-2 py-1 rounded";
        valueCell.textContent = `0x${(0).toString(16).padStart(8, "0")}`;
        valueCell.id = `${address}`;
        stackContainer.appendChild(valueCell);
    }
});
