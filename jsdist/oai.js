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
exports.cachedChatCompletion = void 0;
const openai_1 = require("openai");
const env_1 = require("./env");
function cachedChatCompletion(params, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { cache, openAiApiKey, openAiOrganizationId } = options;
        const cached = yield (cache === null || cache === void 0 ? void 0 : cache.get(params));
        if (cached) {
            return cached;
        }
        const config = new openai_1.Configuration({
            apiKey: openAiApiKey || env_1.Env.OPENAI_API_KEY,
            organization: openAiOrganizationId,
        });
        const openai = new openai_1.OpenAIApi(config);
        if (openai === null) {
            throw new Error("OPENAI_API_KEY not set");
        }
        const completion = yield openai.createChatCompletion(params);
        const data = completion.data;
        yield (cache === null || cache === void 0 ? void 0 : cache.set(params, data));
        return data;
    });
}
exports.cachedChatCompletion = cachedChatCompletion;
