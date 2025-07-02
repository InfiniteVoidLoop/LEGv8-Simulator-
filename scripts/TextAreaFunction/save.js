// load current assembly code from textarea with id assemblyCode to file .as
function saveAssemblyCode() {
    const assemblyCode = document.getElementById("assemblyCode");
    if (assemblyCode) {
        const code = assemblyCode.value; // Get the value of the textarea
        const blob = new Blob([code], { type: "text/plain" }); // Create a Blob from the code
        const url = URL.createObjectURL(blob); // Create a URL for the Blob

        // Create a temporary link element to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = "assembly_code.asm"; // Set the desired file name
        document.body.appendChild(link);
        link.click(); // Programmatically click the link to trigger the download
        document.body.removeChild(link); // Remove the link after downloading
        URL.revokeObjectURL(url); // Clean up the URL object
    } else {
        alert("Assembly code textarea not found.");
    }
}
document.getElementById("saveAssemblyBtn").onclick = saveAssemblyCode;