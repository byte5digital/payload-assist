export {
  payloadAssist as default,
  payloadAssist,
  payloadAssistConfig as config,
  defaultConfig,
} from "./utils/payload-assist.js";
export { Dto } from "./types/dto.js";
export { withDtoReadHook } from "./utils/with-dto-read-hook.js";
export { withResponse } from "./utils/with-response.js";
export { transformAndValidate } from "./utils/transform-and-validate.js";

export { Expose, Type } from "class-transformer";

export type { PayloadAssistConfig, PayloadAssistOptions } from "./types/config.js";
export type { RuleSet } from "./types/rule-set.js";
export type { AccessControl } from "./types/access-control.js";

export { default as PayloadAssistError } from "./types/PayloadAssistError.js";
