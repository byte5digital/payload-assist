import { PayloadRequest } from "payload";
import type { Dto } from "./dto";
import type { RuleSet } from "./rule-set";
import { Access } from "../utils/access-control";

export type PayloadAssistConfig = {
  ruleSet: RuleSet;
  transformAndValidate: (dto: new () => Dto, data: unknown) => Dto;
  getUserRole: (req: PayloadRequest, role: string | number) => boolean;
  adminUserRole: string | number;
  customAccessControllers?: {
    [accessControllerName: string]: (...args: unknown[]) => Access;
  };
};

export type PayloadAssistOptions = Partial<PayloadAssistConfig>;
