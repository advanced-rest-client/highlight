import { assert } from '@open-wc/testing';
import Logger from '../../src/md-editor/Logger.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('Logger', () => {
  let origConsoleFn;
  let consoleCount = 0;

  function wrap(name) {
    origConsoleFn = console[name];
    console[name] = () => { consoleCount += 1; };
  }

  function unwrap(name) {
    console[name] = origConsoleFn;
    origConsoleFn = undefined;
    consoleCount = 0;
  }
  
  describe('assert()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('assert');
    });

    after(() => {
      unwrap('assert');
    })

    it('does not call the console function', () => {
      logger.assert(true);
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.assert(true);
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('clear()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('clear');
    });

    after(() => {
      unwrap('clear');
    })

    it('does not call the console function', () => {
      logger.clear();
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.clear();
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('count()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('count');
    });

    after(() => {
      unwrap('count');
    })

    it('does not call the console function', () => {
      logger.count('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.count('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('countReset()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('countReset');
    });

    after(() => {
      unwrap('countReset');
    })

    it('does not call the console function', () => {
      logger.countReset('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.countReset('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('debug()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('debug');
    });

    after(() => {
      unwrap('debug');
    })

    it('does not call the console function', () => {
      logger.debug('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.debug('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('dir()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('dir');
    });

    after(() => {
      unwrap('dir');
    })

    it('does not call the console function', () => {
      logger.dir('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.dir('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('dirxml()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('dirxml');
    });

    after(() => {
      unwrap('dirxml');
    })

    it('does not call the console function', () => {
      logger.dirxml('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.dirxml('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('error()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('error');
    });

    after(() => {
      unwrap('error');
    })

    it('does not call the console function', () => {
      logger.error('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.error('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('group()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('group');
    });

    after(() => {
      unwrap('group');
    })

    it('does not call the console function', () => {
      logger.group('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.group('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('groupCollapsed()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('groupCollapsed');
    });

    after(() => {
      unwrap('groupCollapsed');
    })

    it('does not call the console function', () => {
      logger.groupCollapsed('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.groupCollapsed('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('groupEnd()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('groupEnd');
    });

    after(() => {
      unwrap('groupEnd');
    })

    it('does not call the console function', () => {
      logger.groupEnd('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.groupEnd('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('info()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('info');
    });

    after(() => {
      unwrap('info');
    })

    it('does not call the console function', () => {
      logger.info('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.info('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('log()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('log');
    });

    after(() => {
      unwrap('log');
    })

    it('does not call the console function', () => {
      logger.log('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.log('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('profile()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('profile');
    });

    after(() => {
      unwrap('profile');
    })

    it('does not call the console function', () => {
      logger.profile('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.profile('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('profileEnd()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('profileEnd');
    });

    after(() => {
      unwrap('profileEnd');
    })

    it('does not call the console function', () => {
      logger.profileEnd('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.profileEnd('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('table()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('table');
    });

    after(() => {
      unwrap('table');
    })

    it('does not call the console function', () => {
      logger.table('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.table('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('time()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('time');
    });

    after(() => {
      unwrap('time');
    })

    it('does not call the console function', () => {
      logger.time('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.time('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('timeEnd()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('timeEnd');
    });

    after(() => {
      unwrap('timeEnd');
    })

    it('does not call the console function', () => {
      logger.timeEnd('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.timeEnd('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('timeLog()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('timeLog');
    });

    after(() => {
      unwrap('timeLog');
    })

    it('does not call the console function', () => {
      logger.timeLog('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.timeLog('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('timeStamp()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('timeStamp');
    });

    after(() => {
      unwrap('timeStamp');
    })

    it('does not call the console function', () => {
      logger.timeStamp('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.timeStamp('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('trace()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('trace');
    });

    after(() => {
      unwrap('trace');
    })

    it('does not call the console function', () => {
      logger.trace('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.trace('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
  
  describe('warn()', () => {
    /** @type Logger */
    let logger;

    before(() => {
      logger = new Logger();
      wrap('warn');
    });

    after(() => {
      unwrap('warn');
    })

    it('does not call the console function', () => {
      logger.warn('a');
      assert.equal(consoleCount, 0, 'the console was not called');
    });

    it('calls the console function', () => {
      logger.enabled = true;
      logger.warn('a');
      assert.equal(consoleCount, 1, 'the console was called');
    });
  });
});
