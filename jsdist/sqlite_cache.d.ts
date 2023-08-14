import { CreateChatCompletionResponse } from "openai";
import { CachedLLMParams, ChatCache } from "./oai";
import * as sqlite3 from "sqlite3";
export declare class SQLiteCache implements ChatCache {
    private db;
    private cacheDir;
    private initializePromise;
    constructor({ cacheDir }?: {
        cacheDir?: string;
    });
    openCache(): sqlite3.Database;
    initCache(): Promise<void>;
    get(params: CachedLLMParams): Promise<CreateChatCompletionResponse | null>;
    set(params: CachedLLMParams, response: CreateChatCompletionResponse): Promise<void>;
}
