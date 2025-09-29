import { describe, it, expect, beforeEach } from "vitest";
import correctPayloadConfig from "./utils/correctPayloadConfig";
import MyCollectionDto from "./utils/myCollectionDTO";

describe("transformAndValidate", async () => {
  const { transformAndValidate } = await import(
    "../utils/transform-and-validate"
  );
  const { payloadAssist, resetPayloadAssist } = await import(
    "../utils/payload-assist"
  );

  beforeEach(() => {
    resetPayloadAssist();
  });

  it("throws if PayloadAssist is not initialized", () => {
    expect(() =>
      transformAndValidate(MyCollectionDto, { name: "Alice" })
    ).toThrow(
      "PayloadAssist is not initialized. Use payloadAssist() to initialize it."
    );
  });

  it("transforms and excludes extraneous properties after initialization", () => {
    payloadAssist(correctPayloadConfig);

    const result = transformAndValidate(MyCollectionDto, {
      name: "Bob",
      extraneous: "should be removed",
    }) as MyCollectionDto;

    expect(result).toBeInstanceOf(MyCollectionDto);
    expect(result.name).toBe("Bob");
    expect(
      (result as unknown as Record<string, unknown>).extraneous
    ).toBeUndefined();
  });
});
