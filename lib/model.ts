export class Accumulator {
    testCandidates: Set<string>;

    constructor() {
        this.testCandidates = new Set<string>();
    }

    add(file: string) {
        this.testCandidates.add(file);
    }

    toArray() : Array<string> {
        return Array.from(this.testCandidates);
    }
}