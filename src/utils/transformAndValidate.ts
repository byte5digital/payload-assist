import { Dto } from "../types/Dto";
import { config as payloadAssistConfig } from "./config";

export const transformAndValidate = (
  dto: new () => Dto,
  data: unknown
): ReturnType<typeof payloadAssistConfig.transformAndValidate> => {
  return payloadAssistConfig.transformAndValidate(dto, data);
};
