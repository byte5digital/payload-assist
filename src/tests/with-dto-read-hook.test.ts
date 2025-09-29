import { describe, it, expect, beforeEach, vi } from "vitest";
import type { CollectionAfterReadHook } from "payload";
import { Dto } from "../types/dto";
import correctPayloadConfig from "./utils/correctPayloadConfig";
import { Expose } from "class-transformer";

class AdminDto extends Dto {
  @Expose() role: string = "admin";
}
class UserDto extends Dto {
  @Expose() role: string = "user";
}
class DefaultDto extends Dto {
  @Expose() kind: string = "default";
}

describe.skip("withDtoReadHook", async () => {
  const { withDtoReadHook } = await import("../utils/with-dto-read-hook");
  const { payloadAssist, resetPayloadAssist } = await import(
    "../utils/payload-assist"
  );

  beforeEach(() => {
    resetPayloadAssist();
  });

  const makeArgs = (
    overrides: Partial<Parameters<CollectionAfterReadHook>[number]> = {}
  ): Parameters<CollectionAfterReadHook>[number] => ({
    doc: { id: 1, name: "John" },
    req: { payloadAPI: "REST", user: undefined } as any,
    collection: {} as any,
    context: {} as any,
    ...overrides,
  });

  it("throws if not initialized", async () => {
    const hook = withDtoReadHook([{ dto: DefaultDto }]);
    await expect(hook(makeArgs())).rejects.toBe(
      "PayloadAssist is not initialized. Use payloadAssist() to initialize it."
    );
  });

  it("returns doc unchanged for local payload API", async () => {
    payloadAssist(correctPayloadConfig);
    const hook = withDtoReadHook([{ dto: DefaultDto }]);

    const result = await hook(
      makeArgs({ req: { payloadAPI: "local" } as any })
    );
    expect(result).toEqual({ id: 1, name: "John" });
  });

  it("applies first matching DTO based on condition", async () => {
    payloadAssist(correctPayloadConfig);
    const hook = withDtoReadHook([
      {
        dto: AdminDto,
        condition: ({ req }) => (req as any)?.user?.role === "admin",
      },
      {
        dto: UserDto,
        condition: ({ req }) => (req as any)?.user?.role === "user",
      },
      { dto: DefaultDto },
    ]);

    const adminRes = await hook(
      makeArgs({ req: { payloadAPI: "REST", user: { role: "admin" } } as any })
    );
    expect(adminRes).toBeInstanceOf(AdminDto);

    const userRes = await hook(
      makeArgs({ req: { payloadAPI: "REST", user: { role: "user" } } as any })
    );
    expect(userRes).toBeInstanceOf(UserDto);
  });

  it("falls back to default DTO if no condition matches", async () => {
    payloadAssist(correctPayloadConfig);
    const hook = withDtoReadHook([
      {
        dto: AdminDto,
        condition: ({ req }) => (req as any)?.user?.role === "admin",
      },
      {
        dto: UserDto,
        condition: ({ req }) => (req as any)?.user?.role === "user",
      },
      { dto: DefaultDto },
    ]);

    const res = await hook(
      makeArgs({ req: { payloadAPI: "REST", user: { role: "guest" } } as any })
    );
    expect(res).toBeInstanceOf(DefaultDto);
  });
});
