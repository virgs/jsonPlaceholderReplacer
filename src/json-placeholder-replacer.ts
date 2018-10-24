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

    public replace(json: object | string): {} {
        if (typeof json == 'string') {
            return this.replaceChildren(JSON.parse(json));
        } else {
            return this.replaceChildren(json);
        }
    }

    private replaceChildren = (node: any): {} => {
        for (const key in node) {
            const attribute = node[key];
            if (typeof attribute == 'object') {
                node[key] = this.replaceChildren(attribute);
            } else {
                node[key] = this.replaceValue(attribute.toString());
            }
        }
        return node;
    }

    private replaceValue(node: string): any {
        let replacer = (placeHolder: string): string => {
            const path: string = placeHolder.substr(2, placeHolder.length - 4);
            let inEveryMap = this.checkInEveryMap(path);
            return inEveryMap !== undefined ? inEveryMap : placeHolder;
        };
        let output = node.replace(/{{[^}}]+}}/g, replacer)
                        .replace(/<<[^>>]+>>/g, replacer);
        try {
            return JSON.parse(output);
        }
        catch (exc) {
            return output;
        }
    }

    private checkInEveryMap(path: string): string | undefined {
        let result = undefined;
        this.variablesMap.forEach(map => result = this.checkEveryMap(map, path));
        return result;
    }

    private checkEveryMap(map: any, path: string): string | undefined {
        let shortCircuit = this.checkShortCircuit(map, path);
        if (shortCircuit) {
            return shortCircuit;
        }
        return this.navigateThroughMap(map, path);
    }

    private checkShortCircuit(map: any, path: string) {
        let shortCircuit = map[path];
        if (shortCircuit !== undefined) {
            return this.stringify(shortCircuit);
        }
    }

    private stringify(variableValue: any): string | undefined {
        if (variableValue !== undefined) {
            if (typeof variableValue == 'object') {
                return JSON.stringify(variableValue);
            } else {
                return variableValue;
            }
        }
    }

    private navigateThroughMap(map: any, path: string) {
        let variableValue: any = map;
        let keys: string[] = path.split('.');
        for (let index = 0; index < keys.length; ++index) {
            if (variableValue === undefined) {
                return;
            }
            variableValue = variableValue[keys[index]];
        }
        return this.stringify(variableValue);
    }
}
