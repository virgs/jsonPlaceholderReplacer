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

const defaultNullishValues = [] as string[];

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
export interface Configuration {
  placeholders: Placeholder[];
  defaultValueSeparator: string;
  nullishValues: (boolean | number | string | null)[];
}

type VariableMap = Record<string, unknown>;

export class JsonPlaceholderReplacer {
  private readonly variablesMap: VariableMap[] = [];
  private readonly configuration: Configuration;
  private readonly delimiterTagsRegex: RegExp;

  public constructor(options?: Partial<BuildOptions>) {
    this.configuration = this.initializeConfigurations(options);

    const delimiterTagsRegexes = this.configuration.placeholders
      .map(
        (delimiterTag) =>
          `^${delimiterTag.begin}[^${delimiterTag.end}]+${delimiterTag.end}$`,
      )
      .join("|");
    this.delimiterTagsRegex = new RegExp(delimiterTagsRegexes);
  }

  public addVariableMap(
    variableMap: VariableMap | string,
  ): JsonPlaceholderReplacer {
    if (typeof variableMap === "string") {
      this.variablesMap.unshift(JSON.parse(variableMap));
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

    const escapeRegExp = (text: string): string =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const delimiterTags: Placeholder[] = tags.map((tag) => {
      const escapedBeginning = escapeRegExp(tag.begin);
      const escapedEnding = escapeRegExp(tag.end);
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
    let nullishValues = defaultNullishValues;
    if (options?.nullishValues?.length) {
      nullishValues = options.nullishValues.map((v) => JSON.stringify(v));
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

  private replaceValue(node: any, variablesMap: VariableMap[]): string {
    const attributeAsString = node.toString();
    const placeHolderIsInsideStringContext =
      !this.delimiterTagsRegex.test(node);
    const output = this.configuration.placeholders.reduce(
      (acc, delimiterTag) => {
        return acc.replace(
          delimiterTag.regex,
          this.replacer(
            placeHolderIsInsideStringContext,
            variablesMap,
          )(delimiterTag),
        );
      },
      attributeAsString,
    );
    try {
      if (output === attributeAsString) {
        return node;
      }
      return JSON.parse(output);
    } catch (exc) {
      return output;
    }
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
          return mapCheckResult;
        }
        const parsed: any = JSON.parse(mapCheckResult);
        if (typeof parsed === "object") {
          return JSON.stringify(parsed);
        }
        return parsed;
      };
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
    const { nullishValues } = this.configuration;
    for (const map of variablesMap) {
      let value = this.navigateThroughMap(map, path);
      // Compare using loose equality to handle nullish values correctly
      if (value !== undefined && !nullishValues.includes(value)) {
        return value;
      }
    }
    return undefined;
  }

  private navigateThroughMap(map: any, path: string): string | undefined {
    if (map === undefined) {
      return;
    }
    const shortCircuit = map[path];
    if (shortCircuit !== undefined) {
      return JSON.stringify(shortCircuit);
    }
    const keys = path.split(".");
    const key: string = keys[0];
    keys.shift();
    return this.navigateThroughMap(map[key], keys.join("."));
  }
}
