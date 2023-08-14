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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteCache = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
class SQLiteCache {
    constructor({ cacheDir } = {}) {
        this.cacheDir = cacheDir !== null && cacheDir !== void 0 ? cacheDir : path.join(os.homedir(), ".cache", "braintrust");
        this.db = this.openCache();
    }
    openCache() {
        fs.mkdirSync(this.cacheDir, { recursive: true });
        const oai_cache = path.join(this.cacheDir, "oai.sqlite");
        const db = new sqlite3.Database(oai_cache);
        this.initCache().catch(err => {
            console.error(`Failed to initialize LLM cache: ${err}`);
        });
        return db;
    }
    initCache() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initializePromise = new Promise((resolve, reject) => {
                this.db.run("CREATE TABLE IF NOT EXISTS cache (params text, response text)", (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
            return this.initializePromise;
        });
    }
    get(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializePromise;
            const param_key = JSON.stringify(params);
            const query = `SELECT response FROM "cache" WHERE params=?`;
            const resp = yield new Promise((resolve, reject) => {
                this.db.get(query, [param_key], (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
            });
            if (resp) {
                return JSON.parse(resp.response);
            }
            return null;
        });
    }
    set(params, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializePromise;
            const param_key = JSON.stringify(params);
            this.db.run(`INSERT INTO "cache" VALUES (?, ?)`, [
                param_key,
                JSON.stringify(response),
            ]);
        });
    }
}
exports.SQLiteCache = SQLiteCache;
