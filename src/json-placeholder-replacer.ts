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

export interface DelimiterTag {
  begin: string;
  end: string;
  escapedBeginning?: string;
  escapedEnding?: string;
}

export interface Configuration {
  delimiterTags: DelimiterTag[];
  defaultValueSeparator: string;
}

export class JsonPlaceholderReplacer {
  private readonly variablesMap: Array<Record<string, unknown>> = [];
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
    variableMap: Record<string, unknown> | string,
  ): JsonPlaceholderReplacer {
    if (typeof variableMap === "string") {
      this.variablesMap.push(JSON.parse(variableMap));
    } else {
      this.variablesMap.push(variableMap);
    }
    return this;
  }

  public replace(json: object): object {
    return this.replaceChildren(json);
  }

  private initializeOptions(options?: Partial<Configuration>): Configuration {
    let delimiterTags = defaultDelimiterTags;
    let defaultValueSeparator = defaultSeparator;
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
    }
    return { defaultValueSeparator, delimiterTags };
  }

  private replaceChildren(node: any): any {
    for (const key in node) {
      const attribute = node[key];
      if (typeof attribute === "object") {
        node[key] = this.replaceChildren(attribute);
      } else if (attribute !== undefined) {
        node[key] = this.replaceValue(attribute.toString());
      }
    }
    return node;
  }

  private replaceValue(node: string): string {
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
          this.replacer(placeHolderIsInsideStringContext)(delimiterTag),
        );
      },
      node,
    );
    try {
      return JSON.parse(output);
    } catch (exc) {
      return output;
    }
  }

  private replacer(placeHolderIsInsideStringContext: boolean) {
    return (delimiterTag: DelimiterTag) =>
      (placeHolder: string): string => {
        const { tag, defaultValue } = this.parseTag(placeHolder, delimiterTag);

        const mapCheckResult = this.checkInEveryMap(tag);
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
      defaultValue = path.substring(defaultValueSeparatorIndex + 1);
    }
    return { tag, defaultValue };
  }

  private checkInEveryMap(path: string): string | undefined {
    let result;
    this.variablesMap.forEach(
      (map) => (result = this.navigateThroughMap(map, path)),
    );
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
