import { createWithConfigRules, RuleSet } from "./utils/withConfigRules";
import { withResponse } from "./utils/withResponse";
import { withDtoReadHook } from "./utils/withDtoReadHook";

export const rules: RuleSet = {
    disableQraphQL: (config) => config.graphQL?.disable === true,
    collectionsEndpointsUseWithResponse: (config) =>
      !!config.collections?.every((collection) => {
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
      !!config.collections?.every((collection) => {
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
  };
  
export default createWithConfigRules(rules);
