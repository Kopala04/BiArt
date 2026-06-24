type LogLevel = "info" | "warn" | "error";

type LogPayload = Record<string, string | number | boolean | undefined>;

function write(level: LogLevel, event: string, payload: LogPayload = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    service: "media-upload",
    event,
    ...payload,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

export const mediaLogger = {
  info: (event: string, payload?: LogPayload) => write("info", event, payload),
  warn: (event: string, payload?: LogPayload) => write("warn", event, payload),
  error: (event: string, payload?: LogPayload) => write("error", event, payload),
};
