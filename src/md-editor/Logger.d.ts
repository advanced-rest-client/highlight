export default class Logger {
  /**
   * Enables / disabled the logger.
   */
  enabled: boolean;
  assert(...args: any): void;
  clear(): void;
  count(...args: any): void;
  countReset(...args: any): void;
  debug(...args: any): void;
  dir(...args: any): void;
  dirxml(...args: any): void;
  error(...args: any): void;
  group(...args: any): void;
  groupCollapsed(...args: any): void;
  groupEnd(...args: any): void;
  info(...args: any): void;
  log(...args: any): void;
  profile(...args: any): void;
  profileEnd(...args: any): void;
  table(...args: any): void;
  time(...args: any): void;
  timeEnd(...args: any): void;
  timeLog(...args: any): void;
  timeStamp(...args: any): void;
  trace(...args: any): void;
  warn(...args: any): void;
}
