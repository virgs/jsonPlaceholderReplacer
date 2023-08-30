# jsonPlaceholderReplacer

[![npm version](https://badge.fury.io/js/json-placeholder-replacer.svg)](https://badge.fury.io/js/json-placeholder-replacer)
[![build status](https://circleci.com/gh/virgs/jsonPlaceholderReplacer.svg?style=shield)](https://app.circleci.com/pipelines/github/virgs/jsonPlaceholderReplacer)
[![Maintainability](https://api.codeclimate.com/v1/badges/6e586ff6eb12a67da08e/maintainability)](https://codeclimate.com/github/lopidio/jsonPlaceholderReplacer/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6e586ff6eb12a67da08e/test_coverage)](https://codeclimate.com/github/lopidio/jsonPlaceholderReplacer/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/virgs/jsonPlaceholderReplacer/badge.svg)](https://app.snyk.io/)

Lightweight yet really powerful typescript library/cli to replace placeholders in an javascript object/JSON.
By default, all you have to do is to use double curly brackets **{{**placeholderKey**}}** or angle brackets **<<**placeholderKey**>>**, interchangeably, to identify the placeholder.
Don't worry, if you don't like these default placeholders you can create your own.

## CLI usage

```shell
json-placeholder-replacer replaceableFilename [...variableMaps]
```

### Example

$ json-placeholder-replacer [replaceable.json](/rep) [variable.map](/map)

### Would result

```shell
cat replaceable.json
        # {
        #  "curly": "{{key}}",
        #  "angle": "<<key>>"
        # }
cat variable.map:
        # {
        #         "key": 10,
        #         "not-mapped": 20
        # }
json-placeholder-replacer replaceable.json variable.map
        # {
        #         "curly": 10,
        #         "angle": 10,
        #         "not-mapped": 20
        # }
```

## Library usage

```typescript
import { JsonPlaceholderReplacer } from "json-placeholder-replacer";
const placeHolderReplacer = new JsonPlaceholderReplacer();

placeHolderReplacer.addVariableMap({
  key: 100,
  otherKey: 200,
});
const afterReplace = placeHolderReplacer.replace({
  replaceable: "{{key}}",
  otherReplaceableWithSameKey: "<<key>>",
  otherReplaceable: "{{otherKey}}",
});

// afterReplace = {
//    replaceable: 100,
//    otherReplaceableWithSameKey: 100,
//    otherReplaceable: 200
// }
```

### You can replace the default placeholders with some as cool as you want

```typescript
const placeHolderReplacer = new JsonPlaceholderReplacer({
  delimiterTags: [{ begin: "@{{-", end: "-}}@" }],
});
placeHolderReplacer.addVariableMap({
  key: "nice",
});
const afterReplace = placeHolderReplacer.replace({
  replaceable: "@{{-key-}}@",
});

// afterReplace = {
//    replaceable: "nice",
// }
```

### It's also possible to add more than one variables map

```typescript
placeHolderReplacer.addVariableMap({
  firstMapKey: "1",
});
placeHolderReplacer.addVariableMap({
  secondMapKey: 2,
});
const afterReplace = placeHolderReplacer.replace({
  replaceable: "{{firstMapKey}}",
  otherReplaceable: "<<secondMapKey>>",
});

// afterReplace = {
//    replaceable: "1",
//    otherReplaceable: 2
// }
```

### And the last added maps have higher priority, so

```typescript
placeHolderReplacer.addVariableMap({
  id: "lowerPriority",
});
placeHolderReplacer.addVariableMap({
  id: "higherPriority",
});
const afterReplace = placeHolderReplacer.replace({
  replaceable: "{{id}}",
});

// afterReplace = {
//    replaceable: "higherPriority"
// }
```

### It keeps original variable types

If a variable in the map is boolean/string/number/object, it remains as boolean/string/number/object when it's replaced

```typescript
placeHolderReplacer.addVariableMap({
  booleanKey: true,
  stringKey: "string",
  numberKey: 10,
  objectKey: {
    inner: "inner",
  },
});
const afterReplace = placeHolderReplacer.replace({
  booleanReplaceable: "{{booleanKey}}",
  stringReplaceable: "{{stringKey}}",
  numberReplaceable: "{{numberKey}}",
  objectReplaceable: "{{objectKey}}",
});

// afterReplace = {
//    booleanReplaceable: true,
//    stringReplaceable: "string",
//    numberReplaceable: 10,
//    objectReplaceable: {
//      inner: "inner"
//    }
// }
```

### Just to make it clearer, it does not replace the placeholder Key

```typescript
placeHolderReplacer.addVariableMap({
  key: "someValue",
});
const afterReplace = placeHolderReplacer.replace({
  "{{key}}": "value",
});
// afterReplace = {
//    "{{key}}": "value"
// }
```

### And, of course, it handles array substitution as well

```typescript
placeHolderReplacer.addVariableMap({
    key: 987,
    objectReplaceable: {
      inner: "inner"
    }
});
const afterReplace = placeHolderReplacer.replace({
    array: ["string", "{{objectReplaceable}}", {{key}}]
})

// afterReplace = {
//    array: ["string", {
//                        inner: "inner"
//                      }, 987]
// }
```

### Want to get nested elements? Go for it

```typescript
placeHolderReplacer.addVariableMap({
  key: {
    nested: "value",
  },
});
const afterReplace: any = placeHolderReplacer.replace({
  replaceable: "<<key.nested>>",
});

// afterReplace = {
//    replaceable: "value"
// }
```

### This feature allows you to have default values in case you don't have them mapped

```typescript
placeHolderReplacer.addVariableMap({
  key: "value",
});
const afterReplace: any = placeHolderReplacer.replace({
  replaceable: "<<not-found-key:default-value>>",
});

// afterReplace = {
//    replaceable: "default-value"
// }
```

### Of course, you can also change what is the default value separator (defaults to ':')

```typescript
const placeHolderReplacer = new JsonPlaceholderReplacer({
  defaultValueSeparator: ":=:",
});

placeHolderReplacer.addVariableMap({
  key: "value",
});
const afterReplace: any = placeHolderReplacer.replace({
  replaceable: "<<not-found-key:=:default-value>>", // Note the ':=:'
});

// afterReplace = {
//    replaceable: "default-value"
// }
```
