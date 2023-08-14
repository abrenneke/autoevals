"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translation = exports.Summary = exports.Security = exports.Possible = exports.Factuality = exports.Humor = exports.ClosedQA = exports.Battle = exports.LLMClassifierFromSpecFile = exports.LLMClassifierFromSpec = exports.LLMClassifierFromTemplate = exports.OpenAIClassifier = void 0;
const yaml = __importStar(require("js-yaml"));
const mustache_1 = __importDefault(require("mustache"));
const oai_1 = require("./oai");
const templates_1 = require("./templates");
const NO_COT_SUFFIX = `Answer the question by printing only a single choice from {{__choices}} (without quotes or punctuation) corresponding to the correct answer with no other text.`;
const COT_SUFFIX = `Write out in a step by step manner your reasoning to be sure that your conclusion is correct. Avoid simply stating the correct answer at the outset. Then print only a single choice from {{__choices}} (without quotes or punctuation) on its own line corresponding to the correct answer. At the end, repeat just the answer by itself on a new line formatted as "Answer=X"`;
const SUPPORTED_MODELS = ["gpt-3.5-turbo", "gpt-4"];
function OpenAIClassifier(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, output, expected, messages: messagesArg, model, parseScoreFn, choiceScores, maxTokens, temperature, cache, openAiApiKey, openAiOrganizationId } = args, remainingRenderArgs = __rest(args, ["name", "output", "expected", "messages", "model", "parseScoreFn", "choiceScores", "maxTokens", "temperature", "cache", "openAiApiKey", "openAiOrganizationId"]);
        let found = false;
        for (const m of SUPPORTED_MODELS) {
            if (model.startsWith(m)) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error(`Unsupported model: ${model}. Currently only supports OpenAI chat models.`);
        }
        const extraArgs = {
            temperature: temperature || 0,
            max_tokens: maxTokens,
        };
        const renderArgs = Object.assign({ output,
            expected }, remainingRenderArgs);
        const messages = messagesArg.map((m) => (Object.assign(Object.assign({}, m), { content: m.content && mustache_1.default.render(m.content, renderArgs) })));
        try {
            const resp = yield (0, oai_1.cachedChatCompletion)(Object.assign({ model,
                messages }, extraArgs), {
                cache,
                openAiApiKey,
                openAiOrganizationId,
            });
            if (resp.choices.length > 0) {
                return Object.assign({ name }, parseResponse(resp.choices[0].message.content, parseScoreFn, choiceScores));
            }
            else {
                throw new Error("Empty response from OpenAI");
            }
        }
        catch (error) {
            return {
                name,
                score: 0,
                error,
            };
        }
    });
}
exports.OpenAIClassifier = OpenAIClassifier;
function parseResponse(resp, parseScoreFn, choiceScores) {
    let score = 0;
    let error = undefined;
    const metadata = {};
    try {
        metadata["rationale"] = `${resp}`;
        const choice = parseScoreFn(resp);
        metadata["choice"] = choice;
        if (choiceScores[choice] !== undefined) {
            score = choiceScores[choice];
        }
        else {
            throw new Error(`Unknown score choice ${choice}`);
        }
    }
    catch (e) {
        score = 0;
        error = e;
    }
    return {
        score,
        metadata,
        error,
    };
}
function LLMClassifierFromTemplate({ name, promptTemplate, choiceScores, model = "gpt-3.5-turbo", useCoT: useCoTArg, temperature, }) {
    const choiceStrings = Object.keys(choiceScores);
    return (runtimeArgs) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const useCoT = (_b = (_a = runtimeArgs.useCoT) !== null && _a !== void 0 ? _a : useCoTArg) !== null && _b !== void 0 ? _b : true;
        const prompt = promptTemplate + "\n" + (useCoT ? COT_SUFFIX : NO_COT_SUFFIX);
        let maxTokens = undefined;
        let parseScoreFn = (resp) => resp.trim();
        if (useCoT) {
            parseScoreFn = (resp) => {
                const answers = [...resp.matchAll(/Answer\s*=\s*(.*)/g)];
                if (answers && answers.length > 0) {
                    return answers[answers.length - 1][1].trim();
                }
                else if (choiceStrings.includes(resp.trim())) {
                    return resp.trim();
                }
                else {
                    throw new Error("No answer found in response");
                }
            };
        }
        else {
            maxTokens = Math.max(...choiceStrings.map((c) => c.length));
        }
        const messages = [
            {
                role: "user",
                content: prompt,
            },
        ];
        return yield OpenAIClassifier(Object.assign(Object.assign({ name,
            messages,
            parseScoreFn,
            choiceScores,
            model,
            maxTokens,
            temperature, __choices: choiceStrings }, runtimeArgs), { 
            // Since the logic is a bit funky for computing this, include
            // it at the end to prevent overrides
            useCoT }));
    });
}
exports.LLMClassifierFromTemplate = LLMClassifierFromTemplate;
function LLMClassifierFromSpec(name, spec) {
    return LLMClassifierFromTemplate({
        name,
        promptTemplate: spec.prompt,
        choiceScores: spec.choice_scores,
        model: spec.model,
        useCoT: spec.use_cot,
        temperature: spec.temperature,
    });
}
exports.LLMClassifierFromSpec = LLMClassifierFromSpec;
function LLMClassifierFromSpecFile(name, templateName) {
    const doc = yaml.load(templates_1.templates[templateName]);
    return LLMClassifierFromSpec(name, doc);
}
exports.LLMClassifierFromSpecFile = LLMClassifierFromSpecFile;
function buildLLMClassifier(name) {
    const templateName = name.replace(/(?<!^)(?=[A-Z])/g, "_").toLowerCase();
    if (!(templateName in templates_1.templates)) {
        throw new Error(`Model template ${name} not found`);
    }
    return LLMClassifierFromSpecFile(templateName, templateName);
}
/**
 * Test whether an output _better_ performs the `instructions` than the original
 * (expected) value.
 */
exports.Battle = buildLLMClassifier("Battle");
/**
 * Test whether an output answers the `input` using knowledge built into the model.
 * You can specify `criteria` to further constrain the answer.
 */
exports.ClosedQA = buildLLMClassifier("ClosedQA");
/**
 * Test whether an output is funny.
 */
exports.Humor = buildLLMClassifier("Humor");
/**
 * Test whether an output is factual, compared to an original (`expected`) value.
 */
exports.Factuality = buildLLMClassifier("Factuality");
/**
 * Test whether an output is a possible solution to the challenge posed in the input.
 */
exports.Possible = buildLLMClassifier("Possible");
/**
 * Test whether an output is malicious.
 */
exports.Security = buildLLMClassifier("Security");
/**
 * Test whether an output is a better summary of the `input` than the original (`expected`) value.
 */
exports.Summary = buildLLMClassifier("Summary");
/**
 * Test whether an `output` is as good of a translation of the `input` in the specified `language`
 * as an expert (`expected`) value.
 */
exports.Translation = buildLLMClassifier("Translation");
