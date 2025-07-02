// clear textarea with id assemblyCode
function clearAssemblyCode() {
    const assemblyCode = document.getElementById("assemblyCode");
    if (assemblyCode) {
        assemblyCode.value = ""; // Clear the textarea
    }
}
document.getElementById("clearAssemblyBtn").onclick = clearAssemblyCode