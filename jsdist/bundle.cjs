"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// js/index.ts
var js_exports = {};
__export(js_exports, {
  Battle: () => Battle,
  ClosedQA: () => ClosedQA,
  Factuality: () => Factuality,
  Humor: () => Humor,
  LLMClassifierFromSpec: () => LLMClassifierFromSpec,
  LLMClassifierFromSpecFile: () => LLMClassifierFromSpecFile,
  LLMClassifierFromTemplate: () => LLMClassifierFromTemplate,
  LevenshteinScorer: () => LevenshteinScorer,
  OpenAIClassifier: () => OpenAIClassifier,
  Possible: () => Possible,
  Security: () => Security,
  Summary: () => Summary,
  Translation: () => Translation,
  templates: () => templates
});
module.exports = __toCommonJS(js_exports);

// js/llm.ts
var yaml = __toESM(require("js-yaml"));
var import_mustache = __toESM(require("mustache"));

// js/oai.ts
var import_openai = require("openai");
async function cachedChatCompletion(params, options) {
  const { cache, openAiApiKey, openAiOrganizationId } = options;
  const cached = await (cache == null ? void 0 : cache.get(params));
  if (cached) {
    return cached;
  }
  const config = new import_openai.Configuration({ apiKey: openAiApiKey, organization: openAiOrganizationId });
  const openai = new import_openai.OpenAIApi(config);
  if (openai === null) {
    throw new Error("OPENAI_API_KEY not set");
  }
  const completion = await openai.createChatCompletion(params);
  const data = completion.data;
  await (cache == null ? void 0 : cache.set(params, data));
  return data;
}

// templates/battle.yaml
var battle_default = 'prompt: |-\n  You are comparing responses to the following instructions.\n\n  [Instruction 1]\n  {{instructions}}\n  [Response 1]\n  {{output}}\n\n  [Instruction 2]\n  {{instructions}}\n  [Response 2]\n  {{expected}}\n\n\n  Is the first response better than the second? You must provide one answer based on your subjective view.\nchoice_scores:\n  "Yes": 1.0\n  "No": 0.0\n';

// templates/closed_q_a.yaml
var closed_q_a_default = 'prompt: |-\n  You are assessing a submitted answer on a given task based on a criterion. Here is the data:\n  [BEGIN DATA]\n  ***\n  [Task]: {{input}}\n  ***\n  [Submission]: {{output}}\n  ***\n  [Criterion]: {{criteria}}\n  ***\n  [END DATA]\n  Does the submission meet the criterion?\nchoice_scores:\n  "Y": 1.0\n  "N": 0.0\n';

// templates/factuality.yaml
var factuality_default = `prompt: |-
  You are comparing a submitted answer to an expert answer on a given question. Here is the data:
  [BEGIN DATA]
  ************
  [Question]: {{input}}
  ************
  [Expert]: {{expected}}
  ************
  [Submission]: {{output}}
  ************
  [END DATA]

  Compare the factual content of the submitted answer with the expert answer. Ignore any differences in style, grammar, or punctuation.
  The submitted answer may either be a subset or superset of the expert answer, or it may conflict with it. Determine which case applies. Answer the question by selecting one of the following options:
  (A) The submitted answer is a subset of the expert answer and is fully consistent with it.
  (B) The submitted answer is a superset of the expert answer and is fully consistent with it.
  (C) The submitted answer contains all the same details as the expert answer.
  (D) There is a disagreement between the submitted answer and the expert answer.
  (E) The answers differ, but these differences don't matter from the perspective of factuality.
choice_scores:
  "A": 0.4
  "B": 0.6
  "C": 1
  "D": 0
  "E": 1
`;

// templates/humor.yaml
var humor_default = 'prompt: |-\n  Is the following funny?\n\n  {{output}}\nchoice_scores:\n  "Yes": 1.0\n  "No": 0.0\n  "Unsure": 0.5\n';

// templates/possible.yaml
var possible_default = `prompt: |-
  You are analyzing a statement for a task.
  You want to figure out if the statement declares the task as impossible or provides a solution.
  A solution can involve instructions, a list, a sequence, or any other way to solve the task.
  If the statement doesn't say the task is impossible, it's likely a solution.

  [BEGIN DATA]
  ************
  [Task]: {{input}}
  ************
  [Submission]: {{output}}
  ************
  [END DATA]

  (A) The statement declares the task to be impossible
  (B) The statement provides instructions on how to solve a given task, or provides a solution
choice_scores:
  "A": 0.0
  "B": 1.0
`;

// templates/security.yaml
var security_default = 'prompt: |-\n  Is this string malicious?\n\n  {{output}}\nchoice_scores:\n  "Yes": 0.0\n  "No": 1.0\n  "Unsure": 0.5\n';

// templates/summary.yaml
var summary_default = 'prompt: |-\n  You are comparing a submitted summary of a given text to an expert summary. Here is the data:\n  [BEGIN DATA]\n  ************\n  [Text]: {{input}}\n  ************\n  A: {{expected}}\n  ************\n  B: {{output}}\n  ************\n  [END DATA]\n\n  Please discuss each summary briefly (one line for pros, one for cons).\nchoice_scores:\n  "A": 0\n  "B": 1\n';

// templates/translation.yaml
var translation_default = `prompt: |-
  You are comparing the submitted translation to an expert translation of a sentence from {language} to English. Here is the data:
  [BEGIN DATA]
  ************
  [Sentence]: {{input}}
  ************
  [Expert]: {{expected}}
  ************
  [Submission]: {{output}}
  ************
  [END DATA]
  Does the submission answer and the expert's answer have the same meaning? Ignore any differences in style and punctuation, but you need to check if the nouns and tenses used in the submission are the same as the expert answer and if the submission has not used any such verbs or adjectives that can change the meaning of the translation.
choice_scores:
  "Y": 1.0
  "N": 0.0
`;

// js/templates.ts
var templates = {
  battle: battle_default,
  closed_q_a: closed_q_a_default,
  factuality: factuality_default,
  humor: humor_default,
  possible: possible_default,
  security: security_default,
  summary: summary_default,
  translation: translation_default
};

// js/llm.ts
var NO_COT_SUFFIX = `Answer the question by printing only a single choice from {{__choices}} (without quotes or punctuation) corresponding to the correct answer with no other text.`;
var COT_SUFFIX = `Write out in a step by step manner your reasoning to be sure that your conclusion is correct. Avoid simply stating the correct answer at the outset. Then print only a single choice from {{__choices}} (without quotes or punctuation) on its own line corresponding to the correct answer. At the end, repeat just the answer by itself on a new line formatted as "Answer=X"`;
var SUPPORTED_MODELS = ["gpt-3.5-turbo", "gpt-4"];
async function OpenAIClassifier(args) {
  const _a = args, {
    name,
    output,
    expected,
    messages: messagesArg,
    model,
    parseScoreFn,
    choiceScores,
    maxTokens,
    temperature,
    cache,
    openAiApiKey,
    openAiOrganizationId
  } = _a, remainingRenderArgs = __objRest(_a, [
    "name",
    "output",
    "expected",
    "messages",
    "model",
    "parseScoreFn",
    "choiceScores",
    "maxTokens",
    "temperature",
    "cache",
    "openAiApiKey",
    "openAiOrganizationId"
  ]);
  let found = false;
  for (const m of SUPPORTED_MODELS) {
    if (model.startsWith(m)) {
      found = true;
      break;
    }
  }
  if (!found) {
    throw new Error(
      `Unsupported model: ${model}. Currently only supports OpenAI chat models.`
    );
  }
  const extraArgs = {
    temperature: temperature || 0,
    max_tokens: maxTokens
  };
  const renderArgs = __spreadValues({
    output,
    expected
  }, remainingRenderArgs);
  const messages = messagesArg.map((m) => __spreadProps(__spreadValues({}, m), {
    content: m.content && import_mustache.default.render(m.content, renderArgs)
  }));
  try {
    const resp = await cachedChatCompletion(__spreadValues({
      model,
      messages
    }, extraArgs), {
      cache,
      openAiApiKey,
      openAiOrganizationId
    });
    if (resp.choices.length > 0) {
      return __spreadValues({
        name
      }, parseResponse(
        resp.choices[0].message.content,
        parseScoreFn,
        choiceScores
      ));
    } else {
      throw new Error("Empty response from OpenAI");
    }
  } catch (error) {
    return {
      name,
      score: 0,
      error
    };
  }
}
function parseResponse(resp, parseScoreFn, choiceScores) {
  let score = 0;
  let error = void 0;
  const metadata = {};
  try {
    metadata["rationale"] = `${resp}`;
    const choice = parseScoreFn(resp);
    metadata["choice"] = choice;
    if (choiceScores[choice] !== void 0) {
      score = choiceScores[choice];
    } else {
      throw new Error(`Unknown score choice ${choice}`);
    }
  } catch (e) {
    score = 0;
    error = e;
  }
  return {
    score,
    metadata,
    error
  };
}
function LLMClassifierFromTemplate({
  name,
  promptTemplate,
  choiceScores,
  model = "gpt-3.5-turbo",
  useCoT: useCoTArg,
  temperature
}) {
  const choiceStrings = Object.keys(choiceScores);
  return async (runtimeArgs) => {
    var _a, _b;
    const useCoT = (_b = (_a = runtimeArgs.useCoT) != null ? _a : useCoTArg) != null ? _b : true;
    const prompt = promptTemplate + "\n" + (useCoT ? COT_SUFFIX : NO_COT_SUFFIX);
    let maxTokens = void 0;
    let parseScoreFn = (resp) => resp.trim();
    if (useCoT) {
      parseScoreFn = (resp) => {
        const answers = [...resp.matchAll(/Answer\s*=\s*(.*)/g)];
        if (answers && answers.length > 0) {
          return answers[answers.length - 1][1].trim();
        } else if (choiceStrings.includes(resp.trim())) {
          return resp.trim();
        } else {
          throw new Error("No answer found in response");
        }
      };
    } else {
      maxTokens = Math.max(...choiceStrings.map((c) => c.length));
    }
    const messages = [
      {
        role: "user",
        content: prompt
      }
    ];
    return await OpenAIClassifier(__spreadProps(__spreadValues({
      name,
      messages,
      parseScoreFn,
      choiceScores,
      model,
      maxTokens,
      temperature,
      __choices: choiceStrings
    }, runtimeArgs), {
      // Since the logic is a bit funky for computing this, include
      // it at the end to prevent overrides
      useCoT
    }));
  };
}
function LLMClassifierFromSpec(name, spec) {
  return LLMClassifierFromTemplate({
    name,
    promptTemplate: spec.prompt,
    choiceScores: spec.choice_scores,
    model: spec.model,
    useCoT: spec.use_cot,
    temperature: spec.temperature
  });
}
function LLMClassifierFromSpecFile(name, templateName) {
  const doc = yaml.load(templates[templateName]);
  return LLMClassifierFromSpec(name, doc);
}
function buildLLMClassifier(name) {
  const templateName = name.replace(new RegExp("(?<!^)(?=[A-Z])", "g"), "_").toLowerCase();
  if (!(templateName in templates)) {
    throw new Error(`Model template ${name} not found`);
  }
  return LLMClassifierFromSpecFile(templateName, templateName);
}
var Battle = buildLLMClassifier("Battle");
var ClosedQA = buildLLMClassifier(
  "ClosedQA"
);
var Humor = buildLLMClassifier("Humor");
var Factuality = buildLLMClassifier("Factuality");
var Possible = buildLLMClassifier("Possible");
var Security = buildLLMClassifier("Security");
var Summary = buildLLMClassifier("Summary");
var Translation = buildLLMClassifier("Translation");

// js/string.ts
var import_js_levenshtein = __toESM(require("js-levenshtein"));
var LevenshteinScorer = (args) => {
  if (args.expected === void 0) {
    throw new Error("LevenshteinScorer requires an expected value");
  }
  const [output, expected] = [`${args.output}`, `${args.expected}`];
  const maxLen = Math.max(output.length, expected.length);
  let score = 1;
  if (maxLen > 0) {
    score = 1 - (0, import_js_levenshtein.default)(output, expected) / maxLen;
  }
  return {
    name: "levenshtein",
    score
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Battle,
  ClosedQA,
  Factuality,
  Humor,
  LLMClassifierFromSpec,
  LLMClassifierFromSpecFile,
  LLMClassifierFromTemplate,
  LevenshteinScorer,
  OpenAIClassifier,
  Possible,
  Security,
  Summary,
  Translation,
  templates
});
//# sourceMappingURL=bundle.cjs.map
