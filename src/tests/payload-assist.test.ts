import { beforeEach, describe, it, vi } from "vitest";
import { Dto } from "../types/dto";
import { withDtoReadHook } from "../utils/with-dto-read-hook";
import { withResponse } from "../utils/with-response";
import { NextResponse } from "next/server";

class MyCollectionDto extends Dto {}

const correctPayloadConfig = {
  collections: [
    {
      slug: "test",
      fields: [],
      hooks: {
        afterRead: [
          withDtoReadHook([
            {
              dto: MyCollectionDto,
            },
          ]),
        ],
      },
      access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
      },
      endpoints: [
        {
          path: "/test",
          method: "get",
          handler: withResponse(async () => ({
            response: new MyCollectionDto(),
            status: 200,
          })),
        },
      ],
    },
  ],
  db: {
    init: vi.fn(),
    defaultIDType: "number",
  },
  graphQL: {
    disable: true,
  },
} as unknown as import("payload").Config;

describe("config check", async () => {
  vi.mock("payload", async () => {
    return {
      buildConfig: vi.fn((cfg: unknown) => cfg),
    };
  });

  const { payloadAssist, resetPayloadAssist } = await import(
    "../utils/payload-assist"
  );

  beforeEach(() => {
    resetPayloadAssist();
  });

  it("should allow proper payload config", async ({ expect }) => {
    const { buildConfig } = await import("payload");
    payloadAssist(correctPayloadConfig);
    expect(buildConfig).toHaveBeenCalledWith(correctPayloadConfig);
  });

  it("should throw an error if collection is missing access object", async ({
    expect,
  }) => {
    const payloadConfig = {
      ...correctPayloadConfig,
      collections: [
        {
          ...correctPayloadConfig.collections?.[0],
          access: undefined,
        },
      ],
    } as import("payload").Config;

    expect(() => payloadAssist(payloadConfig)).toThrow(
      '[PayloadAssist Error]: collectionsCRUDAccessIsDefined: The collection "test" has no access object.'
    );
  });

  it("should throw an error if collection is missing read access object", async ({
    expect,
  }) => {
    const payloadConfig = {
      ...correctPayloadConfig,
      collections: [
        {
          ...correctPayloadConfig.collections?.[0],
          access: {
            ...correctPayloadConfig.collections?.[0].access,
            read: undefined,
          },
        },
      ],
    } as import("payload").Config;

    expect(() => payloadAssist(payloadConfig)).toThrow(
      '[PayloadAssist Error]: collectionsCRUDAccessIsDefined: The collection "test" has no explicit read access definition.'
    );
  });

  it("should throw an error if collection is missing withDtoReadHook", async ({
    expect,
  }) => {
    const payloadConfig = {
      ...correctPayloadConfig,
      collections: [
        {
          ...correctPayloadConfig.collections?.[0],
          hooks: {
            afterRead: [],
          },
        },
      ],
    } as import("payload").Config;

    expect(() => payloadAssist(payloadConfig)).toThrow(
      '[PayloadAssist Error]: collectionsUseWithDtoReadHook: The collection "test" has no afterRead hook that does use withDtoReadHook.'
    );
  });

  it("should throw an error if collection's endpoint is missing withResponse", async ({
    expect,
  }) => {
    const payloadConfig = {
      ...correctPayloadConfig,
      collections: [
        {
          ...correctPayloadConfig.collections?.[0],
          endpoints: [
            {
              ...correctPayloadConfig.collections?.[0].endpoints?.[0],
              handler: () => {
                NextResponse.json({
                  response: "test",
                });
              },
            },
          ],
        },
      ],
    } as import("payload").Config;

    expect(() => payloadAssist(payloadConfig)).toThrow(
      '[PayloadAssist Error]: collectionsEndpointsUseWithResponse: The collection "test" has an endpoint "/test" that does not use withResponse.'
    );
  });

  it("should throw an error if graphQL is not disabled", async ({ expect }) => {
    const payloadConfig = {
      ...correctPayloadConfig,
      graphQL: undefined,
    } as import("payload").Config;

    expect(() => payloadAssist(payloadConfig)).toThrow(
      "[PayloadAssist Error]: disableQraphQL: GraphQL is not disabled."
    );
  });
});
