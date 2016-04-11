import assert from 'assert'
import {createCookieDriver} from '../src/index'
import Rx from 'rx';

describe('Cycle.js Cookie driver', function() {
    var driver = null;

    beforeEach(() => {
        const EmptyObservable = Rx.Observable.empty();
        driver = createCookieDriver()(EmptyObservable);
    });

    it('should expose `get` and `all` api', function() {
        assert.strictEqual(typeof driver.all, 'function');
        assert.strictEqual(typeof driver.get, 'function');
    });
});
