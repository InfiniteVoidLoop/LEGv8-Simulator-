document.addEventListener("DOMContentLoaded", function () {
    // Tab switching
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab");

            // Remove active class from all buttons and tabs
            tabButtons.forEach((btn) =>
                btn.classList.remove("active", "bg-gray-700"),
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
        "#registers .grid.grid-cols-3.gap-1",
    );
    const registerTemplate =
        document.getElementById("registerTemplate").content;

    for (let i = 0; i < 31; i++) {
        const registerClone = registerTemplate.cloneNode(true);
        const registerDiv = registerClone.querySelector(".register-cell");
        const registerName = registerDiv.querySelector("span:first-child");
        const registerValue = registerDiv.querySelector("span:last-child");

        registerName.textContent = `X${i}`;
        registerValue.textContent = `0x${(0).toString(16).padStart(8, "0")}`;
        registerDiv.id = `register-X${i}`;

        registersContainer.appendChild(registerClone);
    }

    // Initialize stack display
    const stackContainer = document.querySelector(".stack-view");
    for (let i = 0; i < 10; i++) {
        const address = 0x7ffffff0 - i * 8;
        const row = document.createElement("div");
        row.className = "stack-row grid grid-cols-3 gap-1";

        // Address
        const addrCell = document.createElement("div");
        addrCell.className = "stack-address text-gray-400";
        addrCell.textContent = `0x${address.toString(16).padStart(8, "0")}`;
        row.appendChild(addrCell);

        // Value
        const valueCell = document.createElement("div");
        valueCell.className = "stack-value bg-gray-700 px-2 py-1 rounded";
        valueCell.textContent = `0x${(0).toString(16).padStart(8, "0")}`;
        row.appendChild(valueCell);

        // Note
        const noteCell = document.createElement("div");
        noteCell.className = "stack-note text-gray-400 text-xs";
        noteCell.textContent = i === 0 ? "[SP]" : "";
        row.appendChild(noteCell);

        stackContainer.appendChild(row);
}})