// import text from file (file upload from device) to textarea with id assemblyCode
function loadAssemblyCode() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".asm"; // Accept only .asm files

    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const assemblyCode = document.getElementById("assemblyCode");
                assemblyCode.value = e.target.result; // Load the content into the textarea
            };
            reader.readAsText(file);
        }
    };

    fileInput.click(); // Trigger the file input dialog
}
document.getElementById("loadAssemblyBtn").onclick = loadAssemblyCode;