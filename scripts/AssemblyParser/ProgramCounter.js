class ProgramCounter {
    static BASE_ADDRESS = 0x40000000;

    constructor() {
        this.currentAddress = ProgramCounter.BASE_ADDRESS;

        // Map lưu thông tin: address (number) -> object
        this.addressMap = new Map();

        console.log(
            `Program Counter initialized. PC = 0x${this.currentAddress.toString(
                16
            )}`
        );
    }

    getCurrentAddress() {
        return this.currentAddress;
    }

    setAddress(newAddress) {
        if (newAddress < 0) {
            throw new InvalidPCException(
                `Attempt to set PC to negative address: ${newAddress}`,
                newAddress
            );
        }
        if (newAddress % 4 !== 0) {
            console.warn(
                `Warning: Setting PC to non-word-aligned address 0x${newAddress.toString(
                    16
                )}. Behavior might be undefined during fetch.`
            );
            throw new InvalidPCException(
                `Attempt to set PC to non-word-aligned address: ${newAddress}`,
                newAddress
            );
        }

        console.log(
            `(ProgramCounter) Set: 0x${this.currentAddress.toString(
                16
            )} -> 0x${newAddress.toString(16)}`
        );
        this.currentAddress = newAddress;
    }

    reset() {
        this.setAddress(ProgramCounter.BASE_ADDRESS);
    }

    /**
     * Gán một object cho một địa chỉ cụ thể.
     * @param {number} address - Địa chỉ bộ nhớ (phải word-aligned).
     * @param {object} obj - Object muốn gán.
     */
    setObjectAtAddress(address, obj) {
        if (address % 4 !== 0) {
            throw new Error(
                `Address 0x${address.toString(16)} is not word-aligned.`
            );
        }
        this.addressMap.set(address, obj);
    }

    /**
     * Lấy object tại một địa chỉ.
     * @param {number} address - Địa chỉ cần truy xuất.
     * @returns {object | undefined}
     */
    getObjectAtAddress(address) {
        return this.addressMap.get(address);
    }

    /**
     * Kiểm tra xem một địa chỉ đã có object chưa.
     * @param {number} address
     * @returns {boolean}
     */
    hasAddress(address) {
        return this.addressMap.has(address);
    }

    /**
     * Xóa object tại một địa chỉ cụ thể.
     * @param {number} address
     */
    removeAddress(address) {
        this.addressMap.delete(address);
    }

    /**
     * Xóa toàn bộ các address đã lưu.
     */
    clearAddressMap() {
        this.addressMap.clear();
    }

    toString() {
        return `PC=0x${this.currentAddress
            .toString(16)
            .padStart(8, "0")
            .toUpperCase()}`;
    }
}
