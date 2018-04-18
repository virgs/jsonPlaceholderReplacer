#!/usr/bin/env node
export {JsonPlaceholderReplacer} from './json-placeholder-replacer'
import {JsonPlaceholderReplacer} from "./json-placeholder-replacer";

if (process.argv.length > 2) {
    process.exitCode = process.argv.length
    const fs = require("fs");
    const replacer = new JsonPlaceholderReplacer();

    process.argv
        .filter((value: string, index: number) => index > 2)
        .map((value: string) => replacer.addVariableMap(JSON.parse(fs.readFileSync(value).toString())));

    const replaceableFileContent = fs.readFileSync(process.argv[2]).toString();
    const replacedValue = replacer.replace(replaceableFileContent);
    console.log(JSON.stringify(replacedValue, null, 4));
    process.exitCode = 0;
}
