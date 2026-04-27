import { Dto } from "../../types/dto.js";
import { Expose } from "class-transformer";

export default class MyCollectionDto extends Dto {
  @Expose() name?: string;
}
