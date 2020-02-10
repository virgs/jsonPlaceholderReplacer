# jsonPlaceholderReplacer
[![npm version](https://badge.fury.io/js/json-placeholder-replacer.svg)](https://badge.fury.io/js/json-placeholder-replacer) 
[![build status](https://travis-ci.org/virgs/jsonPlaceholderReplacer.svg?branch=master)](https://travis-ci.org/virgs/jsonPlaceholderReplacer)
[![Maintainability](https://api.codeclimate.com/v1/badges/6e586ff6eb12a67da08e/maintainability)](https://codeclimate.com/github/virgs/jsonPlaceholderReplacer/maintainability) [![Greenkeeper badge](https://badges.greenkeeper.io/virgs/jsonPlaceholderReplacer.svg)](https://greenkeeper.io/)

Lightweight yet really powerful typescript library/cli to replace placeholders in an javascript object.
By default, all you have to do is to use double curly brackets **{{**placeholderKey**}}** or angle brackets **<<**placeholderKey**>>**, interchangeably, to identify the placeholder.
Don't worry, if you don't like these default placeholders you can create your own. 

## CLI usage
```
$ json-placeholder-replacer replaceableFilename [...variableMaps]
```
Example:
        
```$ json-placeholder-replacer ```[replaceable.json](/rep) [variable.map](/map)


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
    otherReplaceableWithSameKey: "<<key>>",
    otherReplaceable: "{{otherKey}}"
})

// afterReplace = {
//    replaceable: 100,
//    otherReplaceableWithSameKey: 100,
//    otherReplaceable: 200
// }
```

It's possible to replace the default placeholders with some as cool as you want.
```
const placeHolderReplacer = new JsonPlaceholderReplacer({begin: '@{{-', end: '-}}@'});
placeHolderReplacer.addVariableMap({
    key: "nice"
});
const afterReplace = placeHolderReplacer.replace({
    replaceable: "@{{-key-}}@",
})

// afterReplace = {
//    replaceable: "nice",
// }
```

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
    otherReplaceable: "<<secondMapKey>>"
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

Want to get nested elements? Go for it!
```
placeHolderReplacer.addVariableMap({
    key: {
        nested: "value"
    }
});
const afterReplace: any = placeHolderReplacer.replace({
    replaceable: "<<key.nested>>"
});

// afterReplace = {
//    replaceable: "value"
// }

```
