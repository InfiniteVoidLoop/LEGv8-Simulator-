class AssemblyException extends Error {
    constructor(message, cause) {
        if (cause) {
            super(message);
            this.cause = cause;
        } else {
            super(message);
        }
        this.name = "AssemblyException";
    }
}

class Assembler {
    constructor(baseAddress = ProgramCounter.BASE_ADDRESS) {
        this.baseAddress = baseAddress;
        this.symbolTable = new Map();
        this.processedLines = [];
        this.errors = [];
        console.log(`Assembler initialized with base address: 0x${baseAddress.toString(16)}`);
    }

    reset() {
        this.symbolTable.clear();
        this.processedLines = [];
        this.errors = [];
    }

    assemble(assemblyLines) {
        this.reset();
        console.log("Assembler starting...");
        console.log("  Starting Pass 1: Building Symbol Table...");
        try {
            this.buildSymbolTable(assemblyLines);
        } catch (e) {
            this.addError(0, `Pass 1 Failed: ${e.message}`, "");
            throw new AssemblyException(this.aggregateErrors());
        }

        console.log("  Pass 1 finished. Symbol Table:");
        for (const [label, addr] of this.symbolTable.entries()) {
            console.log(`    ${label.padEnd(20)} : 0x${addr.toString(16).toUpperCase()}`);
        }

        console.log("  Starting Pass 2: Generating Instructions...");
        const instructions = this.generateInstructions();

        if (this.errors.length > 0) {
            console.log("  Pass 2 completed with errors.");
            throw new AssemblyException(this.aggregateErrors());
        }

        console.log(`  Pass 2 finished. Generated ${instructions.length} instructions.`);
        console.log("Assembler finished successfully.");
        return instructions;
    }

    getErrors() {
        return [...this.errors];
    }

    buildSymbolTable(rawLines) {
        let currentAddress = this.baseAddress;
        let lineNumber = 0;
        for (const raw of rawLines) {
            lineNumber++;
            const processed = this.preprocessLine(raw);
            if (!processed) continue;
            if (processed.endsWith(":")) {
                const label = processed.slice(0, -1).trim();
                if (!this.isValidLabel(label))
                    throw new AssemblyException(this.formatError(lineNumber, `Invalid label name: '${label}'`, raw));
                if (this.symbolTable.has(label))
                    throw new AssemblyException(this.formatError(lineNumber, `Duplicate label definition: '${label}'`, raw));
                this.symbolTable.set(label, currentAddress);
            } else {
                this.processedLines.push(processed);
                currentAddress += 4;
            }
        }
    }

    generateInstructions() {
        const instructions = [];
        let addr = this.baseAddress;
        let count = 0;
        for (const line of this.processedLines) {
            count++;
            try {
                const instr = InstructionFactory.createFromAssembly(line, this.symbolTable, addr);
                instructions.push(instr);
            } catch (e) {
                this.addError(count, e.message, line);
            } finally {
                addr += 4;
            }
        }
        return instructions;
    }

    preprocessLine(line) {
        const idx = line.indexOf("//");
        const trimmed = (idx >= 0 ? line.slice(0, idx) : line).trim();
        return trimmed;
    }

    isValidLabel(label) {
        if (!label || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(label)) return false;
        return true;
    }

    formatError(lineNum, msg, content) {
        return `AsmError (Line ~${lineNum}): ${msg} [Code: '${content}']`;
    }

    addError(lineNum, msg, content) {
        const err = this.formatError(lineNum, msg, content);
        this.errors.push(err);
        console.log(err);
    }

    aggregateErrors() {
        if (this.errors.length === 0) return "Assembly successful.";
        return (
            `Assembly failed with ${this.errors.length} error(s):\n` +
            this.errors.map(e => `  - ${e}`).join("\n")
        );
    }
}
