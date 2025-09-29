import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextResponse } from "next/server";
import { Dto } from "../types/dto";

describe("withResponse", async () => {
  const { withResponse } = await import("../utils/with-response");

  class MyDto extends Dto {
    value: string = "ok";
  }

  it("returns NextResponse with message when 'message' provided", async () => {
    const handler = withResponse(async () => ({ message: "hello", status: 201 }));
    const res = await handler({} as any);

    expect(res).toBeInstanceOf(NextResponse);

    const json = await (res as NextResponse).json();
    expect(json).toEqual({ message: "hello" });
    expect((res as any).status).toBe(201);
  });

  it("returns NextResponse with DTO and default status 200", async () => {
    const handler = withResponse(async () => ({ response: new MyDto() }));
    const res = await handler({} as any);

    expect(res).toBeInstanceOf(NextResponse);
    const json = await (res as NextResponse).json();
    expect(json).toEqual({ value: "ok" });
    expect((res as any).status).toBe(200);
  });

  it("throws when response is not instance of Dto", async () => {
    const handler = withResponse(async () => ({ response: { value: "nope" } as any }));
    await expect(handler({} as any)).rejects.toBe("Response is not an instance of Dto");
  });
});
