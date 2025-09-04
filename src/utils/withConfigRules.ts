import { buildConfig, Config } from "payload";
import { config as payloadAssistConfig } from "./config";
import { RuleSet } from "../types/RuleSet";

/**
 * This builder function is used to create withConfigRules hook with the given rules.
 * @param rules
 * @returns withConfigRules to create a payload config.
 */
export const withConfigRules = (
  config: Config,
  skipRules?: (keyof RuleSet)[]
) => {
  const checkedConfig = Object.entries(payloadAssistConfig.ruleSet).reduce(
    (config, [ruleName, rule]) => {
      if (skipRules?.includes(ruleName)) return config;

      try {
        if (rule === false) return config; // rule is deactivated, so we skip it
        if (!rule(config)) throw `The config does not satisfy the given rule.`;
      } catch (error) {
        throw `[WithConfigRules Error]: ${ruleName}: ${error}`;
      }
      return config;
    },
    config
  );
  return buildConfig(checkedConfig);
};
