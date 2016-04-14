import Rx from 'rx';
import cookie from 'cookie_js';

export function makeCookieDriver({decode = null} = {}) {
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

    function getCookie(cookieName) {
        return Rx.Observable.just(cookieName)
                .merge(changesSubject$)
                .filter((name) => name === cookieName)
                .map(
                    () => cookie.get(cookieName)
                );
    }

    function getAllCookies() {
        return Rx.Observable.just()
                .merge(changesSubject$)
                .map(
                    () => cookie.all()
                );
    }
}
