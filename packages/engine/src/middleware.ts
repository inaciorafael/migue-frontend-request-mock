import { RequestContext } from "./RequestContext";

export type NextFunction = () => Promise<void>;

export type Middleware = (
  ctx: RequestContext,
  next: NextFunction,
) => Promise<void>;
