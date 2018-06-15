#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var json_placeholder_replacer_1 = require("./json-placeholder-replacer");
exports.JsonPlaceholderReplacer = json_placeholder_replacer_1.JsonPlaceholderReplacer;
const json_placeholder_replacer_2 = require("./json-placeholder-replacer");
const fs = __importStar(require("fs"));
if (process.argv.length > 2 && process.argv[1].includes('json-placeholder-replacer')) {
    process.exitCode = process.argv.length;
    const replacer = new json_placeholder_replacer_2.JsonPlaceholderReplacer();
    process.argv
        .filter((value, index) => index > 2)
        .map((value) => replacer.addVariableMap(JSON.parse(fs.readFileSync(value).toString())));
    const replaceableFileContent = fs.readFileSync(process.argv[2]).toString();
    const replacedValue = replacer.replace(replaceableFileContent);
    console.log(JSON.stringify(replacedValue, null, 4));
    process.exitCode = 0;
}
