import { env } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = env.LOG_LEVEL;

const shouldLog = (level: LogLevel) =>
  levelPriority[level] >= levelPriority[configuredLevel];

const serializeValue = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
};

const serializeMeta = (meta?: LogMeta) => {
  if (!meta) return undefined;
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [key, serializeValue(value)]),
  );
};

const writeLog = (level: LogLevel, message: string, meta?: LogMeta) => {
  if (!shouldLog(level)) return;

  const timestamp = new Date().toISOString();
  const serializedMeta = serializeMeta(meta);

  if (env.NODE_ENV === "production") {
    const payload = {
      timestamp,
      level,
      message,
      ...(serializedMeta || {}),
    };
    const line = JSON.stringify(payload);
    if (level === "error") {
      console.error(line);
      return;
    }
    if (level === "warn") {
      console.warn(line);
      return;
    }
    console.log(line);
    return;
  }

  const suffix = serializedMeta ? ` ${JSON.stringify(serializedMeta)}` : "";
  const line = `[${timestamp}] ${level.toUpperCase()} ${message}${suffix}`;

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
};

export const logger = {
  debug: (message: string, meta?: LogMeta) => writeLog("debug", message, meta),
  info: (message: string, meta?: LogMeta) => writeLog("info", message, meta),
  warn: (message: string, meta?: LogMeta) => writeLog("warn", message, meta),
  error: (message: string, meta?: LogMeta) => writeLog("error", message, meta),
};

