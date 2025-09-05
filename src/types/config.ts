import type { Dto } from "./Dto";
import type { RuleSet } from "./RuleSet";

export type PayloadAssistConfig = {
  ruleSet: RuleSet;
  transformAndValidate: (dto: new () => Dto, data: unknown) => Dto;
};

export type PayloadAssistOptions = Partial<PayloadAssistConfig>;
