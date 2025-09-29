import { withResponse } from "./utils/with-response";
import { withDtoReadHook } from "./utils/with-dto-read-hook";
import { plainToInstance } from "class-transformer";
import "reflect-metadata";
import { PayloadAssistConfig } from "./types/config";

export default {
  ruleSet: {
    disableQraphQL: (config) => {
      if (config.graphQL?.disable !== true) throw `GraphQL is not disabled.`;
      return true
    },
    collectionsEndpointsUseWithResponse: (config) =>
      config.collections?.every((collection) => {
        if (!collection.endpoints) return true;

        return collection.endpoints.every((endpoint) => {
          const isWithResponse = (
            endpoint.handler as ReturnType<typeof withResponse>
          )?.isWithResponse?.();

          if (!isWithResponse)
            throw `The collection "${collection.slug}" has an endpoint "${endpoint.path}" that does not use withResponse.`;

          return isWithResponse;
        });
      }),
    collectionsUseWithDtoReadHook: (config) =>
      config.collections?.every((collection) => {
        if (!collection.hooks?.afterRead)
          throw `The collection "${collection.slug}" has an afterRead hook that does not use withDtoReadHook.`;

        return collection.hooks.afterRead.every((hook) => {
          const isWithDtoReadHook = (
            hook as ReturnType<typeof withDtoReadHook>
          )?.isWithDtoReadHook?.();

          if (!isWithDtoReadHook)
            throw `The collection "${collection.slug}" has an afterRead hook that does not use withDtoReadHook.`;

          return isWithDtoReadHook;
        });
      }),
    collectionsCRUDAccessIsDefined: (config) =>
      config.collections?.every((collection) => {
        if (!collection.access)
          throw `The collection "${collection.slug}" has no access object.`;

        if (!collection.access.read)
          throw `The collection "${collection.slug}" has no explicit read access definition.`;

        if (!collection.access.create)
          throw `The collection "${collection.slug}" has no explicit create access definition.`;

        if (!collection.access.update)
          throw `The collection "${collection.slug}" has no explicit update access definition.`;

        if (!collection.access.delete)
          throw `The collection "${collection.slug}" has no explicit delete access definition.`;

        return true;
      }),
  },
  transformAndValidate: (dto, data) => {
    return plainToInstance(dto, data, {
      excludeExtraneousValues: true,
    });
  },
} as PayloadAssistConfig;
