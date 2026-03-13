import { Middleware } from "../middleware";
import pino from "pino";

const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    process.env.NODE_ENV !== "production"
      ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname",
          messageFormat: "{msg} {req.method} {req.url} {res.statusCode}",
          singleLine: true,
        },
      }
      : undefined,
});

const httpLogger = logger.child({ module: "http" });

const methodEmoji: Record<string, string> = {
  GET: "📥",
  POST: "📤",
  PUT: "📝",
  DELETE: "🗑️",
  PATCH: "🔧",
  OPTIONS: "⚙️",
};

export function createLoggerMiddleware(): Middleware {
  return async (ctx, next) => {
    const start = Date.now();

    const requestId = crypto.randomUUID().slice(0, 8);
    ctx.res.setHeader("X-Request-ID", requestId);

    const reqLogger = httpLogger.child({
      requestId,
      method: ctx.method,
      path: ctx.pathname,
    });

    try {
      await next();

      const duration = Date.now() - start;
      const source = ctx.res.getHeader("X-MIGUE") ? "MOCK" : "API";
      const status = ctx.res.statusCode;

      reqLogger.info({
        msg: `${methodEmoji[ctx.method] || "·"} ${ctx.method} ${ctx.pathname}`,
        duration,
        status,
        source,
      });

      if (duration > 500) {
        reqLogger.warn({
          msg: `🐢 Request lento`,
          duration,
          path: ctx.pathname,
          method: ctx.method,
        });
      }

      if (status >= 400) {
        reqLogger.error({
          msg: `❌ Request falhou`,
          status,
          duration,
          ...(status >= 500 && { stack: new Error().stack }),
        });
      }
    } catch (error) {
      const duration = Date.now() - start;

      reqLogger.error({
        msg: `🔥 Erro não tratado`,
        err: error,
        duration,
      });

      throw error;
    }
  };
}

export { logger };

export const createModuleLogger = (module: string) => logger.child({ module });
