import { Score, Scorer, ScorerArgs } from "./base";
import { ChatCompletionRequestMessage } from "openai";
import { ChatCache } from "./oai";
import { templates } from './templates';
interface LLMArgs {
    maxTokens?: number;
    temperature?: number;
    openAiApiKey: string;
    openAiOrganizationId?: string;
}
export type OpenAIClassifierArgs<RenderArgs> = {
    name: string;
    model: string;
    messages: ChatCompletionRequestMessage[];
    parseScoreFn: (resp: string) => string;
    choiceScores: Record<string, number>;
    cache?: ChatCache;
} & LLMArgs & RenderArgs;
export declare function OpenAIClassifier<RenderArgs, Output>(args: ScorerArgs<Output, OpenAIClassifierArgs<RenderArgs>>): Promise<Score>;
export type LLMClassifierArgs<RenderArgs> = {
    model?: string;
    useCoT?: boolean;
} & LLMArgs & RenderArgs;
export declare function LLMClassifierFromTemplate<RenderArgs>({ name, promptTemplate, choiceScores, model, useCoT: useCoTArg, temperature, }: {
    name: string;
    promptTemplate: string;
    choiceScores: Record<string, number>;
    model?: string;
    useCoT?: boolean;
    temperature?: number;
}): Scorer<string, LLMClassifierArgs<RenderArgs>>;
export interface ModelGradedSpec {
    prompt: string;
    choice_scores: Record<string, number>;
    model?: string;
    use_cot?: boolean;
    temperature?: number;
}
export declare function LLMClassifierFromSpec<RenderArgs>(name: string, spec: ModelGradedSpec): Scorer<any, LLMClassifierArgs<RenderArgs>>;
export declare function LLMClassifierFromSpecFile<RenderArgs>(name: string, templateName: keyof typeof templates): Scorer<any, LLMClassifierArgs<RenderArgs>>;
/**
 * Test whether an output _better_ performs the `instructions` than the original
 * (expected) value.
 */
export declare const Battle: Scorer<any, LLMClassifierArgs<{
    instructions: string;
}>>;
/**
 * Test whether an output answers the `input` using knowledge built into the model.
 * You can specify `criteria` to further constrain the answer.
 */
export declare const ClosedQA: Scorer<any, LLMClassifierArgs<{
    input: string;
    criteria: any;
}>>;
/**
 * Test whether an output is funny.
 */
export declare const Humor: Scorer<any, LLMClassifierArgs<{}>>;
/**
 * Test whether an output is factual, compared to an original (`expected`) value.
 */
export declare const Factuality: Scorer<any, LLMClassifierArgs<{
    input: string;
}>>;
/**
 * Test whether an output is a possible solution to the challenge posed in the input.
 */
export declare const Possible: Scorer<any, LLMClassifierArgs<{
    input: string;
}>>;
/**
 * Test whether an output is malicious.
 */
export declare const Security: Scorer<any, LLMClassifierArgs<{}>>;
/**
 * Test whether an output is a better summary of the `input` than the original (`expected`) value.
 */
export declare const Summary: Scorer<any, LLMClassifierArgs<{
    input: string;
}>>;
/**
 * Test whether an `output` is as good of a translation of the `input` in the specified `language`
 * as an expert (`expected`) value.
 */
export declare const Translation: Scorer<any, LLMClassifierArgs<{
    language: string;
    input: string;
}>>;
export {};
