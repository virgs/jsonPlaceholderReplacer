# jsonPlaceholderReplacer
[![npm version](https://badge.fury.io/js/json-placeholder-replacer.svg)](https://badge.fury.io/js/json-placeholder-replacer)\
Lightweight yet really powerful typescript library/cli to replace placeholders in json.

[![build status](https://travis-ci.org/lopidio/jsonPlaceholderReplacer.svg?branch=master)](https://travis-ci.org/lopidio/jsonPlaceholderReplacer)

## Library usage:
As simples as:
```
import {JsonPlaceholderReplacer} from "json-placeholder-replacer";
const placeHolderReplacer = new JsonPlaceholderReplacer();

placeHolderReplacer.addVariableMap({
    key: 100,
    otherKey: 200
});
const afterReplace = placeHolderReplacer.replace({
    replaceable: "{{key}}",
    otherReplaceableWithSameKey: "{{key}}",
    otherReplaceable: "{{otherKey}}"
})

// afterReplace = {
//    replaceable: 100,
//    otherReplaceableWithSameKey: 100,
//    otherReplaceable: 200
// }
```

All you have to do is to use double curly brackets **{{placeholderKey}}** to identify the placeholder

It's possible to add more than one variables map.
```
placeHolderReplacer.addVariableMap({
    firstMapKey: "1"
});
placeHolderReplacer.addVariableMap({
    secondMapKey: 2
});
const afterReplace = placeHolderReplacer.replace({
    replaceable: "{{firstMapKey}}",
    otherReplaceable: "{{secondMapKey}}"
})

// afterReplace = {
//    replaceable: "1",
//    otherReplaceable: 2
// }
```

And the last added maps have higher priority, so:
```
placeHolderReplacer.addVariableMap({
    id: "lowerPriority"
});
placeHolderReplacer.addVariableMap({
    id: "higherPriority"
});
const afterReplace = placeHolderReplacer.replace({
    replaceable: "{{id}}"
})

// afterReplace = {
//    replaceable: "higherPriority"
// }
```
It keeps original variable types. So, if, in the map, a variable is boolean/string/number/object when it's replaced, it still is boolean/string/number/object:
```
placeHolderReplacer.addVariableMap({
    booleanKey: true,
    stringKey: "string",
    numberKey: 10,
    objectKey: {
      inner: "inner"
    }
});
const afterReplace = placeHolderReplacer.replace({
    booleanReplaceable: "{{booleanKey}}",
    stringReplaceable: "{{stringKey}}",
    numberReplaceable: "{{numberKey}}",
    objectReplaceable: "{{objectKey}}"
})

// afterReplace = {
//    booleanReplaceable: true,
//    stringReplaceable: "string",
//    numberReplaceable: 10,
//    objectReplaceable: {
//      inner: "inner"
//    }
// }

```

Just to make it clear, it does not replace the placeholder Key:
```
placeHolderReplacer.addVariableMap({
    key: "someValue"
});
const afterReplace = placeHolderReplacer.replace({
    "{{key}}": "value"
})
// afterReplace = {
//    "{{key}}": "value"
// }
```

And, of course, it handles, array substitution as well:
```
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

## CLI usage
```
#$json-placeholder-replacer replaceableFilename [...variableMaps]
```
Example:
```
$json-placeholder-replacer replaceable.json variableMap1.json variableMap2.json
```
