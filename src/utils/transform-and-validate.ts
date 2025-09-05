import { Dto } from "../types/dto";
import { payloadAssistConfig as payloadAssistConfig } from "./payload-assist";

export const transformAndValidate = (dto: new () => Dto, data: unknown) => {
  if (!payloadAssistConfig) throw `PayloadAssist is not initialized. Use payloadAssist() to initialize it.`;

  return payloadAssistConfig.transformAndValidate(dto, data);
};
