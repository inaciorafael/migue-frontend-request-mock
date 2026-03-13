import { HttpMethod } from "./http";

export interface RequestContext {
  method: HttpMethod;
  pathname: string;
  query: Record<string, string>;
  headers: Record<string, any>;
  body: unknown;
  rawBody: Buffer;
  url: URL;

  req: any;
  res: any;
}
