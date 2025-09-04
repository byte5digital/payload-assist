import { Config } from "payload";
import { withResponse } from "./utils/withResponse";
import { withDtoReadHook } from "./utils/withDtoReadHook";
import { Dto } from "./types/Dto";
import { plainToInstance } from "class-transformer";
import "reflect-metadata";
import { PayloadAssistConfig } from "./types/PayloadAssistConfig";

export default {
  ruleSet: {
    disableQraphQL: (config: Config) => config.graphQL?.disable === true,
    collectionsEndpointsUseWithResponse: (config: Config) =>
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
    collectionsUseWithDtoReadHook: (config: Config) =>
      config.collections?.every((collection) => {
        if (!collection.hooks?.afterRead)
          throw `The collection "${collection.slug}" needs to have an afterRead hook to use withDtoReadHook.`;
        return collection.hooks.afterRead.every((hook) => {
          const isWithDtoReadHook = (
            hook as ReturnType<typeof withDtoReadHook>
          )?.isWithDtoReadHook?.();
          if (!isWithDtoReadHook)
            throw `The collection "${collection.slug}" has an afterRead hook that does not use withDtoReadHook.`;
          return isWithDtoReadHook;
        });
      }),
  },
  transformAndValidate: (dto: new () => Dto, data: unknown): Dto => {
    return plainToInstance(dto, data, {
      excludeExtraneousValues: true,
    });
  },
} as PayloadAssistConfig;
