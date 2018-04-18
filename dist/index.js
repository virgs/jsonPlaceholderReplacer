#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_placeholder_replacer_1 = require("./json-placeholder-replacer");
exports.JsonPlaceholderReplacer = json_placeholder_replacer_1.JsonPlaceholderReplacer;
const json_placeholder_replacer_2 = require("./json-placeholder-replacer");
if (process.argv.length > 2) {
    process.exitCode = process.argv.length;
    const fs = require("fs");
    const replacer = new json_placeholder_replacer_2.JsonPlaceholderReplacer();
    process.argv
        .filter((value, index) => index > 2)
        .map((value) => replacer.addVariableMap(JSON.parse(fs.readFileSync(value).toString())));
    const replaceableFileContent = fs.readFileSync(process.argv[2]).toString();
    const replacedValue = replacer.replace(replaceableFileContent);
    console.log(JSON.stringify(replacedValue, null, 4));
    process.exitCode = 0;
}
