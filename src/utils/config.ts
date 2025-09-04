import { PayloadAssistConfig } from "../types/PayloadAssistConfig";
import defaultConfig from "../payload-assist.default.config";

export { defaultConfig };

export let config: PayloadAssistConfig = {
  ...defaultConfig,
};

export const setConfig = (customConfig?: Partial<PayloadAssistConfig>) => {
  config = {
    ...config,
    ...(customConfig ?? {}),
  };
};

export default setConfig;
