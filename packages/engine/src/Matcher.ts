import { match } from "path-to-regexp";
import { MockRule } from "../../schema/src";

export function findMatchingRule(
  rules: MockRule[],
  method: string,
  pathname: string,
  query: any,
  body: any,
): {
  rule: MockRule;
  params: Record<string, any>;
  query: Record<string, any>;
} | null {
  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (rule.match.method.toUpperCase() !== method.toUpperCase()) {
      continue;
    }

    const matcher = match(rule.match.path, { decode: decodeURIComponent });
    const pathMatch = matcher(pathname);

    if (!pathMatch) continue;

    if (rule.match.query) {
      const allMatch = Object.entries(rule.match.query).every(
        ([key, value]) => String(query[key]) === String(value),
      );
      if (!allMatch) continue;
    }

    if (rule.match.body) {
      const allMatch = Object.entries(rule.match.body).every(
        ([key, value]) => body[key] === value,
      );
      if (!allMatch) continue;
    }

    return { rule, params: pathMatch.params, query: query };
  }

  return null;
}
