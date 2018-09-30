import {JsonPlaceholderReplacer} from "./json-placeholder-replacer";

describe('JsonPlaceholderReplacer', function() {

    it('should replace place holder {{}}', function() {
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

    it('should replace place holder <<>>', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "<<key>>"
        })

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should replace big names', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            "key-with-several/separators.yeap~a_lot": expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "<<key-with-several/separators.yeap~a_lot>>"
        });

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

    it('should handle boolean values', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = true;
        placeHolderReplacer.addVariableMap({
            key: "useless"
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "<<key>>"
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
            replaceable: "<<key>>"
        })

        expect(afterReplace.replaceable.nested.moreNested.key).toBe("value");
    });

    it('should replace when value is 0', () => {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            value: 0
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: "<<value>>"
        });

        expect(afterReplace.key).toBe(0);
    });

    it('should replace when value is empty', () => {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            value: ''
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: "<<value>>"
        });

        expect(afterReplace.key).toBe('');
    });

    it('should replace when value is null', () => {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            value: null
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: "<<value>>"
        });

        expect(afterReplace.key).toBeNull();
    });

    it('should not replace when value is undefined', () => {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            value: undefined
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: "<<value>>"
        });

        expect(afterReplace.key).toBe("<<value>>");
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
            key: ["string", "<<key>>", 0]
        })

        expect(afterReplace.key).toEqual( ["string", "someValue", 0]);
    });

    it('should replace every occurrence', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: "someValue"
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: ["string", "{{key}}", "<<key>>"]
        })

        expect(afterReplace.key).toEqual( ["string", "someValue", "someValue"]);
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

    it('should handle strings varMap substitution', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap(JSON.stringify({
            key: {
                nested: "value"
            }
        }));
        const afterReplace: any = placeHolderReplacer.replace({
            key: ["string", "{{key}}", 0]
        })

        expect(afterReplace.key).toEqual( [ "string", {"nested": "value"}, 0]);
        expect(afterReplace.key[1].nested).toEqual("value");
    });

    it('should handle strings replaceable substitution', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap(JSON.stringify({
            key: {
                nested: "value"
            }
        }));
        const afterReplace: any = placeHolderReplacer.replace(JSON.stringify({
            key: ["string", "{{key}}", 0]
        }));

        expect(afterReplace.key).toEqual( [ "string", {"nested": "value"}, 0]);
        expect(afterReplace.key[1].nested).toEqual("value");
    });

    it('should handle huge json', function() {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({key: "virgs"});
        const afterReplace: any = placeHolderReplacer.replace(JSON.stringify({
            requisition: {
                name: "someName",
                subscription: [
                    {
                        key: "<<key>>"
                    },
                    {
                        key: "{{key}}"
                    },
                    {
                        key: "{{key}}"
                    }
                ]
            }
        }));

        afterReplace.requisition.subscription.map((sub: any) => expect(sub.key).toEqual("virgs"));
    });

});