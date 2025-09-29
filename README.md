<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/dc1362ca-c963-411d-8826-845b9a511bb4">
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/1ef2819b-91c7-440b-9707-583a580c0703">
  <img alt="Fallback image description" src="https://github.com/user-attachments/assets/1ef2819b-91c7-440b-9707-583a580c0703">
</picture>

<div align="center" style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 12px;">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fregistry.npmjs.org%2F@byte5digital%2Fpayload-assist&query=%24%5B%22dist-tags%22%5D.latest&prefix=v&label=NPM&style=for-the-badge&labelColor=ffffff&color=373E45">
  <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fregistry.npmjs.org%2F@byte5digital%2Fpayload-assist&query=%24%5B%22dist-tags%22%5D.latest&prefix=v&label=NPM&style=for-the-badge&labelColor=002634&color=E5E9EB">
  <img alt="Fallback image description" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fregistry.npmjs.org%2F@byte5digital%2Fpayload-assist&query=%24%5B%22dist-tags%22%5D.latest&prefix=v&label=NPM&style=for-the-badge&labelColor=ffffff&color=373E45">
</picture>
  <picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/TESTS-PASSING-empty?style=for-the-badge&labelColor=ffffff&color=373E45">
  <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/TESTS-PASSING-empty?style=for-the-badge&labelColor=002634&color=E5E9EB">
  <img alt="Tests passing" src="https://img.shields.io/badge/TESTS-PASSING-empty?style=for-the-badge&labelColor=ffffff&color=373E45">
</picture>
  <picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/LICENSE-MIT-empty?style=for-the-badge&labelColor=ffffff&color=373E45">
  <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/LICENSE-MIT-empty?style=for-the-badge&labelColor=002634&color=E5E9EB">
  <img alt="License MIT" src="https://img.shields.io/badge/LICENSE-MIT-empty?style=for-the-badge&labelColor=ffffff&color=373E45">
</picture>
</div>

# payload-assist

Utilities to add guardrails, DTO tooling, and ergonomic rules to Payload CMS projects.

- **Rules**: Validate your Payload config at boot (e.g., kebab-case slugs).
- **DTOs**: First-class helpers to define, transform, validate, and enforce DTO-only responses.
- **Ergonomics**: Thin wrappers to keep endpoints and collection reads consistent and secure.


## Installation

```bash
yarn add payload-assist
# or
npm install payload-assist
```

Peer deps: Payload v3+, Next v15+. Dependencies `class-transformer` and `reflect-metadata` are included in the package.


## API overview

- `payloadAssist(payloadConfig, options?)`: Main function that initializes payload-assist, validates your payload config against defined rules, and returns the built config.
- `defaultConfig`: Default config with built-in rules and transformAndValidate function (can be spread/overridden).
- `Dto`: Base abstract class for response DTOs.
- `transformAndValidate(Dto, data)`: Validate Payload data and transform to DTO. Uses the configured transformer/validator.
- `withResponse(handler)`: Enforce DTO-only JSON responses in your custom payload endpoints.
- `withDtoReadHook([{ dto, condition }, { dto }])`: Attach to collections to return DTOs from read operations with conditional DTO selection.

## Helper Types

### AccessControl

A comprehensive type for Payload collection access control that includes all available access control methods.

```ts
import { AccessControl } from "payload-assist";

export const MyCollection: CollectionConfig = {
  slug: "my-collection",
  access: {
    admin: ({ req }) => req.user?.role === "admin",
    create: ({ req }) => req.user?.role === "admin",
    read: ({ req }) => true, // public read
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  } satisfies AccessControl,
  // ...fields
};
```

## Usage

### Initialize payload-assist

The main `payloadAssist` function initializes the library, validates your payload config against defined rules, and returns the built config. You can customize the `ruleSet` and `transformAndValidate` function through options.

- **ruleSet**: An object map of named rules; merge defaults with your own, if required. Deactivate a default rule by setting the rule to `false`.
- **rules**: `(config: payloadConfig) => boolean | void`; throw to fail with an actionable message and return true if the rule is satisfied.
- **transformAndValidate**: `(dto: Dto, data: unknown) => Dto` Turn raw Payload data into typed DTOs.

**Built-in rules:**
- `disableQraphQL`: Ensures GraphQL is disabled in your config
- `collectionsEndpointsUseWithResponse`: Ensures all collection endpoints use `withResponse`
- `collectionsUseWithDtoReadHook`: Ensures all collections use `withDtoReadHook` in their afterRead hooks

```ts
import payloadAssist, { defaultConfig } from "payload-assist";

export default payloadAssist({
  // your Payload config
}, {
  ruleSet: {
    ...defaultConfig.ruleSet,

    // add/override rules here
    secretIsSet: (config) => config.secret?.length > 0 ? true : throw 'A secret needs to be set',
  },
});
```

---

### DTOs: Purpose and usage

Define exactly what leaves your API by modeling responses as DTOs. Only explicitly exposed fields and nested DTOs are serialized.
It is important that all DTOs extend the `Dto` class. The example below shows the usage with the default `transformAndValidate`.

```ts
import { Dto, Expose, Type } from "payload-assist";

export class MediaResponse extends Dto {
  @Expose() url: string;
  @Expose() mimeType: string;
}

export class UserResponse extends Dto {
  @Expose() id: number;
  @Expose() name: string;
}

export class MyCollectionDto extends Dto {
  @Expose() name: string;
  @Expose() @Type(() => MediaResponse) image: MediaResponse;
  @Expose() @Type(() => UserResponse) owner: UserResponse;
}
```

---

Transform any raw Payload doc into a DTO. By default `transformAndValidate` uses `class-transformer`, but it can be configured through the payloadAssist options.

```ts
import { transformAndValidate } from "payload-assist";

const payloadDoc = await getPayloadDoc()
const dto = transformAndValidate(MyCollectionDto, payloadDoc);
```

---

### Enforcing DTO-only responses in endpoints

Use `withResponse` to guarantee your endpoints return DTOs (and nothing else). It centralizes transform/serialize and standardizes error responses. The transformation strategy is configurable.

```ts
import payload from "payload";
import { withResponse, transformAndValidate } from "payload-assist";
import { MyDataDto } from "path/to/dtos";

export const MyCollection: CollectionConfig = {
  slug: "my-collection",
  endpoints: [
    {
      path: "/my-custom-endpoint",
      method: "get",
      handler: withResponse(async (req: PayloadRequest) => {
        const myData = await req.payload.find({
          collection: "my-collection",
          // ...additional filter logic
        });

        const myDataDto = transformAndValidate(MyDataDto, myData);
        return {
          response: myDataDto,
          status: 200,
        };
      }),
    },
  ],

  // ...fields
};
```

---

### Enforcing DTO-only responses from collections

Attach `withDtoReadHook` to your collections afterReadHooks to transform read results automatically to the given DTOs.
Multiple objects with DTOs can be passed, when they include a condition, only the last item can be without a condition.
The first DTO where the condition is met will be used or the DTO without a condition, if given. If none applies, `null` will be returned.
So the order of the given DTOs should be: More specific first, default last.

```ts
// src/collections/MyCollection.ts
import { CollectionConfig } from "payload/types";
import { withDtoReadHook } from "payload-assist";
import { MyCollectionDto, MyCollectionAdminDto } from "path/to/dtos";

export const MyCollection: CollectionConfig = {
  slug: "my-collection",
  hooks: {
    afterRead: [
      withDtoReadHook(
        {
          dto: MyCollectionAdminDto,
          condition: ({ req: { user } }) => user?.role === "admin",
        },
        {
          dto: MyCollectionDto,
        }
      ),
    ],
  },
  // ...fields
};
```

## License

MIT

## About byte5

We're a development company based in Frankfurt, Germany — remote-friendly, open-minded, and tech-driven. Our team brings deep expertise in **Node.js**, **MedusaJS**, **Laravel**, **Umbraco**, and decentralized tech like **IOTA**. We collaborate with clients who care about clean code, scalable solutions, and long-term maintainability.

We contribute to open source, run **Laravel DACH Meetups**, and support developer communities across the DACH region. Our expertise in **e-commerce platforms** makes us the perfect partner for building robust, scalable solutions.

If you love building smart solutions with real impact — we should talk.

**Connect with us:**

- [Website](https://byte5.net)
- [LinkedIn](https://www.linkedin.com/company/byte5-gmbh)
- [Email](mailto:info@byte5.de)

## Support

- [Issue Tracker](https://github.com/byte5digital/meilisearch-pro/issues)
- [Discord Community](https://discord.gg/medusajs)
- [Email Support](mailto:support@byte5.de)

---

**Built with 🩵 by [byte5](https://byte5.net)**
