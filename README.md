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

Peer deps: Payload v3+, Next v15+, plus `class-transformer` and `reflect-metadata` (installed by the package).


## API overview

- `setConfig(config)`: Configures payload-assist rules and the transformAndValidate function that run against your payload config.
- `defaultConfig`: Default config (can be spread/overridden).
- `withConfigRules(payloadConfig)`: Wraps your payload config to ensure it matches the defined rules.
- `Dto`: Base abstract class for response DTOs.
- `transformAndValidate(Dto, data)`: Validate Payload data and transform to DTO. The underlying transformer/validator can be overridden via config.
- `withResponse(handler)`: Enforce DTO-only JSON responses in your custom payload endpoints.
- `withDtoReadHook([{ dto, select }, { dto }])`: Attach to collections to return DTOs from read operations.

## Usage

### Set config

The `ruleSet` and `transformAndValidate` can be configured by the config.

- **ruleSet**: An object map of named rules; merge defaults with your own, if required Deactivate a default rule by setting the rule to `false`.
- **rules**: `(config: payloadConfig) => boolean | void`; throw to fail with an actionable message and return true if the rule is satisfied.
- **transformAndValidate**: `(dto: Dto, data: unknown) => Dto | Promise<Dto>` Turn raw Payload data into typed DTOs. .

```ts
import setconfig, { defaultConfig } from "payload-assist";

setConfig({
  ruleSet: {
    ...defaultConfig.ruleSet,

    // add/override rules here
     secretIsSet: (config) => config.secret?.length > 0 ? true : throw 'A secret needs to be set',
  },
});
```

---

### withConfigRules

Checks your payload config for unmatched rules and calls payload's `buildConfig`. Throws an error if rules are not met.

```ts
import { withConfigRules } from "payload-assist";

export default withConfigRules({
  // your Payload config
});
```

---

### DTOs: Purpose and usage

Define exactly what leaves your API by modeling responses as DTOs. Only explicitly exposed fields and nested DTOs are serialized.
It is important that all DTOs extend the `Dto` class. The example below shows the usage with the default `transformAndValidate`.

```ts
import { Dto, Expose, Type } from "payload-assist";

export class MediaResponse extends Dto {
  @Expose() url!: string;
  @Expose() mimeType!: string;
}

export class UserResponse extends Dto {
  @Expose() id!: number;
  @Expose() name!: string;
}

export class MyCollectionDto extends Dto {
  @Expose() name!: string;
  @Expose() @Type(() => MediaResponse) image!: MediaResponse;
  @Expose() @Type(() => UserResponse) owner!: UserResponse;
}
```

---

Transform any raw Payload doc into a DTO. By default `transformAndValidate` uses `class-transformer`, but it can be configured.

```ts
import { transformAndValidate } from "payload-assist";

const payloadDoc = await ...
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
        }
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
