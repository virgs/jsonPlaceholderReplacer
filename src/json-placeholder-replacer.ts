export class JsonPlaceholderReplacer {
    private variablesMap: {}[] = [];

    public addVariableMap(variableMap: object | string): JsonPlaceholderReplacer {
        if (typeof variableMap == 'string') {
            this.variablesMap.push(JSON.parse(variableMap));
        } else {
            this.variablesMap.push(variableMap);
        }
        return this;
    }

    public replace(json: object): {} {
        return this.replaceChildren(json);
    }

    private replaceChildren = (node: any): {} => {
        for (const key in node) {
            const attribute = node[key];
            if (typeof attribute == 'object') {
                node[key] = this.replaceChildren(attribute);
            } else if (attribute !== undefined) {
                node[key] = this.replaceValue(attribute.toString());
            }
        }
        return node;
    }

    private replaceValue(node: string): any {
        const getReplacer = (placeHolderIsInsideStringContext: boolean) => {
            return (placeHolder: string): string => {
                const path: string = placeHolder.substr(2, placeHolder.length - 4);
                const mapCheckResult = this.checkInEveryMap(path);
                if (mapCheckResult !== undefined) {
                    const isStringLiteral = !placeHolderIsInsideStringContext && mapCheckResult.isString;
                    return isStringLiteral ? `"${mapCheckResult.value}"` : mapCheckResult.value;
                } else {
                    return placeHolder;
                }
            };
        };
        const placeHolderIsInsideStringContext = !/^{{[^}}]+}}$|^<<[^>>]+>>$/.test(node);
        const output = node.replace(/({{[^}}]+}})|(<<[^>>]+>>)/g,
            getReplacer(placeHolderIsInsideStringContext));
        try {
            return JSON.parse(output);
        } catch (exc) {
            return output;
        }
    }

    private checkInEveryMap(path: string): VariableMapCheckResult {
        let result = undefined;
        this.variablesMap.forEach(map => result = this.navigateThroughMap(map, path));
        return result;
    }

    private navigateThroughMap(map: any, path: string): VariableMapCheckResult {
        if (map === undefined) {
            return;
        }
        let shortCircuit = map[path];
        if (shortCircuit !== undefined) {
            const value = JsonPlaceholderReplacer.stringify(shortCircuit);
            return { value, isString: typeof shortCircuit === 'string' };
        }
        let keys = path.split('.');
        const key: string = keys[0];
        keys.shift();
        return this.navigateThroughMap(map[key], keys.join('.'));
    }

    private static stringify(variableValue: any): any {
        return typeof variableValue == 'object'
            ? JSON.stringify(variableValue)
            : variableValue;
    }
}

type VariableMapCheckResult = undefined | { value: string, isString: boolean };