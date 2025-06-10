class ProgramCounter {
  static BASE_ADDRESS = 0x400000;

  constructor() {
    this.currentAddress = ProgramCounter.BASE_ADDRESS;
    console.log(`Program Counter initialized. PC = 0x${this.currentAddress.toString(16)}`);
  }

  getCurrentAddress() {
    return this.currentAddress;
  }

  setAddress(newAddress) {
    if (newAddress < 0) {
      throw new InvalidPCException(`Attempt to set PC to negative address: ${newAddress}`, newAddress);
    }
    if (newAddress % 4 !== 0) {
      console.warn(`Warning: Setting PC to non-word-aligned address 0x${newAddress.toString(16)}. Behavior might be undefined during fetch.`);
      throw new InvalidPCException(`Attempt to set PC to non-word-aligned address: ${newAddress}`, newAddress);
    }

    console.log(`(ProgramCounter) Set: 0x${this.currentAddress.toString(16)} -> 0x${newAddress.toString(16)}`);
    this.currentAddress = newAddress;
  }

  reset() {
    this.setAddress(ProgramCounter.BASE_ADDRESS);
  }

  toString() {
    return `PC=0x${this.currentAddress.toString(16).padStart(8, '0').toUpperCase()}`;
  }
}