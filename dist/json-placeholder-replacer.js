"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonPlaceholderReplacer {
    constructor() {
        this.variablesMap = [];
        this.replaceChildren = (node) => {
            for (const key in node) {
                const attribute = node[key];
                if (typeof attribute == 'object') {
                    node[key] = this.replaceChildren(attribute);
                }
                else {
                    node[key] = this.replaceValue(attribute.toString());
                }
            }
            return node;
        };
    }
    addVariableMap(variableMap) {
        if (typeof variableMap == 'string') {
            this.variablesMap.unshift(JSON.parse(variableMap));
        }
        else {
            this.variablesMap.unshift(variableMap);
        }
        return this;
    }
    replace(json) {
        if (typeof json == 'string') {
            return this.replaceChildren(JSON.parse(json));
        }
        else {
            return this.replaceChildren(json);
        }
    }
    replaceValue(node) {
        let output = node.replace(/{{\w+}}/g, (placeHolder) => {
            const key = placeHolder.substr(2, placeHolder.length - 4);
            return this.checkInEveryMap(key) || placeHolder;
        }).replace(/<<\w+>>/g, (placeHolder) => {
            const key = placeHolder.substr(2, placeHolder.length - 4);
            return this.checkInEveryMap(key) || placeHolder;
        });
        try {
            return JSON.parse(output);
        }
        catch (exc) {
            return output;
        }
    }
    checkInEveryMap(key) {
        let map = {};
        for (map of this.variablesMap) {
            const variableValue = map[key];
            if (variableValue) {
                if (typeof variableValue == 'object') {
                    return JSON.stringify(variableValue);
                }
                return variableValue;
            }
        }
        return null;
    }
}
exports.JsonPlaceholderReplacer = JsonPlaceholderReplacer;
