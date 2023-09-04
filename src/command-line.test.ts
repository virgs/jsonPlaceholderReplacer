import { commandLineExecution, FileSystem } from "./command-line";

const annotatedContent = JSON.stringify({
  curly: "{{key}}",
  angle: "<<key>>",
  "not-mapped": 20,
});

const variableMapContent = JSON.stringify({
  key: 10,
});

const expected = {
  curly: 10,
  angle: 10,
  "not-mapped": 20,
};

console.log = jest.fn();
console.error = jest.fn();

const toStringMock = jest.fn();
const fsMock: FileSystem = {
  readFileSync: () => ({
    toString: toStringMock,
  }),
  existsSync: jest.fn(() => true),
};

describe("command-line", () => {
  const args = ["node", "jpr"];
  beforeEach(() => {
    jest.resetAllMocks();
    fsMock.existsSync = jest.fn(() => true);
  });

  it("should throw when the file does not exist", () => {
    fsMock.existsSync = jest.fn(() => false);
    expect(() =>
      commandLineExecution(fsMock, args.concat("doesnt exist"), undefined),
    ).toThrow();
  });

  it("should show usage", () => {
    fsMock.existsSync = jest.fn(() => false);
    commandLineExecution(fsMock, args, undefined);

    expect(console.error as jest.Mock).toHaveBeenCalledTimes(1);
    expect(console.log as jest.Mock).toHaveBeenCalled();
  });

  it("should throw when filename ends with \0", () => {
    expect(() =>
      commandLineExecution(fsMock, args.concat("endsWith\0"), undefined),
    ).toThrow();
  });

  it("should work when stdin IS NOT provided", () => {
    toStringMock
      .mockImplementationOnce(() => annotatedContent)
      .mockImplementationOnce(() => variableMapContent);
    expect(
      commandLineExecution(
        fsMock,
        args.concat(["annotated", "map"]),
        undefined,
      ),
    ).toEqual(expected);
  });

  it("should work when stdin IS NOT provided and more than one map is provided", () => {
    toStringMock
      .mockImplementationOnce(() => annotatedContent)
      .mockImplementationOnce(() => variableMapContent)
      .mockImplementationOnce(() => ({
        key: 44,
      }));
    expect(
      commandLineExecution(
        fsMock,
        args.concat(["annotated", "map", "second-map"]),
        undefined,
      ),
    ).toEqual({
      curly: 44,
      angle: 44,
      "not-mapped": 20,
    });
  });

  it("should work when stdin IS provided", () => {
    toStringMock
      .mockImplementationOnce(() => "the firs read is discarded")
      .mockImplementationOnce(() => variableMapContent);
    expect(
      commandLineExecution(
        fsMock,
        args.concat("map"),
        Buffer.from(annotatedContent),
      ),
    ).toEqual(expected);
  });

  it("should work when stdin IS provided and more than one map is provided", () => {
    toStringMock
      .mockImplementationOnce(() => "the firs read is discarded")
      .mockImplementationOnce(() => variableMapContent)
      .mockImplementationOnce(() => ({
        key: 44,
      }));
    expect(
      commandLineExecution(
        fsMock,
        args.concat("overriden", "map"),
        Buffer.from(annotatedContent),
      ),
    ).toEqual({
      curly: 44,
      angle: 44,
      "not-mapped": 20,
    });
  });
});
