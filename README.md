
# Cycle JS Cookie Driver

[Cycle.js](https://github.com/staltz/cycle) Cookie Driver, based on [cookie_js](https://www.npmjs.com/package/cookie_js) library.

##Usage

``` javascript
import Cycle from '@cycle/core';
import {makeCookieDriver} from 'cyclejs-cookie';

function main({cookie}) {
    const cookieChangeSource$ = Rx.Observable.interval(1000);

    const cookieValue$ = cookie.get('MyCookie');
    cookieValue$.subscribe(
        (value) => console.log(`MyCookie current value is ${value}`)
    );

    return {
        cookie: cookieChangeSource$.map((counter) => ({
            key: 'MyCookie',
            value: 'cookieValue-' + counter
        }))
    };
};

Cycle.run(main, {
    cookie: makeCookieDriver()
});
```
