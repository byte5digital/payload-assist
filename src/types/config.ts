import type { Dto } from "./dto";
import type { RuleSet } from "./rule-set";

export type PayloadAssistConfig = {
  ruleSet: RuleSet;
  transformAndValidate: (dto: new () => Dto, data: unknown) => Dto;
};

export type PayloadAssistOptions = Partial<PayloadAssistConfig>;
