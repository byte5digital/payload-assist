// load custom config and merge with default config

const customConfig = require(process.cwd() + "/custom.config");


export { Expose, Type } from "class-transformer";

export {
  payloadAssist as default,
  payloadAssist,
  payloadAssistConfig as config,
  defaultConfig,
} from "./utils/payload-assist";
export { Dto } from "./types/dto";
export { withDtoReadHook } from "./utils/with-dto-read-hook";
export { withResponse } from "./utils/with-response";
export { transformAndValidate } from "./utils/transform-and-validate";
export {
  default as accessControl,
  default as a,
  isLoggedIn,
  isAdmin,
  isUserRole,
  isCustomCondition,
} from "./utils/access-control";

export type { PayloadAssistConfig, PayloadAssistOptions } from "./types/config";
export type { RuleSet } from "./types/rule-set";
export type { AccessControl } from "./types/access-control";
export type { AccessChain, ChainControllers } from "./utils/access-control";
