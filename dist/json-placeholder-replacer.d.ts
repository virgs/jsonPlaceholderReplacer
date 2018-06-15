export declare class JsonPlaceholderReplacer {
    private variablesMap;
    addVariableMap(variableMap: object | string): JsonPlaceholderReplacer;
    replace(json: object | string): {};
    private replaceChildren;
    private replaceValue(node);
    private checkInEveryMap(key);
}
