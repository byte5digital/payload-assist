import { Dto } from "../types/dto.js";
import { payloadAssistConfig as payloadAssistConfig } from "./payload-assist.js";
import PayloadAssistError from "../types/PayloadAssistError.js";

export const transformAndValidate = (dto: new () => Dto, data: unknown) => {
  if (!payloadAssistConfig)
    throw new PayloadAssistError(
      `PayloadAssist is not initialized. Use payloadAssist() to initialize it.`
    );

  return payloadAssistConfig.transformAndValidate(dto, data);
};
