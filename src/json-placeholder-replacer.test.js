"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_placeholder_replacer_1 = require("./json-placeholder-replacer");
describe('JsonPlaceholderReplacer', function () {
    it('should replace place holder', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        var expected = 100;
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        var afterReplace = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        });
        expect(afterReplace.replaceable).toBe(expected);
    });
    it('last added map should have higher priority', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        var expected = "100";
        placeHolderReplacer.addVariableMap({
            key: "useless"
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        var afterReplace = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        });
        expect(afterReplace.replaceable).toBe(+expected);
    });
    it('should handle boolean values', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        var expected = true;
        placeHolderReplacer.addVariableMap({
            key: "useless"
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        var afterReplace = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        });
        expect(afterReplace.replaceable).toBe(expected);
    });
    it('should not replace undefined placeHolder', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        var afterReplace = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        });
        expect(afterReplace.replaceable).toBe("{{key}}");
    });
    it('should replace full object placeHolder', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer.addVariableMap({
            key: {
                nested: {
                    moreNested: {
                        key: "value"
                    }
                }
            }
        });
        var afterReplace = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        });
        expect(afterReplace.replaceable.nested.moreNested.key).toBe("value");
    });
    it('should not replace key placeHolder', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer.addVariableMap({
            key: "someValue"
        });
        var afterReplace = placeHolderReplacer.replace({
            "{{key}}": "value"
        });
        expect(afterReplace.someValue).not.toBeDefined();
        expect(afterReplace["{{key}}"]).toBe("value");
    });
    it('should handle array substitution', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer.addVariableMap({
            key: "someValue"
        });
        var afterReplace = placeHolderReplacer.replace({
            key: ["string", "{{key}}", 0]
        });
        expect(afterReplace.key).toEqual(["string", "someValue", 0]);
    });
    it('should replace every occurrence', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer.addVariableMap({
            key: "someValue"
        });
        var afterReplace = placeHolderReplacer.replace({
            key: ["string", "{{key}}", "{{key}}"]
        });
        expect(afterReplace.key).toEqual(["string", "someValue", "someValue"]);
    });
    it('should handle array object substitution', function () {
        var placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer.addVariableMap({
            key: {
                nested: "value"
            }
        });
        var afterReplace = placeHolderReplacer.replace({
            key: ["string", "{{key}}", 0]
        });
        expect(afterReplace.key).toEqual(["string", { "nested": "value" }, 0]);
        expect(afterReplace.key[1].nested).toEqual("value");
    });
});
