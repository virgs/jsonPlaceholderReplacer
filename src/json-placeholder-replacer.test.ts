import {JsonPlaceholderReplacer} from "./json-placeholder-replacer";

describe('JsonPlaceholderReplacer', function() {

    it('should replace place holder', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('last added map should have higher priority', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = "100";
        placeHolderReplacer.addVariableMap({
            key: "useless"
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable).toBe(+expected);
    });

    it('last handle boolean values', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = true;
        placeHolderReplacer.addVariableMap({
            key: "useless"
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should not replace undefined placeHolder', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable).toBe("{{key}}");
    });

    it('should replace full object placeHolder', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: {
                nested: {
                    moreNested: {
                        key: "value"
                    }
                }
            }
        });

        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable.nested.moreNested.key).toBe("value");
    });

    it('should not replace key placeHolder', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: "someValue"
        });
        const afterReplace: any = placeHolderReplacer.replace({
            "{{key}}": "value"
        })

        expect(afterReplace.someValue).not.toBeDefined();
        expect(afterReplace["{{key}}"]).toBe("value");
    });

    it('should handle array substitution', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: "someValue"
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: ["string", "{{key}}", 0]
        })

        expect(afterReplace.key).toEqual( ["string", "someValue", 0]);
    });

    it('should handle array object substitution', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: {
                nested: "value"
            }
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: ["string", "{{key}}", 0]
        })

        expect(afterReplace.key).toEqual( [ "string", {"nested": "value"}, 0]);
        expect(afterReplace.key[1].nested).toEqual("value");
    });

});