import {JsonPlaceholderReplacer} from './json-placeholder-replacer';

describe('JsonPlaceholderReplacer', function () {

    it('should handle undefined values exception', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        expect(() => placeHolderReplacer.replace({
            replaceable: undefined
        })).not.toThrow();
    });

    it('should replace place holder {{}}', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '{{key}}'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should replace place holder <<>>', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key>>'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should replace big names', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            'key-with-several/separatorsyeap~a_lot': expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key-with-several/separatorsyeap~a_lot>>'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('last added map should have higher priority', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = '100';
        placeHolderReplacer.addVariableMap({
            key: 'useless'
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '{{key}}'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should navigate through variableMap', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 'value';
        placeHolderReplacer.addVariableMap({
            key: {
                nested: expected
            }
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key.nested>>'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should not navigate through variableMap when a key is found', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 'value';
        placeHolderReplacer.addVariableMap({
            'key.with.dot': expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key.with.dot>>'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should not navigate through variableMap when a key is found in deeper object', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 'value';
        placeHolderReplacer.addVariableMap({
            key: {
                'with.dot': expected
            }
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key.with.dot>>'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should do nothing when nothing is found', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 'value';
        placeHolderReplacer.addVariableMap({
            key: {
                nested: expected
            }
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key.not.found>>'
        });

        expect(afterReplace.replaceable).toBe('<<key.not.found>>');
    });

    it('should prefer short circuit', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = 'value';
        placeHolderReplacer.addVariableMap({
            key: {
                nested: 'useless'
            },
            'key.nested': expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key.nested>>'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should handle boolean values', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expected = true;
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key>>'
        });

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should not replace undefined placeHolder', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '{{key}}'
        });

        expect(afterReplace.replaceable).toBe('{{key}}');
    });

    it('should replace full object placeHolder', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: {
                nested: {
                    moreNested: {
                        key: 'value'
                    }
                }
            }
        });

        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: '<<key>>'
        });

        expect(afterReplace.replaceable.nested.moreNested.key).toBe('value');
    });

    it('should replace when value is 0', () => {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            value: 0
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: '<<value>>'
        });

        expect(afterReplace.key).toBe(0);
    });

    it('should replace when value is empty', () => {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            value: ''
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: '<<value>>'
        });

        expect(afterReplace.key).toBe('');
    });

    it('should replace when value is null', () => {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            value: null
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: '<<value>>'
        });

        expect(afterReplace.key).toBeNull();
    });

    it('should not replace when value is undefined', () => {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            value: undefined
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: '<<value>>'
        });

        expect(afterReplace.key).toBe('<<value>>');
    });

    it('should not replace key placeHolder', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: 'someValue'
        });
        const afterReplace: any = placeHolderReplacer.replace({
            '{{key}}': 'value'
        });

        expect(afterReplace.someValue).not.toBeDefined();
        expect(afterReplace['{{key}}']).toBe('value');
    });

    it('should handle array substitution', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: 'someValue'
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: ['string', '<<key>>', 0]
        });

        expect(afterReplace.key).toEqual(['string', 'someValue', 0]);
    });

    it('should replace every occurrence', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: 'someValue'
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: ['string', '{{key}}', '<<key>>']
        });

        expect(afterReplace.key).toEqual(['string', 'someValue', 'someValue']);
    });

    it('should handle array object substitution', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key: {
                nested: 'value'
            }
        });
        const afterReplace: any = placeHolderReplacer.replace({
            key: ['string', '{{key}}', 0]
        });

        expect(afterReplace.key).toEqual(['string', {'nested': 'value'}, 0]);
        expect(afterReplace.key[1].nested).toEqual('value');
    });

    it('should handle strings varMap substitution', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap(JSON.stringify({
            key: {
                nested: 'value'
            }
        }));
        const afterReplace: any = placeHolderReplacer.replace({
            key: ['string', '{{key}}', 0]
        });

        expect(afterReplace.key).toEqual(['string', {'nested': 'value'}, 0]);
        expect(afterReplace.key[1].nested).toEqual('value');
    });

    it('should handle huge json', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({key: 'virgs'});
        const afterReplace: any = placeHolderReplacer.replace({
            requisition: {
                name: 'someName',
                subscription: [
                    {
                        key: '<<key>>'
                    },
                    {
                        key: '{{key}}'
                    },
                    {
                        key: '{{key}}'
                    }
                ]
            }
        });

        afterReplace.requisition.subscription.map((sub: any) => expect(sub.key).toEqual('virgs'));
    });

    it('should keep original type of string values', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        placeHolderReplacer.addVariableMap({
            key1: '123',
            key2: '123.45',
            key3: 'true',
            key4: 'NaN',
            key5: 'null',
            key6: 'undefined',
            key7: '[1, 2, 3]',
            key8: '{ "value": 123 }'
        });
        const afterReplace: any = placeHolderReplacer.replace([
            '{{key1}}', '{{key2}}', '{{key3}}', '{{key4}}',
            '{{key5}}', '{{key6}}', '{{key7}}', '{{key8}}'
        ]);

        afterReplace.map((replacedValue: any) => expect(typeof replacedValue).toBe('string'));
    });

    it('should replace inside a string context', function () {
        const placeHolderReplacer = new JsonPlaceholderReplacer();

        const expectedAfterReplace = {
            string: 'String: hello world!',
            stringWithInteger: 'Integer: 123',
            stringWithFloat: 'Float: 1.23',
            stringWithBoolean: 'Boolean: true',
            stringWithNaN: 'NaN: NaN',
            stringWithNull: 'Null: null',
            stringWithArray: 'Array: [1,2,3]',
            stringWithObject: 'Object: {"value":123}'
        };
        placeHolderReplacer.addVariableMap({
            string: 'hello world!',
            integer: 123,
            float: 1.23,
            boolean: true,
            nan: NaN,
            null: null,
            array: [1, 2, 3],
            object: { value: 123 }
        });
        const afterReplace: any = placeHolderReplacer.replace({
            string: 'String: {{string}}',
            stringWithInteger: 'Integer: {{integer}}',
            stringWithFloat: 'Float: {{float}}',
            stringWithBoolean: 'Boolean: {{boolean}}',
            stringWithNaN: 'NaN: {{nan}}',
            stringWithNull: 'Null: {{null}}',
            stringWithArray: 'Array: {{array}}',
            stringWithObject: 'Object: {{object}}'
        });

        expect(afterReplace).toMatchObject(expectedAfterReplace);
    });

});
