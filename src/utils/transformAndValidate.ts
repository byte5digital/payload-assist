import { Dto } from "../types/Dto";
import { payloadAssistConfig as payloadAssistConfig } from "./payloadAssist";

export const transformAndValidate = (dto: new () => Dto, data: unknown) => {
  if (!payloadAssistConfig) throw `PayloadAssist is not initialized. Use payloadAssist() to initialize it.`;

  return payloadAssistConfig.transformAndValidate(dto, data);
};
