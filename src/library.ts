const defaultDelimiterTags = [
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

export interface DelimiterTag {
  begin: string;
  end: string;
  escapedBeginning?: string;
  escapedEnding?: string;
}

export interface Configuration {
  delimiterTags: DelimiterTag[];
  defaultValueSeparator: string;
  nullishValues: (boolean | number | string | null)[];
}

type VariableMap = Record<string, unknown>;

export class JsonPlaceholderReplacer {
  private readonly variablesMap: VariableMap[] = [];
  private readonly configuration: Configuration;
  private readonly delimiterTagsRegex: RegExp;

  public constructor(options?: Partial<Configuration>) {
    this.configuration = this.initializeOptions(options);
    const escapeRegExp = (text: string): string =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    this.configuration.delimiterTags = this.configuration.delimiterTags.map(
      (tag) => ({
        ...tag,
        escapedBeginning: escapeRegExp(tag.begin),
        escapedEnding: escapeRegExp(tag.end),
      }),
    );
    const delimiterTagsRegexes = this.configuration.delimiterTags
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
      this.variablesMap.push(JSON.parse(variableMap));
    } else {
      this.variablesMap.push(variableMap);
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
    return this.replaceChildren(json, this.variablesMap);
  }

  public replaceWith(json: object, ...variablesMap: VariableMap[]): object {
    return this.replaceChildren(json, variablesMap);
  }

  private initializeOptions(options?: Partial<Configuration>): Configuration {
    let delimiterTags = defaultDelimiterTags;
    let defaultValueSeparator = defaultSeparator;
    let nullishValues = defaultNullishValues;
    if (options !== undefined) {
      if (
        options.delimiterTags !== undefined &&
        options.delimiterTags.length > 0
      ) {
        delimiterTags = options.delimiterTags;
      }
      if (options.defaultValueSeparator !== undefined) {
        defaultValueSeparator = options.defaultValueSeparator;
      }
      if (options.nullishValues?.length) {
        nullishValues = options.nullishValues.map((v) => JSON.stringify(v));
      }
    }

    return { defaultValueSeparator, delimiterTags, nullishValues };
  }

  private replaceChildren(node: any, variablesMap: VariableMap[]): any {
    for (const key in node) {
      const attribute = node[key];
      if (typeof attribute === "object") {
        node[key] = this.replaceChildren(attribute, variablesMap);
      } else if (attribute !== undefined) {
        node[key] = this.replaceValue(attribute, variablesMap);
      }
    }
    return node;
  }

  private replaceValue(node: any, variablesMap: VariableMap[]): string {
    const attributeAsString = node.toString();
    const placeHolderIsInsideStringContext =
      !this.delimiterTagsRegex.test(node);
    const output = this.configuration.delimiterTags.reduce(
      (acc, delimiterTag) => {
        const regex = new RegExp(
          `(${delimiterTag.escapedBeginning}[^${delimiterTag.escapedEnding}]+${delimiterTag.escapedEnding})`,
          "g",
        );
        return acc.replace(
          regex,
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
    return (delimiterTag: DelimiterTag) =>
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
    delimiterTag: DelimiterTag,
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

  private checkInEveryMap(
    path: string,
    variablesMap: VariableMap[],
  ): string | undefined {
    const { nullishValues } = this.configuration;
    let result: string | undefined;
    variablesMap.forEach((map) => {
      let value = this.navigateThroughMap(map, path);
      if (value !== undefined && nullishValues.includes(value)) {
        value = undefined;
      }
      result = value || result;
    });
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
    const keys = path.split(".");
    const key: string = keys[0];
    keys.shift();
    return this.navigateThroughMap(map[key], keys.join("."));
  }
}
