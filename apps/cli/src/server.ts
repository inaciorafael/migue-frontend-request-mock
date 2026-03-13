import http from "http";
import { MigueEngine } from "../../../packages/engine/src";
import { MockStore } from "../../../packages/mocks/src";

function applyCors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function startServer(
  mocksPath: string,
  backend: string,
  port: number,
  resilient: boolean,
) {
  const store = new MockStore(mocksPath);
  const engine = new MigueEngine(store, {
    backend,
    resilient,
  });

  const server = http.createServer((req, res) => {
    applyCors(res);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    engine.handle(req, res);
  });

  server.listen(port, () => {
    if (port) {
      console.log(`🧉 MIGUÉ rodando em http://localhost:${port}`);
    }

    if (backend) {
      console.log(`🎯 Backend: ${backend}`);
    }

    if (resilient) {
      console.log("Resilent mode ativado");
    }

    console.log(`📂 Mocks: ${mocksPath}`);
  });
}
