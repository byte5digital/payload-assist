import { plainToInstance } from "class-transformer";
import "reflect-metadata";
import { Dto } from "../types/Dto";

export const transformAndValidate = (dto: new () => Dto, data: unknown) => {
  return plainToInstance(dto, data, {
    excludeExtraneousValues: true,
  });
};
