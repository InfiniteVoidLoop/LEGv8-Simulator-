class RFormatInstruction extends Instruction {
    constructor(bytecode, definition) {
        super(bytecode, definition);
        this.rm = this.getRm_R();
        this.shamt = this.getShamt_R();
        this.rn = this.getRn_R();
        this.rd = this.getRd_R();
    }

    disassemble() {
        const mnemonic = this.definition.getMnemonic();

        switch (mnemonic) {
            case "LSL":
            case "LSR":
                return `${mnemonic.padEnd(6)} X${this.rd}, X${this.rn}, #${
                    this.shamt
                }`;
            case "BR":
                return `${mnemonic.padEnd(6)} X${this.rn}`;
            case "ADD":
            case "ADDS":
            case "SUB":
            case "SUBS":
            case "AND":
            case "ANDS":
            case "ORR":
            case "EOR":
                return `${mnemonic.padEnd(6)} X${this.rd}, X${this.rn}, X${
                    this.rm
                }`;
            default:
                return `${mnemonic.padEnd(6)} X${this.rd}, X${this.rn}, X${
                    this.rm
                } ; (shamt=${this.shamt})`;
        }
    }
}
