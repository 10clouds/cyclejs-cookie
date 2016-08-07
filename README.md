
# Cycle JS Cookie Driver

[Cycle.js](https://github.com/staltz/cycle) Cookie Driver, based on [cookie_js](https://www.npmjs.com/package/cookie_js) library.

## Install
```shell
$ npm install --save cyclejs-cookie xstream
```

## Usage

``` javascript
import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeCookieDriver} from 'cyclejs-cookie';

function main({cookie}) {
    const cookieChangeSource$ = xs.periodic(1000);

    const cookieValue$ = cookie.get('MyCookie');

    // just for print debug
    const noop = () => undefined;
    cookieValue$.debug('cookie current value').addListener({
        next: noop,
        error: noop,
        complete: noop,
    });

    return {
        cookie: cookieChangeSource$.map((counter) => ({
            key: 'MyCookie',
            value: 'cookieValue-' + counter,
            settings: {
                expires: 30, // expiring in 30 days
            }
        }))
    };
};

run(main, {
    cookie: makeCookieDriver()
});
```

## Api
 Library export only one function: `makeCookieDriver`

## makeCookieDriver(options = {}}
 Instantiates an new cookie driver function ([cookieDriver(sink$)](#cookiedriversink)).
 
#### options
 - `decode` - set `cookie.decode` attribute, check [cookie_js](https://github.com/florian/cookie.js#a-word-on-encoding) documentation for details.

## cookieDriver(sink$)
 `$sink` - driver assumes that sink$ is stream of [_cookie setter objects_](#cookie-setter-object). it interprete _cookie setter object_ and set new cookie (or delete if cookie value is undefined).

 Returning cookies observables functions object `{get(), all()}`.
 - `get(cookieName)` - returning stream of cookie `cookieName` changes, initiated by current cookie value
 - `all()` - returning stream of all cookies object changes, initiated by starting cookies object
 
## cookie setter object
 Driver assumes following objects on it $sink:
 ```js
 {
   key: 'cookieName',
   value: 'cookieValue', // if undefined, cookie will be deleted
   options: {..}
 }
 ```
 Options is cookie settings, like expires time.
 By [cookie_js documentation](https://github.com/florian/cookie.js):
 
The following fields can be added to the mentioned object:

| key | value | default value |
|:--|:--|:--|
| `expires` |  Either a `number` containing the days until the expiry, a date in the `GMTString` format or a `date object`. | Expires when the browser is closed. |
| `domain` |  A `string` that specifies the domain that can access the cookie. | The current domain. |
| `path` | A `string` that limits the access of the cookie to that path. | The current path. |
| `secure` | A `boolean` indicating whether the cookie shall only be accessable over a secure connection or not. | `false` |
