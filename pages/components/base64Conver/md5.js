let Md5Utils = function(n) {
    "use strict";
    function t(n, t) {
        var r = (65535 & n) + (65535 & t);
        return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r
    }
    function r(n, r, e, u, o, c) {
        return t((f = t(t(r, n), t(u, c))) << (i = o) | f >>> 32 - i, e);
        var f, i
    }
    function e(n, t, e, u, o, c, f) {
        return r(t & e | ~t & u, n, t, o, c, f)
    }
    function u(n, t, e, u, o, c, f) {
        return r(t & u | e & ~u, n, t, o, c, f)
    }
    function o(n, t, e, u, o, c, f) {
        return r(t ^ e ^ u, n, t, o, c, f)
    }
    function c(n, t, e, u, o, c, f) {
        return r(e ^ (t | ~u), n, t, o, c, f)
    }
    function f(n, r) {
        var f, i, a, h, l;
        n[r >> 5] |= 128 << r % 32,
        n[14 + (r + 64 >>> 9 << 4)] = r;
        var d = 1732584193
          , g = -271733879
          , v = -1732584194
          , s = 271733878;
        for (f = 0; f < n.length; f += 16)
            i = d,
            a = g,
            h = v,
            l = s,
            d = e(d, g, v, s, n[f], 7, -680876936),
            s = e(s, d, g, v, n[f + 1], 12, -389564586),
            v = e(v, s, d, g, n[f + 2], 17, 606105819),
            g = e(g, v, s, d, n[f + 3], 22, -1044525330),
            d = e(d, g, v, s, n[f + 4], 7, -176418897),
            s = e(s, d, g, v, n[f + 5], 12, 1200080426),
            v = e(v, s, d, g, n[f + 6], 17, -1473231341),
            g = e(g, v, s, d, n[f + 7], 22, -45705983),
            d = e(d, g, v, s, n[f + 8], 7, 1770035416),
            s = e(s, d, g, v, n[f + 9], 12, -1958414417),
            v = e(v, s, d, g, n[f + 10], 17, -42063),
            g = e(g, v, s, d, n[f + 11], 22, -1990404162),
            d = e(d, g, v, s, n[f + 12], 7, 1804603682),
            s = e(s, d, g, v, n[f + 13], 12, -40341101),
            v = e(v, s, d, g, n[f + 14], 17, -1502002290),
            d = u(d, g = e(g, v, s, d, n[f + 15], 22, 1236535329), v, s, n[f + 1], 5, -165796510),
            s = u(s, d, g, v, n[f + 6], 9, -1069501632),
            v = u(v, s, d, g, n[f + 11], 14, 643717713),
            g = u(g, v, s, d, n[f], 20, -373897302),
            d = u(d, g, v, s, n[f + 5], 5, -701558691),
            s = u(s, d, g, v, n[f + 10], 9, 38016083),
            v = u(v, s, d, g, n[f + 15], 14, -660478335),
            g = u(g, v, s, d, n[f + 4], 20, -405537848),
            d = u(d, g, v, s, n[f + 9], 5, 568446438),
            s = u(s, d, g, v, n[f + 14], 9, -1019803690),
            v = u(v, s, d, g, n[f + 3], 14, -187363961),
            g = u(g, v, s, d, n[f + 8], 20, 1163531501),
            d = u(d, g, v, s, n[f + 13], 5, -1444681467),
            s = u(s, d, g, v, n[f + 2], 9, -51403784),
            v = u(v, s, d, g, n[f + 7], 14, 1735328473),
            d = o(d, g = u(g, v, s, d, n[f + 12], 20, -1926607734), v, s, n[f + 5], 4, -378558),
            s = o(s, d, g, v, n[f + 8], 11, -2022574463),
            v = o(v, s, d, g, n[f + 11], 16, 1839030562),
            g = o(g, v, s, d, n[f + 14], 23, -35309556),
            d = o(d, g, v, s, n[f + 1], 4, -1530992060),
            s = o(s, d, g, v, n[f + 4], 11, 1272893353),
            v = o(v, s, d, g, n[f + 7], 16, -155497632),
            g = o(g, v, s, d, n[f + 10], 23, -1094730640),
            d = o(d, g, v, s, n[f + 13], 4, 681279174),
            s = o(s, d, g, v, n[f], 11, -358537222),
            v = o(v, s, d, g, n[f + 3], 16, -722521979),
            g = o(g, v, s, d, n[f + 6], 23, 76029189),
            d = o(d, g, v, s, n[f + 9], 4, -640364487),
            s = o(s, d, g, v, n[f + 12], 11, -421815835),
            v = o(v, s, d, g, n[f + 15], 16, 530742520),
            d = c(d, g = o(g, v, s, d, n[f + 2], 23, -995338651), v, s, n[f], 6, -198630844),
            s = c(s, d, g, v, n[f + 7], 10, 1126891415),
            v = c(v, s, d, g, n[f + 14], 15, -1416354905),
            g = c(g, v, s, d, n[f + 5], 21, -57434055),
            d = c(d, g, v, s, n[f + 12], 6, 1700485571),
            s = c(s, d, g, v, n[f + 3], 10, -1894986606),
            v = c(v, s, d, g, n[f + 10], 15, -1051523),
            g = c(g, v, s, d, n[f + 1], 21, -2054922799),
            d = c(d, g, v, s, n[f + 8], 6, 1873313359),
            s = c(s, d, g, v, n[f + 15], 10, -30611744),
            v = c(v, s, d, g, n[f + 6], 15, -1560198380),
            g = c(g, v, s, d, n[f + 13], 21, 1309151649),
            d = c(d, g, v, s, n[f + 4], 6, -145523070),
            s = c(s, d, g, v, n[f + 11], 10, -1120210379),
            v = c(v, s, d, g, n[f + 2], 15, 718787259),
            g = c(g, v, s, d, n[f + 9], 21, -343485551),
            d = t(d, i),
            g = t(g, a),
            v = t(v, h),
            s = t(s, l);
        return [d, g, v, s]
    }
    function i(n) {
        var t, r = "", e = 32 * n.length;
        for (t = 0; t < e; t += 8)
            r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255);
        return r
    }
    function a(n) {
        var t, r = [];
        for (r[(n.length >> 2) - 1] = void 0,
        t = 0; t < r.length; t += 1)
            r[t] = 0;
        var e = 8 * n.length;
        for (t = 0; t < e; t += 8)
            r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32;
        return r
    }
    function h(n) {
        var t, r, e = "";
        for (r = 0; r < n.length; r += 1)
            t = n.charCodeAt(r),
            e += "0123456789abcdef".charAt(t >>> 4 & 15) + "0123456789abcdef".charAt(15 & t);
        return e
    }
    function l(n) {
        return unescape(encodeURIComponent(n))
    }
    function d(n) {
        return function(n) {
            return i(f(a(n), 8 * n.length))
        }(l(n))
    }
    function g(n, t) {
        return function(n, t) {
            var r, e, u = a(n), o = [], c = [];
            for (o[15] = c[15] = void 0,
            u.length > 16 && (u = f(u, 8 * n.length)),
            r = 0; r < 16; r += 1)
                o[r] = 909522486 ^ u[r],
                c[r] = 1549556828 ^ u[r];
            return e = f(o.concat(a(t)), 512 + 8 * t.length),
            i(f(c.concat(e), 640))
        }(l(n), l(t))
    }
    return {
        md5: function(n, t, r) {
            return t ? r ? g(t, n) : h(g(t, n)) : r ? d(n) : h(d(n))
        }
    }
}();
export default Md5Utils;
