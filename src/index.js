import xs from 'xstream';
import {cookie} from 'cookie_js';

export function makeCookieDriver({decode = null} = {}) {
    'use strict';

    if (decode) {
        cookie.utils.decode = decode;
    }

    const changesSubject$ = new xs.never();

    const noop = () => undefined;
    const err = console.error.bind(console);

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
            .addListener({
                next: cookieSettings => cookie.remove(cookieSettings.key),
                error: err,
                complete: noop,
            });
    }

    function handleSetCookie(sink$) {
        sink$
            .filter(cookieSettings => cookieSettings.value !== undefined)
            .addListener({
                next: cookieSettings =>
                    cookie.set(
                        cookieSettings.key,
                        cookieSettings.value,
                        cookieSettings.settings
                    ),
                error: err,
                complete: noop,
            });
    }

    function handleCookieUpdateSubject(sink$) {
        sink$.addListener({
            next: (val) => changesSubject$.shamefullySendNext(val.key),
            error: (err) => changesSubject$.shamefullySendError(err),
            complete: () => changesSubject$.shamefullySendComplete()
        });
    }

    function getCookie(cookieName) {
        return xs.merge(xs.of(cookieName), changesSubject$)
                .filter((name) => name === cookieName)
                .map(
                    () => cookie.get(cookieName)
                );
    }

    function getAllCookies() {
        return xs.merge(xs.of(null), changesSubject$)
                .map(
                    () => cookie.all()
                );
    }
}
