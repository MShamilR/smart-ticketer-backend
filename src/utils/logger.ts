import winston, { error } from "winston";

const {
  align,
  json,
  combine,
  colorize,
  timestamp,
  errors,
  prettyPrint,
  printf,
} = winston.format;

const customFormat = combine(
  colorize(),
  json(),
  //align(),
  timestamp({
    format: "YYYY-MM-DD hh:mm:ss A",
  }),
  prettyPrint(),
  errors({ stack: true }),

  printf(
    ({ level, message, timestamp, service, stack, type, code, ...meta }) => {
      const error = stack
        ? `${message}\n[type: ${type}] [code: ${code}]\n${stack}`
        : "";
      return `${timestamp} [${level}] [${service}] ${
        error || message
      } [${JSON.stringify(meta)}]`;
    }
  )
);

const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: "info",
    format: customFormat,
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: customFormat,
      }),
    ],
  });
};

export default createLogger;
