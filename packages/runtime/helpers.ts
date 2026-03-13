import { faker } from "@faker-js/faker";

type StateMap = Record<string, any>;
const state: StateMap = {};

interface WeightedOption<T> {
  value: T;
  chance: number;
}

export const templateHelpers = {
  pickWithProbability: <T>(options: WeightedOption<T>[]): T => {
    const totalChance = options.reduce((sum, opt) => sum + opt.chance, 0);

    if (Math.abs(totalChance - 100) > 0.01) {
      console.warn('Soma das chances não é 100:', totalChance);
    }

    const random = Math.random() * 100;
    let cumulative = 0;

    for (const option of options) {
      cumulative += option.chance;
      if (random < cumulative) {
        return option.value;
      }
    }

    return options[0].value;
  },
  uuid: () => crypto.randomUUID(),
  randomInt: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  randomBool: () => Math.random() < 0.5,

  arrayFrom: <T>(length: number, fn: (i: number) => T) =>
    Array.from({ length }, (_, i) => fn(i)),
  choice: <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)],

  setState: (key: string, value: any) => {
    state[key] = value;
    return value;
  },
  getState: (key: string, defaultValue?: any) =>
    key in state ? state[key] : defaultValue,

  faker,
};

export type TemplateHelpers = typeof templateHelpers;
