#!/usr/bin/env node

import { Command } from "commander";
import { startServer } from "./server";

const program = new Command();

program
  .option("--mocks <path>", "Pasta dos mocks", '../../../mocks')
  .option("--backend <url>", "Backend real")
  .option("--port <number>", "Porta do servidor", "4321")
  .option("--resilient", "Resiliente mode", false);

program.parse();

const opts = program.opts();

startServer(opts.mocks, opts.backend, Number(opts.port), opts.resilient);
