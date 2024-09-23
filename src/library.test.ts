import { JsonPlaceholderReplacer } from "./library";

describe("library", () => {
  it("should handle undefined values exception", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    expect(() =>
      placeHolderReplacer.replace({
        replaceable: undefined,
      }),
    ).not.toThrow();
  });

  it("should keep original values", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const afterReplace: any = placeHolderReplacer.replace({
      stringFloat: "4.0",
      stringInt: "7",
      stringBoolean: "true",
      boolTrue: true,
      boolFalse: false,
      numberInt: 8,
      numberFloat: 8.123,
      nullNull: null,
      stringNull: "null",
    });

    expect(afterReplace.stringFloat).toBe("4.0");
    expect(afterReplace.stringInt).toBe("7");
    expect(afterReplace.stringBoolean).toBe("true");
    expect(afterReplace.boolTrue).toBe(true);
    expect(afterReplace.boolFalse).toBe(false);
    expect(afterReplace.numberInt).toBe(8);
    expect(afterReplace.numberFloat).toBe(8.123);
    expect(afterReplace.nullNull).toBeNull();
    expect(afterReplace.stringNull).toBe("null");
  });

  it("should replace placeholder {{}}", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      key: 100,
      numstring: "101",
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "{{key}}",
      y: "{{numstring}}",
    });

    expect(afterReplace.replaceable).toBe(expected);
    expect(afterReplace.y).toBe("101");
  });

  it("should replace placeholder <<>>", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      key: expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key>>",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should replace custom placeholder. such as: @{{- -}}@", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer({
      delimiterTags: [{ begin: "@{{-", end: "-}}@" }],
    });

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      key: expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "@{{-key-}}@",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should replace using multiple custom placeholder. such as: $$ $$ and := =:", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer({
      delimiterTags: [
        { begin: "$$", end: "$$" },
        { begin: ":=", end: "=:" },
      ],
    });

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      key: expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      first: "$$key$$",
      second: ":=key=:",
    });

    expect(afterReplace.first).toBe(expected);
    expect(afterReplace.second).toBe(expected);
  });

  it("should accept identical placeholders. such as: @@ @@", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer({
      delimiterTags: [{ begin: "@@", end: "@@" }],
    });

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      key: expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "@@key@@",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should scape placeholders. such as: (())", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer({
      delimiterTags: [{ begin: "((", end: "))" }],
    });

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      key: expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "((key))",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should NOT replace mixed placeholders {{>>", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      key: expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "{{key>>",
    });

    expect(afterReplace.replaceable).toBe("{{key>>");
  });

  it("should replace big names", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      "key-with-several/separatorsyeap~a_lot": expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key-with-several/separatorsyeap~a_lot>>",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("last added map should have higher priority, but preserve value from previous map", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      key: "useless",
      key2: "handy",
    });
    placeHolderReplacer.addVariableMap({
      key: 100,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "{{key}}",
      replaceable2: "{{key2}}",
    });

    expect(afterReplace.replaceable).toBe(100);
    expect(afterReplace.replaceable2).toBe("handy");
  });

  it("should overwrite variableMap", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({ key1: "someKey1" });
    placeHolderReplacer.setVariableMap(
      { key3: { deep: "someKey3" } },
      { key2: "someKey2" },
    );

    expect(
      placeHolderReplacer.replace({
        key1: "{{key1}}",
        key2: "{{key2}}",
        key3: "{{key3.deep}}",
      }),
    ).toStrictEqual({ key1: "{{key1}}", key2: "someKey2", key3: "someKey3" });
  });

  it("should work with local variableMap", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({ key1: "someKey1" });

    expect(
      placeHolderReplacer.replaceWith({ key1: "{{key1}}", key2: "{{key2}}" }),
    ).toStrictEqual({ key1: "{{key1}}", key2: "{{key2}}" });

    expect(
      placeHolderReplacer.replaceWith(
        { key1: "{{key1}}", key2: "{{key2}}" },
        { key2: "someKey2" },
      ),
    ).toStrictEqual({ key1: "{{key1}}", key2: "someKey2" });
  });

  it("should mutate passed objects in place on replacement", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({ key: "someKey" });

    const object = { key: "{{key}}", some: true };
    const array = [false, "{{key}}"];

    const afterReplaceObject = placeHolderReplacer.replace(object);
    const afterReplaceArray = placeHolderReplacer.replace(array);

    expect(afterReplaceObject).toEqual(object);
    expect(afterReplaceArray).toEqual(array);
  });

  it("should accept default values with separator", () => {
    const defaultValue = "default-value";
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({});
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: `{{key-with-default-value:${defaultValue}}}`,
    });

    expect(afterReplace.replaceable).toBe(defaultValue);
  });

  it("should override default values if key is found", () => {
    const defaultValue = "default-value";
    const defaultValueKey = "key-with-default-value";
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = 100;
    placeHolderReplacer.addVariableMap({
      [defaultValueKey]: expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: `{{${defaultValueKey}:${defaultValue}}}`,
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should be able to set values which should be treated as nullish to replace with default value", () => {
    const defaultValue = "default";
    const variables = {
      null: null,
      empty: "",
      false: false,
      number: 0,
    };

    const placeHolderReplacer = new JsonPlaceholderReplacer({
      nullishValues: [null, "", false, 0],
    });

    placeHolderReplacer.addVariableMap(variables);

    expect(
      placeHolderReplacer.replace({
        undefined: `{{undefined:${defaultValue}}}`,
        null: `{{null:${defaultValue}}}`,
        empty: `{{empty:${defaultValue}}}`,
        false: `{{false:${defaultValue}}}`,
        number: `{{number:${defaultValue}}}`,
      }),
    ).toStrictEqual({
      undefined: defaultValue,
      empty: defaultValue,
      false: defaultValue,
      null: defaultValue,
      number: defaultValue,
    });

    expect(
      placeHolderReplacer.replace({
        undefined: `{{undefined}}`,
        null: `{{null}}`,
        empty: `{{empty}}`,
        false: `{{false}}`,
        number: `{{number}}`,
      }),
    ).toStrictEqual({
      undefined: `{{undefined}}`,
      null: `{{null}}`,
      empty: `{{empty}}`,
      false: `{{false}}`,
      number: `{{number}}`,
    });
  });

  it("should be able to change default value separator", () => {
    const defaultValue = "default-value";
    const defaultValueKey = "key-with-default-value";
    const separatorCharacter = ":=:";
    const placeHolderReplacer = new JsonPlaceholderReplacer({
      defaultValueSeparator: separatorCharacter,
    });

    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: `{{${defaultValueKey}${separatorCharacter}${defaultValue}}}`,
    });

    expect(afterReplace.replaceable).toBe(defaultValue);
  });

  it("should navigate through variableMap", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = "value";
    placeHolderReplacer.addVariableMap({
      key: {
        nested: expected,
      },
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key.nested>>",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should not navigate through variableMap when a key is found", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = "value";
    placeHolderReplacer.addVariableMap({
      "key.with.dot": expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key.with.dot>>",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should not navigate through variableMap when a key is found in deeper object", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = "value";
    placeHolderReplacer.addVariableMap({
      key: {
        "with.dot": expected,
      },
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key.with.dot>>",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should do nothing when nothing is found", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = "value";
    placeHolderReplacer.addVariableMap({
      key: {
        nested: expected,
      },
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key.not.found>>",
    });

    expect(afterReplace.replaceable).toBe("<<key.not.found>>");
  });

  it("should prefer short circuit", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = "value";
    placeHolderReplacer.addVariableMap({
      key: {
        nested: "useless",
      },
      "key.nested": expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key.nested>>",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should handle boolean values", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expected = true;
    placeHolderReplacer.addVariableMap({
      key: expected,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key>>",
    });

    expect(afterReplace.replaceable).toBe(expected);
  });

  it("should not replace undefined placeHolder", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "{{key}}",
    });

    expect(afterReplace.replaceable).toBe("{{key}}");
  });

  it("should replace full object placeHolder", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      key: {
        nested: {
          moreNested: {
            key: "value",
          },
        },
      },
    });

    const afterReplace: any = placeHolderReplacer.replace({
      replaceable: "<<key>>",
    });

    expect(afterReplace.replaceable.nested.moreNested.key).toBe("value");
  });

  it("should replace when value is 0", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      value: 0,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      key: "<<value>>",
    });

    expect(afterReplace.key).toBe(0);
  });

  it("should replace when value is empty", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      value: "",
    });
    const afterReplace: any = placeHolderReplacer.replace({
      key: "<<value>>",
    });

    expect(afterReplace.key).toBe("");
  });

  it("should replace when value is null", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      value: null,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      key: "<<value>>",
    });

    expect(afterReplace.key).toBeNull();
  });

  it("should not replace when value is undefined", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      value: undefined,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      key: "<<value>>",
    });

    expect(afterReplace.key).toBe("<<value>>");
  });

  it("should not replace key placeHolder", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      key: "someValue",
    });
    const afterReplace: any = placeHolderReplacer.replace({
      "{{key}}": "value",
    });

    expect(afterReplace.someValue).not.toBeDefined();
    expect(afterReplace["{{key}}"]).toBe("value");
  });

  it("should handle array substitution", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      key: "someValue",
    });
    const afterReplace: any = placeHolderReplacer.replace({
      key: ["string", "<<key>>", 0],
    });

    expect(afterReplace.key).toEqual(["string", "someValue", 0]);
  });

  it("should replace every occurrence", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      key: "someValue",
    });
    const afterReplace: any = placeHolderReplacer.replace({
      key: ["string", "{{key}}", "<<key>>"],
    });

    expect(afterReplace.key).toEqual(["string", "someValue", "someValue"]);
  });

  it("should handle array object substitution", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({
      key: {
        nested: "value",
      },
    });
    const afterReplace: any = placeHolderReplacer.replace({
      key: ["string", "{{key}}", 0],
    });

    expect(afterReplace.key).toEqual(["string", { nested: "value" }, 0]);
    expect(afterReplace.key[1].nested).toEqual("value");
  });

  it("should handle strings varMap substitution", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap(
      JSON.stringify({
        key: {
          nested: "value",
        },
      }),
    );
    const afterReplace: any = placeHolderReplacer.replace({
      key: ["string", "{{key}}", 0],
    });

    expect(afterReplace.key).toEqual(["string", { nested: "value" }, 0]);
    expect(afterReplace.key[1].nested).toEqual("value");
  });

  it("should handle huge json", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    placeHolderReplacer.addVariableMap({ key: "virgs" });
    const afterReplace: any = placeHolderReplacer.replace({
      requisition: {
        name: "someName",
        subscription: [
          {
            key: "<<key>>",
          },
          {
            key: "{{key}}",
          },
          {
            key: "{{key}}",
          },
        ],
      },
    });

    afterReplace.requisition.subscription.forEach((sub: any) => {
      expect(sub.key).toEqual("virgs");
    });
  });

  it("should keep original type of string values", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const variableMap = {
      key1: "123",
      key2: "123.45",
      key3: "true",
      key4: "NaN",
      key5: "null",
      key6: "undefined",
      key7: "[1, 2, 3]",
      key8: '{ "value": 123 }',
    };
    placeHolderReplacer.addVariableMap(variableMap);
    const afterReplace: any = placeHolderReplacer.replace([
      "{{key1}}",
      "{{key2}}",
      "{{key3}}",
      "{{key4}}",
      "{{key5}}",
      "{{key6}}",
      "{{key7}}",
      "{{key8}}",
    ]);

    afterReplace.forEach((replacedValue: any) => {
      expect(typeof replacedValue).toBe("string");
    });
  });

  it("should replace inside a string context", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const expectedAfterReplace = {
      string: "String: hello world!",
      stringWithInteger: "Integer: 123",
      stringWithFloat: "Float: 1.23",
      stringWithBoolean: "Boolean: true",
      stringWithNull: "Null: null",
      stringWithArray: "Array: [1,2,3]",
      stringWithObject: 'Object: {"value":123}',
    };
    placeHolderReplacer.addVariableMap({
      string: "hello world!",
      integer: 123,
      float: 1.23,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: { value: 123 },
    });
    const afterReplace: any = placeHolderReplacer.replace({
      string: "String: {{string}}",
      stringWithInteger: "Integer: {{integer}}",
      stringWithFloat: "Float: {{float}}",
      stringWithBoolean: "Boolean: {{boolean}}",
      stringWithNull: "Null: {{null}}",
      stringWithArray: "Array: {{array}}",
      stringWithObject: "Object: {{object}}",
    });

    expect(afterReplace).toMatchObject(expectedAfterReplace);
  });

  it("should handle escape characters", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    const multiLine = "multi\nline";
    const backSlash = "back\\slash";
    placeHolderReplacer.addVariableMap({
      multiLine,
      backSlash,
    });
    const afterReplace: any = placeHolderReplacer.replace({
      multiLine: "{{multiLine}}",
      backSlash: "{{backSlash}}",
    });

    expect(afterReplace.multiLine).toBe(multiLine);
    expect(afterReplace.backSlash).toBe(backSlash);
  });
});
