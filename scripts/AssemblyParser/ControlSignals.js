class ControlSignals {
    /**
     * Constructor for ControlSignals.
     * @param {string} reg2Loc - Register 2 location control signal
     * @param {string} uncondBranch - Unconditional branch control signal
     * @param {string} flagBranch - Flag branch control signal
     * @param {string} zeroBranch - Zero branch control signal
     * @param {string} memRead - Memory read control signal
     * @param {string} memToReg - Memory to register control signal
     * @param {string} memWrite - Memory write control signal
     * @param {string} flagWrite - Flag write control signal
     * @param {string} aluSrc - ALU source control signal
     * @param {number} aluOp - ALU operation control signal
     * @param {string} regWrite - Register write control signal
     * @param {number} operation - Operation control signal
     */
    constructor(
        reg2Loc,
        uncondBranch,
        flagBranch,
        zeroBranch,
        memRead,
        memToReg,
        memWrite,
        flagWrite,
        aluSrc,
        aluOp,
        regWrite,
        operation
    ) {
        this.reg2Loc = reg2Loc;
        this.uncondBranch = uncondBranch;
        this.flagBranch = flagBranch;
        this.zeroBranch = zeroBranch;
        this.memRead = memRead;
        this.memToReg = memToReg;
        this.memWrite = memWrite;
        this.flagWrite = flagWrite;
        this.aluSrc = aluSrc;
        this.aluOp = aluOp;
        this.regWrite = regWrite;
        this.operation = operation;
    }

    // Static constants equivalent to Java's static final fields
    static get NOP() {
        return new ControlSignals(
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            0,
            "0",
            0
        );
    }

    static get HALT() {
        return new ControlSignals(
            "1",
            "1",
            "1",
            "1",
            "1",
            "1",
            "1",
            "1",
            "1",
            0,
            "1",
            0
        );
    }

    /**
     * @returns {string} A string representation of the ControlSignals object.
     */
    toString() {
        return `ControlSignals [reg2Loc=${this.reg2Loc}, uncondBranch=${this.uncondBranch}, flagBranch=${this.flagBranch}, zeroBranch=${this.zeroBranch}, memRead=${this.memRead}, memToReg=${this.memToReg}, memWrite=${this.memWrite}, flagWrite=${this.flagWrite}, aluSrc=${this.aluSrc}, aluOp=${this.aluOp}, regWrite=${this.regWrite}, operation=${this.operation}]`;
    }
}
