import assert from 'assert';
import Rx from 'rx';
import simple from 'simple-mock';
import cookie from 'cookie_js';
import {createCookieDriver} from '../src/index';

describe('Cycle.js Cookie driver', function() {
    'use strict';
    const EmptyObservable$ = Rx.Observable.empty();
    var driver = null;

    beforeEach(() => {
        driver = createCookieDriver();
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
        const subject = new Rx.Subject();
        const cookieDriver = driver(subject);
        subject.onNext({
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
            cookieDriver.get('MyCookie').subscribe((result) => {
                assert.strictEqual(result, '321');
                done();
            });
        });

        it('and it changes', getChangesTestFactory(false));
        it('and ignore it changes', getChangesTestFactory(true));

        function getChangesTestFactory(onlyStartValue) {
            return function (done) {
                var cookieValue      = '321';
                var cookieGetCounter = 0;

                // delaying for simulate later value set
                const setNewValue$ = Rx.Observable.just({
                    key: 'MyCookie',
                    value: 'new-value'
                }).delay(10);

                simple.mock(cookie, 'get', (key) => {
                    assert.strictEqual(key, 'MyCookie');
                    return cookieValue;
                });
                simple.mock(cookie, 'set', (key, value) => {
                    cookieValue = value;
                });

                const cookieDriver   = driver(setNewValue$);
                const cookieChanges$ = cookieDriver.get(
                    'MyCookie',
                    onlyStartValue
                );
                if (!onlyStartValue) {
                    cookieChanges$.subscribe(result => {
                        cookieGetCounter++;
                        assert.strictEqual(result, cookieValue);
                        if (cookieGetCounter >= 2) {
                            done();
                        }
                    });
                } else {
                    cookieChanges$
                        .do(result => {
                            cookieGetCounter++;
                            assert.strictEqual(cookieGetCounter, 1, 'shoudnt be called twice');
                        })
                        .delay(25)
                        .subscribe(() => done());
                }
            };
        }
    });

    it('should get all cookie value by `.all()`', function (done) {
        simple.mock(cookie, 'all', () => ({
            'MyCookie': '321',
        }));
        const subject = new Rx.Subject();
        const cookieDriver = driver(subject);
        cookieDriver.all().subscribe((allCookies) => {
            assert.strictEqual(typeof allCookies, 'object');
            assert.strictEqual(allCookies.MyCookie, '321');
            done();
        });
    });
});
