const defaultDelimiterTags: DelimiterTagFixture[] = [
  {
    begin: "{{",
    end: "}}",
  },
  {
    begin: "<<",
    end: ">>",
  },
];

const defaultSeparator = ":";

const defaultNullishValues: NullishValue[] = [];

export interface DelimiterTagFixture {
  begin: string;
  end: string;
}

export interface Placeholder {
  begin: string;
  end: string;
  escapedBeginning: string;
  escapedEnding: string;
  regex: RegExp;
}

export interface BuildOptions {
  delimiterTags: DelimiterTagFixture[];
  defaultValueSeparator: string;
  nullishValues: (boolean | number | string | null)[];
}
type NullishValue = boolean | number | string | null;

export interface Configuration {
  placeholders: Placeholder[];
  defaultValueSeparator: string;
  nullishValues: NullishValue[];
}

type VariableMap = Record<string, unknown>;

export class JsonPlaceholderReplacer {
  private readonly variablesMap: VariableMap[] = [];
  private readonly configuration: Configuration;
  private readonly delimiterTagsRegex: RegExp;
  private readonly serializedNullishValues: Set<string>;
  private readonly stringifyCache = new WeakMap<object, string>();

  private readonly escapeRegExp = (text: string): string =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  public constructor(options?: Partial<BuildOptions>) {
    this.configuration = this.initializeConfigurations(options);
    this.serializedNullishValues = new Set(
      this.configuration.nullishValues.map((v) => JSON.stringify(v)),
    );

    const delimiterTagsRegexes = this.configuration.placeholders
      .map(
        (delimiterTag) =>
          `^${delimiterTag.escapedBeginning}[^${delimiterTag.escapedEnding}]+${delimiterTag.escapedEnding}$`,
      )
      .join("|");
    this.delimiterTagsRegex = new RegExp(delimiterTagsRegexes);
  }

  public addVariableMap(
    variableMap: VariableMap | string,
  ): JsonPlaceholderReplacer {
    if (typeof variableMap === "string") {
      try {
        this.variablesMap.unshift(JSON.parse(variableMap));
      } catch (error) {
        throw new Error(
          `Invalid JSON string provided to addVariableMap: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    } else {
      this.variablesMap.unshift(variableMap);
    }
    return this;
  }

  public setVariableMap(
    ...variablesMap: (VariableMap | string)[]
  ): JsonPlaceholderReplacer {
    this.variablesMap.length = 0;
    variablesMap.forEach((variableMap) => this.addVariableMap(variableMap));
    return this;
  }

  public replace(json: object): object {
    return this.replaceChildren(json, this.variablesMap, new WeakSet());
  }

  public replaceWith(json: object, ...variablesMap: VariableMap[]): object {
    return this.replaceChildren(json, variablesMap.reverse(), new WeakSet());
  }

  private initializeConfigurations(
    options?: Partial<BuildOptions>,
  ): Configuration {
    const tags = options?.delimiterTags || defaultDelimiterTags;

    const delimiterTags: Placeholder[] = tags.map((tag) => {
      const escapedBeginning = this.escapeRegExp(tag.begin);
      const escapedEnding = this.escapeRegExp(tag.end);
      return {
        begin: tag.begin,
        end: tag.end,
        escapedBeginning,
        escapedEnding,
        regex: new RegExp(
          `(${escapedBeginning}[^${escapedEnding}]+${escapedEnding})`,
          "g",
        ),
      };
    });

    let defaultValueSeparator = defaultSeparator;
    if (options?.defaultValueSeparator !== undefined) {
      defaultValueSeparator = options.defaultValueSeparator;
    }
    let nullishValues: NullishValue[] = defaultNullishValues;
    if (options?.nullishValues?.length) {
      nullishValues = options.nullishValues;
    }

    return {
      defaultValueSeparator,
      placeholders: delimiterTags,
      nullishValues,
    };
  }

  private replaceChildren(
    node: any,
    variablesMap: VariableMap[],
    visited: WeakSet<object>,
  ): any {
    if (typeof node === "object" && node !== null) {
      if (visited.has(node)) {
        return node;
      }
      visited.add(node);

      for (const key in node) {
        const attribute = node[key];
        if (typeof attribute === "object" && attribute !== null) {
          node[key] = this.replaceChildren(attribute, variablesMap, visited);
        } else if (attribute === null) {
          node[key] = null;
        } else if (attribute !== undefined) {
          node[key] = this.replaceValue(attribute, variablesMap);
        }
      }
      return node;
    } else if (node !== undefined) {
      return this.replaceValue(node, variablesMap);
    }
    return node;
  }

  private replaceValue(node: any, variablesMap: VariableMap[]): any {
    const attributeAsString = node.toString();
    const placeHolderIsInsideStringContext =
      !this.delimiterTagsRegex.test(node);

    // Create the replacer function once per call
    const replacerFn = this.replacer(
      placeHolderIsInsideStringContext,
      variablesMap,
    );

    const output = this.configuration.placeholders.reduce(
      (acc, delimiterTag) => {
        return acc.replace(
          delimiterTag.regex,
          replacerFn(delimiterTag), // Use the same replacerFn
        );
      },
      attributeAsString,
    );

    if (output === attributeAsString) {
      return node;
    }

    // Only try JSON.parse if the output looks like JSON and is not inside string context
    if (!placeHolderIsInsideStringContext) {
      try {
        return JSON.parse(output);
      } catch (exc) {
        // If JSON parsing fails, return the output as-is
        return output;
      }
    }

    return output;
  }

  private replacer(
    placeHolderIsInsideStringContext: boolean,
    variablesMap: VariableMap[],
  ) {
    return (delimiterTag: Placeholder) =>
      (placeHolder: string): string => {
        const { tag, defaultValue } = this.parseTag(placeHolder, delimiterTag);

        const mapCheckResult = this.checkInEveryMap(tag, variablesMap);
        if (mapCheckResult === undefined) {
          if (defaultValue !== undefined) {
            return defaultValue;
          }
          return placeHolder;
        }
        if (!placeHolderIsInsideStringContext) {
          // For non-string context, we'll return JSON.stringify and let replaceValue handle the parsing
          return this.safeStringify(mapCheckResult);
        }
        if (typeof mapCheckResult === "object" && mapCheckResult !== null) {
          return this.safeStringify(mapCheckResult);
        }
        return String(mapCheckResult);
      };
  }

  private safeStringify(value: any): string {
    if (typeof value === "object" && value !== null) {
      if (this.stringifyCache.has(value)) {
        return this.stringifyCache.get(value)!;
      }
      const stringified = JSON.stringify(value);
      this.stringifyCache.set(value, stringified);
      return stringified;
    }
    return JSON.stringify(value);
  }

  private parseTag(
    placeHolder: string,
    delimiterTag: Placeholder,
  ): { tag: string; defaultValue: string | undefined } {
    const path: string = placeHolder.substring(
      delimiterTag.begin.length,
      placeHolder.length - delimiterTag.begin.length,
    );
    let tag = path;
    let defaultValue: string | undefined;
    const defaultValueSeparatorIndex = path.indexOf(
      this.configuration.defaultValueSeparator,
    );
    if (defaultValueSeparatorIndex > 0) {
      tag = path.substring(0, defaultValueSeparatorIndex);
      defaultValue = path.substring(
        defaultValueSeparatorIndex +
          this.configuration.defaultValueSeparator.length,
      );
    }
    return { tag, defaultValue };
  }

  private checkInEveryMap(path: string, variablesMap: VariableMap[]): any {
    for (const map of variablesMap) {
      let value = this.navigateThroughMap(map, path);
      if (value !== undefined && !this.isNullishValue(value)) {
        return value;
      }
    }
    return undefined;
  }

  private isNullishValue(value: any): boolean {
    if (this.serializedNullishValues.size === 0) {
      return false;
    }
    const stringified = this.safeStringify(value);
    return this.serializedNullishValues.has(stringified);
  }

  private navigateThroughMap(map: any, path: string): any {
    if (map === undefined) {
      return;
    }
    const shortCircuit = map[path];
    if (shortCircuit !== undefined) {
      return shortCircuit;
    }
    const keys = path.split(".");
    const key: string = keys[0];
    keys.shift();
    return this.navigateThroughMap(map[key], keys.join("."));
  }
}
