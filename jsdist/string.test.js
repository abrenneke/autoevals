"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("./string");
test("Basic Test", () => __awaiter(void 0, void 0, void 0, function* () {
    const cases = [
        { a: "", b: "", expected: 1 },
        { a: "", b: "a", expected: 0 },
        { a: "a", b: "", expected: 0 },
        { a: "a", b: "a", expected: 1 },
        { a: "a", b: "b", expected: 0 },
        { a: "ab", b: "ac", expected: 0.5 },
        { a: "ac", b: "bc", expected: 0.5 },
        { a: "abc", b: "axc", expected: 0.6666666666666667 },
        { a: "xabxcdxxefxgx", b: "1ab2cd34ef5g6", expected: 0.5384615384615384 },
    ];
    for (const { a, b, expected } of cases) {
        const score = (yield (0, string_1.LevenshteinScorer)({ output: a, expected: b })).score;
        expect(score).toBeCloseTo(expected);
    }
}));
