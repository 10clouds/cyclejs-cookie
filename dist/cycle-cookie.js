(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeCookieDriver = makeCookieDriver;

var _xstream = (typeof window !== "undefined" ? window['xstream'] : typeof global !== "undefined" ? global['xstream'] : null);

var _xstream2 = _interopRequireDefault(_xstream);

var _cookie_js = (typeof window !== "undefined" ? window['cookie'] : typeof global !== "undefined" ? global['cookie'] : null);

var _cookie_js2 = _interopRequireDefault(_cookie_js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeCookieDriver() {
    'use strict';

    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$decode = _ref.decode;
    var decode = _ref$decode === undefined ? null : _ref$decode;
    if (decode) {
        _cookie_js2.default.utils.decode = decode;
    }

    var changesSubject$ = new _xstream2.default.never();
    var noop = function noop() {
        return undefined;
    };

    return function cookieDriver(sink$) {
        handleRemoveCookie(sink$);
        handleSetCookie(sink$);
        handleCookieUpdateSubject(sink$);

        return {
            get: getCookie,
            all: getAllCookies
        };
    };

    function handleRemoveCookie(sink$) {
        sink$.filter(function (cookieSettings) {
            return cookieSettings.value === undefined;
        }).addListener({
            next: function next(cookieSettings) {
                return _cookie_js2.default.remove(cookieSettings.key);
            },
            error: noop,
            complete: noop
        });
    }

    function handleSetCookie(sink$) {
        sink$.filter(function (cookieSettings) {
            return cookieSettings.value !== undefined;
        }).addListener({
            next: function next(cookieSettings) {
                return _cookie_js2.default.set(cookieSettings.key, cookieSettings.value, cookieSettings.settings);
            },
            error: noop,
            complete: noop
        });
    }

    function handleCookieUpdateSubject(sink$) {
        sink$.addListener({
            next: function next(val) {
                return changesSubject$.shamefullySendNext(val.key);
            },
            error: function error(err) {
                return changesSubject$.shamefullySendError(err);
            },
            complete: function complete() {
                return changesSubject$.shamefullySendComplete();
            }
        });
    }

    function getCookie(cookieName) {
        return _xstream2.default.merge(_xstream2.default.of(cookieName), changesSubject$).filter(function (name) {
            return name === cookieName;
        }).map(function () {
            return _cookie_js2.default.get(cookieName);
        });
    }

    function getAllCookies() {
        return _xstream2.default.merge(_xstream2.default.of(null), changesSubject$).map(function () {
            return _cookie_js2.default.all();
        });
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
