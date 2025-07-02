class MemoryStorage {
    // static MIN_ADDRESS = 0x500000n;
    static MIN_ADDRESS = 0x000000n; // Minimum address for memory access
    static VALUE_MASK = 0xffffffffffffffffn;
    static ENDIANNESS = true; // little-endian for DataView

    constructor(initialMemory) {
        this.memory =
            initialMemory instanceof MemoryStorage
                ? new Map(initialMemory.memory)
                : new Map();
    }

    _checkAddress(addr) {
        addr = typeof addr === "bigint" ? addr : BigInt(addr);
        if (addr < MemoryStorage.MIN_ADDRESS) {
            const msg = `Access below minimum address 0x${MemoryStorage.MIN_ADDRESS.toString(
                16,
            )}`;
            console.error(msg, addr);
            throw new Error(msg);
        }
    }

    readBytes(startAddr, numBytes) {
        let addr = BigInt(startAddr);
        this._checkAddress(addr);
        this._checkAddress(addr + BigInt(numBytes - 1));

        const result = new Uint8Array(numBytes);
        for (let i = 0; i < numBytes; i++) {
            const b = this.memory.get(addr + BigInt(i));
            result[i] = b === undefined ? 0 : b;
        }
        return result;
    }

    writeBytes(startAddr, byteArray) {
        if (!byteArray || byteArray.length === 0) {
            const msg = "Data to write cannot be null or empty.";
            console.error(msg);
            throw new Error(msg);
        }
        let addr = BigInt(startAddr);
        const len = byteArray.length;
        this._checkAddress(addr);
        this._checkAddress(addr + BigInt(len - 1));

        for (let i = 0; i < len; i++) {
            const a = addr + BigInt(i),
                b = byteArray[i] & 0xff;
            if (b === 0) this.memory.delete(a);
            else this.memory.set(a, b);
        }
    }

    readByte(addr) {
        return this.readBytes(addr, 1)[0];
    }
    writeByte(addr, v) {
        this.writeBytes(addr, [v & 0xff]);
    }

    readHalfWord(addr) {
        const bytes = this.readBytes(addr, 2);
        return new DataView(bytes.buffer).getUint16(
            0,
            MemoryStorage.ENDIANNESS,
        );
    }
    writeHalfWord(addr, value) {
        const buf = new ArrayBuffer(2);
        new DataView(buf).setUint16(
            0,
            value & 0xffff,
            MemoryStorage.ENDIANNESS,
        );
        this.writeBytes(addr, new Uint8Array(buf));
    }

    readWord(addr) {
        const bytes = this.readBytes(addr, 4);
        return new DataView(bytes.buffer).getUint32(
            0,
            MemoryStorage.ENDIANNESS,
        );
    }
    writeWord(addr, value) {
        const buf = new ArrayBuffer(4);
        new DataView(buf).setUint32(0, value >>> 0, MemoryStorage.ENDIANNESS);
        this.writeBytes(addr, new Uint8Array(buf));
    }

    readDoubleWord(addr) {
        const bytes = this.readBytes(addr, 8);
        return (
            new DataView(bytes.buffer).getBigUint64(
                0,
                MemoryStorage.ENDIANNESS,
            ) & MemoryStorage.VALUE_MASK
        );
    }
    writeDoubleWord(addr, value) {
        const buf = new ArrayBuffer(8);
        new DataView(buf).setBigUint64(
            0,
            BigInt(value) & MemoryStorage.VALUE_MASK,
            MemoryStorage.ENDIANNESS,
        );
        this.writeBytes(addr, new Uint8Array(buf));
    }

    getMemoryBytes() {
        return new Map(this.memory);
    }

    getMemoryDoubleWord(startAddr, endAddr) {
        let s = BigInt(startAddr),
            e = BigInt(endAddr);
        this._checkAddress(s);
        this._checkAddress(e);
        if (s > e) {
            const msg = `Start 0x${s.toString(16)} > end 0x${e.toString(16)}`;
            console.error(msg);
            throw new Error(msg);
        }
        if (e - s > 0x1000n) {
            const msg = `Range too large: 0x${(e - s).toString(16)} bytes`;
            console.error(msg);
            throw new Error(msg);
        }
        const map = new Map();
        for (let a = s; a <= e; a += 8n) {
            map.set(a, this.readDoubleWord(a));
        }
        return map;
    }

    clear() {
        this.memory.clear();
        console.log("SUCCESS: Data Memory Storage cleared.");
    }

    displayMemoryContents(startAddr, endAddr) {
        let s = BigInt(startAddr),
            e = BigInt(endAddr);
        this._checkAddress(s);
        this._checkAddress(e);
        if (s > e) {
            const msg = `Start 0x${s.toString(16)} > end 0x${e.toString(16)}`;
            console.error(msg);
            throw new Error(msg);
        }
        const lines = [
            `Bytes from 0x${s.toString(16)} to 0x${e.toString(16)}:`,
        ];
        for (let a = s; a <= e; a += 8n) {
            const v = this.readDoubleWord(a);
            lines.push(
                `  0x${a.toString(16).padStart(8, "0")} : 0x${v
                    .toString(16)
                    .padStart(16, "0")} (${v})`,
            );
        }
        console.log("INFO: Memory Contents\n" + lines.join("\n"));
    }

    toString() {
        const entries = Array.from(this.memory.entries()).sort((a, b) =>
            a[0] < b[0] ? -1 : 1,
        );
        if (!entries.length) return "Data Memory (Initialized Bytes): (Empty)";
        return entries
            .map(
                ([addr, b]) =>
                    `0x${addr.toString(16).padStart(8, "0")} : 0x${b
                        .toString(16)
                        .padStart(1, "0")} (${b})`,
            )
            .join("\n");
    }
}
