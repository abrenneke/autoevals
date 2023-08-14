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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const llm_1 = require("./llm");
const sqlite_cache_1 = require("./sqlite_cache");
let cache;
beforeAll(() => {
    cache = new sqlite_cache_1.SQLiteCache({
        cacheDir: path_1.default.join(path_1.default.dirname(path_1.default.resolve(__filename)), "..", ".testcache")
    });
});
test("openai", () => __awaiter(void 0, void 0, void 0, function* () {
    const parseBestTitle = (grade) => {
        return grade.match(/Winner: (\d+)/)[1];
    };
    const messages = [
        {
            role: "system",
            content: `You are a technical project manager who helps software engineers generate better titles for their GitHub issues.
You will look at the issue description, and pick which of two titles better describes it.`,
        },
        {
            role: "user",
            content: `I'm going to provide you with the issue description, and two possible titles.

Issue Description: {{page_content}}

Title 1: {{output}}
Title 2: {{expected}}

Please discuss each title briefly (one line for pros, one for cons), and then pick which one you think more accurately
summarizes the issue by writing "Winner: 1" or "Winner: 2", and then a short rationale for your choice`,
        },
    ];
    const page_content = `As suggested by Nicolo, we should standardize the error responses coming from GoTrue, postgres, and realtime (and any other/future APIs) so that it's better DX when writing a client,

We can make this change on the servers themselves, but since postgrest and gotrue are fully/partially external may be harder to change, it might be an option to transform the errors within the client libraries/supabase-js, could be messy?

Nicolo also dropped this as a reference: http://spec.openapis.org/oas/v3.0.3#openapi-specification`;
    const output = `Standardize error responses from GoTrue, Postgres, and Realtime APIs for better DX`;
    const expected = `Good title`;
    const score = yield (0, llm_1.OpenAIClassifier)({
        name: "titles",
        output,
        expected,
        messages,
        model: "gpt-3.5-turbo",
        parseScoreFn: parseBestTitle,
        choiceScores: { 1: 1, 2: 0 },
        page_content,
        maxTokens: 500,
        cache,
    });
    expect(score.score).toBe(1);
    expect(score.error).toBeUndefined();
}), 60000);
test("llm_classifier", () => __awaiter(void 0, void 0, void 0, function* () {
    const pageContent = `As suggested by Nicolo, we should standardize the error responses coming from GoTrue, postgres, and realtime (and any other/future APIs) so that it's better DX when writing a client,

We can make this change on the servers themselves, but since postgrest and gotrue are fully/partially external may be harder to change, it might be an option to transform the errors within the client libraries/supabase-js, could be messy?

Nicolo also dropped this as a reference: http://spec.openapis.org/oas/v3.0.3#openapi-specification`;
    const genTitle = `Standardize error responses from GoTrue, Postgres, and Realtime APIs for better DX`;
    const originalTitle = `Good title`;
    for (const useCoT of [true, false]) {
        const classifier = (0, llm_1.LLMClassifierFromTemplate)({
            name: "titles",
            promptTemplate: `You are a technical project manager who helps software engineers generate better titles for their GitHub issues.
You will look at the issue description, and pick which of two titles better describes it.

I'm going to provide you with the issue description, and two possible titles.

Issue Description: {{page_content}}

1: {{output}}
2: {{expected}}`,
            choiceScores: { "1": 1, "2": 0 },
            useCoT,
        });
        let response = yield classifier({
            output: genTitle,
            expected: originalTitle,
            page_content: pageContent,
        });
        expect(response.score).toBe(1);
        expect(response.error).toBeUndefined();
        response = yield classifier({
            output: originalTitle,
            expected: genTitle,
            page_content: pageContent,
        });
        expect(response.score).toBe(0);
        expect(response.error).toBeUndefined();
    }
}), 60000);
test("battle", () => __awaiter(void 0, void 0, void 0, function* () {
    for (const useCoT of [true, false]) {
        console.log("useCoT", useCoT);
        let response = yield (0, llm_1.Battle)({
            useCoT,
            instructions: "Add the following numbers: 1, 2, 3",
            output: "600",
            expected: "6",
        });
        expect(response.score).toBe(0);
        expect(response.error).toBeUndefined();
        response = yield (0, llm_1.Battle)({
            useCoT,
            instructions: "Add the following numbers: 1, 2, 3",
            output: "6",
            expected: "600",
        });
        expect(response.score).toBe(useCoT ? 1 : 0);
        expect(response.error).toBeUndefined();
        response = yield (0, llm_1.Battle)({
            useCoT,
            instructions: "Add the following numbers: 1, 2, 3",
            output: "6",
            expected: "6",
        });
        expect(response.score).toBe(0);
        expect(response.error).toBeUndefined();
    }
}), 60000);
