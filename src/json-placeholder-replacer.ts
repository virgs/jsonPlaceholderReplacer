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

    private replaceChildren(node: any): {} {
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

    private replaceValue(node: string): string {
        const placeHolderIsInsideStringContext = !/^{{[^}}]+}}$|^<<[^>>]+>>$/.test(node);
        const getReplacer = () => {
            return (placeHolder: string): string => {
                const path: string = placeHolder.substr(2, placeHolder.length - 4);
                const mapCheckResult = this.checkInEveryMap(path);
                if (mapCheckResult !== undefined) {
                    if (placeHolderIsInsideStringContext) {
                        const parsed = JSON.parse(mapCheckResult);
                        if (typeof parsed === 'object') {
                            return JSON.stringify(parsed);
                        }
                        return parsed;
                    }
                    return mapCheckResult;
                } else {
                    return placeHolder;
                }
            };
        };
        const output = node.replace(/({{[^}}]+}})|(<<[^>>]+>>)/g,
            getReplacer());
        try {
            return JSON.parse(output);
        } catch (exc) {
            return output;
        }
    }

    private checkInEveryMap(path: string): string | undefined {
        let result = undefined;
        this.variablesMap.forEach(map => result = this.navigateThroughMap(map, path));
        return result;
    }

    private navigateThroughMap(map: any, path: string): string | undefined {
        if (map === undefined) {
            return;
        }
        const shortCircuit = map[path];
        if (shortCircuit !== undefined) {
            return JSON.stringify(shortCircuit);
        }
        let keys = path.split('.');
        const key: string = keys[0];
        keys.shift();
        return this.navigateThroughMap(map[key], keys.join('.'));
    }

}
