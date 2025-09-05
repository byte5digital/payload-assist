import { Access, PayloadRequest } from "payload";

/**
 * Missing type for payload collections access control
 * @see https://payloadcms.com/docs/access-control/overview
 */
export type AccessControl = {
  admin?: ({ req }: { req: PayloadRequest }) => boolean | Promise<boolean>;
  create?: Access;
  delete?: Access;
  read?: Access;
  readVersions?: Access;
  unlock?: Access;
  update?: Access;
};
