import Rx from 'rx';
import cookie from 'cookie_js';

export function createCookieDriver({decode = null} = {}) {
    'use strict';

    if (decode) {
        cookie.utils.decode = decode;
    }
    var changesSubject$ = new Rx.Subject();

    return function cookieDriver(sink$) {
        handleRemoveCookie(sink$);
        handleSetCookie(sink$);
        handleCookieUpdateSubject(sink$);

        return {
            get: getCookie,
            all: getAllCookies,
        };
    };

    function handleRemoveCookie(sink$) {
        sink$
            .filter(cookieSettings => cookieSettings.value === undefined)
            .subscribe(cookieSettings => cookie.remove(cookieSettings.key));
    }

    function handleSetCookie(sink$) {
        sink$
            .filter(cookieSettings => cookieSettings.value !== undefined)
            .subscribe(cookieSettings =>
                cookie.set(
                    cookieSettings.key,
                    cookieSettings.value,
                    cookieSettings.settings
                )
            );
    }

    function handleCookieUpdateSubject(sink$) {
        sink$.subscribe(
            (val) => changesSubject$.onNext(val.key),
            (err) => changesSubject$.onError(err),
            () => changesSubject$.onCompleted()
        );
    }

    function getCookie(cookieName, onlyStartValue) {
        var cookieValue$ = Rx.Observable
                                .just(cookieName);
        if (!onlyStartValue) {
            cookieValue$ = cookieValue$
                .merge(changesSubject$)
                .filter((name) => name === cookieName);
        }
        return cookieValue$.map(
            () => cookie.get(cookieName)
        );
    }

    function getAllCookies(onlyStartValue) {
        var cookiesValue$ = Rx.Observable
                                .just();
        if (!onlyStartValue) {
            cookiesValue$ = cookiesValue$
                .merge(changesSubject$);
        }
        return cookiesValue$.map(
            () => cookie.all()
        );
    }
}
