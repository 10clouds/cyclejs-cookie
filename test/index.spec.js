import assert from 'assert';
import xs from 'xstream';
import delay from 'xstream/extra/delay'
import simple from 'simple-mock';
import {cookie} from 'cookie_js';
import {makeCookieDriver} from '../src/index';

describe('Cycle.js Cookie driver', function() {
    'use strict';
    const EmptyObservable$ = xs.empty();
    var driver = null;
    const noop = () => undefined;

    beforeEach(() => {
        driver = makeCookieDriver();
    });

    afterEach(() => {
        simple.restore();
    });

    it('should expose `get` and `all` api', function() {
        assert.strictEqual(typeof driver(EmptyObservable$).all, 'function');
        assert.strictEqual(typeof driver(EmptyObservable$).get, 'function');
    });

    it('should set cookie value', function(done) {
        simple.mock(cookie, 'set', (key, val) => {
            assert.strictEqual(key, 'MyCookie');
            assert.strictEqual(val, '321');
            done();
        });
        const subject = new xs.never();
        const cookieDriver = driver(subject);
        subject.shamefullySendNext({
            'key': 'MyCookie',
            'value': '321'
        });
    });

    describe('should get cookie value', function () {
        it('simple', function (done) {
            simple.mock(cookie, 'get', (key) => {
                assert.strictEqual(key, 'MyCookie');
                return '321';
            });
            const cookieDriver = driver(EmptyObservable$);
            cookieDriver.get('MyCookie').addListener({
                next: (result) => {
                    assert.strictEqual(result, '321');
                    done();
                },
                error: noop,
                complete: noop
            });
        });

        it('and it changes', function (done) {
            var cookieValue      = '321';
            var cookieGetCounter = 0;

            // delaying for simulate later value set
            const setNewValue$ = xs.periodic(10).take(1).map(() => ({
                key: 'MyCookie',
                value: 'new-value'
            }));

            simple.mock(cookie, 'get', (key) => {
                assert.strictEqual(key, 'MyCookie');
                return cookieValue;
            });
            simple.mock(cookie, 'set', (key, value) => {
                cookieValue = value;
            });

            const cookieDriver   = driver(setNewValue$);
            const cookieChanges$ = cookieDriver.get('MyCookie');

            cookieChanges$.addListener({
                next: result => {
                    cookieGetCounter++;
                    assert.strictEqual(result, cookieValue);
                    if (cookieGetCounter >= 2) {
                        done();
                    }
                },
                error: noop,
                complete: noop
            });
        });
    });


    it('should get all cookie value by `.all()`', function (done) {
        simple.mock(cookie, 'all', () => ({
            'MyCookie': '321',
        }));
        const cookieDriver = driver(EmptyObservable$);
        cookieDriver.all().addListener({
            next: (allCookies) => {
                assert.strictEqual(typeof allCookies, 'object');
                assert.strictEqual(allCookies.MyCookie, '321');
                done();
            },
            error: (noop),
            complete: noop
        });
    });

    it('should remove cookie when value set to undefined', function (done) {
        simple.mock(cookie, 'remove', (key) => {
            assert.strictEqual(key, 'MyCookie');
            done();
        });

        // delaying for simulate later value set
        const setEmptyValue$ = xs.periodic(10).take(1).map(() => ({
            key: 'MyCookie',
            value: undefined
        }));

        const cookieDriver = driver(setEmptyValue$);
    });
});
