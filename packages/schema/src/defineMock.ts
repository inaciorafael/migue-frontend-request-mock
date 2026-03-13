import { TemplateHelpers } from "../../runtime/helpers.ts";
import { MockRule } from "./mockRule.ts";

type ExtractParamNames<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractParamNames<`/${Rest}`>
  : Path extends `${string}:${infer Param}`
  ? Param
  : never;

type ParamsFromPath<Path extends string> = {
  [K in ExtractParamNames<Path>]: string;
};

export type RuntimeCtx<Q = {}, P = {}> = TemplateHelpers & {
  params: P;
  query: Q;
  body: any;
};

export type TsMockRule<M extends { path: string; query?: any }> = Omit<
  MockRule,
  "response" | "error"
> & {
  response: (
    ctx: TemplateHelpers & {
      params: ParamsFromPath<M["path"]>;
      query: M["query"] extends object ? M["query"] : {};
      body: any;
    },
  ) => MockRule["response"];

  error?: (
    ctx: TemplateHelpers & {
      params: ParamsFromPath<M["path"]>;
      query: M["query"] extends object ? M["query"] : {};
      body: any;
    },
  ) => MockRule["error"];
};

export function defineMock<const M extends { path: string; query?: any }>(
  rule: TsMockRule<M> & { match: M },
) {
  return rule;
}

export function defineMocks<
  const T extends readonly (TsMockRule<any> & { match: any })[]
>(rules: [...T]) {
  return rules;
}
