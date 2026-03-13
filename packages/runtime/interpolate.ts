import { evaluateExpression } from "./TemplateRuntime";

const TEMPLATE_REGEX_GLOBAL = /\{\{(.+?)\}\}/g;
const TEMPLATE_REGEX_FULL = /^\s*\{\{(.+?)\}\}\s*$/;

export function interpolate(value: any, ctx: any): any {
  if (typeof value === "string") {
    const fullMatch = value.match(TEMPLATE_REGEX_FULL);
    if (fullMatch) {
      try {
        return evaluateExpression(fullMatch[1].trim(), ctx);
      } catch (err) {
        console.error("Erro ao avaliar template completo:", fullMatch[1], err);
        return value;
      }
    }

    return value.replace(TEMPLATE_REGEX_GLOBAL, (_, expr) => {
      try {
        const evalResult = evaluateExpression(expr.trim(), ctx);
        return String(evalResult);
      } catch (err) {
        console.error("Erro ao avaliar template parcial:", expr, err);
        return `{{${expr}}}`;
      }
    });
  }

  if (Array.isArray(value)) {
    return value.map((v) => interpolate(v, ctx));
  }

  if (typeof value === "object" && value !== null) {
    const result: any = {};
    for (const key of Object.keys(value)) {
      result[key] = interpolate(value[key], {
        ...ctx,
        ...result,
      });
    }
    return result;
  }

  return value;
}
