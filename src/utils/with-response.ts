import { PayloadRequest } from "payload";
import { Dto } from "../types/dto";
import { NextResponse } from "next/server";

type ResponseObject =
  | {
      response: Dto;
      status?: number;
    }
  | {
      message: string;
      status?: number;
    };

/**
 * This hook is used to wrap the handler function and return a response object with a dto or a message
 * @param handler - The handler function to wrap
 * @returns The handler function
 */
export const withResponse = (
  handler: (req: PayloadRequest) => Promise<ResponseObject>
) => {
  const withResponse = async (req: PayloadRequest) => {
    const responseObject = await handler(req);

    if ("message" in responseObject)
      return NextResponse.json(
        { message: responseObject.message },
        { status: responseObject.status }
      ); // message response does not require a dto

    if (!(responseObject.response instanceof Dto))
      throw new Error("Response is not an instance of Dto");

    return NextResponse.json<Dto>(responseObject.response, {
      status: responseObject.status ?? 200,
    });
  };
  withResponse.isWithResponse = () => true; // sub function to check if the endpoint uses withResponse
  return withResponse;
};
