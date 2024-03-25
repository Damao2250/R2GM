import Md5Utils from "./md5.js";
let EncodeUtils = (()=>{
    let e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
      , r = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1]
      , t = function(e) {
        return {
            hexEncode: function(e) {
                let r = function(e, r) {
                    let t = []
                      , n = 0;
                    for (let r = 0; r < e.length; r++) {
                        let o = e.charCodeAt(r);
                        0 <= o && o <= 127 ? (n += 1,
                        t.push(o)) : 128 <= o && o <= 2047 ? (n += 2,
                        t.push(192 | 31 & o >> 6),
                        t.push(128 | 63 & o)) : (2048 <= o && o <= 55295 || 57344 <= o && o <= 65535) && (n += 3,
                        t.push(224 | 15 & o >> 12),
                        t.push(128 | 63 & o >> 6),
                        t.push(128 | 63 & o))
                    }
                    for (let e = 0; e < t.length; e++)
                        t[e] &= 255;
                    return r ? t : n <= 255 ? [0, n].concat(t) : [n >> 8, 255 & n].concat(t)
                }(e, !0)
                  , t = "";
                for (let e = 0; e < r.length; e++) {
                    let n = (255 & r[e]).toString(16);
                    1 === n.length && (n = "0" + n),
                    t += n
                }
                return t
            },
            hexDecode: function(e) {
                let r = [];
                for (let t = 0; t < e.length; t += 2)
                    r.push(parseInt(e.substring(t, t + 2), 16));
                return function(e) {
                    if ("string" == typeof e)
                        return e;
                    let r = ""
                      , t = e;
                    for (let e = 0; e < t.length; e++) {
                        let n = t[e].toString(2)
                          , o = n.match(/^1+?(?=0)/);
                        if (o && 8 === n.length) {
                            let n = o[0].length
                              , a = t[e].toString(2).slice(7 - n);
                            for (let r = 1; r < n; r++)
                                a += t[r + e].toString(2).slice(2);
                            r += String.fromCharCode(parseInt(a, 2)),
                            e += n - 1
                        } else
                            r += String.fromCharCode(t[e])
                    }
                    return r
                }(r)
            }
        }
    }();
    return {
        uniEncode: function(e) {
            let r = [];
            for (let t = 0; t < e.length; t++)
                r[t] = ("00" + e.charCodeAt(t).toString(16)).slice(-4);
            return "\\u" + r.join("\\u")
        },
        uniDecode: function(e) {
            e = e = e.replace(/(\\)?\\u/gi, "%u").replace("%u0025", "%25");
            let r = (e = unescape(e.toString().replace(/%2B/g, "+"))).match(/(%u00([0-9A-F]{2}))/gi);
            if (r)
                for (let t = 0; t < r.length; t++) {
                    let n = r[t].substring(1, 3);
                    Number("0x" + n) >= 128 && (e = e.replace(r[t], n))
                }
            return e = unescape(e.toString().replace(/%2B/g, "+"))
        },
        base64Encode: function(r) {
            let t, n, o, a, c, h;
            for (o = r.length,
            n = 0,
            t = ""; n < o; ) {
                if (a = 255 & r.charCodeAt(n++),
                n == o) {
                    t += e.charAt(a >> 2),
                    t += e.charAt((3 & a) << 4),
                    t += "==";
                    break
                }
                if (c = r.charCodeAt(n++),
                n == o) {
                    t += e.charAt(a >> 2),
                    t += e.charAt((3 & a) << 4 | (240 & c) >> 4),
                    t += e.charAt((15 & c) << 2),
                    t += "=";
                    break
                }
                h = r.charCodeAt(n++),
                t += e.charAt(a >> 2),
                t += e.charAt((3 & a) << 4 | (240 & c) >> 4),
                t += e.charAt((15 & c) << 2 | (192 & h) >> 6),
                t += e.charAt(63 & h)
            }
            return t
        },
        base64Decode: function(e) {
            let t, n, o, a, c, h, u;
            for (h = e.length,
            c = 0,
            u = ""; c < h; ) {
                do {
                    t = r[255 & e.charCodeAt(c++)]
                } while (c < h && -1 == t);
                if (-1 == t)
                    break;
                do {
                    n = r[255 & e.charCodeAt(c++)]
                } while (c < h && -1 == n);
                if (-1 == n)
                    break;
                u += String.fromCharCode(t << 2 | (48 & n) >> 4);
                do {
                    if (61 == (o = 255 & e.charCodeAt(c++)))
                        return u;
                    o = r[o]
                } while (c < h && -1 == o);
                if (-1 == o)
                    break;
                u += String.fromCharCode((15 & n) << 4 | (60 & o) >> 2);
                do {
                    if (61 == (a = 255 & e.charCodeAt(c++)))
                        return u;
                    a = r[a]
                } while (c < h && -1 == a);
                if (-1 == a)
                    break;
                u += String.fromCharCode((3 & o) << 6 | a)
            }
            return u
        },
        utf8Encode: function(e) {
            let r, t, n, o;
            for (r = "",
            n = e.length,
            t = 0; t < n; t++)
                (o = e.charCodeAt(t)) >= 1 && o <= 127 ? r += e.charAt(t) : o > 2047 ? (r += String.fromCharCode(224 | o >> 12 & 15),
                r += String.fromCharCode(128 | o >> 6 & 63),
                r += String.fromCharCode(128 | o >> 0 & 63)) : (r += String.fromCharCode(192 | o >> 6 & 31),
                r += String.fromCharCode(128 | o >> 0 & 63));
            return r
        },
        utf8Decode: function(e) {
            let r, t, n, o, a, c;
            for (r = "",
            n = e.length,
            t = 0; t < n; )
                switch ((o = e.charCodeAt(t++)) >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    r += e.charAt(t - 1);
                    break;
                case 12:
                case 13:
                    a = e.charCodeAt(t++),
                    r += String.fromCharCode((31 & o) << 6 | 63 & a);
                    break;
                case 14:
                    a = e.charCodeAt(t++),
                    c = e.charCodeAt(t++),
                    r += String.fromCharCode((15 & o) << 12 | (63 & a) << 6 | (63 & c) << 0)
                }
            return r
        },
        utf16to8: function(e) {
            return e.replace(/\\x/g, "%")
        },
        utf8to16: function(e) {
            return e.replace(/%/g, "\\x")
        },
        md5: e=>Md5Utils.md5(e),
        hexEncode: t.hexEncode,
        hexDecode: t.hexDecode,
        html2js: function(e) {
            let r = e.replace(/\\/g, "\\\\").replace(/\\/g, "\\/").replace(/\'/g, "\\'").split("\n")
              , t = r.length
              , n = [];
            return n.push("let htmlCodes = [\n"),
            r.forEach((e,r)=>{
                "" !== e && (r === t - 1 ? n.push("'" + e + "'") : n.push("'" + e + "',\n"))
            }
            ),
            n.push('\n].join("");'),
            n.join("")
        },
        urlParamsDecode: function(e) {
            let r = {};
            try {
                let t = []
                  , n = new URL(e);
                for (let e of n.searchParams)
                    t.push(e);
                r = {
                    url: n.href,
                    params: t,
                    protocol: n.protocol,
                    pathname: n.pathname,
                    hostname: n.hostname
                }
            } catch (e) {
                r.error = "这不是一个合法的URL！无法完成解析！"
            }
            return r
        },
        sha1Encode: function(e) {
            var r, t, n = new Uint8Array(function(e) {
                let r, t, n, o = [];
                for (r = 0; r < e.length; r++)
                    (t = e.charCodeAt(r)) < 128 ? o.push(t) : t < 2048 ? o.push(192 + (t >> 6 & 31), 128 + (63 & t)) : ((n = 55296 ^ t) >> 10 == 0 ? (t = (n << 10) + (56320 ^ e.charCodeAt(++r)) + 65536,
                    o.push(240 + (t >> 18 & 7), 128 + (t >> 12 & 63))) : o.push(224 + (t >> 12 & 15)),
                    o.push(128 + (t >> 6 & 63), 128 + (63 & t)));
                return o
            }(e)), o = 16 + (n.length + 8 >>> 6 << 4), a = new Uint8Array(o << 2);
            for (a.set(new Uint8Array(n.buffer)),
            a = new Uint32Array(a.buffer),
            t = new DataView(a.buffer),
            s = 0; s < o; s++)
                a[s] = t.getUint32(s << 2);
            a[n.length >> 2] |= 128 << 24 - 8 * (3 & n.length),
            a[o - 1] = n.length << 3;
            var c = []
              , h = [function() {
                return l[1] & l[2] | ~l[1] & l[3]
            }
            , function() {
                return l[1] ^ l[2] ^ l[3]
            }
            , function() {
                return l[1] & l[2] | l[1] & l[3] | l[2] & l[3]
            }
            , function() {
                return l[1] ^ l[2] ^ l[3]
            }
            ]
              , u = function(e, r) {
                return e << r | e >>> 32 - r
            }
              , i = [1518500249, 1859775393, -1894007588, -899497514]
              , l = [1732584193, -271733879, null, null, -1009589776];
            for (l[2] = ~l[0],
            l[3] = ~l[1],
            s = 0; s < a.length; s += 16) {
                var f = l.slice(0);
                for (r = 0; r < 80; r++)
                    c[r] = r < 16 ? a[s + r] : u(c[r - 3] ^ c[r - 8] ^ c[r - 14] ^ c[r - 16], 1),
                    t = u(l[0], 5) + h[r / 20 | 0]() + l[4] + c[r] + i[r / 20 | 0] | 0,
                    l[1] = u(l[1], 30),
                    l.pop(),
                    l.unshift(t);
                for (r = 0; r < 5; r++)
                    l[r] = l[r] + f[r] | 0
            }
            t = new DataView(new Uint32Array(l).buffer);
            for (var s = 0; s < 5; s++)
                l[s] = t.getUint32(s << 2);
            return Array.prototype.map.call(new Uint8Array(new Uint32Array(l).buffer), function(e) {
                return (e < 16 ? "0" : "") + e.toString(16)
            }).join("")
        }
    }
}
)();
export default EncodeUtils;
