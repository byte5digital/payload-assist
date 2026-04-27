import type { Dto } from "./dto.js";
import type { RuleSet } from "./rule-set.js";

export type PayloadAssistConfig = {
  ruleSet: RuleSet;
  transformAndValidate: (dto: new () => Dto, data: unknown) => Dto;
};

export type PayloadAssistOptions = Partial<PayloadAssistConfig>;
