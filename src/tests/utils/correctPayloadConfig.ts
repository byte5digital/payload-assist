import { withDtoReadHook } from "../../utils/with-dto-read-hook";
import { withResponse } from "../../utils/with-response";
import { vi } from "vitest";
import MyCollectionDto from "./myCollectionDTO";

export const correctPayloadConfig = {
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
          path: "/some-endpoint",
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

export default correctPayloadConfig;
