import { JsonPlaceholderReplacer } from "./library";

interface PerformanceTestResult {
  totalDuration: number;
  averageDuration: number;
  operationsCount: number;
  replacementsCount: number;
}

interface TestObject {
  [key: string]: {
    value: string;
    nested: {
      data: string;
      array: string[];
    };
  };
}

function performanceTest(): PerformanceTestResult {
  const placeHolderReplacer = new JsonPlaceholderReplacer();

  // Setup a large variable map
  const largeVariableMap: Record<string, any> = {};
  for (let i = 0; i < 1000; i++) {
    largeVariableMap[`key${i}`] = {
      nested: {
        value: `value${i}`,
        number: i,
        boolean: i % 2 === 0,
        array: [1, 2, 3, i],
        object: { deep: { deeper: i } },
      },
    };
  }

  placeHolderReplacer.addVariableMap(largeVariableMap);

  // Create a large JSON object with many placeholders
  const testData = {
    users: [] as any[],
  };

  for (let i = 0; i < 100; i++) {
    testData.users.push({
      id: `{{key${i % 100}.nested.number}}`,
      name: `{{key${i % 100}.nested.value}}`,
      active: `{{key${i % 100}.nested.boolean}}`,
      metadata: `{{key${i % 100}.nested.object}}`,
      tags: `{{key${i % 100}.nested.array}}`,
    });
  }

  const startTime = performance.now();

  const operationsCount = 10;
  let totalReplacements = 0;

  // Run the replacement multiple times
  for (let i = 0; i < operationsCount; i++) {
    const testDataCopy = JSON.parse(JSON.stringify(testData));
    const result = placeHolderReplacer.replace(testDataCopy);

    // Count successful replacements in first iteration
    if (i === 0) {
      totalReplacements = countSuccessfulReplacements(result);
    }
  }

  const endTime = performance.now();
  const totalDuration = endTime - startTime;
  const averageDuration = totalDuration / operationsCount;

  return {
    totalDuration,
    averageDuration,
    operationsCount,
    replacementsCount: totalReplacements,
  };
}

function countSuccessfulReplacements(obj: any, count = 0): number {
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        count = countSuccessfulReplacements(obj[key], count);
      } else if (typeof obj[key] === "string" && !obj[key].includes("{{")) {
        count++;
      } else if (typeof obj[key] !== "string") {
        count++; // Non-string values that were successfully replaced
      }
    }
  }
  return count;
}

describe("Performance Tests", () => {
  it("should complete large operations within reasonable time", () => {
    console.log("Running performance test with assertions...");

    const result = performanceTest();

    console.log(
      `\nPerformance test completed in ${result.totalDuration.toFixed(3)}ms`,
    );
    console.log(
      `Average per operation: ${result.averageDuration.toFixed(3)}ms`,
    );
    console.log(
      `Total replacements per operation: ${result.replacementsCount}`,
    );

    // Assertions
    expect(result.operationsCount).toBe(10);
    expect(result.replacementsCount).toBeGreaterThan(0);
    expect(result.averageDuration).toBeLessThan(50); // Should be faster than 50ms per operation
    expect(result.totalDuration).toBeLessThan(500); // Should be faster than 500ms total
  });

  it("should handle simple operations efficiently", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();
    placeHolderReplacer.addVariableMap({ key: "value", number: 42 });

    const simpleData = {
      test1: "{{key}}",
      test2: "{{number}}",
      test3: "String with {{key}} in middle",
      test4: { nested: "{{number}}" },
    };

    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const testDataCopy = JSON.parse(JSON.stringify(simpleData));
      placeHolderReplacer.replace(testDataCopy);
    }

    const endTime = performance.now();
    const avgTimePerOperation = (endTime - startTime) / iterations;

    console.log(
      `Simple operations (${iterations} iterations): ${avgTimePerOperation.toFixed(4)}ms per operation`,
    );

    expect(avgTimePerOperation).toBeLessThan(1); // Should be very fast for simple operations
  });

  it("should maintain performance across multiple variable maps", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();

    // Add multiple variable maps to test prioritization performance
    for (let mapIndex = 0; mapIndex < 5; mapIndex++) {
      const map: Record<string, any> = {};
      for (let i = 0; i < 100; i++) {
        map[`key${mapIndex}_${i}`] = `value${mapIndex}_${i}`;
      }
      placeHolderReplacer.addVariableMap(map);
    }

    const testData = {
      values: [] as string[],
    };

    for (let i = 0; i < 50; i++) {
      testData.values.push(`{{key0_${i}}}`); // Should find in first map
      testData.values.push(`{{key4_${i}}}`); // Should find in last map
    }

    const startTime = performance.now();
    const result = placeHolderReplacer.replace(testData);
    const endTime = performance.now();

    const duration = endTime - startTime;
    console.log(`Multiple variable maps test: ${duration.toFixed(3)}ms`);

    expect(duration).toBeLessThan(10); // Should still be fast with multiple maps
    expect((result as any).values[0]).toBe("value0_0"); // Verify replacements worked
    expect((result as any).values[1]).toBe("value4_0");
  });

  it("should handle deeply nested objects efficiently", () => {
    const placeHolderReplacer = new JsonPlaceholderReplacer();
    placeHolderReplacer.addVariableMap({
      "deep.nested.value": "found_it",
      "another.path": { result: "complex_object" },
    });

    const deepData = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                value: "{{deep.nested.value}}",
                object: "{{another.path}}",
              },
            },
          },
        },
      },
    };

    const iterations = 100;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const testDataCopy = JSON.parse(JSON.stringify(deepData));
      placeHolderReplacer.replace(testDataCopy);
    }

    const endTime = performance.now();
    const avgTimePerOperation = (endTime - startTime) / iterations;

    console.log(
      `Deep nesting test (${iterations} iterations): ${avgTimePerOperation.toFixed(4)}ms per operation`,
    );

    expect(avgTimePerOperation).toBeLessThan(5); // Should handle deep nesting efficiently
  });
});
