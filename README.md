# jsonPlaceholderReplacer
Lightweight yet really powerful typescript library/cli to replace placeholders in json.

Usage:
As simples as:
```
import {JsonPlaceholderReplacer} from "json-placeholder-replacer";
const placeHolderReplacer = new JsonPlaceholderReplacer();

placeHolderReplacer.addVariableMap({
    key: 100
});
const afterReplace: any = placeHolderReplacer.replace({
    replaceable: "{{key}}"
})

// afterReplace = {
//    replaceable: 100
// }
```
All you have to do is to use double curly brackets **{{placeholderKey}}** to identify the place holder
It's possible to add more than one variables map.
Like this:
```
placeHolderReplacer.addVariableMap({
    firstMapKey: "1"
});
placeHolderReplacer.addVariableMap({
    secondMapKey: 2
});
const afterReplace: any = placeHolderReplacer.replace({
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
const afterReplace: any = placeHolderReplacer.replace({
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
const afterReplace: any = placeHolderReplacer.replace({
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
const afterReplace: any = placeHolderReplacer.replace({
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
const afterReplace: any = placeHolderReplacer.replace({
    array: ["string", "{{objectReplaceable}}", {{key}}]
})

// afterReplace = {
//    array: ["string", {
//                        inner: "inner"
//                      }, 987]
// }
```

It replaces all placeHolders occurences:
```
import {JsonPlaceholderReplacer} from "json-placeholder-replacer";

const placeHolderReplacer = new JsonPlaceholderReplacer();
placeHolderReplacer.addVariableMap({
    key: 100
});
const afterReplace: any = placeHolderReplacer.replace({
    firstOccurrence: "{{key}}",
    secondOccurrence: "{{key}}"
})

// afterReplace = {
//    firstOccurrence: 100,
//    secondOccurrence: 100
// }
```
