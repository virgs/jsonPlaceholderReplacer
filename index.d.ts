// Type definitions for JSON-PLACE-HOLDER-REPLACER
// Project: JSON-PLACE-HOLDER-REPLACER
// Definitions by: Virgs https://github.com/lopidio

/*~ This declaration specifies that the class constructor function is the exported object from the file
 */
export = JsonPlaceholderReplacer;

/*~ Write your module's methods and properties in this class */
declare class JsonPlaceholderReplacer {
    constructor();
    addVariableMap(variableMap: object): JsonPlaceholderReplacer;
    replace(json: {}): {};
}