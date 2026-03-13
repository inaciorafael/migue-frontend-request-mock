import { MockRuleSchema, MockRule } from './mockRule'

export function parseMockRules(input: unknown): MockRule[] {
  if (!Array.isArray(input)) return [];

  return input.map((item) => MockRuleSchema.parse(item));
}
