#!/usr/bin/env node
export {JsonPlaceholderReplacer} from './json-placeholder-replacer';
import {JsonPlaceholderReplacer} from './json-placeholder-replacer';
import * as fs from 'fs';

if (process.argv.length > 2 && process.argv[1].includes('json-placeholder-replacer')) {
    process.exitCode = process.argv.length;
    const replacer = new JsonPlaceholderReplacer();

    process.argv
        .filter((value: string, index: number) => index > 2)
        .map((value: string) => replacer.addVariableMap(JSON.parse(fs.readFileSync(value).toString())));

    const replaceableFileContent = fs.readFileSync(process.argv[2]).toString();
    const replacedValue = replacer.replace(JSON.parse(replaceableFileContent));
    console.log(JSON.stringify(replacedValue, null, 4));
    process.exitCode = 0;
}
