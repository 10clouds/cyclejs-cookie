import assert from 'assert'
import Rx from 'rx'
import simple from 'simple-mock'
import cookie from 'cookie_js'
import {createCookieDriver} from '../src/index'

describe('Cycle.js Cookie driver', function() {
    const EmptyObservable = Rx.Observable.empty();
    var driver = null;

    beforeEach(() => {
        driver = createCookieDriver();
    });

    afterEach(() => {
        simple.restore();
    });

    it('should expose `get` and `all` api', function() {
        assert.strictEqual(typeof driver(EmptyObservable).all, 'function');
        assert.strictEqual(typeof driver(EmptyObservable).get, 'function');
    });

    it('should set cookie value', function(done) {
        simple.mock(cookie, 'set', (key, val) => {
            assert.strictEqual(key, 'MyCookie');
            assert.strictEqual(val, '321');
            done();
        });
        const subject = new Rx.Subject();
        const cookieDriver = driver(subject);
        subject.onNext({
            'key': 'MyCookie',
            'value': '321'
        });
    });

    it('should get cookie value', function(done) {
        simple.mock(cookie, 'get', (key) => {
            assert.strictEqual(key, 'MyCookie');
            return '321';
        });
        const cookieDriver = driver(EmptyObservable);
        cookieDriver.get('MyCookie').subscribe((result) => {
            assert.strictEqual(result, '321');
            done();
        })
    });
});
