import { JsonPlaceholderReplacer } from "./library";

export type FileSystem = {
  readFileSync: (filename: string) => {
    toString: () => string;
  };
  existsSync: (filename: string) => boolean;
};

export const commandLineExecution = (
  fs: FileSystem,
  args: string[],
  stdinBuffer?: Buffer,
) => {
  //Prevents prototype-pollution
  Object.freeze(Object.prototype);

  process.exitCode = args.length;

  if (args.length < 3) {
    showUsage();
  } else {
    let annotated: string = readFile(args[2] as string, fs);
    const variableMaps: string[] = args.filter(
      (_value: string, index: number) => index > 2,
    );
    if (stdinBuffer) {
      variableMaps.unshift(args[2]);
      annotated = stdinBuffer.toString();
    }
    const replacer = new JsonPlaceholderReplacer();
    variableMaps.forEach((filename) =>
      replacer.addVariableMap(readFile(filename, fs)),
    );
    const replacedValue = replacer.replace(JSON.parse(annotated));
    console.log(JSON.stringify(replacedValue));
    process.exitCode = 0;
    return replacedValue;
  }
};

const showUsage = () => {
  console.error(`Wrong command line usage\n`);
  console.log(`Usage:`);
  console.log(`   jpr replaceable_filename variable_maps...`);
  console.log(`   jpr variable_maps... < replaceable_filename`);
  console.log(`   cat replaceable_filename | jpr variable_maps...`);
};

const readFile = (filename: string, fs: FileSystem): string => {
  if (filename.indexOf("\0") !== -1) {
    throw Error(`Access denied! '${filename}' is not sanitized`);
  }
  if (!fs.existsSync(filename)) {
    throw Error(`Access denied! no such file: '${filename}'`);
  }
  return fs.readFileSync(filename).toString();
};
