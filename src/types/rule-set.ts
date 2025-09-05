import { Config } from "payload";

export type RuleSet = {
  [ruleName in string]:
    | ((config: Config) => boolean | undefined | null)
    | false; // if the rule is false, it means it is deactivated
};
