import getRawBody from "raw-body";
import { HttpMethod, HttpMethods } from "./http";
import { RequestContext } from "./RequestContext";

export async function createRequestContext(
  req: any,
  res: any,
): Promise<RequestContext> {
  const rawBody = await getRawBody(req).catch(() => Buffer.from(""));

  let parsedBody: unknown = {};

  if (rawBody.length) {
    try {
      parsedBody = JSON.parse(rawBody.toString());
    } catch {
      parsedBody = rawBody.toString();
    }
  }

  const url = new URL(req.url!, "http://localhost");
  const query = Object.fromEntries(url.searchParams.entries());

  const method = (req.method || "GET") as HttpMethod;

  if (!HttpMethods.includes(method)) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  return {
    method,
    pathname: url.pathname,
    query,
    headers: req.headers,
    body: parsedBody,
    rawBody,
    url,
    req,
    res,
  };
}
