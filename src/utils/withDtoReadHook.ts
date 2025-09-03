import type { CollectionAfterReadHook } from "payload";
import { Dto } from "../types/Dto";
import { transformAndValidate } from "./transformAndValidate";

/**
 * Dtos is an array of objects with the following properties:
 * - dto: the DTO to apply to the document
 * - condition: a function that returns a boolean indicating if the DTO should be applied to the document
 * 
 * The array can have multiple DTOs with a condition property, and one without a condition property.
 * The one without a condition property will be applied to the document if no other DTOs match the condition.
 * The order of the objects in the array is important. The first DTO with a matching condition will be applied to the document.
 * 
 * Example:
 * [
 *   { dto: CompanyAdminResponse, condition: ({ req: { user } }) => user?.role === "user" },
 *   { dto: CompanyResponse, condition: ({ req: { user } }) => user?.role === "admin" },
 * ]
 */
type Dtos = [
    ...Array<{
        dto: new () => Dto,
        condition: (args: Parameters<CollectionAfterReadHook>[0]) => boolean
    }>,
    {
        dto: new () => Dto,
        condition?: (args: Parameters<CollectionAfterReadHook>[0]) => boolean
    }
]

type afterReadHook = CollectionAfterReadHook & { isWithDtoReadHook: () => boolean }

/**
 * This hook applies the first DTO in the array that matches the condition to the document, or the DTO without a condition if no other DTO matches the condition.
 * @param dtos - The array of DTOs to apply to the document
 * @returns The afterReadHook function that to be used in the collection config
 */
export const withDtoReadHook = (dtos: Dtos) => {
    const afterReadHook: afterReadHook = async (args) => {
        const { doc, req, } = args
        if (req.payloadAPI === 'local') return doc; // requests from local payload api don't require DTOs

        const dtoToApply = dtos.find(rule => rule.condition?.(args) ?? true)
        if (dtoToApply) return transformAndValidate(dtoToApply.dto, doc)

        return null
    }

    afterReadHook.isWithDtoReadHook = () => true; // sub function to check if the hook uses withDtoReadHook
    return afterReadHook;
}