export declare class JsonPlaceholderReplacer {
    private variablesMap;
    addVariableMap(variableMap: object): JsonPlaceholderReplacer;
    replace(json: {}): {};
    private replaceChildren;
    replaceValue(node: string): string;
    private checkInEveryMap(key);
}
