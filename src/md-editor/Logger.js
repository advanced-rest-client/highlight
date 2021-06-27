/* eslint-disable no-console */
export const enabledValue = Symbol('enabledValue');

export default class Logger {

  get enabled() {
    return typeof this[enabledValue] !== 'boolean' ? false : this[enabledValue];
  }

  /**
   * @param {boolean} value Enables / disabled the logger.
   */
  set enabled(value) {
    let local = value;
    if (typeof local !== 'boolean') {
      local = Boolean(value);
    }
    this[enabledValue] = local;
  }

  /**
   * @param {...any} args
   */
  assert(...args) {
    if (!this.enabled) {
      return;
    }
    console.assert.apply(console.assert, args);
  }

  clear() {
    if (!this.enabled) {
      return;
    }
    console.clear();
  }

  /**
   * @param {...any} args
   */
  count(...args) {
    if (!this.enabled) {
      return;
    }
    console.count.apply(console.count, args);
  }

  /**
   * @param {...any} args
   */
  countReset(...args) {
    if (!this.enabled) {
      return;
    }
    console.countReset.apply(console.countReset, args);
  }
  
  /**
   * @param {...any} args
   */
  debug(...args) {
    if (!this.enabled) {
      return;
    }
    console.debug.apply(console.debug, args);
  }
  
  /**
   * @param {...any} args
   */
  dir(...args) {
    if (!this.enabled) {
      return;
    }
    console.dir.apply(console.dir, args);
  }

  /**
   * @param {...any} args
   */
  dirxml(...args) {
    if (!this.enabled) {
      return;
    }
    console.dirxml.apply(console.dirxml, args);
  }

  /**
   * @param {...any} args
   */
  error(...args) {
    if (!this.enabled) {
      return;
    }
    console.error.apply(console.error, args);
  }

  /**
   * @param {...any} args
   */
  group(...args) {
    if (!this.enabled) {
      return;
    }
    console.group.apply(console.group, args);
  }

  /**
   * @param {...any} args
   */
  groupCollapsed(...args) {
    if (!this.enabled) {
      return;
    }
    console.groupCollapsed.apply(console.groupCollapsed, args);
  }

  /**
   * @param {...any} args
   */
  groupEnd(...args) {
    if (!this.enabled) {
      return;
    }
    console.groupEnd.apply(console.groupEnd, args);
  }

  /**
   * @param {...any} args
   */
  info(...args) {
    if (!this.enabled) {
      return;
    }
    console.info.apply(console.info, args);
  }

  /**
   * @param {...any} args
   */
  log(...args) {
    if (!this.enabled) {
      return;
    }
    console.log.apply(console.log, args);
  }
  
  /**
   * @param {...any} args
   */
  profile(...args) {
    if (!this.enabled) {
      return;
    }
    console.profile.apply(console.profile, args);
  }

  /**
   * @param {...any} args
   */
  profileEnd(...args) {
    if (!this.enabled) {
      return;
    }
    console.profileEnd.apply(console.profileEnd, args);
  }
  
  /**
   * @param {...any} args
   */
  table(...args) {
    if (!this.enabled) {
      return;
    }
    console.table.apply(console.table, args);
  }
  
  /**
   * @param {...any} args
   */
  time(...args) {
    if (!this.enabled) {
      return;
    }
    console.time.apply(console.time, args);
  }

  /**
   * @param {...any} args
   */
  timeEnd(...args) {
    if (!this.enabled) {
      return;
    }
    console.timeEnd.apply(console.timeEnd, args);
  }

  /**
   * @param {...any} args
   */
  timeLog(...args) {
    if (!this.enabled) {
      return;
    }
    console.timeLog.apply(console.timeLog, args);
  }

  /**
   * @param {...any} args
   */
  timeStamp(...args) {
    if (!this.enabled) {
      return;
    }
    console.timeStamp.apply(console.timeStamp, args);
  }

  /**
   * @param {...any} args
   */
  trace(...args){
    if (!this.enabled) {
      return;
    }
    console.trace.apply(console.trace, args);
  }

  /**
   * @param {...any} args
   */
  warn(...args) {
    if (!this.enabled) {
      return;
    }
    console.warn.apply(console.warn, args);
  }
}
