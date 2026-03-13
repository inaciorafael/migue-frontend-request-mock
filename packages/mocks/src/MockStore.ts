import chokidar from "chokidar";
import fg from "fast-glob";
import { pathToFileURL } from "url";
import { TsMockRule } from "../../schema/src/defineMock";

export class MockStore {
  private rules: TsMockRule[] = [];
  private mocksPath: string;

  constructor(mocksPath: string) {
    this.mocksPath = mocksPath;
    this.load();
    this.watch();
  }

  async load() {
    try {
      const files = await fg("**/*.mock.ts", {
        cwd: this.mocksPath,
        absolute: true,
      });

      const allRules: TsMockRule[] = [];

      for (const file of files) {
        const modulePath = await import(pathToFileURL(file).href + `?update=${Date.now()}`);
        const exported = modulePath.default;

        if (Array.isArray(exported)) {
          allRules.push(...exported);
        } else {
          allRules.push(exported);
        }
      }

      this.rules = allRules;
      console.log("[MIGUÉ] Mocks TS carregados:", this.rules.length);
    } catch (err) {
      console.error("[MIGUÉ] Erro ao carregar mocks:", err);
      this.rules = [];
    }
  }

  watch() {
    chokidar.watch(this.mocksPath).on("change", () => {
      console.log("[MIGUÉ] mock alterado, recarregando...");
      this.load();
    });
  }

  getRules() {
    return this.rules;
  }
}
