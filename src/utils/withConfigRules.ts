import { buildConfig, Config } from "payload";
import { withResponse } from "./withResponse";
import { withDtoReadHook } from "./withDtoReadHook";

export type RuleSet = { [ruleName in string]: (config: Config) => boolean };

/**
 * This builder function is used to create withConfigRules hook with the given rules.
 * @param rules
 * @returns withConfigRules to create a payload config.
 */
export const createWithConfigRules =
  (rules: RuleSet) => (config: Config, skipRules?: (keyof typeof rules)[]) => {
    const checkedConfig = Object.entries(rules).reduce(
      (config, [ruleName, rule]) => {
        if (skipRules?.includes(ruleName)) return config;

        try {
          if (!rule(config))
            throw `The config does not satisfy the given rule.`;
        } catch (error) {
          throw `[WithConfigRules Error]: ${ruleName}: ${error}`;
        }
        return config;
      },
      config
    );
    return buildConfig(checkedConfig);
  };
