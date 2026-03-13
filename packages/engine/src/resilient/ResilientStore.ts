import fs from "fs";
import path from "path";

interface Snapshot {
  status: number;
  headers: Record<string, any>;
  body: any;
  timestamp: number;
}

export class ResilientStore {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve("mocks/__resilient__");

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private buildFilename(method: string, url: string): string {
    const safeUrl = url.replace(/[\/:?&=]/g, "_");

    return `${method}_${safeUrl}.json`;
  }

  private getFilePath(method: string, url: string): string {
    return path.join(this.baseDir, this.buildFilename(method, url));
  }

  public save(method: string, url: string, snapshot: Snapshot): void {
    const filePath = this.getFilePath(method, url);

    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf-8");
  }

  public load(method: string, url: string): Snapshot | null {
    const filePath = this.getFilePath(method, url);

    if (!fs.existsSync(filePath)) return null;

    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
}
