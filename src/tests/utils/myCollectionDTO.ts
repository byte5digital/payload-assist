import { Dto } from "../../types/dto";
import { Expose } from "class-transformer";

export default class MyCollectionDto extends Dto {
  @Expose() name?: string;
}
