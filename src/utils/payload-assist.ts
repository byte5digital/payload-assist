import { PayloadAssistConfig, PayloadAssistOptions } from "../types/config";
import payloadAssistDefaultConfig from "../default.config";
import { buildConfig, Config as PayloadConfig, Plugin } from "payload";

export { payloadAssistDefaultConfig as defaultConfig };

export let payloadAssistConfig: PayloadAssistConfig | undefined = undefined;

/**
 * This function initializes the payloadAssist and calls payload's buildConfig with the given payload config.
 * @param payloadConfig - The payload config.
 * @param options - The options to cusotmize payloadAssist.
 * @returns Built and sanitized Payload Config
 */
export const payloadAssist =
  (options?: PayloadAssistOptions): Plugin =>
  (payloadConfig: PayloadConfig) => {
    if (payloadAssistConfig) throw `PayloadAssist is already initialized`;

    payloadAssistConfig = {
      ...payloadAssistDefaultConfig,
      ...(options ?? {}),
    };

    Object.entries(payloadAssistConfig.ruleSet).reduce(
      (payloadConfig, [ruleName, rule]) => {
        try {
          if (rule === false) return payloadConfig; // rule is deactivated, so we skip it
          if (!rule(payloadConfig))
            throw `The payload config does not satisfy "${ruleName}".`;
        } catch (error) {
          throw `[PayloadAssist Error]: ${ruleName}: ${error}`;
        }
        return payloadConfig;
      },
      payloadConfig
    );

    return payloadConfig;
  };
