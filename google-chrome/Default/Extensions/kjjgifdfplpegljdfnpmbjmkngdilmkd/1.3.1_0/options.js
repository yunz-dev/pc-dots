(function () {
  "use strict";

  var n,
    l$1,
    u$1,
    t$5,
    o$2,
    f$1 = {},
    e$1 = [],
    c$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function s$1(n, l) {
    for (var u in l) n[u] = l[u];
    return n;
  }
  function a$1(n) {
    var l = n.parentNode;
    l && l.removeChild(n);
  }
  function h$1(l, u, i) {
    var t,
      o,
      r,
      f = {};
    for (r in u)
      "key" == r ? (t = u[r]) : "ref" == r ? (o = u[r]) : (f[r] = u[r]);
    if (
      (arguments.length > 2 &&
        (f.children = arguments.length > 3 ? n.call(arguments, 2) : i),
      "function" == typeof l && null != l.defaultProps)
    )
      for (r in l.defaultProps) void 0 === f[r] && (f[r] = l.defaultProps[r]);
    return v$1(l, f, t, o, null);
  }
  function v$1(n, i, t, o, r) {
    var f = {
      type: n,
      props: i,
      key: t,
      ref: o,
      __k: null,
      __: null,
      __b: 0,
      __e: null,
      __d: void 0,
      __c: null,
      __h: null,
      constructor: void 0,
      __v: null == r ? ++u$1 : r,
    };
    return null == r && null != l$1.vnode && l$1.vnode(f), f;
  }
  function y$1() {
    return { current: null };
  }
  function p$1(n) {
    return n.children;
  }
  function d$1(n, l) {
    (this.props = n), (this.context = l);
  }
  function _$1(n, l) {
    if (null == l) return n.__ ? _$1(n.__, n.__.__k.indexOf(n) + 1) : null;
    for (var u; l < n.__k.length; l++)
      if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
    return "function" == typeof n.type ? _$1(n) : null;
  }
  function k$1(n) {
    var l, u;
    if (null != (n = n.__) && null != n.__c) {
      for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)
        if (null != (u = n.__k[l]) && null != u.__e) {
          n.__e = n.__c.base = u.__e;
          break;
        }
      return k$1(n);
    }
  }
  function b$1(n) {
    ((!n.__d && (n.__d = !0) && t$5.push(n) && !g$1.__r++) ||
      o$2 !== l$1.debounceRendering) &&
      ((o$2 = l$1.debounceRendering) || setTimeout)(g$1);
  }
  function g$1() {
    for (var n; (g$1.__r = t$5.length); )
      (n = t$5.sort(function (n, l) {
        return n.__v.__b - l.__v.__b;
      })),
        (t$5 = []),
        n.some(function (n) {
          var l, u, i, t, o, r;
          n.__d &&
            ((o = (t = (l = n).__v).__e),
            (r = l.__P) &&
              ((u = []),
              ((i = s$1({}, t)).__v = t.__v + 1),
              j$1(
                r,
                t,
                i,
                l.__n,
                void 0 !== r.ownerSVGElement,
                null != t.__h ? [o] : null,
                u,
                null == o ? _$1(t) : o,
                t.__h
              ),
              z$1(u, t),
              t.__e != o && k$1(t)));
        });
  }
  function w$1(n, l, u, i, t, o, r, c, s, a) {
    var h,
      y,
      d,
      k,
      b,
      g,
      w,
      x = (i && i.__k) || e$1,
      C = x.length;
    for (u.__k = [], h = 0; h < l.length; h++)
      if (
        null !=
        (k = u.__k[h] =
          null == (k = l[h]) || "boolean" == typeof k
            ? null
            : "string" == typeof k ||
              "number" == typeof k ||
              "bigint" == typeof k
            ? v$1(null, k, null, null, k)
            : Array.isArray(k)
            ? v$1(p$1, { children: k }, null, null, null)
            : k.__b > 0
            ? v$1(k.type, k.props, k.key, null, k.__v)
            : k)
      ) {
        if (
          ((k.__ = u),
          (k.__b = u.__b + 1),
          null === (d = x[h]) || (d && k.key == d.key && k.type === d.type))
        )
          x[h] = void 0;
        else
          for (y = 0; y < C; y++) {
            if ((d = x[y]) && k.key == d.key && k.type === d.type) {
              x[y] = void 0;
              break;
            }
            d = null;
          }
        j$1(n, k, (d = d || f$1), t, o, r, c, s, a),
          (b = k.__e),
          (y = k.ref) &&
            d.ref != y &&
            (w || (w = []),
            d.ref && w.push(d.ref, null, k),
            w.push(y, k.__c || b, k)),
          null != b
            ? (null == g && (g = b),
              "function" == typeof k.type && k.__k === d.__k
                ? (k.__d = s = m$1(k, s, n))
                : (s = A(n, k, d, x, b, s)),
              "function" == typeof u.type && (u.__d = s))
            : s && d.__e == s && s.parentNode != n && (s = _$1(d));
      }
    for (u.__e = g, h = C; h--; )
      null != x[h] &&
        ("function" == typeof u.type &&
          null != x[h].__e &&
          x[h].__e == u.__d &&
          (u.__d = _$1(i, h + 1)),
        N(x[h], x[h]));
    if (w) for (h = 0; h < w.length; h++) M(w[h], w[++h], w[++h]);
  }
  function m$1(n, l, u) {
    for (var i, t = n.__k, o = 0; t && o < t.length; o++)
      (i = t[o]) &&
        ((i.__ = n),
        (l =
          "function" == typeof i.type
            ? m$1(i, l, u)
            : A(u, i, i, t, i.__e, l)));
    return l;
  }
  function A(n, l, u, i, t, o) {
    var r, f, e;
    if (void 0 !== l.__d) (r = l.__d), (l.__d = void 0);
    else if (null == u || t != o || null == t.parentNode)
      n: if (null == o || o.parentNode !== n) n.appendChild(t), (r = null);
      else {
        for (f = o, e = 0; (f = f.nextSibling) && e < i.length; e += 2)
          if (f == t) break n;
        n.insertBefore(t, o), (r = o);
      }
    return void 0 !== r ? r : t.nextSibling;
  }
  function C(n, l, u, i, t) {
    var o;
    for (o in u)
      "children" === o || "key" === o || o in l || H(n, o, null, u[o], i);
    for (o in l)
      (t && "function" != typeof l[o]) ||
        "children" === o ||
        "key" === o ||
        "value" === o ||
        "checked" === o ||
        u[o] === l[o] ||
        H(n, o, l[o], u[o], i);
  }
  function $(n, l, u) {
    "-" === l[0]
      ? n.setProperty(l, u)
      : (n[l] =
          null == u ? "" : "number" != typeof u || c$1.test(l) ? u : u + "px");
  }
  function H(n, l, u, i, t) {
    var o;
    n: if ("style" === l)
      if ("string" == typeof u) n.style.cssText = u;
      else {
        if (("string" == typeof i && (n.style.cssText = i = ""), i))
          for (l in i) (u && l in u) || $(n.style, l, "");
        if (u) for (l in u) (i && u[l] === i[l]) || $(n.style, l, u[l]);
      }
    else if ("o" === l[0] && "n" === l[1])
      (o = l !== (l = l.replace(/Capture$/, ""))),
        (l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2)),
        n.l || (n.l = {}),
        (n.l[l + o] = u),
        u
          ? i || n.addEventListener(l, o ? T$1 : I, o)
          : n.removeEventListener(l, o ? T$1 : I, o);
    else if ("dangerouslySetInnerHTML" !== l) {
      if (t) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (
        "href" !== l &&
        "list" !== l &&
        "form" !== l &&
        "tabIndex" !== l &&
        "download" !== l &&
        l in n
      )
        try {
          n[l] = null == u ? "" : u;
          break n;
        } catch (n) {}
      "function" == typeof u ||
        (null != u && (!1 !== u || ("a" === l[0] && "r" === l[1]))
          ? n.setAttribute(l, u)
          : n.removeAttribute(l));
    }
  }
  function I(n) {
    this.l[n.type + !1](l$1.event ? l$1.event(n) : n);
  }
  function T$1(n) {
    this.l[n.type + !0](l$1.event ? l$1.event(n) : n);
  }
  function j$1(n, u, i, t, o, r, f, e, c) {
    var a,
      h,
      v,
      y,
      _,
      k,
      b,
      g,
      m,
      x,
      A,
      C,
      $,
      H = u.type;
    if (void 0 !== u.constructor) return null;
    null != i.__h &&
      ((c = i.__h), (e = u.__e = i.__e), (u.__h = null), (r = [e])),
      (a = l$1.__b) && a(u);
    try {
      n: if ("function" == typeof H) {
        if (
          ((g = u.props),
          (m = (a = H.contextType) && t[a.__c]),
          (x = a ? (m ? m.props.value : a.__) : t),
          i.__c
            ? (b = (h = u.__c = i.__c).__ = h.__E)
            : ("prototype" in H && H.prototype.render
                ? (u.__c = h = new H(g, x))
                : ((u.__c = h = new d$1(g, x)),
                  (h.constructor = H),
                  (h.render = O)),
              m && m.sub(h),
              (h.props = g),
              h.state || (h.state = {}),
              (h.context = x),
              (h.__n = t),
              (v = h.__d = !0),
              (h.__h = [])),
          null == h.__s && (h.__s = h.state),
          null != H.getDerivedStateFromProps &&
            (h.__s == h.state && (h.__s = s$1({}, h.__s)),
            s$1(h.__s, H.getDerivedStateFromProps(g, h.__s))),
          (y = h.props),
          (_ = h.state),
          v)
        )
          null == H.getDerivedStateFromProps &&
            null != h.componentWillMount &&
            h.componentWillMount(),
            null != h.componentDidMount && h.__h.push(h.componentDidMount);
        else {
          if (
            (null == H.getDerivedStateFromProps &&
              g !== y &&
              null != h.componentWillReceiveProps &&
              h.componentWillReceiveProps(g, x),
            (!h.__e &&
              null != h.shouldComponentUpdate &&
              !1 === h.shouldComponentUpdate(g, h.__s, x)) ||
              u.__v === i.__v)
          ) {
            (h.props = g),
              (h.state = h.__s),
              u.__v !== i.__v && (h.__d = !1),
              (h.__v = u),
              (u.__e = i.__e),
              (u.__k = i.__k),
              u.__k.forEach(function (n) {
                n && (n.__ = u);
              }),
              h.__h.length && f.push(h);
            break n;
          }
          null != h.componentWillUpdate && h.componentWillUpdate(g, h.__s, x),
            null != h.componentDidUpdate &&
              h.__h.push(function () {
                h.componentDidUpdate(y, _, k);
              });
        }
        if (
          ((h.context = x),
          (h.props = g),
          (h.__v = u),
          (h.__P = n),
          (A = l$1.__r),
          (C = 0),
          "prototype" in H && H.prototype.render)
        )
          (h.state = h.__s),
            (h.__d = !1),
            A && A(u),
            (a = h.render(h.props, h.state, h.context));
        else
          do {
            (h.__d = !1),
              A && A(u),
              (a = h.render(h.props, h.state, h.context)),
              (h.state = h.__s);
          } while (h.__d && ++C < 25);
        (h.state = h.__s),
          null != h.getChildContext &&
            (t = s$1(s$1({}, t), h.getChildContext())),
          v ||
            null == h.getSnapshotBeforeUpdate ||
            (k = h.getSnapshotBeforeUpdate(y, _)),
          ($ =
            null != a && a.type === p$1 && null == a.key
              ? a.props.children
              : a),
          w$1(n, Array.isArray($) ? $ : [$], u, i, t, o, r, f, e, c),
          (h.base = u.__e),
          (u.__h = null),
          h.__h.length && f.push(h),
          b && (h.__E = h.__ = null),
          (h.__e = !1);
      } else
        null == r && u.__v === i.__v
          ? ((u.__k = i.__k), (u.__e = i.__e))
          : (u.__e = L(i.__e, u, i, t, o, r, f, c));
      (a = l$1.diffed) && a(u);
    } catch (n) {
      (u.__v = null),
        (c || null != r) &&
          ((u.__e = e), (u.__h = !!c), (r[r.indexOf(e)] = null)),
        l$1.__e(n, u, i);
    }
  }
  function z$1(n, u) {
    l$1.__c && l$1.__c(u, n),
      n.some(function (u) {
        try {
          (n = u.__h),
            (u.__h = []),
            n.some(function (n) {
              n.call(u);
            });
        } catch (n) {
          l$1.__e(n, u.__v);
        }
      });
  }
  function L(l, u, i, t, o, r, e, c) {
    var s,
      h,
      v,
      y = i.props,
      p = u.props,
      d = u.type,
      k = 0;
    if (("svg" === d && (o = !0), null != r))
      for (; k < r.length; k++)
        if (
          (s = r[k]) &&
          "setAttribute" in s == !!d &&
          (d ? s.localName === d : 3 === s.nodeType)
        ) {
          (l = s), (r[k] = null);
          break;
        }
    if (null == l) {
      if (null === d) return document.createTextNode(p);
      (l = o
        ? document.createElementNS("http://www.w3.org/2000/svg", d)
        : document.createElement(d, p.is && p)),
        (r = null),
        (c = !1);
    }
    if (null === d) y === p || (c && l.data === p) || (l.data = p);
    else {
      if (
        ((r = r && n.call(l.childNodes)),
        (h = (y = i.props || f$1).dangerouslySetInnerHTML),
        (v = p.dangerouslySetInnerHTML),
        !c)
      ) {
        if (null != r)
          for (y = {}, k = 0; k < l.attributes.length; k++)
            y[l.attributes[k].name] = l.attributes[k].value;
        (v || h) &&
          ((v &&
            ((h && v.__html == h.__html) ||
              v.__html === l.__disabled__innerHTML)) ||
            (l.__disabled__innerHTML = (v && v.__html) || ""));
      }
      if ((C(l, p, y, o, c), v)) u.__k = [];
      else if (
        ((k = u.props.children),
        w$1(
          l,
          Array.isArray(k) ? k : [k],
          u,
          i,
          t,
          o && "foreignObject" !== d,
          r,
          e,
          r ? r[0] : i.__k && _$1(i, 0),
          c
        ),
        null != r)
      )
        for (k = r.length; k--; ) null != r[k] && a$1(r[k]);
      c ||
        ("value" in p &&
          void 0 !== (k = p.value) &&
          (k !== l.value ||
            ("progress" === d && !k) ||
            ("option" === d && k !== y.value)) &&
          H(l, "value", k, y.value, !1),
        "checked" in p &&
          void 0 !== (k = p.checked) &&
          k !== l.checked &&
          H(l, "checked", k, y.checked, !1));
    }
    return l;
  }
  function M(n, u, i) {
    try {
      "function" == typeof n ? n(u) : (n.current = u);
    } catch (n) {
      l$1.__e(n, i);
    }
  }
  function N(n, u, i) {
    var t, o;
    if (
      (l$1.unmount && l$1.unmount(n),
      (t = n.ref) && ((t.current && t.current !== n.__e) || M(t, null, u)),
      null != (t = n.__c))
    ) {
      if (t.componentWillUnmount)
        try {
          t.componentWillUnmount();
        } catch (n) {
          l$1.__e(n, u);
        }
      t.base = t.__P = null;
    }
    if ((t = n.__k))
      for (o = 0; o < t.length; o++)
        t[o] && N(t[o], u, "function" != typeof n.type);
    i || null == n.__e || a$1(n.__e), (n.__e = n.__d = void 0);
  }
  function O(n, l, u) {
    return this.constructor(n, u);
  }
  function P(u, i, t) {
    var o, r, e;
    l$1.__ && l$1.__(u, i),
      (r = (o = "function" == typeof t) ? null : (t && t.__k) || i.__k),
      (e = []),
      j$1(
        i,
        (u = ((!o && t) || i).__k = h$1(p$1, null, [u])),
        r || f$1,
        f$1,
        void 0 !== i.ownerSVGElement,
        !o && t ? [t] : r ? null : i.firstChild ? n.call(i.childNodes) : null,
        e,
        !o && t ? t : r ? r.__e : i.firstChild,
        o
      ),
      z$1(e, u);
  }
  (n = e$1.slice),
    (l$1 = {
      __e: function (n, l, u, i) {
        for (var t, o, r; (l = l.__); )
          if ((t = l.__c) && !t.__)
            try {
              if (
                ((o = t.constructor) &&
                  null != o.getDerivedStateFromError &&
                  (t.setState(o.getDerivedStateFromError(n)), (r = t.__d)),
                null != t.componentDidCatch &&
                  (t.componentDidCatch(n, i || {}), (r = t.__d)),
                r)
              )
                return (t.__E = t);
            } catch (l) {
              n = l;
            }
        throw n;
      },
    }),
    (u$1 = 0),
    (d$1.prototype.setState = function (n, l) {
      var u;
      (u =
        null != this.__s && this.__s !== this.state
          ? this.__s
          : (this.__s = s$1({}, this.state))),
        "function" == typeof n && (n = n(s$1({}, u), this.props)),
        n && s$1(u, n),
        null != n && this.__v && (l && this.__h.push(l), b$1(this));
    }),
    (d$1.prototype.forceUpdate = function (n) {
      this.__v && ((this.__e = !0), n && this.__h.push(n), b$1(this));
    }),
    (d$1.prototype.render = p$1),
    (t$5 = []),
    (g$1.__r = 0);

  function boolean(value) {
    if (typeof value !== "boolean") {
      throw new DecoderError({ tag: "boolean", got: value });
    }
    return value;
  }
  function number(value) {
    if (typeof value !== "number") {
      throw new DecoderError({ tag: "number", got: value });
    }
    return value;
  }
  function string(value) {
    if (typeof value !== "string") {
      throw new DecoderError({ tag: "string", got: value });
    }
    return value;
  }
  function stringUnion(mapping) {
    return function stringUnionDecoder(value) {
      const str = string(value);
      if (!Object.prototype.hasOwnProperty.call(mapping, str)) {
        throw new DecoderError({
          tag: "unknown stringUnion variant",
          knownVariants: Object.keys(mapping),
          got: str,
        });
      }
      return str;
    };
  }
  function unknownArray(value) {
    if (!Array.isArray(value)) {
      throw new DecoderError({ tag: "array", got: value });
    }
    return value;
  }
  function unknownRecord(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new DecoderError({ tag: "object", got: value });
    }
    return value;
  }
  function array(decoder) {
    return function arrayDecoder(value) {
      const arr = unknownArray(value);
      const result = [];
      for (let index = 0; index < arr.length; index++) {
        try {
          result.push(decoder(arr[index]));
        } catch (error) {
          throw DecoderError.at(error, index);
        }
      }
      return result;
    };
  }
  function record(decoder) {
    return function recordDecoder(value) {
      const object = unknownRecord(value);
      const keys = Object.keys(object);
      const result = {};
      for (const key of keys) {
        if (key === "__proto__") {
          continue;
        }
        try {
          result[key] = decoder(object[key]);
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      return result;
    };
  }
  function fieldsAuto(mapping, { exact = "allow extra" } = {}) {
    return function fieldsAutoDecoder(value) {
      const object = unknownRecord(value);
      const keys = Object.keys(mapping);
      const result = {};
      for (const key of keys) {
        if (key === "__proto__") {
          continue;
        }
        const decoder = mapping[key];
        try {
          result[key] = decoder(object[key]);
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      if (exact !== "allow extra") {
        const unknownFields = Object.keys(object).filter(
          (key) => !Object.prototype.hasOwnProperty.call(mapping, key)
        );
        if (unknownFields.length > 0) {
          throw new DecoderError({
            tag: "exact fields",
            knownFields: keys,
            got: unknownFields,
          });
        }
      }
      return result;
    };
  }
  function tuple(mapping) {
    return function tupleDecoder(value) {
      const arr = unknownArray(value);
      if (arr.length !== mapping.length) {
        throw new DecoderError({
          tag: "tuple size",
          expected: mapping.length,
          got: arr.length,
        });
      }
      const result = [];
      for (let index = 0; index < arr.length; index++) {
        try {
          const decoder = mapping[index];
          result.push(decoder(arr[index]));
        } catch (error) {
          throw DecoderError.at(error, index);
        }
      }
      return result;
    };
  }
  function multi(mapping) {
    return function multiDecoder(value) {
      if (value === undefined) {
        if (mapping.undefined !== undefined) {
          return mapping.undefined(value);
        }
      } else if (value === null) {
        if (mapping.null !== undefined) {
          return mapping.null(value);
        }
      } else if (typeof value === "boolean") {
        if (mapping.boolean !== undefined) {
          return mapping.boolean(value);
        }
      } else if (typeof value === "number") {
        if (mapping.number !== undefined) {
          return mapping.number(value);
        }
      } else if (typeof value === "string") {
        if (mapping.string !== undefined) {
          return mapping.string(value);
        }
      } else if (Array.isArray(value)) {
        if (mapping.array !== undefined) {
          return mapping.array(value);
        }
      } else {
        if (mapping.object !== undefined) {
          return mapping.object(value);
        }
      }
      throw new DecoderError({
        tag: "unknown multi type",
        knownTypes: Object.keys(mapping),
        got: value,
      });
    };
  }
  function chain(decoder, next) {
    return function chainDecoder(value) {
      return next(decoder(value));
    };
  }
  function formatDecoderErrorVariant(variant, options) {
    const formatGot = (value) => {
      const formatted = repr(value, options);
      return (options === null || options === void 0
        ? void 0
        : options.sensitive) === true
        ? `${formatted}\n(Actual values are hidden in sensitive mode.)`
        : formatted;
    };
    const stringList = (strings) =>
      strings.length === 0
        ? "(none)"
        : strings.map((s) => JSON.stringify(s)).join(", ");
    const got = (message, value) =>
      value === DecoderError.MISSING_VALUE
        ? message
        : `${message}\nGot: ${formatGot(value)}`;
    switch (variant.tag) {
      case "boolean":
      case "number":
      case "string":
        return got(`Expected a ${variant.tag}`, variant.got);
      case "array":
      case "object":
        return got(`Expected an ${variant.tag}`, variant.got);
      case "unknown multi type":
        return `Expected one of these types: ${
          variant.knownTypes.length === 0
            ? "never"
            : variant.knownTypes.join(", ")
        }\nGot: ${formatGot(variant.got)}`;
      case "unknown fieldsUnion tag":
        return `Expected one of these tags: ${stringList(
          variant.knownTags
        )}\nGot: ${formatGot(variant.got)}`;
      case "unknown stringUnion variant":
        return `Expected one of these variants: ${stringList(
          variant.knownVariants
        )}\nGot: ${formatGot(variant.got)}`;
      case "exact fields":
        return `Expected only these fields: ${stringList(
          variant.knownFields
        )}\nFound extra fields: ${formatGot(variant.got).replace(
          /^\[|\]$/g,
          ""
        )}`;
      case "tuple size":
        return `Expected ${variant.expected} items\nGot: ${variant.got}`;
      case "custom":
        return got(variant.message, variant.got);
    }
  }
  class DecoderError extends TypeError {
    constructor({ key, ...params }) {
      const variant =
        "tag" in params
          ? params
          : { tag: "custom", message: params.message, got: params.value };
      super(
        `${formatDecoderErrorVariant(
          variant,
          // Default to sensitive so accidental uncaught errors don’t leak
          // anything. Explicit `.format()` defaults to non-sensitive.
          { sensitive: true }
        )}\n\nFor better error messages, see https://github.com/lydell/tiny-decoders#error-messages`
      );
      this.path = key === undefined ? [] : [key];
      this.variant = variant;
      this.nullable = false;
      this.optional = false;
    }
    static at(error, key) {
      if (error instanceof DecoderError) {
        if (key !== undefined) {
          error.path.unshift(key);
        }
        return error;
      }
      return new DecoderError({
        tag: "custom",
        message: error instanceof Error ? error.message : String(error),
        got: DecoderError.MISSING_VALUE,
        key,
      });
    }
    format(options) {
      const path = this.path
        .map((part) => `[${JSON.stringify(part)}]`)
        .join("");
      const nullableString = this.nullable ? " (nullable)" : "";
      const optionalString = this.optional ? " (optional)" : "";
      const variant = formatDecoderErrorVariant(this.variant, options);
      return `At root${path}${nullableString}${optionalString}:\n${variant}`;
    }
  }
  DecoderError.MISSING_VALUE = Symbol("DecoderError.MISSING_VALUE");
  function repr(
    value,
    {
      recurse = true,
      maxArrayChildren = 5,
      maxObjectChildren = 3,
      maxLength = 100,
      recurseMaxLength = 20,
      sensitive = false,
    } = {}
  ) {
    const type = typeof value;
    const toStringType = Object.prototype.toString
      .call(value)
      .replace(/^\[object\s+(.+)\]$/, "$1");
    try {
      if (
        value == null ||
        type === "number" ||
        type === "boolean" ||
        type === "symbol" ||
        toStringType === "RegExp"
      ) {
        return sensitive
          ? toStringType.toLowerCase()
          : truncate(String(value), maxLength);
      }
      if (type === "string") {
        return sensitive ? type : truncate(JSON.stringify(value), maxLength);
      }
      if (typeof value === "function") {
        return `function ${truncate(JSON.stringify(value.name), maxLength)}`;
      }
      if (Array.isArray(value)) {
        const arr = value;
        if (!recurse && arr.length > 0) {
          return `${toStringType}(${arr.length})`;
        }
        const lastIndex = arr.length - 1;
        const items = [];
        const end = Math.min(maxArrayChildren - 1, lastIndex);
        for (let index = 0; index <= end; index++) {
          const item =
            index in arr
              ? repr(arr[index], {
                  recurse: false,
                  maxLength: recurseMaxLength,
                  sensitive,
                })
              : "<empty>";
          items.push(item);
        }
        if (end < lastIndex) {
          items.push(`(${lastIndex - end} more)`);
        }
        return `[${items.join(", ")}]`;
      }
      if (toStringType === "Object") {
        const object = value;
        const keys = Object.keys(object);
        // `class Foo {}` has `toStringType === "Object"` and `name === "Foo"`.
        const { name } = object.constructor;
        if (!recurse && keys.length > 0) {
          return `${name}(${keys.length})`;
        }
        const numHidden = Math.max(0, keys.length - maxObjectChildren);
        const items = keys
          .slice(0, maxObjectChildren)
          .map(
            (key2) =>
              `${truncate(JSON.stringify(key2), recurseMaxLength)}: ${repr(
                object[key2],
                {
                  recurse: false,
                  maxLength: recurseMaxLength,
                  sensitive,
                }
              )}`
          )
          .concat(numHidden > 0 ? `(${numHidden} more)` : []);
        const prefix = name === "Object" ? "" : `${name} `;
        return `${prefix}{${items.join(", ")}}`;
      }
      return toStringType;
    } catch (_error) {
      return toStringType;
    }
  }
  function truncate(str, maxLength) {
    const half = Math.floor(maxLength / 2);
    return str.length <= maxLength
      ? str
      : `${str.slice(0, half)}…${str.slice(-half)}`;
  }

  const ROOT_CLASS = "root";
  const HINT_CLASS = "hint";
  const HIGHLIGHTED_HINT_CLASS = "highlighted";
  const MIXED_CASE_CLASS = "mixedCase";
  const HAS_MATCHED_CHARS_CLASS = "hasMatchedChars";
  const MATCHED_CHARS_CLASS = "matchedChars";
  const TEXT_RECT_CLASS = "matchedText";
  const SHRUGGIE_CLASS = "shruggie";
  const STATUS_CLASS = "status";
  const PEEK_CLASS = "peek";
  const HIDDEN_CLASS = "hidden";

  // The minimum and maximum z-index browsers support.
  const MIN_Z_INDEX = -2147483648;
  const MAX_Z_INDEX = 2147483647;

  const SHRUGGIE = "¯\\_(ツ)_/¯";

  const font = "font-family: system-ui;";

  // The CSS is ordered so that stuff more interesting for users to change in the
  // options are closer to the top.
  const CSS = `
.${ROOT_CLASS} {
  ${font}
}

.${HINT_CLASS} {
  font-size: 12px;
  padding: 2px;
  color: black;
  background-color: ${"#f6ff00"};
  border: solid 1px rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  font-weight: bold;
  line-height: 1;
  white-space: nowrap;
}

.${HIGHLIGHTED_HINT_CLASS} {
  background-color: ${"#0f0"};
}

.${MATCHED_CHARS_CLASS} {
  opacity: 0.3;
}

.${TEXT_RECT_CLASS} {
  border-bottom: 2px solid ${"#ef0fff"};
  box-sizing: border-box;
}

.${STATUS_CLASS} {
  font-size: 14px;
  padding: 4px 6px;
  color: white;
  background-color: black;
  box-shadow: 0 0 1px 0 rgba(255, 255, 255, 0.5);
  bottom: 0;
  right: 0;
  line-height: 1;
}

.${PEEK_CLASS} .${HINT_CLASS}:not(.${HAS_MATCHED_CHARS_CLASS}):not(.${HIGHLIGHTED_HINT_CLASS}) {
  opacity: 0.2;
}

.${MIXED_CASE_CLASS} {
  text-transform: none;
}

.${HIDDEN_CLASS},
.${HINT_CLASS}:not(.${HIDDEN_CLASS}) ~ .${SHRUGGIE_CLASS},
.${STATUS_CLASS}:empty {
  opacity: 0 !important;
}
`.trim();

  const SUGGESTION_FONT_SIZE = `
.${HINT_CLASS} {
  font-size: 14px;
}

.${STATUS_CLASS} {
  font-size: 16px;
}
`.trim();

  const SUGGESTION_VIMIUM = `
.${ROOT_CLASS} {
  font-family: Helvetica, Arial, sans-serif;
}

.${HINT_CLASS} {
  font-size: 11px;
  padding: 1px 3px 0px 3px;
  color: #302505;
  background-image: linear-gradient(to bottom, #fff785, #ffc542);
  border: 1px solid #c38a22;
  border-radius: 3px;
  box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  font-weight: bold;
}

.${HIGHLIGHTED_HINT_CLASS} {
  filter: hue-rotate(45deg) saturate(150%);
}

.${MATCHED_CHARS_CLASS} {
  opacity: 1;
  color: #d4ac3a;
}

.${STATUS_CLASS} {
  font-size: 12px;
  padding: 3px 3px 2px 3px;
  color: black;
  background-color: #ebebeb;
  border: 1px solid #b3b3b3;
  border-radius: 4px 4px 0 0;
  text-shadow: 0 1px 2px white;
  min-width: 150px;
  right: 150px;
}
`.trim();

  const KeyboardAction = stringUnion({
    ActivateHint: null,
    ActivateHintAlt: null,
    Backspace: null,
    EnterHintsMode_BackgroundTab: null,
    EnterHintsMode_Click: null,
    EnterHintsMode_ForegroundTab: null,
    EnterHintsMode_ManyClick: null,
    EnterHintsMode_ManyTab: null,
    EnterHintsMode_Select: null,
    Escape: null,
    ExitHintsMode: null,
    RefreshHints: null,
    ReverseSelection: null,
    RotateHintsBackward: null,
    RotateHintsForward: null,
    TogglePeek: null,
  });

  // Raw values from a `KeyboardEvent` that we care about.

  const Shortcut = fieldsAuto({
    key: string,
    alt: boolean,
    cmd: boolean,
    ctrl: boolean,
    shift: boolean,
  });

  const EMPTY_SHORTCUT = {
    key: "",
    alt: false,
    cmd: false,
    ctrl: false,
    shift: false,
  };

  function requireModifier(shortcut) {
    const { key, alt, cmd, ctrl, shift } = shortcut;
    if (!(alt || cmd || ctrl || (shift && key.length > 1))) {
      throw new DecoderError({
        message: "Expected Shortcut to use a least one modifier",
        value: shortcut,
      });
    }
    return shortcut;
  }

  const SHORTCUT_SEPARATOR = "-";

  function serializeShortcut(shortcut) {
    return [
      shortcut.alt ? "alt" : undefined,
      shortcut.cmd ? "cmd" : undefined,
      shortcut.ctrl ? "ctrl" : undefined,
      shortcut.shift ? "shift" : undefined,
      shortcut.key,
    ]
      .filter((name) => name !== undefined)
      .join(SHORTCUT_SEPARATOR);
  }

  // This turns a shortcut string into an object that can be fed to `Shortcut`.
  function deserializeShortcut(shortcutString) {
    const parts = shortcutString.split(SHORTCUT_SEPARATOR);
    const lastIndex = parts.length - 1;
    return parts.reduce(
      (shortcut, part, index) =>
        index === lastIndex
          ? // If the last part is empty, we’re deserializing a shortcut like `alt--`.
            { ...shortcut, key: part === "" ? SHORTCUT_SEPARATOR : part }
          : // Ignore empty parts, such as in `alt--x`.
          part !== ""
          ? // Modifiers.
            { ...shortcut, [part]: true }
          : shortcut,
      { ...EMPTY_SHORTCUT }
    );
  }

  const KeyboardMapping = fieldsAuto({
    shortcut: Shortcut,
    action: KeyboardAction,
  });

  const KeyboardMappingWithModifiers = fieldsAuto({
    shortcut: chain(Shortcut, requireModifier),
    action: KeyboardAction,
  });

  const KeyPair = tuple([string, string]);

  function keyboardEventToKeypress(event) {
    return {
      key: event.key,
      code: event.code,
      alt: event.altKey,
      cmd: event.metaKey,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      capslock: event.getModifierState("CapsLock"),
    };
  }

  function normalizeKeypress({ keypress, keyTranslations }) {
    // If ignoring the keyboard layout, try to translate `.code` to a `.key`
    // value. Use `.key` otherwise.
    const translated = translateCode({
      code: keypress.code,
      shift: keypress.shift,
      keyTranslations,
    });
    const key = translated !== undefined ? translated : keypress.key;

    // Printable and non-printable are handled slightly differently.
    const isChar = key.length === 1;

    // Space is both printable (" ") and non-printable ("Space"), and allows shift
    // (unlike other printable keys).
    const isSpace = key === " ";

    // Capslock is handled differently based on whether the key comes from
    // `keyTranslations`.
    const wasTranslated = translated !== undefined;

    return {
      key: isSpace
        ? "Space"
        : // For keyboard shortcuts, capslock should not make a difference. When
        // `key` comes from `keyTranslations`, capslock is ignored by definition.
        // When using `event.key`, try to undo the effects of capslock, by
        // changing case.
        isChar && !wasTranslated && keypress.capslock
        ? keypress.shift
          ? key.toUpperCase() // Capslock made it lowercase; change it back.
          : key.toLowerCase() // Capslock made it uppercase; change it back.
        : key,
      printableKey:
        // When typing hints chars or filtering by text, capslock _should_ make a
        // difference. For example, one might use capslock instead of holding
        // shift when filtering by text. Since capslock is ignored when `key`
        // comes from `keyTranslations`, try to simulate capslock. When using
        // `event.key` there’s nothing to do – capslock has already been applied
        // for us.
        isChar
          ? wasTranslated && keypress.capslock
            ? // Remember that shift works the other way around in capslock mode.
              keypress.shift
              ? key.toLowerCase()
              : key.toUpperCase()
            : key
          : undefined,
      alt: keypress.alt,
      cmd: keypress.cmd,
      ctrl: keypress.ctrl,
      // Shift is ignored for printable keys: Shift changes the value of `key`
      // ("a" vs "A", "/" vs "?") and is as such not needed to check when matching
      // keyboard shortcuts. _Not_ checking it means that keyboard shortcuts have
      // a higher chance of working with several keyboard layouts. For example, in
      // the Swedish keyboard layout shift is required to type "/", while in the
      // American layout shift is not pressed when typing "/".
      shift: !isChar || isSpace ? keypress.shift : undefined,
    };
  }

  function translateCode({ code, shift, keyTranslations }) {
    if (Object.prototype.hasOwnProperty.call(keyTranslations, code)) {
      const [unshifted, shifted] = keyTranslations[code];
      return shift ? shifted : unshifted;
    }

    return undefined;
  }

  const MODIFIER_KEYS = new Set([
    "Alt",
    "AltGraph",
    "Control",
    "Hyper",
    "Meta",
    "Shift",
    "Super",
    "OS",
  ]);

  function isModifierKey(key) {
    return MODIFIER_KEYS.has(key);
  }

  const LogLevel = stringUnion({
    error: null,
    warn: null,
    log: null,
    debug: null,
  });

  const LOG_LEVELS = {
    error: 0,
    warn: 1,
    log: 2,
    debug: 3,
  };

  const DEFAULT_LOG_LEVEL = "warn";
  function log(level, ...args) {
    if (LOG_LEVELS[level] > LOG_LEVELS[log.level]) {
      return;
    }

    const method = getLogMethod(level);
    method.call(
      console,
      `[${"LinkHints"}]`,
      formatDate(new Date()),
      window.location.protocol.endsWith("-extension:")
        ? "extension page"
        : window.location.href,
      "\n ",
      ...args
    );
  }

  // The main `Program` for each entrypoint modifies this property. A little ugly,
  // but very convenient.
  log.level = DEFAULT_LOG_LEVEL;

  function formatDate(date) {
    const pad = (num, length = 2) => num.toString().padStart(length, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}.${pad(date.getMilliseconds(), 3)}`;
  }

  /* eslint-disable no-console */
  function getLogMethod(level) {
    switch (level) {
      case "error":
        return console.error;

      case "warn":
        return console.warn;

      case "log":
        return console.log;

      case "debug":
        return console.debug;
    }
  }
  /* eslint-enable no-console */

  function addEventListener(target, eventName, listener, name, options = {}) {
    const wrappedListener = (event) => {
      try {
        listener(event);
      } catch (error) {
        log("error", name, error, event);
      }
    };
    const fullOptions = { capture: true, passive: true, ...options };
    target.addEventListener(
      eventName,
      // @ts-expect-error This is fine. I have no idea how to fix.
      wrappedListener,
      fullOptions
    );
    return () => {
      target.removeEventListener(
        eventName,
        // @ts-expect-error This is fine. I have no idea how to fix.
        wrappedListener,
        fullOptions
      );
    };
  }

  function addListener(
    target,

    listener,
    name,
    options
  ) {
    // @ts-expect-error This is fine. I have no idea how to fix.
    const wrappedListener = (...args) => {
      try {
        listener(...args);
      } catch (error) {
        log("error", name, error, ...args);
      }
    };
    if (options === undefined) {
      target.addListener(wrappedListener);
    } else {
      target.addListener(wrappedListener, options);
    }
    return () => {
      target.removeListener(wrappedListener);
    };
  }

  function timeout(duration, callback) {
    const timeoutId = setTimeout(callback, duration);
    return () => {
      clearTimeout(timeoutId);
    };
  }

  class Resets {
    _callbacks = [];

    add(...callbacks) {
      this._callbacks.push(...callbacks);
    }

    reset() {
      for (const callback of this._callbacks) {
        callback();
      }
      this._callbacks = [];
    }
  }

  function makeRandomToken() {
    const array = new Uint32Array(3);
    window.crypto.getRandomValues(array);
    return array.join("");
  }

  // Turn a `ClientRect` into a `Box` using the coordinates of the topmost
  // viewport. Only the part of the `ClientRect` visible through all viewports end
  // up in the `Box`.
  function getVisibleBox(passedRect, viewports) {
    // No shortcuts (such as summing up viewport x:s and y:s) can be taken here,
    // since each viewport (frame) clips the visible area. We have to loop them
    // all through.
    const visibleRect = viewports.reduceRight(
      (rect, viewport) => ({
        left: viewport.x + Math.max(rect.left, 0),
        right: viewport.x + Math.min(rect.right, viewport.width),
        top: viewport.y + Math.max(rect.top, 0),
        bottom: viewport.y + Math.min(rect.bottom, viewport.height),
      }),
      passedRect
    );

    const width = visibleRect.right - visibleRect.left;
    const height = visibleRect.bottom - visibleRect.top;

    // If `visibleRect` has a nonsensical width or height it means it is not
    // visible within `viewports`.
    return width <= 0 || height <= 0
      ? undefined
      : {
          x: visibleRect.left,
          y: visibleRect.top,
          width,
          height,
        };
  }

  const SKIP_TEXT_ELEMENTS = new Set([
    // Ignore the default text in the HTML of `<textarea>` (if any), which is not
    // updated as the user types.
    "textarea",
    // Ignore the text of `<option>`s inside `<select>` and `<datalist>`, most
    // of which are not visible.
    "select",
    "datalist",
    // Ignore fallback content inside `<canvas>`, `<audio>` and `<video>`.
    "canvas",
    "audio",
    "video",
    // Google has `<style>` elements inside some `<div>`s with click listeners.
    "style",
    // If we ignore `<style>` we could just as well ignore `<script>` too.
    "script",
    // Finally, ignore the two elements with the most text of all. They aren’t
    // useful and cause performance issues.
    "html",
    "body",
  ]);

  function shouldSkipElementText(element) {
    return (
      // Checking `.localName` is ~3x faster than `instanceof` in the link monster
      // demo.
      SKIP_TEXT_ELEMENTS.has(element.localName) ||
      // Shadow hosts _can_ have text that is never displayed. Ideally we should
      // catch closed shadow roots as well, but it’s unclear if it’s worth the
      // trouble.
      element.shadowRoot !== null
    );
  }

  function* walkTextNodes(element) {
    let ignoreText = false;

    if (!shouldSkipElementText(element)) {
      for (const node of element.childNodes) {
        if (node?.nodeType === 3) {
          if (!ignoreText) {
            // Detect 1px elements with `overflow: hidden;` used to visually hide
            // screen reader text. One has to measure the _element_ – because the
            // (clipped) _text_ still has a reasonable size!
            const parentRect = element.getBoundingClientRect();
            const isScreenReaderOnly =
              parentRect.width <= 1 && parentRect.height <= 1;
            if (isScreenReaderOnly) {
              ignoreText = true;
            } else {
              yield node;
            }
          }
        } else if (node instanceof HTMLElement) {
          yield* walkTextNodes(node);
        }
      }
    }
  }

  // This is like `element.textContent`, except it skips the content of some
  // elements (see `walkTextNodes`). This does not seem to be slower than
  // `.textContent`.
  function extractText(element) {
    if (shouldSkipElementText(element)) {
      return "";
    }
    const onlyChild =
      element.childNodes.length === 1 ? element.childNodes[0] : undefined;
    return onlyChild !== undefined && onlyChild?.nodeType === 3
      ? onlyChild.data
      : // This line is sufficient by itself. The above is just a performance
        // optimization for a common case (a single text node child).
        Array.from(walkTextNodes(element), (node) => node.data).join("");
  }

  function getTextRects({
    element,
    viewports,
    words,
    checkElementAtPoint = true,
  }) {
    const text = extractText(element).toLowerCase();

    const ranges = [];

    for (const word of words) {
      let index = -1;
      while ((index = text.indexOf(word, index + 1)) >= 0) {
        ranges.push({
          start: index,
          end: index + word.length,
          range: document.createRange(),
        });
      }
    }

    if (ranges.length === 0) {
      return [];
    }

    let index = 0;

    for (const node of walkTextNodes(element)) {
      const nextIndex = index + node.length;

      for (const { start, end, range } of ranges) {
        if (start >= index && start < nextIndex) {
          range.setStart(node, start - index);
        }
        if (end >= index && end <= nextIndex) {
          range.setEnd(node, end - index);
        }
      }

      index = nextIndex;
    }

    const [offsetX, offsetY] = viewports.reduceRight(
      ([x, y], viewport) => [x + viewport.x, y + viewport.y],
      [0, 0]
    );

    return ranges.flatMap(({ range }) => {
      const rects = range.getClientRects();
      return Array.from(rects, (rect) => {
        const box = getVisibleBox(rect, viewports);
        if (box === undefined) {
          return [];
        }
        if (!checkElementAtPoint) {
          return box;
        }
        const elementAtPoint = getElementFromPoint(
          element,
          Math.round(box.x + box.width / 2 - offsetX),
          Math.round(box.y + box.height / 2 - offsetY)
        );
        return elementAtPoint !== undefined && element.contains(elementAtPoint)
          ? box
          : [];
      }).flat();
    });
  }

  function getElementFromPoint(element, x, y) {
    const root = element.getRootNode();
    const doc =
      root instanceof Document || root instanceof ShadowRoot ? root : document;
    const elementFromPoint = doc.elementFromPoint(x, y);
    return elementFromPoint === null ? undefined : elementFromPoint;
  }

  function classlist(...args) {
    return args
      .flatMap((arg) =>
        typeof arg === "string"
          ? arg
          : Object.entries(arg)
              .filter(([, enabled]) => enabled)
              .map(([className]) => className)
      )
      .join(" ");
  }

  function isMixedCase(string) {
    return string.toLowerCase() !== string && string.toUpperCase() !== string;
  }

  function splitEnteredText(enteredText) {
    return enteredText.split(" ").filter((word) => word !== "");
  }

  // Deep equal for JSON data.
  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }

      for (let index = a.length - 1; index >= 0; index--) {
        if (!deepEqual(a[index], b[index])) {
          return false;
        }
      }

      return true;
    }

    if (
      typeof a === "object" &&
      a !== null &&
      typeof b === "object" &&
      b !== null
    ) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) {
        return false;
      }

      const keys = new Set(keysA.concat(keysB));

      for (const key of keys) {
        if (!deepEqual(a[key], b[key])) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  const UnsignedInt = chain(number, (value) => {
    if (!(Number.isFinite(value) && value >= 0 && Number.isInteger(value))) {
      throw new DecoderError({
        message: `Expected an unsigned finite integer`,
        value,
      });
    }
    return value;
  });

  function normalizeUnsignedInt(value, defaultValue) {
    const parsed = parseFloat(value);
    const defaulted =
      Number.isFinite(parsed) && parsed >= 0 && Number.isInteger(parsed)
        ? parsed
        : defaultValue;
    return defaulted.toString();
  }

  const UnsignedFloat = chain(number, (value) => {
    if (!(Number.isFinite(value) && value >= 0)) {
      throw new DecoderError({
        message: "Expected an unsigned finite float",
        value,
      });
    }
    return value;
  });

  function normalizeUnsignedFloat(value, defaultValue) {
    const parsed = parseFloat(value);
    const defaulted =
      Number.isFinite(parsed) && parsed >= 0 ? parsed : defaultValue;
    return defaulted.toString();
  }

  function decode(decoder, value, map) {
    try {
      return decoder(value);
    } catch (error) {
      if (error instanceof DecoderError) {
        const originalPath = map?.get(JSON.stringify(error.path));
        if (originalPath !== undefined) {
          error.path = originalPath;
        }
        throw new TypeError(error.format());
      } else {
        throw error;
      }
    }
  }

  function fireAndForget(promise, name, ...args) {
    promise.catch((error) => {
      log("error", name, error, ...args);
    });
  }

  const Options = fieldsAuto({
    chars: chain(string, validateChars),
    autoActivate: boolean,
    overTypingDuration: UnsignedInt,
    css: string,
    logLevel: LogLevel,
    useKeyTranslations: boolean,
    keyTranslations: record(KeyPair),
    normalKeyboardShortcuts: array(KeyboardMappingWithModifiers),
    hintsKeyboardShortcuts: array(KeyboardMapping),
  });

  const MIN_CHARS = 2;

  function validateChars(chars) {
    if (/\s/.test(chars)) {
      throw new DecoderError({
        message: "Expected chars not to contain whitespace",
        value: chars,
      });
    }

    const match = /(.)(?=.*\1)/.exec(chars);
    if (match !== null) {
      throw new DecoderError({
        message: `Expected chars not to contain duplicate characters, but got ${repr(
          match[1]
        )} more than once.`,
        value: DecoderError.MISSING_VALUE,
      });
    }

    if (chars.length < MIN_CHARS) {
      throw new DecoderError({
        message: `Expected at least ${repr(MIN_CHARS)} chars`,
        value: chars.length,
      });
    }

    return chars;
  }

  function normalizeChars(chars, defaultValue) {
    const unique = pruneChars(chars);
    return unique.length >= MIN_CHARS
      ? unique
      : unique.length === 0
      ? defaultValue
      : pruneChars(unique + defaultValue).slice(0, MIN_CHARS);
  }

  function pruneChars(chars) {
    return Array.from(new Set(Array.from(chars.replace(/\s/g, "")))).join("");
  }

  function flattenOptions(options) {
    const {
      keyTranslations,
      normalKeyboardShortcuts,
      hintsKeyboardShortcuts,
      ...rest
    } = options;

    return {
      ...rest,
      ...flattenKeyTranslations(keyTranslations, "keys"),
      ...flattenKeyboardMappings(normalKeyboardShortcuts, "normal"),
      ...flattenKeyboardMappings(hintsKeyboardShortcuts, "hints"),
    };
  }

  function flattenKeyTranslations(keyTranslations, prefix) {
    return Object.fromEntries(
      Object.keys(keyTranslations).map((code) => [
        `${prefix}.${code}`,
        keyTranslations[code],
      ])
    );
  }

  function flattenKeyboardMappings(mappings, prefix) {
    return Object.fromEntries(
      mappings.map((mapping) => [
        `${prefix}.${serializeShortcut(mapping.shortcut)}`,
        mapping.action,
      ])
    );
  }

  const PREFIX_REGEX = /([^.]+)\.([^]*)/;

  // This takes a flat object and turns it into an object that can be fed to
  // `makeOptionsDecoder`. It also returns a map where you can lookup the `.path`
  // of a `DecoderError` to get the original key in the flat object.
  function unflattenOptions(object) {
    const options = {};
    const map = new Map();

    function set(parent, fullKey, key, value) {
      if (!(typeof options[parent] === "object" && options[parent] !== null)) {
        options[parent] = {};
      }
      if (value !== null) {
        options[parent][key] = value;
        map.set(JSON.stringify([parent, key]), [fullKey]);
        if (Array.isArray(value)) {
          for (let index = 0; index < value.length; index++) {
            map.set(JSON.stringify([parent, key, index]), [fullKey, index]);
          }
        } else if (typeof value === "object" && value !== null) {
          for (const subKey of Object.keys(value)) {
            map.set(JSON.stringify([parent, key, subKey]), [fullKey, subKey]);
          }
        }
      }
    }

    function pushShortcut(parent, fullKey, key, value) {
      if (!Array.isArray(options[parent])) {
        options[parent] = [];
      }
      if (value !== null) {
        const length = options[parent].push({
          shortcut: deserializeShortcut(key),
          action: value,
        });
        map.set(JSON.stringify([parent, length - 1, "shortcut"]), [fullKey]);
        map.set(JSON.stringify([parent, length - 1, "action"]), [fullKey]);
      }
    }

    for (const key of Object.keys(object)) {
      const item = object[key];
      const [, start, rest] = PREFIX_REGEX.exec(key) ?? ["", "", ""];

      switch (start) {
        case "keys":
          set("keyTranslations", key, rest, item);
          break;

        case "normal":
          pushShortcut("normalKeyboardShortcuts", key, rest, item);
          break;

        case "hints":
          pushShortcut("hintsKeyboardShortcuts", key, rest, item);
          break;

        default:
          options[key] = item;
      }
    }

    return [options, map];
  }

  const DEBUG_PREFIX = "debug.";

  function importOptions(flatOptions, options) {
    try {
      const updatedOptionsFlat = {
        ...flattenOptions(options),
        ...flatOptions,
      };
      const [unflattened, map] = unflattenOptions(updatedOptionsFlat);
      const newOptions = decode(Options, unflattened, map);
      return {
        options: newOptions,
        successCount: Object.keys(flatOptions).length,
        errors: [],
      };
    } catch (errorAny) {
      const error = errorAny;
      return {
        options: undefined,
        successCount: 0,
        errors: [`The file is invalid: ${error.message}`],
      };
    }
  }

  function Attachment({ label, contents, children, ...restProps }) {
    const Tag = label !== undefined ? "label" : "span";
    return h$1(
      Tag,
      { ...restProps, className: "Attachment" },
      h$1(
        "span",
        {
          className: classlist("Attachment-content", {
            TinyLabel: label !== undefined,
          }),
        },

        label !== undefined ? label : contents
      ),
      children
    );
  }

  var t$4,
    u,
    r,
    o$1,
    i = 0,
    c = [],
    f = [],
    e = l$1.__b,
    a = l$1.__r,
    v = l$1.diffed,
    l = l$1.__c,
    m = l$1.unmount;
  function d(t, r) {
    l$1.__h && l$1.__h(u, t, i || r), (i = 0);
    var o = u.__H || (u.__H = { __: [], __h: [] });
    return t >= o.__.length && o.__.push({ __V: f }), o.__[t];
  }
  function p(n) {
    return (i = 1), y(z, n);
  }
  function y(n, r, o) {
    var i = d(t$4++, 2);
    if (
      ((i.t = n),
      !i.__c &&
        ((i.__ = [
          o ? o(r) : z(void 0, r),
          function (n) {
            var t = i.__N ? i.__N[0] : i.__[0],
              u = i.t(t, n);
            t !== u && ((i.__N = [u, i.__[1]]), i.__c.setState({}));
          },
        ]),
        (i.__c = u),
        !i.__c.u))
    ) {
      i.__c.__H.u = !0;
      var c = i.__c.shouldComponentUpdate;
      i.__c.shouldComponentUpdate = function (n, t, u) {
        var r = i.__c.__H.__.filter(function (n) {
          return n.__c;
        });
        return r.every(function (n) {
          return !n.__N;
        })
          ? !c || c(n, t, u)
          : !r.every(function (n) {
              if (!n.__N) return !0;
              var t = n.__[0];
              return (n.__ = n.__N), (n.__N = void 0), t === n.__[0];
            }) &&
              (!c || c(n, t, u));
      };
    }
    return i.__N || i.__;
  }
  function _(r, o) {
    var i = d(t$4++, 3);
    !l$1.__s && w(i.__H, o) && ((i.__ = r), (i.o = o), u.__H.__h.push(i));
  }
  function h(r, o) {
    var i = d(t$4++, 4);
    !l$1.__s && w(i.__H, o) && ((i.__ = r), (i.o = o), u.__h.push(i));
  }
  function s(n) {
    return (
      (i = 5),
      F(function () {
        return { current: n };
      }, [])
    );
  }
  function F(n, u) {
    var r = d(t$4++, 7);
    return w(r.__H, u) ? ((r.__V = n()), (r.o = u), (r.__h = n), r.__V) : r.__;
  }
  function T(n, t) {
    return (
      (i = 8),
      F(function () {
        return n;
      }, t)
    );
  }
  function b() {
    for (var t; (t = c.shift()); )
      if (t.__P && t.__H)
        try {
          t.__H.__h.forEach(j), t.__H.__h.forEach(k), (t.__H.__h = []);
        } catch (u) {
          (t.__H.__h = []), l$1.__e(u, t.__v);
        }
  }
  (l$1.__b = function (n) {
    (u = null), e && e(n);
  }),
    (l$1.__r = function (n) {
      a && a(n), (t$4 = 0);
      var o = (u = n.__c).__H;
      o &&
        (r === u
          ? ((o.__h = []),
            (u.__h = []),
            o.__.forEach(function (n) {
              n.__N && (n.__ = n.__N), (n.__V = f), (n.__N = n.o = void 0);
            }))
          : (o.__h.forEach(j), o.__h.forEach(k), (o.__h = []))),
        (r = u);
    }),
    (l$1.diffed = function (t) {
      v && v(t);
      var i = t.__c;
      i &&
        i.__H &&
        (i.__H.__h.length &&
          ((1 !== c.push(i) && o$1 === l$1.requestAnimationFrame) ||
            (
              (o$1 = l$1.requestAnimationFrame) ||
              function (n) {
                var t,
                  u = function () {
                    clearTimeout(r),
                      g && cancelAnimationFrame(t),
                      setTimeout(n);
                  },
                  r = setTimeout(u, 100);
                g && (t = requestAnimationFrame(u));
              }
            )(b)),
        i.__H.__.forEach(function (n) {
          n.o && (n.__H = n.o),
            n.__V !== f && (n.__ = n.__V),
            (n.o = void 0),
            (n.__V = f);
        })),
        (r = u = null);
    }),
    (l$1.__c = function (t, u) {
      u.some(function (t) {
        try {
          t.__h.forEach(j),
            (t.__h = t.__h.filter(function (n) {
              return !n.__ || k(n);
            }));
        } catch (r) {
          u.some(function (n) {
            n.__h && (n.__h = []);
          }),
            (u = []),
            l$1.__e(r, t.__v);
        }
      }),
        l && l(t, u);
    }),
    (l$1.unmount = function (t) {
      m && m(t);
      var u,
        r = t.__c;
      r &&
        r.__H &&
        (r.__H.__.forEach(function (n) {
          try {
            j(n);
          } catch (n) {
            u = n;
          }
        }),
        u && l$1.__e(u, r.__v));
    });
  var g = "function" == typeof requestAnimationFrame;
  function j(n) {
    var t = u,
      r = n.__c;
    "function" == typeof r && ((n.__c = void 0), r()), (u = t);
  }
  function k(n) {
    var t = u;
    (n.__c = n.__()), (u = t);
  }
  function w(n, t) {
    return (
      !n ||
      n.length !== t.length ||
      t.some(function (t, u) {
        return t !== n[u];
      })
    );
  }
  function z(n, t) {
    return "function" == typeof t ? t(n) : t;
  }

  function ButtonWithPopup({
    open: openProp,
    buttonContent,
    popupContent,
    onOpenChange,
    className = "",
    ...restProps
  }) {
    const onChangeRef = s(undefined);
    onChangeRef.current = onOpenChange;

    const [openState, setOpenState] = p(false);

    const open = openProp !== undefined ? openProp : openState;

    const rootRef = s(null);

    const setOpen = T(
      (newOpen) => {
        if (openProp === undefined) {
          setOpenState(newOpen);
        }
        if (onChangeRef.current !== undefined) {
          onChangeRef.current(newOpen);
        }
      },
      [openProp]
    );

    _(() => {
      if (open) {
        function closeIfOutside(event) {
          const root = rootRef.current;
          const { target } = event;

          if (
            root !== null &&
            target instanceof Node &&
            !root.contains(target) &&
            target !== document
          ) {
            setOpen(false);
          }
        }

        const resets = new Resets();
        resets.add(
          addEventListener(
            window,
            "focus",
            closeIfOutside,
            "ButtonWithPopup closeIfOutside"
          ),
          addEventListener(
            window,
            "click",
            closeIfOutside,
            "ButtonWithPopup closeIfOutside"
          )
        );

        return () => {
          resets.reset();
        };
      }

      return undefined;
    }, [open, setOpen]);

    return h$1(
      "div",
      {
        className: classlist("ButtonWithPopup", { "is-open": open }),
        ref: rootRef,
      },

      h$1(
        "button",
        {
          ...restProps,
          type: "button",
          className: classlist("ButtonWithPopup-button", className),
          onClick: () => {
            setOpen(!open);
          },
        },

        buttonContent
      ),

      open &&
        h$1(
          "div",
          { className: "ButtonWithPopup-popup" },
          popupContent({
            close: () => {
              setOpen(false);
            },
          })
        )
    );
  }

  var o = function () {};
  (o.prototype.shouldComponentUpdate = function (t) {
    return this.update(t), !1;
  }),
    (o.prototype.componentDidMount = function () {
      var t = this.__P;
      t &&
        ((this.shadow = t.attachShadow({ mode: "open" })),
        this.update(this.props));
    }),
    (o.prototype.componentWillUnmount = function () {
      this.update(this.props, !0);
    }),
    (o.prototype.update = function (o, e) {
      var n = P(e ? null : o.children, this.shadow, undefined);
      e && n && n.remove();
    }),
    (o.prototype.render = function () {});

  const HINT_X = 38; // px
  const HINT_Y = 50; // px
  const HINT_X_OFFSET = 10; // px
  const HINT_Y_OFFSET = 10; // px

  const HINT_VARIATIONS = [
    [
      [0, 1],
      [1, 0],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
    [
      [0, 3],
      [2, 1],
      [3, 0],
    ],
  ];

  const FILTER_BY_TEXT = h$1(
    "p",
    null,
    "Nearby example ",
    h$1("span", { style: { fontVariant: "all-small-caps" } }, "TEXT"),
    " ",
    "to filter."
  );
  const ENTERED_TEXT = "filter by text ex";

  function CSSPreview({ chars, css, peek }) {
    const containerRef = s(null);
    const filterByTextRef = s(null);

    const [textRects, setTextRects] = p([]);

    function updateTextRects() {
      const containerElement = containerRef.current;
      const filterByTextElement = filterByTextRef.current;
      if (containerElement === null || filterByTextElement === null) {
        return;
      }

      const rect = containerElement.getBoundingClientRect();

      const newTextRects = getTextRects({
        element: filterByTextElement,
        viewports: [],
        words: new Set(splitEnteredText(ENTERED_TEXT)),
        checkElementAtPoint: false,
      }).map((box) => ({
        ...box,
        x: box.x - rect.left,
        y: box.y - rect.top,
      }));

      setTextRects(newTextRects);
    }

    _(updateTextRects, []);

    let hintZIndex = MAX_Z_INDEX;
    const hint = ({
      left,
      top,
      matchedChars = "",
      chars: unmatchedChars,
      highlighted = false,
      hidden = false,
    }) => {
      hintZIndex--;
      const hasMatchedChars = matchedChars !== "";
      return h$1(
        "div",
        {
          key: hintZIndex,
          className: classlist(HINT_CLASS, {
            [MIXED_CASE_CLASS]: isMixedCase(chars),
            [HAS_MATCHED_CHARS_CLASS]: hasMatchedChars,
            [HIGHLIGHTED_HINT_CLASS]: highlighted,
            [HIDDEN_CLASS]: hidden,
          }),
          style: {
            position: "absolute",
            left: HINT_X_OFFSET + left,
            top: HINT_Y_OFFSET + top,
            zIndex: hintZIndex,
          },
        },

        hasMatchedChars &&
          h$1("span", { className: MATCHED_CHARS_CLASS }, matchedChars),
        unmatchedChars
      );
    };

    return h$1(
      "div",
      {
        className: "Preview",
        style: {
          height: HINT_Y_OFFSET * 2 + HINT_Y * (HINT_VARIATIONS.length + 2),
          zIndex: MAX_Z_INDEX,
        },
      },

      h$1(
        "div",
        {
          style: {
            position: "absolute",
            top: HINT_Y_OFFSET + HINT_Y * (HINT_VARIATIONS.length + 1),
            right: HINT_X_OFFSET,
          },
          ref: filterByTextRef,
        },

        FILTER_BY_TEXT
      ),

      h$1(
        "div",
        { style: { height: "100%" }, ref: containerRef },
        h$1(
          o,
          null,
          h$1(
            "div",
            { className: classlist(ROOT_CLASS, { [PEEK_CLASS]: peek }) },
            hint({
              left: 0,
              top: HINT_Y * (HINT_VARIATIONS.length + 1),
              chars: SHRUGGIE,
            }),

            hint({
              left: HINT_X * 2,
              top: HINT_Y * (HINT_VARIATIONS.length + 1),
              chars: "hidden",
              hidden: true,
            }),

            h$1(
              "div",
              {
                className: STATUS_CLASS,
                style: {
                  position: "absolute",
                  zIndex: MAX_Z_INDEX.toString(),
                },
              },

              ENTERED_TEXT
            ),

            chars.split("").map((char, index) =>
              hint({
                left: HINT_X * index,
                top: 0,
                chars: char,
              })
            ),

            HINT_VARIATIONS.map((variations, y) =>
              variations
                .flatMap(([numMatched, numChars]) =>
                  [false, true].map((highlighted) => ({
                    matchedChars: chars.slice(0, numMatched),
                    chars: chars.slice(numMatched, numMatched + numChars),
                    highlighted,
                  }))
                )
                .map((props, x) =>
                  hint({
                    left: HINT_X * 2 * x,
                    top: HINT_Y * (y + 1),
                    ...props,
                  })
                )
            ),

            textRects.map((box, index) =>
              h$1("div", {
                key: index,
                className: TEXT_RECT_CLASS,
                "data-frame-id": 0,
                style: {
                  position: "absolute",
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                  zIndex: MIN_Z_INDEX.toString(),
                },
              })
            ),

            h$1("style", null, `${CSS}\n\n${css}`)
          )
        )
      )
    );
  }

  function Details({ summary, open, onChange, children }) {
    return h$1(
      "div",
      null,
      h$1(
        "button",
        {
          type: "button",
          className: classlist("Details-button Toggle", { "is-open": open }),
          onClick: () => {
            onChange(!open);
          },
        },

        summary
      ),
      open && children
    );
  }

  function Field({
    id,
    connected = false,
    fullWidth = false,
    label,
    span = false,
    description,
    changed,
    changedRight = false,
    render,
    onReset,
  }) {
    const reset =
      onReset !== undefined && changed
        ? h$1(
            "button",
            {
              type: "button",
              className: "Field-resetButton TextSmall",
              onClick: onReset,
            },
            "Reset"
          )
        : undefined;

    return h$1(
      "div",
      {
        className: classlist("Field", "SpacedVertical", {
          "is-connected": connected,
          "is-fullWidth": fullWidth,
          "is-changed": changed,
          "is-changedRight": changedRight,
        }),
      },

      h$1(
        "div",
        null,
        span
          ? h$1("span", { className: "Field-label" }, label, reset)
          : h$1(
              "span",
              { className: "Field-label" },
              h$1("label", { htmlFor: id }, label),
              reset
            ),

        render({ id })
      ),

      description !== undefined &&
        h$1("div", { className: "Field-description TextSmall" }, description)
    );
  }

  function ImportSummary({ success, tweakable, errors }) {
    const successString = success === 1 ? `1 value` : `${success} values`;
    const tweakableString =
      tweakable === 1 ? `1 debug value` : `${tweakable} debug values`;
    const errorsString = errors === 1 ? `1 error` : `${errors} errors`;

    switch (true) {
      case success === 0 && tweakable === 0 && errors === 0:
        return h$1("p", null, "The file contains nothing to import.");

      case success === 0 && tweakable === 0:
        return h$1(
          "p",
          null,
          "❌ Failed to import the file. (",
          errorsString,
          ")"
        );

      default:
        return h$1(
          "div",
          null,
          success > 0 &&
            h$1("p", null, "✅ ", successString, " successfully imported."),
          tweakable > 0 && h$1("p", null, "ℹ️ ", tweakableString, " written."),
          errors > 0 && h$1("p", null, "❌ ", errorsString, " found.")
        );
    }
  }

  const WHITESPACE = /^\s$/;

  function KeyboardShortcut({ mac, shortcut }) {
    const { key = "" } = shortcut;
    return h$1(
      "span",
      { className: "KeyboardShortcut" },
      shortcut.cmd === true &&
        h$1("kbd", { title: mac ? "Command" : undefined }, mac ? "⌘" : "Cmd"),
      shortcut.ctrl === true &&
        h$1("kbd", { title: mac ? "Control" : undefined }, mac ? "^" : "Ctrl"),
      shortcut.alt === true &&
        h$1(
          "kbd",
          { title: mac ? "Option/Alt" : undefined },
          mac ? "⌥" : "Alt"
        ),
      hasShift(shortcut) &&
        h$1("kbd", { title: mac ? "Shift" : undefined }, mac ? "⇧" : "Shift"),
      key !== "" &&
        h$1(
          "kbd",
          null,
          WHITESPACE.test(key)
            ? viewKey(key)
            : key.length === 1
            ? key.toUpperCase()
            : key
        )
    );
  }

  function hasShift(shortcut) {
    const { key = "" } = shortcut;
    return key.length === 1
      ? // For printable keys, guess that Shift is used for uppercase letters.
        key.toLowerCase() !== key.toUpperCase() && key.toUpperCase() === key
      : shortcut.shift ?? false;
  }

  function viewKey(key) {
    if (key === " ") {
      return "Space";
    }

    if (WHITESPACE.test(key)) {
      return `U+${key
        .charCodeAt(0)
        .toString(16)
        .padStart(4, "0")
        .toUpperCase()}`;
    }

    return key;
  }

  class KeyboardShortcuts extends d$1 {
    state = {
      addingAction: undefined,
      shortcutError: undefined,
    };

    componentDidUpdate(prevProps) {
      const {
        capturedKeypressWithTimestamp,
        mode,
        mac,
        useKeyTranslations,
        mappings,
        onAddChange,
      } = this.props;
      const { addingAction } = this.state;

      if (
        !deepEqual(
          capturedKeypressWithTimestamp,
          prevProps.capturedKeypressWithTimestamp
        )
      ) {
        if (
          capturedKeypressWithTimestamp === undefined ||
          addingAction === undefined
        ) {
          this.setState({ shortcutError: undefined });
          return;
        }

        const capturedKeypress = capturedKeypressWithTimestamp.keypress;
        const { shortcutError } = this.state;

        const shortcut = {
          key: capturedKeypress.key,
          alt: capturedKeypress.alt,
          cmd: capturedKeypress.cmd,
          ctrl: capturedKeypress.ctrl,
          shift:
            capturedKeypress.shift === undefined
              ? false
              : capturedKeypress.shift,
        };

        const confirm = (newShortcutError) => {
          if (deepEqual(shortcutError, newShortcutError)) {
            this.saveMapping({
              shortcut,
              action: addingAction,
            });
          } else {
            this.setState({
              shortcutError: newShortcutError,
            });
          }
        };

        // The Space key is a good choice for cancelling since it cannot be used
        // in hints mode (it breaks filter by text). (Outside hints mode,
        // shortcuts without modifiers cannot be used anyway.)
        if (shortcut.key === "Space" && !hasModifier(shortcut)) {
          this.setState({
            addingAction: undefined,
            shortcutError: undefined,
          });
          onAddChange(false);
          return;
        }

        if (!isRecognized(shortcut.key)) {
          this.setState({
            shortcutError: {
              shortcut,
              error: { type: "UnrecognizedKey" },
            },
          });
          return;
        }

        if (
          mode === "Normal" &&
          !(hasModifier(shortcut) || isAllowedWithShiftOnly(shortcut))
        ) {
          this.setState({
            shortcutError: {
              shortcut,
              error: { type: "MissingModifier", shift: hasShift(shortcut) },
            },
          });
          return;
        }

        const conflictingMapping = mappings.find((mapping) =>
          deepEqual(mapping.shortcut, shortcut)
        );
        if (conflictingMapping !== undefined) {
          if (conflictingMapping.action === addingAction) {
            this.setState({
              addingAction: undefined,
              shortcutError: undefined,
            });
            onAddChange(false);
          } else {
            confirm({
              shortcut,
              error: {
                type: "OtherShortcutConflict",
                otherMapping: conflictingMapping,
              },
            });
          }

          return;
        }

        if (
          mode === "Normal" &&
          getTextEditingShortcuts(mac).some((shortcut2) =>
            deepEqual(shortcut, shortcut2)
          )
        ) {
          confirm({
            shortcut,
            error: { type: "CommonTextEditingShortcutConflict" },
          });
          return;
        }

        const hasOtherModifier = shortcut.ctrl || shortcut.cmd;
        if (
          mac &&
          shortcut.alt &&
          capturedKeypress.printableKey !== undefined &&
          !(mode === "Normal" && useKeyTranslations && hasOtherModifier) &&
          !(mode === "Hints" && useKeyTranslations)
        ) {
          confirm({
            shortcut,
            error: {
              type: "MacOptionKey",
              printableKey: capturedKeypress.printableKey,
              hasOtherModifier,
            },
          });
          return;
        }

        this.saveMapping({
          shortcut,
          action: addingAction,
        });
      }
    }

    saveMapping(newMapping) {
      const { mappings, onChange, onAddChange } = this.props;
      const newMappings = mappings
        .filter((mapping) => !deepEqual(mapping.shortcut, newMapping.shortcut))
        .concat(newMapping);

      this.setState({
        addingAction: undefined,
        shortcutError: undefined,
      });

      onChange(newMappings);
      onAddChange(false);
    }

    render() {
      const {
        id,
        name,
        description,
        mode,
        mac,
        useKeyTranslations,
        mappings,
        defaultMappings,
        chars,
        onChange,
        onAddChange,
      } = this.props;
      const { addingAction, shortcutError } = this.state;

      return h$1(Field, {
        id: id,
        fullWidth: true,
        label: name,
        span: true,
        description: description,
        changed: false,
        render: () =>
          h$1(
            "div",
            null,
            h$1(
              "table",
              { className: "ShortcutsTable" },
              h$1(
                "tbody",
                null,
                defaultMappings.map((defaultMapping, index) => {
                  const shortcuts = mappings
                    .filter(
                      (mapping) => mapping.action === defaultMapping.action
                    )
                    .map((mapping) => ({
                      key: serializeShortcut(mapping.shortcut),
                      shortcut: mapping.shortcut,
                    }))
                    .sort((a, b) => compare(a.key, b.key));

                  const changed = !(
                    shortcuts.length === 1 &&
                    shortcuts.every(({ shortcut }) =>
                      deepEqual(shortcut, defaultMapping.shortcut)
                    )
                  );

                  const isAdding = addingAction === defaultMapping.action;

                  const conflictingChars = getConflictingChars(
                    shortcuts.map(({ shortcut }) => shortcut),
                    chars
                  );

                  return h$1(
                    "tr",
                    {
                      key: index,
                      id: getKeyboardActionId(defaultMapping.action),
                    },

                    h$1(
                      "th",
                      { className: classlist({ "is-changed": changed }) },
                      h$1(
                        "p",
                        null,
                        describeKeyboardAction(defaultMapping.action).name
                      ),
                      conflictingChars.length > 0 &&
                        h$1(
                          "p",
                          { className: "TextSmall Error" },
                          "Overridden hint characters:",
                          " ",
                          conflictingChars.join(", ")
                        )
                    ),
                    h$1(
                      "td",
                      null,
                      h$1(
                        "div",
                        { className: "Spaced Spaced--center" },
                        h$1(
                          "div",
                          { className: "ShortcutsGrid" },
                          shortcuts.map(({ key, shortcut }) =>
                            h$1(
                              "div",
                              { key: key },
                              h$1(KeyboardShortcut, {
                                mac: mac,
                                shortcut: shortcut,
                              }),
                              h$1(
                                "button",
                                {
                                  type: "button",
                                  title: "Remove this shortcut",
                                  className: "RemoveButton",
                                  onClick: () => {
                                    onChange(
                                      mappings.filter(
                                        (mapping) =>
                                          !deepEqual(shortcut, mapping.shortcut)
                                      )
                                    );
                                  },
                                },
                                "×"
                              )
                            )
                          )
                        ),

                        h$1(
                          "div",
                          { className: "AddShortcutButton" },
                          h$1(ButtonWithPopup, {
                            title: "Add shortcut",
                            className: "AddShortcutButton-button",
                            open: isAdding,
                            buttonContent: h$1("strong", null, "+"),
                            onOpenChange: (open) => {
                              this.setState({
                                addingAction: open
                                  ? defaultMapping.action
                                  : undefined,
                              });
                              onAddChange(open);
                            },
                            popupContent: () =>
                              h$1(
                                "div",
                                {
                                  className: "SpacedVertical",
                                  style: { width: 450 },
                                },

                                shortcutError === undefined
                                  ? h$1(ShortcutAddDisplay, {
                                      mac: mac,
                                      defaultMapping: defaultMapping,
                                    })
                                  : h$1(
                                      "div",
                                      { className: "SpacedVertical" },
                                      h$1(KeyboardShortcut, {
                                        mac: mac,
                                        shortcut: shortcutError.shortcut,
                                      }),
                                      h$1(ShortcutErrorDisplay, {
                                        mode: mode,
                                        mac: mac,
                                        useKeyTranslations: useKeyTranslations,
                                        error: shortcutError.error,
                                      })
                                    ),
                                h$1(
                                  "p",
                                  { className: "TextSmall" },
                                  h$1(
                                    "em",
                                    null,
                                    "Press",
                                    " ",
                                    h$1(KeyboardShortcut, {
                                      mac: mac,
                                      shortcut: { key: "Space" },
                                    }),
                                    " ",
                                    "to cancel."
                                  )
                                )
                              ),
                          })
                        )
                      )
                    )
                  );
                })
              )
            )
          ),
      });
    }
  }

  function ShortcutAddDisplay({ mac, defaultMapping }) {
    return h$1(
      "div",
      null,
      h$1(
        "p",
        null,
        h$1("strong", null, "Press the keyboard shortcut you’d like to use!")
      ),

      h$1(
        "div",
        { className: "TextSmall SpacedVertical", style: { marginTop: 15 } },
        h$1(
          "p",
          null,
          "Default:",
          " ",
          h$1(KeyboardShortcut, { mac: mac, shortcut: defaultMapping.shortcut })
        ),
        h$1(
          "p",
          null,
          "Note: Some browser/OS shortcuts cannot be overridden. For example,",
          " ",
          h$1(KeyboardShortcut, {
            mac: mac,
            shortcut: {
              key: "w",
              cmd: mac,
              ctrl: !mac,
            },
          }),
          " ",
          "cannot be detected and always closes the current tab."
        )
      )
    );
  }

  function ShortcutErrorDisplay({ mac, mode, useKeyTranslations, error }) {
    switch (error.type) {
      case "UnrecognizedKey":
        return h$1(
          "div",
          null,
          h$1("p", null, h$1("strong", null, "This key was not recognized.")),
          h$1("p", null, "Please choose another one!")
        );

      case "MissingModifier":
        if (error.shift) {
          return h$1(
            "p",
            null,
            h$1(
              "strong",
              null,
              "Only ",
              h$1(KeyboardShortcut, { mac: mac, shortcut: { key: "Escape" } }),
              " ",
              "and ",
              h$1(KeyboardShortcut, { mac: mac, shortcut: { key: "F1" } }),
              "–",

              h$1(KeyboardShortcut, { mac: mac, shortcut: { key: "F12" } }),
              " can be used with only",
              " ",
              h$1(KeyboardShortcut, {
                mac: mac,
                shortcut: { key: "", shift: true },
              }),
              " ",
              "for main keyboard shortcuts."
            )
          );
        }
        return h$1(
          "p",
          null,
          h$1("strong", null, "Main keyboard shortcuts must use a modifier.")
        );

      case "OtherShortcutConflict":
        return h$1(
          "div",
          null,
          h$1(
            "p",
            null,
            h$1(
              "strong",
              null,
              "This shortcut is already used for:",
              " ",
              h$1(
                "span",
                { style: { whiteSpace: "nowrap" } },
                "“",
                describeKeyboardAction(error.otherMapping.action).name,
                ".”"
              )
            )
          ),
          h$1(
            "p",
            null,
            "Press the shortcut again to replace, or choose another one!"
          )
        );

      case "CommonTextEditingShortcutConflict":
        return h$1(
          "div",
          null,
          h$1(
            "p",
            null,
            h$1("strong", null, "This is a common text editing shortcut.")
          ),
          h$1(
            "p",
            null,
            "Press the shortcut again to override, or choose another one!"
          )
        );

      case "MacOptionKey": {
        const Highlight = error.hasOtherModifier ? "strong" : "span";
        const disclaimer = h$1(
          "p",
          null,
          h$1(Highlight, null, "This shortcut should work,"),
          " but it might be difficult to remember which key to press by seeing",
          " ",
          h$1(KeyboardShortcut, {
            shortcut: { key: error.printableKey },
            mac: mac,
          }),
          " ",
          "on this page. Unfortunately, that information isn’t provided by the browser."
        );
        return h$1(
          "div",
          { className: "SpacedVertical" },
          mode === "Normal"
            ? useKeyTranslations
              ? h$1(
                  "p",
                  null,
                  /* `error.hasOtherModifier` is always `false` here. */
                  h$1(
                    "strong",
                    null,
                    "If",
                    " ",
                    h$1(KeyboardShortcut, {
                      shortcut: { key: error.printableKey, alt: true },
                      mac: mac,
                    }),
                    " ",
                    "produces a special character, you won’t be able to type that character in text inputs if using this shortcut."
                  )
                )
              : h$1(
                  "div",
                  null,
                  !error.hasOtherModifier &&
                    h$1(
                      "p",
                      null,
                      h$1(
                        "strong",
                        null,
                        "You might not be able to type",
                        " ",
                        h$1("code", null, printKey(error.printableKey)),
                        " in text inputs if using this shortcut."
                      )
                    ),
                  disclaimer
                )
            : h$1(
                "div",
                null,
                /* `useKeyTranslations` is always `false` here. */
                !error.hasOtherModifier &&
                  h$1(
                    "p",
                    null,
                    h$1(
                      "strong",
                      null,
                      "You might not be able to ",
                      h$1("em", null, "filter by text"),
                      " using",
                      " ",
                      h$1("code", null, printKey(error.printableKey)),
                      " if using this shortcut."
                    )
                  ),
                disclaimer
              ),
          h$1(
            "p",
            null,
            "Press the shortcut again to confirm, or choose another one!"
          )
        );
      }
    }
  }

  function printKey(printableKey) {
    return printableKey === "\u00a0"
      ? "non-breaking space"
      : viewKey(printableKey);
  }

  function getKeyboardActionId(action) {
    return `action-${action}`;
  }

  function describeKeyboardAction(action) {
    switch (action) {
      case "EnterHintsMode_Click":
        return {
          name: "Click",
        };

      case "EnterHintsMode_ManyClick":
        return {
          name: "Click many",
        };

      case "EnterHintsMode_ManyTab":
        return {
          name: "Open many tabs",
        };

      case "EnterHintsMode_BackgroundTab":
        return {
          name: "Open link in new tab",
        };

      case "EnterHintsMode_ForegroundTab":
        return {
          name: "Open link in new tab and switch to it",
        };

      case "EnterHintsMode_Select":
        return {
          name: "Select element",
        };

      case "ExitHintsMode":
        return {
          name: "Exit hints mode",
        };

      case "RotateHintsForward":
        return {
          name: "Rotate hints forward",
        };

      case "RotateHintsBackward":
        return {
          name: "Rotate hints backward",
        };

      case "RefreshHints":
        return {
          name: "Refresh hints",
        };

      case "TogglePeek":
        return {
          name: "Toggle peek mode",
        };

      case "Escape":
        return {
          name: "Exit hints mode, blur elements and clear selection",
        };

      case "ActivateHint":
        return {
          name: "Activate highlighted hint",
        };

      case "ActivateHintAlt":
        return {
          name: "Activate highlighted hint in a new tab",
        };

      case "Backspace":
        return {
          name: "Erase last entered character",
        };

      case "ReverseSelection":
        return {
          name: "Swap which end of a text selection to work on",
        };
    }
  }

  function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  // This does not allow only shift on purpose.
  //
  // - Shift doesn't count as a modifier for printable keys. Example: a vs A.
  // - Shift + non-printable keys are generally already taken. Example:
  //   Shift + ArrowRight selects text. Exception: The keys allowed by
  //   `isAllowedWithShiftOnly`.
  function hasModifier(shortcut) {
    return shortcut.alt || shortcut.cmd || shortcut.ctrl;
  }

  function isAllowedWithShiftOnly(shortcut) {
    return (
      shortcut.shift &&
      (shortcut.key === "Escape" || /^F\d+$/.test(shortcut.key))
    );
  }

  function isRecognized(key) {
    return key !== "Dead" && key !== "Unidentified";
  }

  function getConflictingChars(shortcuts, charsString) {
    const chars = charsString.split("");
    return shortcuts.flatMap((shortcut) =>
      hasModifier(shortcut)
        ? []
        : chars.find((char) => char === shortcut.key) ?? []
    );
  }

  function getConflictingKeyboardActions(
    defaultMappings,
    mappings,
    charsString
  ) {
    const chars = charsString.split("");
    return defaultMappings
      .map((defaultMapping) => {
        const shortcuts = mappings
          .filter((mapping) => mapping.action === defaultMapping.action)
          .map((mapping) => mapping.shortcut);
        const conflicts = chars.filter((char) =>
          shortcuts.some(
            (shortcut) => shortcut.key === char && !hasModifier(shortcut)
          )
        );
        return [defaultMapping.action, conflicts];
      })
      .filter(([, conflicts]) => conflicts.length > 0);
  }

  function getTextEditingShortcuts(mac) {
    function shortcut({
      key,
      alt = false,
      cmd = false,
      ctrl = false,
      shift = false,
    }) {
      return { key, alt, cmd, ctrl, shift };
    }

    return mac
      ? [
          shortcut({ key: "ArrowLeft", cmd: true }),
          shortcut({ key: "ArrowLeft", cmd: true, shift: true }),
          shortcut({ key: "ArrowLeft", alt: true }),
          shortcut({ key: "ArrowLeft", alt: true, shift: true }),
          shortcut({ key: "ArrowRight", cmd: true }),
          shortcut({ key: "ArrowRight", cmd: true, shift: true }),
          shortcut({ key: "ArrowRight", alt: true }),
          shortcut({ key: "ArrowRight", alt: true, shift: true }),
          shortcut({ key: "ArrowUp", cmd: true }),
          shortcut({ key: "ArrowUp", cmd: true, shift: true }),
          shortcut({ key: "ArrowUp", alt: true }),
          shortcut({ key: "ArrowUp", alt: true, shift: true }),
          shortcut({ key: "ArrowDown", cmd: true }),
          shortcut({ key: "ArrowDown", cmd: true, shift: true }),
          shortcut({ key: "ArrowDown", alt: true }),
          shortcut({ key: "ArrowDown", alt: true, shift: true }),
          shortcut({ key: "Backspace", cmd: true }),
          shortcut({ key: "Backspace", alt: true }),
          shortcut({ key: "a", cmd: true }),
          shortcut({ key: "c", cmd: true }),
          shortcut({ key: "v", cmd: true }),
          shortcut({ key: "x", cmd: true }),
          shortcut({ key: "z", cmd: true }),
        ]
      : [
          shortcut({ key: "ArrowLeft", ctrl: true }),
          shortcut({ key: "ArrowLeft", ctrl: true, shift: true }),
          shortcut({ key: "ArrowRight", ctrl: true }),
          shortcut({ key: "ArrowRight", ctrl: true, shift: true }),
          shortcut({ key: "ArrowUp", ctrl: true }),
          shortcut({ key: "ArrowUp", ctrl: true, shift: true }),
          shortcut({ key: "ArrowDown", ctrl: true }),
          shortcut({ key: "ArrowDown", ctrl: true, shift: true }),
          shortcut({ key: "Backspace", ctrl: true }),
          shortcut({ key: "Delete", ctrl: true }),
          shortcut({ key: "Home", ctrl: true }),
          shortcut({ key: "End", ctrl: true }),
          shortcut({ key: "a", ctrl: true }),
          shortcut({ key: "c", ctrl: true }),
          shortcut({ key: "v", ctrl: true }),
          shortcut({ key: "x", ctrl: true }),
          shortcut({ key: "z", ctrl: true }),
        ];
  }

  const MAX_PERF_ENTRIES = 9;

  function Perf({ perf, expandedPerfTabIds, onExpandChange, onReset }) {
    const keys = Object.keys(perf);

    const isEmpty = keys.every((tabId) => perf[tabId].length === 0);

    return h$1(
      "div",
      { className: "SpacedVertical SpacedVertical--large" },
      h$1(
        "div",
        { className: "Intro", style: { paddingBottom: 0 } },
        h$1(
          "div",
          { className: "Spaced" },
          h$1(
            "div",
            null,
            h$1(
              "p",
              null,
              "Here you can see some numbers on how entering hints mode the last",
              " ",
              MAX_PERF_ENTRIES,
              " times has performed. Most numbers are milliseconds."
            ),

            isEmpty &&
              h$1(
                "p",
                null,
                h$1(
                  "strong",
                  null,
                  "Enter hints mode in a tab and stats will appear here!"
                )
              )
          ),

          h$1(
            "div",
            null,
            h$1(
              "button",
              {
                type: "button",
                disabled: isEmpty,
                title:
                  "Data is only stored in memory and is removed automatically when tabs are closed or the whole browser is closed.",
                onClick: () => {
                  onReset();
                },
              },
              "Reset"
            )
          )
        )
      ),

      keys.map((tabId) => {
        const perfData = perf[tabId];
        if (perfData.length === 0) {
          return null;
        }

        const medianDuration = getMedian(
          perfData.map(({ timeToFirstPaint }) => timeToFirstPaint)
        );

        const topData = durationsToRows(
          perfData.map(({ topDurations }) => topDurations)
        );

        const allStats = perfData.map(({ collectStats }) => collectStats);
        const noFrames = allStats.every((stats) => stats.length === 1);
        const collectRows = statsToRows(
          sumStats(noFrames ? "(no frames)" : "total", allStats)
        ).concat(noFrames ? [] : statsToRows(allStats));

        const renderData = durationsToRows(
          perfData.map(({ renderDurations }) => renderDurations)
        );

        const allRows = [
          { title: "Top", data: topData },
          ...collectRows,
          { title: "Render", data: renderData },
        ];

        const expanded = expandedPerfTabIds.includes(tabId);

        return h$1(
          "table",
          { key: tabId, className: "PerfTable TextSmall" },
          h$1(
            "caption",
            { className: classlist("Toggle", { "is-open": expanded }) },
            h$1(
              "button",
              {
                type: "button",
                onClick: () => {
                  onExpandChange(
                    expandedPerfTabIds
                      .filter((id) => id !== tabId)
                      .concat(expanded ? [] : [tabId])
                  );
                },
              },

              h$1("span", { title: `Tab ID: ${tabId}` }, "#", tabId),
              " – ",
              h$1(
                "span",
                { title: "Median time to first paint in milliseconds." },
                formatDuration(medianDuration),
                " ms"
              ),
              " – ",
              Array.from(
                new Set(perfData.map(({ collectStats }) => collectStats[0].url))
              ).join(" | ")
            )
          ),

          expanded &&
            h$1(
              "thead",
              null,
              h$1(
                "tr",
                null,
                h$1("th", null, "Phase"),
                Array.from({ length: MAX_PERF_ENTRIES }, (_, index) =>
                  h$1(
                    "th",
                    { key: index },
                    h$1(
                      "span",
                      {
                        title:
                          index < perfData.length
                            ? perfData[index].collectStats[0].url
                            : undefined,
                      },

                      index + 1
                    )
                  )
                )
              )
            ),

          expanded &&
            h$1(
              "tbody",
              null,
              h$1(
                "tr",
                { className: "PerfTable-alternate" },
                h$1("th", null, "time to first paint"),
                toCells(
                  perfData.map(({ timeToFirstPaint }) =>
                    formatDuration(timeToFirstPaint)
                  )
                )
              ),
              h$1(
                "tr",
                null,
                h$1("th", null, "time to last paint"),
                toCells(
                  perfData.map(({ timeToLastPaint }) =>
                    formatDuration(timeToLastPaint)
                  )
                )
              ),

              allRows.map(({ title, data }, rowIndex) =>
                h$1(
                  p$1,
                  { key: rowIndex },
                  h$1(
                    "tr",
                    null,
                    h$1("th", { colSpan: MAX_PERF_ENTRIES + 1 }, title)
                  ),
                  data.map(({ heading, values }, index) =>
                    h$1(
                      "tr",
                      {
                        key: `${title}-${heading}`,
                        className: classlist({
                          "PerfTable-alternate": index % 2 === 0,
                        }),
                      },

                      h$1("th", null, heading),
                      toCells(values)
                    )
                  )
                )
              )
            )
        );
      })
    );
  }

  function toCells(items) {
    const lastIndex = items.length - 1;
    return Array.from({ length: MAX_PERF_ENTRIES }, (_, index) =>
      h$1("td", { key: index }, index <= lastIndex ? items[index] : null)
    );
  }

  function getMedian(numbers) {
    const sorted = numbers.slice().sort();
    if (sorted.length === 0) {
      return 0;
    }
    const mid = sorted.length / 2;
    if (Number.isInteger(mid)) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[Math.floor(mid)];
  }

  function formatDuration(duration) {
    return Math.round(duration).toString();
  }

  function sumStats(title, allStats) {
    return allStats.map((stats) => {
      const sum = (fn) => stats.reduce((result, item) => result + fn(item), 0);

      return [
        {
          url: title,
          numTotalElements: sum(({ numTotalElements }) => numTotalElements),
          numTrackedElements: sum(
            ({ numTrackedElements }) => numTrackedElements
          ),
          numVisibleElements: sum(
            ({ numVisibleElements }) => numVisibleElements
          ),
          numVisibleFrames: sum(({ numVisibleFrames }) => numVisibleFrames),
          bailed: sum(({ bailed }) => bailed),
          durations: sumDurations(stats.map(({ durations }) => durations)),
        },
      ];
    });
  }

  function sumDurations(allDurations) {
    const result = new Map();

    for (const durations of allDurations) {
      for (const [label, duration] of durations) {
        const previous = result.get(label) ?? 0;
        result.set(label, previous + duration);
      }
    }

    return Array.from(result);
  }

  function durationsToRows(allDurations) {
    const labels = new Set(
      allDurations.flatMap((durations) => durations.map(([label]) => label))
    );

    return Array.from(labels, (label) => ({
      heading: label,
      values: allDurations.map((durations) => {
        const match = durations.find(([label2]) => label2 === label);
        return match !== undefined ? formatDuration(match[1]) : "-";
      }),
    }));
  }

  function statsToRows(allStats) {
    const urls = new Set(
      allStats.flatMap((stats) => stats.map(({ url }) => url))
    );

    return Array.from(urls, (url) => {
      const allData = allStats.map((stats) => {
        const match = stats.find(({ url: url2 }) => url2 === url);
        return match !== undefined
          ? {
              numTotalElements: match.numTotalElements.toString(),
              numTrackedElements: match.numTrackedElements.toString(),
              numVisibleElements: match.numVisibleElements.toString(),
              numVisibleFrames: match.numVisibleFrames.toString(),
              bailed: match.bailed.toString(),
              durations: match.durations,
            }
          : {
              numTotalElements: "-",
              numTrackedElements: "-",
              numVisibleElements: "-",
              numVisibleFrames: "-",
              bailed: "-",
              durations: [],
            };
      });

      return {
        title: `Collect ${url}`,
        data: [
          ...durationsToRows(allData.map(({ durations }) => durations)),
          {
            heading: "# total elements",
            values: allData.map(({ numTotalElements }) => numTotalElements),
          },
          {
            heading: "# tracked elements",
            values: allData.map(({ numTrackedElements }) => numTrackedElements),
          },
          {
            heading: "# visible elements",
            values: allData.map(({ numVisibleElements }) => numVisibleElements),
          },
          {
            heading: "# visible frames",
            values: allData.map(({ numVisibleFrames }) => numVisibleFrames),
          },
          {
            heading: "# bailed",
            values: allData.map(({ bailed }) => bailed),
          },
        ],
      };
    });
  }

  const params = new URLSearchParams(window.location.search);

  function TestLink({ text }) {
    const [clicked, setClicked] = p(false);

    const id = text.toLowerCase().replace(/\W+/g, "-");

    return h$1(
      "a",
      {
        href: `?test=${id}`,
        tabIndex: -1,
        className: classlist("TestLink", { "is-clicked": clicked }),
        onClick: (event) => {
          event.preventDefault();
          setClicked(true);
        },
        onBlur: () => {
          setClicked(false);
        },
      },

      text,
      params.get("test") === id ? "\u00a0✅" : ""
    );
  }

  function TestLinks() {
    const [keys, setKeys] = p([]);

    return h$1(
      "div",
      {
        className: "TestLinks SpacedVertical TextSmall",
        onKeyDown: (event) => {
          if (event.key.length === 1) {
            setKeys(keys.concat(event.key));
          }
        },
        onBlurCapture: () => {
          setKeys([]);
        },
      },

      h$1(
        "div",
        { className: "TestLinks-grid" },
        h$1(TestLink, { text: "Alfa" }),
        h$1(TestLink, { text: "Bravo" }),
        h$1(TestLink, { text: "Charlie" }),
        h$1(TestLink, { text: "Delta" }),
        h$1(TestLink, { text: "Echo" }),
        h$1(TestLink, { text: "Foxtrot" }),
        h$1(TestLink, { text: "Golf" }),
        h$1(TestLink, { text: "Hotel" }),
        h$1(TestLink, { text: "India" }),
        h$1(TestLink, { text: "Juliett" }),
        h$1(TestLink, { text: "Kilo" }),
        h$1(TestLink, { text: "Lima" }),
        h$1(TestLink, { text: "Mike" }),
        h$1(TestLink, { text: "November" }),
        h$1(TestLink, { text: "Oscar" }),
        h$1(TestLink, { text: "Papa" }),
        h$1(TestLink, { text: "Quebec" }),
        h$1(TestLink, { text: "Romeo" }),
        h$1(TestLink, { text: "Sierra" }),
        h$1(TestLink, { text: "Tango" }),
        h$1(TestLink, { text: "Uniform" }),
        h$1(TestLink, { text: "Victor" }),
        h$1(TestLink, { text: "Whiskey" }),
        h$1(TestLink, { text: "X-ray" }),
        h$1(TestLink, { text: "Yankee" }),
        h$1(TestLink, { text: "Zulu" }),
        h$1(TestLink, { text: "$199" })
      ),

      h$1(
        "p",
        { className: "TestLinks-pagination Spaced" },
        h$1(TestLink, { text: "Previous" }),
        Array.from({ length: 12 }, (_, index) =>
          h$1(TestLink, { text: (index + 1).toString() })
        ),
        h$1(TestLink, { text: "Next" })
      ),

      keys.length > 0 &&
        h$1(
          "div",
          null,
          h$1("p", { className: "TinyLabel" }, "Potentially over-typed keys:"),
          h$1("div", null, keys.join(" "))
        )
    );
  }

  const SAVE_TIMEOUT = 200; // ms

  function TextInput({
    savedValue,
    normalize = (string) => string,
    save: saveProp,
    textarea = false,
    className = "",
    onKeyDown,
    ...restProps
  }) {
    // `as "input"` is there because I could not figure out how to make `onInput` type-check otherwise.
    const Tag = textarea ? "textarea" : "input";
    const readonly = saveProp === undefined;

    const [focused, setFocused] = p(false);
    const [stateValue, setStateValue] = p(undefined);

    const value = stateValue !== undefined ? stateValue : savedValue;

    const saveRef = s(undefined);
    saveRef.current = saveProp;

    const normalizeRef = s();
    normalizeRef.current = normalize;

    const selectionStartRef = s(0);
    const selectionEndRef = s(0);
    const rootRef = s(null);

    function storeSelection() {
      const element = rootRef.current;
      if (element !== null) {
        selectionStartRef.current = element.selectionStart;
        selectionEndRef.current = element.selectionEnd;
      }
    }

    function restoreSelection() {
      const element = rootRef.current;
      if (element !== null) {
        element.selectionStart = selectionStartRef.current;
        element.selectionEnd = selectionEndRef.current;
      }
    }

    h(() => {
      // Move the default cursor position from the end of the textarea to the start.
      if (textarea) {
        restoreSelection();
      }
    }, [textarea]);

    h(() => {
      // When readonly textareas change, move the cursor back to the start.
      if (textarea && readonly) {
        selectionStartRef.current = 0;
        selectionEndRef.current = 0;
        return timeout(0, restoreSelection);
      }
      return undefined;
    }, [textarea, readonly, savedValue]);

    _(
      () =>
        // Save after `SAVE_TIMEOUT` ms has passed since the last input.
        focused && !readonly
          ? timeout(SAVE_TIMEOUT, () => {
              const save = saveRef.current;
              if (save !== undefined && normalizeRef.current !== undefined) {
                const normalizedValue = normalizeRef.current(value);
                if (normalizedValue !== savedValue) {
                  save(normalizedValue, "input");
                }
              }
            })
          : undefined,
      [focused, readonly, savedValue, value]
    );

    return h$1(Tag, {
      ...restProps,
      ref: rootRef,
      className: classlist(className, { "is-readonly": readonly }),
      value: value,
      spellcheck: false,
      onInput: (event) => {
        if (readonly) {
          // This is like the `readonly` attribute, but with a visible cursor,
          // which is nice when selecting parts of the text for copying.
          event.currentTarget.value = value;
          restoreSelection();
        } else {
          setStateValue(event.currentTarget.value);
        }
      },
      onKeyDown: (event) => {
        storeSelection();
        if (onKeyDown !== undefined) {
          onKeyDown(event);
        }
      },
      onMouseDown: () => {
        storeSelection();
      },
      onFocus: () => {
        setFocused(true);
      },
      onBlur: () => {
        setFocused(false);

        // Normalize on blur.
        setStateValue(undefined);

        // Save on blur.
        const normalizedValue = normalize(value);
        if (normalizedValue !== savedValue && saveProp !== undefined) {
          saveProp(normalizedValue, "blur");
        }
      },
    });
  }

  (function () {
    function BranchPoint(children1, weight1) {
      this.children = children1;
      this.weight = weight1;
    }

    BranchPoint.prototype.assignCodeWords = function (
      alphabet,
      callback,
      prefix
    ) {
      var codeWord, i, index, node, ref;
      if (prefix == null) {
        prefix = "";
      }
      index = 0;
      ref = this.children;
      for (i = ref.length - 1; i >= 0; i += -1) {
        node = ref[i];
        codeWord = prefix + alphabet[index++];
        if (node instanceof BranchPoint) {
          node.assignCodeWords(alphabet, callback, codeWord);
        } else {
          callback(node, codeWord);
        }
      }
    };

    return BranchPoint;
  })();

  const ElementType = stringUnion({
    "clickable-event": null,
    clickable: null,
    label: null,
    link: null,
    scrollable: null,
    selectable: null,
    textarea: null,
  });

  function bool(value) {
    return {
      type: "Bool",
      value,
    };
  }

  function unsignedInt(value) {
    return {
      type: "UnsignedInt",
      value,
    };
  }

  function unsignedFloat(value) {
    return {
      type: "UnsignedFloat",
      value,
    };
  }

  function stringSet(value) {
    return {
      type: "StringSet",
      value,
    };
  }

  function elementTypeSet(value) {
    return {
      type: "ElementTypeSet",
      value,
    };
  }

  function selectorString(value) {
    return {
      type: "SelectorString",
      value,
    };
  }

  function regex(value) {
    return {
      type: "Regex",
      value,
    };
  }

  function tweakable(namespace, mapping) {
    const keyPrefix = `${DEBUG_PREFIX}${namespace}.`;
    const defaults = { ...mapping };
    const changed = {};
    const errors = {};

    function update(data) {
      for (const [key, value] of Object.entries(data)) {
        try {
          if (!Object.prototype.hasOwnProperty.call(defaults, key)) {
            throw new DecoderError({
              message: "Unknown key",
              value: DecoderError.MISSING_VALUE,
              key,
            });
          }

          const original = defaults[key];
          errors[key] = undefined;
          changed[key] = false;

          if (value === undefined) {
            mapping[key] = original;
            continue;
          }

          switch (original.type) {
            case "Bool": {
              const decoded = decode(boolean, value);
              mapping[key] = {
                type: "Bool",
                value: decoded,
              };
              changed[key] = decoded !== original.value;
              break;
            }

            case "UnsignedInt": {
              const decoded = decode(UnsignedInt, value);
              mapping[key] = {
                type: "UnsignedInt",
                value: decoded,
              };
              changed[key] = decoded !== original.value;
              break;
            }

            case "UnsignedFloat": {
              const decoded = decode(UnsignedFloat, value);
              mapping[key] = {
                type: "UnsignedFloat",
                value: decoded,
              };
              changed[key] = decoded !== original.value;
              break;
            }

            case "StringSet": {
              const decoded = decode(StringSet(string), value);
              mapping[key] = {
                type: "StringSet",
                value: decoded,
              };
              changed[key] = !equalStringSets(decoded, original.value);
              break;
            }

            case "ElementTypeSet": {
              const decoded = decode(StringSet(ElementType), value);
              mapping[key] = {
                type: "ElementTypeSet",
                value: decoded,
              };
              changed[key] = !equalStringSets(
                new Set(decoded),
                new Set(original.value)
              );
              break;
            }

            case "SelectorString": {
              // eslint-disable-next-line @typescript-eslint/no-loop-func
              const decoded = chain(string, (val) => {
                document.querySelector(val);
                return val;
              })(value);
              mapping[key] = {
                type: "SelectorString",
                value: decoded,
              };
              changed[key] = decoded !== original.value;
              break;
            }

            case "Regex": {
              const decoded = chain(
                string,
                (val) => new RegExp(val, "u")
              )(value);
              mapping[key] = {
                type: "Regex",
                value: decoded,
              };
              changed[key] = decoded.source !== original.value.source;
              break;
            }
          }
        } catch (errorAny) {
          const error = errorAny;
          errors[key] = error.message;
        }
      }
    }

    const loaded = browser.storage.sync
      .get(Object.keys(defaults).map((key) => `${keyPrefix}${key}`))
      .then((rawData) => {
        const data = Object.fromEntries(
          Object.entries(rawData).map(([fullKey, value]) => [
            fullKey.slice(keyPrefix.length),
            value,
          ])
        );
        update(data);
      })
      .catch((error) => {
        log("error", "tweakable", "First load failed.", {
          namespace,
          mapping,
          error,
        });
      });

    const unlisten = addListener(
      browser.storage.onChanged,
      (changes, areaName) => {
        if (areaName === "sync") {
          const data = Object.fromEntries(
            Object.keys(changes).flatMap((fullKey) => {
              if (fullKey.startsWith(keyPrefix)) {
                const key = fullKey.slice(keyPrefix.length);
                if (Object.prototype.hasOwnProperty.call(defaults, key)) {
                  return [[key, changes[fullKey].newValue]];
                }
              }
              return [];
            })
          );
          update(data);
        }
      },
      "tweakable storage.onChanged listener"
    );

    return {
      namespace,
      defaults,
      changed,
      errors,
      loaded,
      unlisten,
    };
  }

  function normalizeStringArray(arrayOrSet) {
    return Array.from(arrayOrSet)
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .sort();
  }

  function StringSet(decoder) {
    return chain(
      array(string),
      (arr) => new Set(array(decoder)(normalizeStringArray(arr)))
    );
  }

  function equalStringSets(a, b) {
    return deepEqual(normalizeStringArray(a), normalizeStringArray(b));
  }

  const t$3 = {
    // Some onscreen frames may never respond (if the frame 404s or hasn't loaded
    // yet), but the parent can't now that. If a frame hasn't reported that it is
    // alive after this timeout, ignore it.
    FRAME_REPORT_TIMEOUT: unsignedInt(100), // ms

    // Only show the badge “spinner” if the hints are slow.
    BADGE_COLLECTING_DELAY: unsignedInt(300), // ms

    // Roughly how often to update the hints in hints mode. While a lower number
    // might yield updates faster, that feels very stuttery. Having a somewhat
    // longer interval feels better.
    UPDATE_INTERVAL: unsignedInt(500), // ms
    UPDATE_MIN_TIMEOUT: unsignedInt(100), // ms

    // How long a matched/activated hint should show as highlighted.
    MATCH_HIGHLIGHT_DURATION: unsignedInt(200), // ms

    // For people with tiling window managers who exclusively use windows rather
    // than tabs. This changes basically everything that deals with tabs to
    // instead deal with windows.
    PREFER_WINDOWS: bool(false),
  };

  const tMeta$3 = tweakable("Background", t$3);

  const t$2 = {
    MAX_IMMEDIATE_HINT_MOVEMENTS: unsignedInt(50),
  };

  const tMeta$2 = tweakable("Renderer", t$2);

  // This file is injected as a regular script in all pages and overrides
  // `.addEventListener` (and friends) so we can detect click listeners.
  // This is a bit fiddly because we try to cover our tracks as good as possible.

  // Basically everything in this file has to be inside the `export default`
  // function, since `.toString()` is called on it in ElementManager. This also
  // means that `import`s generally cannot be used in this file. All of the below
  // constants are `.replace()`:ed in by ElementManager, but they are defined in
  // this file so that TypeScript knows about them.

  // NOTE: If you add a new constant, you have to update the `constants` object in
  // ElementManager.ts as well!

  // To make things even more complicated, in Firefox the `export default`
  // function is actually executed rather than inserted as an inline script. This
  // is to work around Firefox’s CSP limiations. As a bonus, Firefox can
  // communicate with this file directly (via the `communicator` parameter) rather
  // than via very clever usage of DOM events. This works in Firefox due to
  // `.wrappedJSObject`, `exportFunction` and `XPCNativeWrapper`.

  // All types of events that likely makes an element clickable. All code and
  // comments that deal with this only refer to "click", though, to keep things
  // simple.
  const CLICKABLE_EVENT_NAMES = ["click", "mousedown"];
  const CLICKABLE_EVENT_PROPS = CLICKABLE_EVENT_NAMES.map(
    (eventName) => `on${eventName}`
  );

  // Common prefix for events. It’s important to create a name unique from
  // previous versions of the extension, in case this script hangs around after an
  // update (it’s not possible to do cleanups before disabling an extension in
  // Firefox). We don’t want the old version to interfere with the new one. This
  // uses `"1_3_1"` rather than `makeRandomToken()` so that all frames share
  // the same event name. Clickable elements created in this frame but inserted
  // into another frame need to dispatch an event in their parent window rather
  // than this one. However, since the prefix is static it will be possible for
  // malicious sites to send these events. Luckily, that doesn’t hurt much. All
  // the page could do is cause false positives or disable detection of click
  // events altogether.
  const prefix = `__${"LinkHints"}WebExt_${"1_3_1"}_`;

  // Events that don’t need to think about the iframe edge case described above
  // can use this more secure prefix, with a practically unguessable part in it.
  const secretPrefix = `__${"LinkHints"}WebExt_${makeRandomToken()}_`;

  const CLICKABLE_CHANGED_EVENT = `${prefix}ClickableChanged`;
  const OPEN_SHADOW_ROOT_CREATED_EVENT = `${prefix}OpenShadowRootCreated`;
  const CLOSED_SHADOW_ROOT_CREATED_1_EVENT = `${prefix}ClosedShadowRootCreated1`;
  const CLOSED_SHADOW_ROOT_CREATED_2_EVENT = `${prefix}ClosedShadowRootCreated2`;

  const QUEUE_EVENT = `${secretPrefix}Queue`;

  // If an element is not inserted into the page, events fired on it won’t reach
  // ElementManager’s window event listeners. Instead, such elements are
  // temporarily inserted into a secret element. This event is used to register
  // the secret element in ElementManager.
  const REGISTER_SECRET_ELEMENT_EVENT = `${secretPrefix}RegisterSecretElement`;

  // Events sent from ElementManager to this file.
  const FLUSH_EVENT = `${secretPrefix}Flush`;
  const RESET_EVENT = `${secretPrefix}Reset`;

  // Keep the above imports and this object in sync. See injected.ts.
  ({
    CLICKABLE_CHANGED_EVENT: JSON.stringify(CLICKABLE_CHANGED_EVENT),
    CLICKABLE_EVENT_NAMES: JSON.stringify(CLICKABLE_EVENT_NAMES),
    CLICKABLE_EVENT_PROPS: JSON.stringify(CLICKABLE_EVENT_PROPS),
    CLOSED_SHADOW_ROOT_CREATED_1_EVENT: JSON.stringify(
      CLOSED_SHADOW_ROOT_CREATED_1_EVENT
    ),
    CLOSED_SHADOW_ROOT_CREATED_2_EVENT: JSON.stringify(
      CLOSED_SHADOW_ROOT_CREATED_2_EVENT
    ),
    FLUSH_EVENT: JSON.stringify(FLUSH_EVENT),
    OPEN_SHADOW_ROOT_CREATED_EVENT: JSON.stringify(
      OPEN_SHADOW_ROOT_CREATED_EVENT
    ),
    QUEUE_EVENT: JSON.stringify(QUEUE_EVENT),
    REGISTER_SECRET_ELEMENT_EVENT: JSON.stringify(
      REGISTER_SECRET_ELEMENT_EVENT
    ),
    RESET_EVENT: JSON.stringify(RESET_EVENT),
  });

  const ATTRIBUTES_CLICKABLE = new Set([
    // These are supposed to be used with a `role` attribute. In some GitHub
    // dropdowns some items only have this attribute hinting that they are
    // clickable, though.
    "aria-checked",
    "aria-selected",
    // Ember.
    "data-ember-action",
    // Bootstrap.
    "data-dismiss",
    // Twitter.
    "data-permalink-path",
    "data-image-url",
  ]);

  const ATTRIBUTES_NOT_CLICKABLE = new Set([
    // Google.
    "data-hveid",
  ]);

  const t$1 = {
    // The single-page HTML specification has over 70K links! If trying to track all
    // of those with `IntersectionObserver`, scrolling is noticeably laggy. On my
    // computer, the lag starts somewhere between 10K and 20K tracked links.
    // Tracking at most 10K should be enough for regular sites.
    MAX_INTERSECTION_OBSERVED_ELEMENTS: unsignedInt(10e3),

    // If `.getVisibleElements` is taking too long, skip remaining elements.
    // Chrome’s implementation of `document.elementFromPoint` is not optimized for
    // elements with thousands of children, which is rare in practice but present
    // in the link-monster demo.
    MAX_DURATION: unsignedInt(10e3),

    ELEMENT_TYPES_LOW_QUALITY: elementTypeSet(new Set(["clickable-event"])),

    // Give worse hints to scrollable elements and (selectable) frames. They are
    // usually very large by nature, but not that commonly used. Also give worse
    // hints to elements with click listeners only. They often wrap text inputs,
    // covering the hint for the input.
    ELEMENT_TYPES_WORSE: elementTypeSet(
      new Set(["clickable-event", "scrollable", "selectable"])
    ),

    // Elements this many pixels high or taller always get their hint placed at the
    // very left edge.
    MIN_HEIGHT_BOX: unsignedFloat(110), // px

    // Avoid placing hints too far to the right side. The first non-empty text node
    // of an element does not necessarily have to come first, due to CSS. For
    // example, it is not uncommon to see menu items with a label to the left and a
    // number to the right. That number is usually positioned using `float: right;`
    // and due to how floats work it then needs to come _before_ the label in DOM
    // order. This avoids targeting such text.
    MAX_HINT_X_PERCENTAGE_OF_WIDTH: unsignedFloat(0.75),

    // Maximum area for elements with only click listeners. Elements larger than
    // this are most likely not clickable, and only used for event delegation.
    MAX_CLICKABLE_EVENT_AREA: unsignedFloat(1e6), // px

    PROTOCOLS_LINK: stringSet(
      new Set(
        [
          "http:",
          "https:",
          "ftp:",
          "chrome-extension:",
          "moz-extension:",
          // Firefox does not allow opening `file://` URLs in new tabs, but Chrome
          // does. Both allow _clicking_ them.
          // See: <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/create>
          "file:",
        ].filter((string) => string !== "")
      )
    ),

    // http://w3c.github.io/aria/#widget_roles
    ROLES_CLICKABLE: stringSet(
      new Set([
        "button",
        "checkbox",
        "link",
        "menuitem",
        "menuitemcheckbox",
        "menuitemradio",
        "option",
        "radio",
        "searchbox",
        "spinbutton",
        "switch",
        "tab",
        "textbox",
        "treeitem",
        // Omitted since they don’t seem useful to click:
        // "gridcell",
        // "progressbar",
        // "scrollbar",
        // "separator",
        // "slider",
        // "tabpanel",
      ])
    ),

    // "true" indicates that contenteditable is on. Chrome also supports
    // "plaintext-only". There may be more modes in the future, such as "caret", so
    // it’s better to only list the values that indicate that an element _isn’t_
    // contenteditable.
    VALUES_NON_CONTENTEDITABLE: stringSet(
      new Set([
        // The default value. If a parent is contenteditable, it means that this
        // element is as well (and `element.isContentEditable` is true). But we only
        // want hints for the “root” contenteditable element.
        "inherit",
        // Explicitly turned off:
        "false",
      ])
    ),

    VALUES_SCROLLABLE_OVERFLOW: stringSet(new Set(["auto", "scroll"])),

    MIN_SIZE_FRAME: unsignedFloat(6), // px
    MIN_SIZE_TEXT_RECT: unsignedFloat(2), // px
    MIN_SIZE_ICON: unsignedFloat(10), // px

    ATTRIBUTES_CLICKABLE: stringSet(ATTRIBUTES_CLICKABLE),
    ATTRIBUTES_NOT_CLICKABLE: stringSet(ATTRIBUTES_NOT_CLICKABLE),

    ATTRIBUTES_MUTATION: stringSet(
      new Set([
        "class",
        "contenteditable",
        "disabled",
        "href",
        "role",
        ...CLICKABLE_EVENT_PROPS,
        ...ATTRIBUTES_CLICKABLE,
        ...ATTRIBUTES_NOT_CLICKABLE,
      ])
    ),

    // Find actual images as well as icon font images. Matches for example “Icon”,
    // “glyphicon”, “fa” and “fa-thumbs-up” but not “face or “alfa”.
    SELECTOR_IMAGE: selectorString(
      "img, svg, [class*='icon' i], [class~='fa'], [class^='fa-'], [class*=' fa-']"
    ),

    // `cm-` and `ͼ` are from CodeMirror. https://codemirror.net/6/
    // `mtk` is from the Monaco editor. https://www.typescriptlang.org/play
    REGEX_CLICKABLE_CLASS: regex(/\bcm-|ͼ|\bmtk/u),
  };

  const tMeta$1 = tweakable("ElementManager", t$1);

  const t = {
    // How long a copied element should be selected.
    FLASH_COPIED_ELEMENT_DURATION: unsignedInt(200), // ms
    // Elements that look bad when inverted.
    FLASH_COPIED_ELEMENT_NO_INVERT_SELECTOR: selectorString(
      "img, audio, video, object, embed, iframe, frame, input, textarea, select, progress, meter, canvas"
    ),
    HINTS_REFRESH_IDLE_CALLBACK_TIMEOUT: unsignedInt(100), // ms
  };

  const tMeta = tweakable("Worker", t);

  function StringSetEditor({ save, id, savedValue }) {
    const [hasFocus, setHasFocus] = p(false);
    const [stateValue, setStateValue] = p(undefined);

    const value =
      stateValue !== undefined ? stateValue : Array.from(savedValue);
    const endsWithBlank =
      value.length > 0 && value[value.length - 1].trim() === "";

    h(
      () =>
        // Normalize on blur, but not when moving to the next field.
        !hasFocus && stateValue !== undefined
          ? timeout(0, () => {
              setStateValue(undefined);
            })
          : undefined,
      [hasFocus, stateValue]
    );

    return h$1(
      "div",
      {
        className: "SpacedVertical",
        onBlurCapture: () => {
          setHasFocus(false);
        },
        onFocusCapture: () => {
          setHasFocus(true);
        },
      },

      value.concat(endsWithBlank ? [] : [""]).map((item, index) =>
        h$1(TextInput, {
          key: index,
          id: index === 0 ? id : undefined,
          savedValue: item,
          normalize: (newValue) => newValue.trim(),
          save: (newItem, reason) => {
            const newValue =
              index === value.length
                ? newItem.trim() === ""
                  ? value
                  : value.concat(newItem)
                : value.map((item2, index2) =>
                    index2 === index ? newItem : item2
                  );
            setStateValue(newValue);
            save(new Set(newValue), reason);
          },
          onKeyDown: (event) => {
            const { target } = event;
            if (target instanceof HTMLElement && event.key === "Enter") {
              const next = target.nextElementSibling;
              if (next?.localName === "input") {
                next.select();
              }
            }
          },
        })
      )
    );
  }

  // This file is allowed to import `tweakable` objects from the other programs.

  const ALL_TWEAKABLES = [
    [t$3, tMeta$3],
    [t, tMeta],
    [t$2, tMeta$2],
    [t$1, tMeta$1],
  ];

  const ALL_KEYS = new Set(
    ALL_TWEAKABLES.flatMap(([, tMeta]) =>
      Object.keys(tMeta.defaults).map(
        (key) => `${DEBUG_PREFIX}${tMeta.namespace}.${key}`
      )
    )
  );

  function Tweakable({ before, onUpdate }) {
    const onUpdateRef = s(onUpdate);
    onUpdateRef.current = onUpdate;

    _(
      () =>
        addListener(
          browser.storage.onChanged,
          (changes, areaName) => {
            if (areaName === "sync") {
              const didUpdate = Object.keys(changes).some((key) =>
                ALL_KEYS.has(key)
              );
              if (didUpdate) {
                onUpdateRef.current();
              }
            }
          },
          "Tweakable storage.onChanged listener"
        ),
      []
    );

    return h$1(
      "div",
      null,
      before,

      ALL_TWEAKABLES.map(([t, tMeta]) =>
        Object.keys(tMeta.defaults)
          .sort()
          .map((key) => {
            const { [key]: changed = false } = tMeta.changed;
            return h$1(TweakableField, {
              key: `${tMeta.namespace}.${key}`,
              namespace: tMeta.namespace,
              name: key,
              value: t[key],
              defaultValue: tMeta.defaults[key],
              changed: changed,
              error: tMeta.errors[key],
            });
          })
      )
    );
  }

  function TweakableField({
    namespace,
    name,
    value,
    defaultValue,
    changed,
    error,
  }) {
    const fullKey = `${DEBUG_PREFIX}${namespace}.${name}`;

    const reset = () => {
      save(fullKey, undefined);
    };

    const fieldProps = {
      id: fullKey,
      label: `${namespace}: ${name}`,
      changed,
      description:
        error !== undefined
          ? h$1(
              "div",
              { className: "Error SpacedVertical" },
              h$1(
                "p",
                null,
                "There was an error with the saved value. Using default instead.",
                " ",
                h$1("button", { type: "button", onClick: reset }, "Remove")
              ),
              h$1("pre", null, error)
            )
          : undefined,
      onReset: reset,
    };

    switch (value.type) {
      case "Bool":
        if (defaultValue.type === "Bool") {
          return h$1(Field, {
            ...fieldProps,
            render: ({ id }) =>
              h$1(
                "label",
                { className: "Spaced Spaced--center" },
                h$1("input", {
                  type: "checkbox",
                  id: id,
                  checked: value.value,
                  onChange: (event) => {
                    save(fullKey, event.currentTarget.checked);
                  },
                }),
                h$1("span", null, "Enabled")
              ),
          });
        }
        break;

      case "UnsignedInt":
        if (defaultValue.type === "UnsignedInt") {
          return h$1(Field, {
            ...fieldProps,
            render: ({ id }) =>
              h$1(TextInput, {
                id: id,
                style: { width: "50%" },
                savedValue: value.value.toString(),
                normalize: (newValue) =>
                  normalizeUnsignedInt(newValue, defaultValue.value),
                save: (newValue) => {
                  save(fullKey, Number(newValue));
                },
              }),
          });
        }
        break;

      case "UnsignedFloat":
        if (defaultValue.type === "UnsignedFloat") {
          return h$1(Field, {
            ...fieldProps,
            render: ({ id }) =>
              h$1(TextInput, {
                id: id,
                style: { width: "50%" },
                savedValue: value.value.toString(),
                normalize: (newValue) =>
                  normalizeUnsignedFloat(newValue, defaultValue.value),
                save: (newValue) => {
                  save(fullKey, Number(newValue));
                },
              }),
          });
        }
        break;

      case "StringSet":
        if (defaultValue.type === "StringSet") {
          return h$1(Field, {
            ...fieldProps,
            render: ({ id }) =>
              h$1(StringSetEditor, {
                id: id,
                savedValue: value.value,
                save: (newValue) => {
                  save(fullKey, normalizeStringArray(newValue));
                },
              }),
          });
        }
        break;

      case "ElementTypeSet":
        if (defaultValue.type === "ElementTypeSet") {
          return h$1(Field, {
            ...fieldProps,
            render: ({ id }) =>
              h$1(StringSetEditor, {
                id: id,
                savedValue: new Set(value.value),
                save: (newValue) => {
                  save(fullKey, normalizeStringArray(newValue));
                },
              }),
          });
        }
        break;

      case "SelectorString":
        if (defaultValue.type === "SelectorString") {
          return h$1(Field, {
            ...fieldProps,
            render: ({ id }) =>
              h$1(TextInput, {
                id: id,
                style: { width: "100%" },
                savedValue: value.value,
                normalize: (newValue) => {
                  const trimmed = newValue.trim();
                  return trimmed === "" ? defaultValue.value : trimmed;
                },
                save: (newValue) => {
                  save(fullKey, newValue);
                },
              }),
          });
        }
        break;

      case "Regex":
        if (defaultValue.type === "Regex") {
          return h$1(Field, {
            ...fieldProps,
            render: ({ id }) =>
              h$1(TextInput, {
                id: id,
                style: { width: "100%" },
                savedValue: value.value.source,
                normalize: (newValue) => {
                  const trimmed = newValue.trim();
                  return trimmed === "" ? defaultValue.value.source : trimmed;
                },
                save: (newValue) => {
                  save(fullKey, newValue);
                },
              }),
          });
        }
        break;
    }

    return h$1(Field, {
      ...fieldProps,
      span: true,
      render: () =>
        h$1(
          "p",
          { className: "Error" },
          "Value/defaultValue type mismatch: ",
          value.type,
          "/",
          defaultValue.type,
          "."
        ),
    });
  }

  function save(key, value) {
    fireAndForget(
      value === undefined
        ? browser.storage.sync.remove(key)
        : browser.storage.sync.set({ [key]: value }),
      "TweakableField save",
      { key, value }
    );
  }

  function hasChangedTweakable() {
    return ALL_TWEAKABLES.some(([, tMeta]) =>
      Object.values(tMeta.changed).some(Boolean)
    );
  }

  function getTweakableExport() {
    return Object.fromEntries(
      ALL_TWEAKABLES.flatMap(([t, tMeta]) =>
        Object.keys(tMeta.defaults).flatMap((key) => {
          const { value } = t[key];
          const { [key]: changed = false } = tMeta.changed;
          return changed
            ? [
                [
                  `${DEBUG_PREFIX}${tMeta.namespace}.${key}`,
                  value instanceof Set ? Array.from(value) : value,
                ],
              ]
            : [];
        })
      )
    );
  }

  function partitionTweakable(data) {
    const tweakableData = {};
    const otherData = {};

    for (const [key, value] of Object.entries(data)) {
      if (ALL_KEYS.has(key)) {
        tweakableData[key] = value;
      } else {
        otherData[key] = value;
      }
    }

    return [tweakableData, otherData];
  }

  async function saveTweakable(data) {
    const [tweakableData] = partitionTweakable(data);
    return browser.storage.sync.set(tweakableData);
  }

  const CSS_SUGGESTIONS = [
    { name: "Base CSS", value: CSS },
    { name: "Font size", value: SUGGESTION_FONT_SIZE },
    { name: "Vimium", value: SUGGESTION_VIMIUM },
  ];

  const getLayoutMap =
    navigator.keyboard !== undefined && navigator.keyboard !== null
      ? navigator.keyboard.getLayoutMap.bind(navigator.keyboard)
      : undefined;

  class OptionsProgram extends d$1 {
    resets = new Resets();

    hiddenErrors = [];

    keysTableRef = y$1();

    hasRestoredPosition = false;

    state = {
      options: undefined,
      hasSaved: false,
      customChars: "",
      keyTranslationsInput: {
        text: "",
        testOnly: false,
        lastKeypress: undefined,
      },
      keyboardDetect: undefined,
      capturedKeypressWithTimestamp: undefined,
      peek: false,
      cssSuggestion: CSS_SUGGESTIONS[0].value,
      importData: {
        successCount: undefined,
        tweakableCount: undefined,
        errors: [],
      },
      perf: {},
      expandedPerfTabIds: [],
      expandedPerf: false,
      expandedDebug: false,
      localStorageCleared: undefined,
    };

    start() {
      log("log", "OptionsProgram#start");

      this.resets.add(
        addListener(
          browser.runtime.onMessage,
          this.onMessage.bind(this),
          "OptionsProgram#onMessage"
        )
      );

      document.documentElement.classList.add("chrome");

      this.sendMessage({ type: "OptionsScriptAdded" });
    }

    stop() {
      log("log", "OptionsProgram#stop");
      this.resets.reset();
    }

    componentDidMount() {
      this.start();
    }

    componentWillUnmount() {
      this.stop();
    }

    sendMessage(message) {
      log("log", "OptionsProgram#sendMessage", message.type, message, this);
      fireAndForget(
        browser.runtime.sendMessage(wrapMessage(message)).then(() => undefined),
        "OptionsProgram#sendMessage",
        message
      );
    }

    onMessage(wrappedMessage) {
      if (wrappedMessage.type !== "ToOptions") {
        return;
      }

      const { message } = wrappedMessage;

      log("log", "OptionsProgram#onMessage", message.type, message, this);

      switch (message.type) {
        case "StateSync": {
          log.level = message.logLevel;
          // If the options errors (if any) are the same as the ones shown when
          // clicking the X button for the errors, keep them hidden. Otherwise
          // show the new errors.
          const errorsHidden = deepEqual(
            this.hiddenErrors,
            message.options.errors
          );
          this.setState((state) => ({
            options: {
              ...message.options,
              errors: errorsHidden ? [] : message.options.errors,
            },
            customChars:
              state.options === undefined
                ? message.options.values.chars
                : state.customChars,
          }));
          if (!errorsHidden) {
            this.hiddenErrors = [];
          }
          break;
        }

        case "KeypressCaptured":
          this.setState({
            capturedKeypressWithTimestamp: {
              timestamp: Date.now(),
              keypress: message.keypress,
            },
          });
          break;

        case "PerfUpdate":
          this.setState(
            (state) => ({
              perf: {
                ...state.perf,
                ...message.perf,
              },
            }),
            () => {
              fireAndForget(
                this.savePerf(),
                "OptionsProgram#onMessage->savePerf"
              );
            }
          );
          break;
      }
    }

    async savePerf() {}

    saveOptions(partialOptions) {
      this.setState((state) => ({
        options:
          state.options === undefined
            ? undefined
            : {
                ...state.options,
                values: {
                  ...state.options.values,
                  ...partialOptions,
                },
                errors: [],
              },
        hasSaved: true,
      }));
      this.sendMessage({
        type: "SaveOptions",
        partialOptions,
      });
    }

    resetOptions() {
      this.setState((state) => ({
        options:
          state.options === undefined
            ? undefined
            : {
                ...state.options,
                values: state.options.defaults,
                errors: [],
              },
        hasSaved: false,
      }));
      this.sendMessage({
        type: "ResetOptions",
      });
    }

    async importOptions() {
      const { options: optionsData } = this.state;
      if (optionsData === undefined) {
        return;
      }
      const { values: options } = optionsData;
      try {
        const file = await selectFile("application/json");
        const data = await readAsJson(file);
        const [tweakableData, otherData] = partitionTweakable(
          multi({ object: (x) => x })(data)
        );
        const {
          options: newOptions,
          successCount,
          errors,
        } = importOptions(otherData, options);
        this.setState({
          importData: {
            successCount,
            tweakableCount: Object.keys(tweakableData).length,
            errors,
          },
        });
        if (newOptions !== undefined) {
          this.saveOptions(newOptions);
        }
        await saveTweakable(tweakableData);
      } catch (errorAny) {
        const error = errorAny;
        this.setState((state) => ({
          importData: {
            ...state.importData,
            errors: [`The file is invalid: ${error.message}`],
          },
        }));
      }
    }

    exportOptions() {
      const { options: optionsData } = this.state;

      const tweakableExport = getTweakableExport();

      const data = {
        ...(optionsData !== undefined ? optionsData.raw : {}),
        ...tweakableExport,
      };

      saveFile(
        `${JSON.stringify(data, undefined, 2)}\n`,
        `${"LinkHints"}-options-${toISODateString(new Date())}.json`,
        "application/json"
      );
    }

    async resetLocalStorage() {
      await browser.storage.local.clear();
      this.setState({ localStorageCleared: new Date() });
    }

    render() {
      const {
        options: optionsData,
        hasSaved,
        customChars,
        keyTranslationsInput,
        keyboardDetect,
        capturedKeypressWithTimestamp,
        peek,
        cssSuggestion,
        importData,
        perf,
        expandedPerfTabIds,
        expandedPerf,
        expandedDebug,
        localStorageCleared,
      } = this.state;

      if (optionsData === undefined) {
        return null;
      }

      const { values: options, defaults, mac } = optionsData;
      const errors = importData.errors.concat(optionsData.errors);

      const usingDefaults =
        deepEqual(defaults, options) && !hasChangedTweakable();

      const charsPresets = [
        { name: "QWERTY (default)", value: defaults.chars },
        { name: "Dvorak", value: "hutenogacpridkmjw" },
        { name: "Colemak", value: "tnseriaoplfuwydhvmck" },
      ];

      const conflictingActions = getConflictingKeyboardActions(
        defaults.hintsKeyboardShortcuts,
        options.hintsKeyboardShortcuts,
        options.chars
      );

      const customIndex = charsPresets.length;

      const rawSelectedIndex = charsPresets.findIndex(
        (preset) => preset.value === options.chars
      );
      const selectedIndex =
        rawSelectedIndex >= 0 ? rawSelectedIndex : customIndex;

      const isLowerCase = options.chars === options.chars.toLowerCase();

      const keyTranslationsChanged = !deepEqual(
        options.keyTranslations,
        defaults.keyTranslations
      );

      const { lastKeypress } = keyTranslationsInput;

      return h$1(
        "div",
        { className: "Layout" },
        h$1(
          "main",
          { className: "Layout-main Paper" },
          h$1(Field, {
            key: "chars",
            id: "chars",
            label: "Hint characters",
            description: h$1(
              p$1,
              null,
              conflictingActions.length > 0 &&
                conflictingActions.map(([action, chars]) =>
                  h$1(
                    "p",
                    { key: action, className: "Error" },
                    "Overridden by",
                    " ",
                    h$1(
                      "a",
                      { href: `#${getKeyboardActionId(action)}` },
                      describeKeyboardAction(action).name
                    ),
                    ": ",
                    chars.join(", ")
                  )
                ),
              h$1(
                "p",
                null,
                "Use the characters you find the easiest to type. Put the best ones further to the left. All ",

                h$1("em", null, "other"),
                " characters are used to match elements by their ",
                h$1("em", null, "text."),
                " Lowercase vs uppercase matters when typing ",
                h$1("em", null, "hint characters"),
                ", but not when ",
                h$1("em", null, "filtering by text."),
                isLowerCase &&
                  h$1(
                    p$1,
                    null,
                    " ",
                    h$1("strong", null, "Note:"),
                    " The hints are",
                    " ",
                    h$1("em", null, "displayed"),
                    " uppercase because it looks nicer. 😎"
                  )
              )
            ),
            changed: options.chars !== defaults.chars,
            render: ({ id }) =>
              h$1(
                "div",
                { className: "Spaced" },
                h$1(TextInput, {
                  id: id,
                  style: { flex: "1 1 50%" },
                  savedValue: options.chars,
                  normalize: (value) => normalizeChars(value, defaults.chars),
                  save: (value, reason) => {
                    if (reason === "input") {
                      this.setState({ customChars: value });
                    }
                    this.saveOptions({ chars: value });
                  },
                }),

                h$1(
                  "div",
                  { className: "Spaced", style: { flex: "1 1 50%" } },
                  h$1(
                    Attachment,
                    { label: "Presets", style: { flex: "1 1 50%" } },
                    h$1(
                      "select",
                      {
                        style: { flexGrow: 1 },
                        value: selectedIndex,
                        onChange: (event) => {
                          const index = Number(event.currentTarget.value);
                          const chars =
                            index >= 0 && index < charsPresets.length
                              ? charsPresets[index].value
                              : customChars;
                          this.saveOptions({ chars });
                        },
                      },

                      charsPresets.map(({ name }, index) =>
                        h$1("option", { key: name, value: index }, name)
                      ),
                      charsPresets.every(
                        (preset) => preset.value !== customChars
                      ) && h$1("option", { value: customIndex }, "Custom")
                    )
                  ),

                  h$1(
                    "button",
                    {
                      type: "button",
                      style: { flex: "1 1 50%", whiteSpace: "nowrap" },
                      onClick: () => {
                        const chars = isLowerCase
                          ? options.chars.toUpperCase()
                          : options.chars.toLowerCase();
                        const unique = normalizeChars(chars, defaults.chars);
                        this.setState({ customChars: unique });
                        this.saveOptions({ chars: unique });
                      },
                    },

                    isLowerCase ? "→ UPPERCASE" : "→ lowercase"
                  )
                )
              ),
          }),

          h$1(Field, {
            key: "autoActivate",
            id: "autoActivate",
            label: "Auto activate when filtering by text",
            description: h$1(
              "p",
              null,
              "When ",
              h$1("em", null, "filtering by text"),
              " you can press",
              " ",
              h$1(ActivateHighlightedKey, {
                mac: mac,
                mappings: options.hintsKeyboardShortcuts,
                defaultMappings: defaults.hintsKeyboardShortcuts,
              }),
              " ",
              "to activate the highlighted hint (green). With this option enabled, the highlighted hint is automatically activated if it is the only match. Many times one might type a few extra characters before realizing that a hint was automatically activated, so your key strokes are suppressed for a short period just after activation."
            ),
            changed: options.autoActivate !== defaults.autoActivate,
            changedRight:
              options.overTypingDuration !== defaults.overTypingDuration,
            render: ({ id }) =>
              h$1(
                "div",
                { className: "Spaced" },
                h$1(
                  "span",
                  {
                    className: "ShrinkwrapChildren",
                    style: { flex: "1 1 50%" },
                  },

                  h$1(
                    "label",
                    { className: "Spaced Spaced--center" },
                    h$1("input", {
                      type: "checkbox",
                      id: id,
                      checked: options.autoActivate,
                      onChange: (event) => {
                        this.saveOptions({
                          autoActivate: event.currentTarget.checked,
                        });
                      },
                    }),
                    h$1("span", null, "Enabled")
                  )
                ),

                h$1(
                  Attachment,
                  {
                    label: `Over-typing duration${
                      options.overTypingDuration !== defaults.overTypingDuration
                        ? ` (default: ${defaults.overTypingDuration})`
                        : ""
                    }`,
                    style: { flex: "1 1 50%" },
                  },

                  h$1(
                    "div",
                    {
                      className: "Spaced Spaced--center",
                      style: { flex: "1 1 100%" },
                    },

                    h$1(TextInput, {
                      style: { flex: "1 1 50%" },
                      disabled: !options.autoActivate,
                      savedValue: options.overTypingDuration.toString(),
                      normalize: (value) =>
                        normalizeUnsignedInt(
                          value,
                          defaults.overTypingDuration
                        ),
                      save: (value) => {
                        this.saveOptions({ overTypingDuration: Number(value) });
                      },
                    }),
                    h$1("span", { style: { flex: "1 1 50%" } }, "milliseconds")
                  )
                )
              ),
          }),

          h$1(Field, {
            key: "useKeyTranslations",
            id: "useKeyTranslations",
            connected: options.useKeyTranslations,
            label: "Keyboard layout",
            span: true,
            description: options.useKeyTranslations
              ? h$1(
                  "p",
                  null,
                  "Browser extensions receive two things when you press a key: The actual key according to your layout, as well as a",

                  " ",
                  h$1("em", null, "code"),
                  " which is a name for the ",
                  h$1("em", null, "physical"),
                  " key you pressed and always stays the same regardless of which layout you have enabled. Switch to your main layout and type in the textarea to translate such ",

                  h$1("em", null, "codes"),
                  " to actual keys.",
                  " ",
                  getLayoutMap !== undefined &&
                    h$1(
                      p$1,
                      null,
                      "The “Detect” button below can do some of the translation for you."
                    )
                )
              : null,
            changed: options.useKeyTranslations !== defaults.useKeyTranslations,
            render: ({ id }) =>
              h$1(
                "div",
                { className: "ShrinkwrapChildren" },
                h$1(
                  "label",
                  { className: "Spaced Spaced--center" },
                  h$1("input", {
                    type: "radio",
                    name: id,
                    checked: !options.useKeyTranslations,
                    onChange: () => {
                      this.saveOptions({
                        useKeyTranslations: false,
                      });
                    },
                  }),
                  h$1("span", null, "I use a single keyboard layout")
                ),

                h$1(
                  "label",
                  {
                    className: "Spaced Spaced--center",
                    style: { marginTop: 4 },
                  },

                  h$1("input", {
                    type: "radio",
                    name: id,
                    checked: options.useKeyTranslations,
                    onChange: () => {
                      this.saveOptions({
                        useKeyTranslations: true,
                      });
                    },
                  }),
                  h$1("span", null, "I use multiple keyboard layouts")
                )
              ),
          }),

          options.useKeyTranslations &&
            h$1(Field, {
              key: "keyTranslations",
              id: "keyTranslations",
              connected: true,
              label: keyTranslationsInput.testOnly
                ? "Type here to test your translations"
                : "Type here to translate codes to keys",
              changed: keyTranslationsChanged,
              render: ({ id }) =>
                h$1(
                  "div",
                  { className: "Spaced" },
                  h$1(
                    "div",
                    { className: "SpacedVertical", style: { flex: "1 1 50%" } },
                    h$1(
                      Attachment,
                      {
                        style: { flexGrow: "1" },
                        contents: h$1(
                          "div",
                          { className: "TinyLabel Spaced" },
                          h$1(
                            "label",
                            {
                              className: "Spaced Spaced--center",
                              style: { marginLeft: "auto" },
                            },

                            h$1("span", null, "Test only"),
                            h$1("input", {
                              type: "checkbox",
                              checked: keyTranslationsInput.testOnly,
                              onChange: (event) => {
                                this.setState({
                                  keyTranslationsInput: {
                                    ...keyTranslationsInput,
                                    testOnly: event.currentTarget.checked,
                                  },
                                });
                              },
                            })
                          )
                        ),
                      },

                      h$1("textarea", {
                        id: id,
                        spellcheck: false,
                        className: "TextSmall",
                        style: { resize: "none" },
                        placeholder: keyTranslationsInput.testOnly
                          ? "Type with another layout…"
                          : "Type with your main layout…",
                        value: keyTranslationsInput.text,
                        onInput: (event) => {
                          event.currentTarget.value = keyTranslationsInput.text;
                        },
                        onBlur: () => {
                          this.setState({
                            keyTranslationsInput: {
                              ...keyTranslationsInput,
                              text: "",
                            },
                          });
                        },
                        onKeyDown: (event) => {
                          event.preventDefault();
                          const keypress = keyboardEventToKeypress(event);
                          const { code, key, shift } = keypress;
                          if (isModifierKey(key)) {
                            return;
                          }
                          if (!isRecognized(key)) {
                            this.setState({
                              keyTranslationsInput: {
                                ...keyTranslationsInput,
                                lastKeypress: keypress,
                              },
                            });
                            return;
                          }
                          const keyTranslations = keyTranslationsInput.testOnly
                            ? undefined
                            : updateKeyTranslations(
                                { code, key, shift },
                                options.keyTranslations
                              );
                          const normalizedKeypress = normalizeKeypress({
                            keypress,
                            keyTranslations:
                              keyTranslations !== undefined
                                ? keyTranslations
                                : options.keyTranslations,
                          });
                          const finalKey =
                            normalizedKeypress.printableKey !== undefined
                              ? normalizedKeypress.printableKey
                              : normalizedKeypress.key;
                          if (keyTranslations !== undefined) {
                            this.saveOptions({ keyTranslations });
                          }
                          this.setState(
                            {
                              keyTranslationsInput: {
                                ...keyTranslationsInput,
                                text: `${keyTranslationsInput.text} ${finalKey}`.trimLeft(),
                                lastKeypress: keypress,
                              },
                            },
                            () => {
                              if (!keyTranslationsInput.testOnly) {
                                this.scrollKeyIntoView(code);
                              }
                            }
                          );
                        },
                        onKeyUp: (event) => {
                          const capslock = event.getModifierState("CapsLock");
                          if (
                            lastKeypress !== undefined &&
                            capslock !== lastKeypress.capslock
                          ) {
                            this.setState({
                              keyTranslationsInput: {
                                ...keyTranslationsInput,
                                lastKeypress: {
                                  ...lastKeypress,
                                  capslock,
                                },
                              },
                            });
                          }
                        },
                      })
                    ),

                    lastKeypress !== undefined &&
                      h$1(
                        "div",
                        null,
                        h$1(
                          "p",
                          { className: "TinyLabel" },
                          "Last received keypress data"
                        ),

                        h$1(
                          "table",
                          { className: "KeypressTable TextSmall" },
                          h$1(
                            "tbody",
                            null,
                            h$1(
                              "tr",
                              null,
                              h$1("th", null, "Code"),
                              h$1("td", null, lastKeypress.code)
                            ),
                            h$1(
                              "tr",
                              null,
                              h$1("th", null, "Key"),
                              h$1(
                                "td",
                                null,
                                viewKey(lastKeypress.key),
                                !isRecognized(lastKeypress.key)
                                  ? " (ignored)"
                                  : null
                              )
                            ),
                            h$1(
                              "tr",
                              null,
                              h$1("th", null, "Modifiers"),
                              h$1(
                                "td",
                                { style: { paddingTop: 0, paddingBottom: 0 } },
                                h$1(KeyboardShortcut, {
                                  mac: mac,
                                  shortcut: {
                                    alt: lastKeypress.alt,
                                    cmd: lastKeypress.cmd,
                                    ctrl: lastKeypress.ctrl,
                                    shift: lastKeypress.shift,
                                  },
                                })
                              )
                            ),
                            lastKeypress.capslock &&
                              h$1(
                                "tr",
                                null,
                                h$1("th", null, "Caps Lock"),
                                h$1(
                                  "td",
                                  null,
                                  "On",
                                  " ",
                                  !keyTranslationsInput.testOnly &&
                                    h$1("strong", null, "– beware!")
                                )
                              )
                          )
                        )
                      )
                  ),

                  h$1(
                    Attachment,
                    {
                      contents: h$1(
                        "div",
                        { className: "Spaced Spaced--end TinyLabel" },
                        h$1(
                          "span",
                          { style: { marginRight: "auto" } },
                          "Key translations"
                        ),

                        getLayoutMap !== undefined &&
                          h$1(ButtonWithPopup, {
                            buttonContent: "Detect",
                            popupContent: () =>
                              h$1(
                                "div",
                                { style: { width: 320 } },
                                keyboardDetect === undefined
                                  ? h$1(
                                      "div",
                                      { className: "SpacedVertical" },
                                      h$1(
                                        "p",
                                        null,
                                        "Your browser allows detecting",
                                        " ",
                                        h$1("em", null, "parts"),
                                        " of your ",
                                        h$1("em", null, "current"),
                                        " ",
                                        "keyboard layout."
                                      ),
                                      h$1(
                                        "button",
                                        {
                                          type: "button",
                                          onClick: () => {
                                            fireAndForget(
                                              this.detectKeyboard(),
                                              "OptionsProgram#render->detectKeyboard"
                                            );
                                          },
                                        },
                                        "Detect keyboard layout"
                                      )
                                    )
                                  : keyboardDetect instanceof Error
                                  ? h$1(
                                      "div",
                                      { className: "SpacedVertical Error" },
                                      h$1(
                                        "p",
                                        null,
                                        "Failed to detect keyboard layout:"
                                      ),
                                      h$1("p", null, keyboardDetect.message)
                                    )
                                  : h$1(
                                      "div",
                                      { className: "SpacedVertical" },
                                      h$1(
                                        "p",
                                        null,
                                        "Received keys from the browser:",
                                        " ",
                                        keyboardDetect.numReceived
                                      ),
                                      h$1(
                                        "p",
                                        null,
                                        "– Fully updated keys:",
                                        " ",
                                        keyboardDetect.numFullyUpdated
                                      ),
                                      h$1(
                                        "p",
                                        { style: { marginLeft: "1em" } },
                                        "– Already up-to-date:",
                                        " ",
                                        keyboardDetect.numAlreadyFullyUpdated
                                      ),
                                      h$1(
                                        "p",
                                        null,
                                        "– Partially updated keys (shift unknown):",
                                        " ",
                                        keyboardDetect.numPartiallyUpdated
                                      ),
                                      h$1(
                                        "p",
                                        { style: { marginLeft: "1em" } },
                                        "– Possibly already up-to-date:",
                                        " ",
                                        keyboardDetect.numAlreadyPartiallyUpdated
                                      )
                                    )
                              ),
                            onOpenChange: (open) => {
                              if (!open) {
                                this.setState({
                                  keyboardDetect: undefined,
                                });
                              }
                            },
                          }),

                        keyTranslationsChanged
                          ? h$1(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  this.saveOptions({
                                    keyTranslations: defaults.keyTranslations,
                                  });
                                  if (this.keysTableRef.current !== null) {
                                    this.keysTableRef.current.scrollTop = 0;
                                  }
                                },
                              },
                              "Reset to defaults (en-US QWERTY)"
                            )
                          : h$1("em", null, "Using defaults (en-US QWERTY)")
                      ),
                      style: { flex: "1 1 50%" },
                    },

                    h$1(
                      "div",
                      {
                        className: classlist("KeysTable", "TextSmall", {
                          "is-disabled": keyTranslationsInput.testOnly,
                        }),
                        ref: this.keysTableRef,
                      },

                      h$1(
                        "table",
                        null,
                        h$1(
                          "thead",
                          null,
                          h$1(
                            "tr",
                            null,
                            h$1("th", null, "Code"),
                            h$1("th", null, "Actual key"),
                            h$1("th", null, "Shifted"),
                            h$1("th", null)
                          )
                        ),
                        h$1(
                          "tbody",
                          null,
                          Object.keys(options.keyTranslations)
                            .sort()
                            .map((code) => {
                              const [unshifted, shifted] =
                                options.keyTranslations[code];
                              const {
                                [code]: [defaultUnshifted, defaultShifted] = [
                                  undefined,
                                  undefined,
                                ],
                              } = defaults.keyTranslations;
                              const changed =
                                unshifted !== defaultUnshifted ||
                                shifted !== defaultShifted;
                              return h$1(
                                "tr",
                                { key: code, id: makeKeysRowId(code) },
                                h$1(
                                  "td",
                                  {
                                    className: classlist({
                                      "is-changed": changed,
                                    }),
                                  },

                                  code
                                ),
                                h$1("td", null, viewKey(unshifted)),
                                h$1("td", null, viewKey(shifted)),
                                h$1(
                                  "td",
                                  null,
                                  h$1(
                                    "button",
                                    {
                                      type: "button",
                                      title: "Remove this key translation",
                                      className: "RemoveButton",
                                      disabled: keyTranslationsInput.testOnly,
                                      onClick: () => {
                                        const {
                                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                          [code]: _removed,
                                          ...newKeyTranslations
                                        } = options.keyTranslations;
                                        this.saveOptions({
                                          keyTranslations: newKeyTranslations,
                                        });
                                      },
                                    },
                                    "×"
                                  )
                                )
                              );
                            })
                        )
                      )
                    )
                  )
                ),
            }),

          h$1(KeyboardShortcuts, {
            key: "normal",
            id: "normal",
            mode: "Normal",
            mac: mac,
            useKeyTranslations: options.useKeyTranslations,
            name: "Main keyboard shortcuts",
            description: h$1(
              p$1,
              null,
              h$1(
                "p",
                null,
                h$1("strong", null, "Tip:"),
                " Hold",
                " ",
                h$1(KeyboardShortcut, {
                  mac: mac,
                  shortcut: { alt: !mac, ctrl: mac },
                }),
                " ",
                "while activating a hint (typing the last character) to force links to open in a new tab!"
              ),
              h$1(
                "p",
                null,
                "For “",
                describeKeyboardAction("EnterHintsMode_Select").name,
                ",” holding",
                " ",
                h$1(KeyboardShortcut, {
                  mac: mac,
                  shortcut: { alt: !mac, ctrl: mac },
                }),
                " ",
                "instead copies the text or link address of the element."
              )
            ),
            chars: "",
            mappings: options.normalKeyboardShortcuts,
            defaultMappings: defaults.normalKeyboardShortcuts,
            capturedKeypressWithTimestamp: capturedKeypressWithTimestamp,
            onChange: (newMappings) => {
              this.saveOptions({
                normalKeyboardShortcuts: newMappings,
              });
            },
            onAddChange: this.onKeyboardShortcutAddChange,
          }),

          h$1(KeyboardShortcuts, {
            key: "hints",
            id: "hints",
            mode: "Hints",
            mac: mac,
            useKeyTranslations: options.useKeyTranslations,
            name: "Hints mode keyboard shortcuts",
            chars: options.chars,
            mappings: options.hintsKeyboardShortcuts,
            defaultMappings: defaults.hintsKeyboardShortcuts,
            capturedKeypressWithTimestamp: capturedKeypressWithTimestamp,
            onChange: (newMappings) => {
              this.saveOptions({
                hintsKeyboardShortcuts: newMappings,
              });
            },
            onAddChange: this.onKeyboardShortcutAddChange,
          }),

          h$1(Field, {
            key: "css",
            id: "css",
            label: "Appearance",
            changed: options.css !== defaults.css,
            render: ({ id }) =>
              h$1(
                "div",
                { className: "SpacedVertical" },
                h$1(
                  "div",
                  { className: "Spaced" },
                  h$1(TextInput, {
                    textarea: true,
                    className: "TextSmall",
                    placeholder: "Write or copy and paste CSS overrides here…",
                    style: { flex: "1 1 50%", height: 310 },
                    id: id,
                    savedValue: options.css,
                    save: (value) => {
                      this.saveOptions({ css: value });
                    },
                  }),

                  h$1(
                    Attachment,
                    {
                      contents: h$1(
                        "div",
                        { className: "Spaced TinyLabel" },
                        h$1(
                          "select",
                          {
                            value: cssSuggestion,
                            onChange: (event) => {
                              this.setState({
                                cssSuggestion: event.currentTarget.value,
                              });
                            },
                          },

                          CSS_SUGGESTIONS.map(({ name, value }) =>
                            h$1("option", { key: name, value: value }, name)
                          )
                        ),

                        h$1(
                          "button",
                          {
                            type: "button",
                            onClick: () => {
                              this.saveOptions({
                                css:
                                  options.css.trim() === ""
                                    ? cssSuggestion
                                    : `${options.css.replace(
                                        /\n\s*$/,
                                        ""
                                      )}\n\n${cssSuggestion}`,
                              });
                            },
                          },
                          "Copy over"
                        )
                      ),
                      style: { flex: "1 1 50%" },
                    },

                    h$1(TextInput, {
                      textarea: true,
                      className: "TextSmall",
                      savedValue: cssSuggestion,
                    })
                  )
                ),

                h$1(
                  "p",
                  { className: "TextSmall" },
                  "To the left, you can add or copy and paste CSS overrides to change the look of things. To the right, you’ll find the base CSS for reference, as well as some inspiration through the dropdown."
                ),

                h$1(
                  "div",
                  null,
                  h$1(
                    "div",
                    { className: "TinyLabel Spaced" },
                    h$1("p", null, "Preview"),

                    h$1(
                      "label",
                      {
                        className: "Spaced Spaced--center",
                        style: { marginLeft: "auto" },
                      },

                      h$1("span", null, "Peek"),
                      h$1("input", {
                        type: "checkbox",
                        checked: peek,
                        onChange: (event) => {
                          this.setState({ peek: event.currentTarget.checked });
                        },
                      })
                    )
                  ),

                  h$1(CSSPreview, {
                    chars: options.chars,
                    css: options.css,
                    peek: peek,
                  })
                )
              ),
          }),

          h$1(
            "div",
            { className: "SpacedVertical SpacedVertical--large" },
            h$1(
              Details,
              {
                summary: "Performance",
                open: expandedPerf,
                onChange: (newOpen) => {
                  this.setState({ expandedPerf: newOpen }, () => {
                    this.savePosition();
                  });
                },
              },

              h$1(Perf, {
                perf: perf,
                expandedPerfTabIds: expandedPerfTabIds,
                onExpandChange: (newExpandedPerfTabIds) => {
                  this.setState(
                    { expandedPerfTabIds: newExpandedPerfTabIds },
                    () => {
                      this.savePosition();
                    }
                  );
                },
                onReset: () => {
                  this.sendMessage({ type: "ResetPerf" });
                  this.setState({ perf: {} });
                },
              })
            ),

            h$1(
              Details,
              {
                summary: "Debug",
                open: expandedDebug,
                onChange: (newOpen) => {
                  this.setState({ expandedDebug: newOpen }, () => {
                    this.savePosition();
                  });
                },
              },

              h$1(
                "div",
                { className: "Intro" },
                h$1(
                  "p",
                  null,
                  h$1(
                    "strong",
                    null,
                    "Change only if you know what you’re doing!"
                  )
                ),
                h$1(
                  "p",
                  null,
                  "Changing some of these options might require refreshing tabs or restarting the browser to take effect."
                )
              ),

              h$1(Tweakable, {
                onUpdate: () => {
                  this.forceUpdate();
                },
                before: h$1(
                  p$1,
                  null,
                  h$1("div", null),

                  h$1(Field, {
                    id: "clearLocal",
                    label: "Local storage",
                    changed: false,
                    render: () =>
                      h$1(
                        "div",
                        { className: "Spaced Spaced--center" },
                        h$1(
                          "button",
                          {
                            type: "button",
                            onClick: () => {
                              fireAndForget(
                                this.resetLocalStorage(),
                                "OptionsProgram#render->resetLocalStorage"
                              );
                            },
                          },
                          "Clear"
                        ),
                        localStorageCleared !== undefined &&
                          h$1(
                            "p",
                            null,
                            "Last cleared:",
                            " ",
                            localStorageCleared.toLocaleString()
                          )
                      ),
                    onReset: () => {
                      this.saveOptions({ logLevel: defaults.logLevel });
                    },
                  }),

                  h$1(Field, {
                    id: "logLevel",
                    label: "Log level",
                    changed: options.logLevel !== defaults.logLevel,
                    render: ({ id }) =>
                      h$1(
                        "select",
                        {
                          id: id,
                          value: options.logLevel,
                          style: { width: "50%" },
                          onChange: (event) => {
                            const { value } = event.currentTarget;
                            try {
                              const logLevel = decode(LogLevel, value);
                              this.saveOptions({ logLevel });
                            } catch (error) {
                              log(
                                "error",
                                "OptionsProgram#render",
                                "Failed to decode logLevel.",
                                error
                              );
                            }
                          },
                        },

                        Object.keys(LOG_LEVELS).map((level) =>
                          h$1(
                            "option",
                            { key: level, value: level },
                            level.slice(0, 1).toUpperCase() + level.slice(1)
                          )
                        )
                      ),
                    onReset: () => {
                      this.saveOptions({ logLevel: defaults.logLevel });
                    },
                  })
                ),
              })
            )
          ),

          h$1("div", {
            id: "errors",
            className: classlist({ ErrorsSpacing: !expandedDebug }),
          }),
          errors.length > 0 &&
            h$1(
              "div",
              { className: "ErrorsHeading", style: { zIndex: MAX_Z_INDEX } },
              h$1(
                "a",
                { href: "#errors", className: "ErrorsHeading-link" },
                importData.errors.length > 0
                  ? "Errors were encountered while importing your options."
                  : hasSaved
                  ? "Errors were encountered while saving your options."
                  : "Errors were encountered while reading your saved options."
              ),
              h$1(
                "button",
                {
                  type: "button",
                  title: "Hide errors",
                  className: "ErrorsHeading-removeButton RemoveButton",
                  onClick: () => {
                    this.setState({
                      options: {
                        ...optionsData,
                        errors: [],
                      },
                      importData: {
                        ...importData,
                        errors: [],
                      },
                    });
                    this.hiddenErrors = optionsData.errors;
                  },
                },
                "×"
              )
            ),
          errors.length > 0 &&
            h$1(
              "pre",
              { className: "Errors SpacedVertical TextSmall" },
              errors.join("\n\n")
            )
        ),

        h$1(
          "aside",
          { className: "Layout-sidebar" },
          h$1(
            "div",
            { className: "Paper" },
            h$1(
              "div",
              { className: "Branding" },
              h$1("img", {
                src: browser.runtime.getURL("icons/main.svg"),
                alt: "",
                className: "Branding-image",
              }),
              h$1(
                "div",
                null,
                h$1(
                  "p",
                  { className: "Branding-name" },
                  "Link Hints",
                  " ",
                  "1.3.1"
                ),
                h$1(
                  "p",
                  { className: "TextSmall" },
                  h$1(
                    "a",
                    {
                      href: "https://lydell.github.io/LinkHints",
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                    "Homepage"
                  )
                )
              )
            )
          ),

          h$1(
            "div",
            { className: "Paper" },
            h$1(Field, {
              id: "allOptions",
              label: "All options",
              span: true,
              changed: false,
              render: () =>
                h$1(
                  "div",
                  { className: "SpacedVertical", style: { maxWidth: 320 } },
                  h$1(
                    "div",
                    { className: "Spaced" },
                    h$1(
                      "button",
                      {
                        type: "button",
                        style: { flex: "1 1 50%" },
                        disabled: usingDefaults,
                        onClick: () => {
                          this.exportOptions();
                        },
                      },
                      "Export"
                    ),
                    h$1(
                      "div",
                      {
                        className: "SpacedVertical",
                        style: { flex: "1 1 50%" },
                      },
                      h$1(ButtonWithPopup, {
                        open: importData.successCount !== undefined,
                        buttonContent: "Import",
                        popupContent: () =>
                          h$1(
                            "div",
                            { style: { whiteSpace: "nowrap" } },
                            h$1(ImportSummary, {
                              success: importData.successCount ?? 0,
                              tweakable: importData.tweakableCount ?? 0,
                              errors: importData.errors.length,
                            })
                          ),
                        onOpenChange: (open) => {
                          if (open) {
                            fireAndForget(
                              this.importOptions(),
                              "OptionsProgram#render->importOptions"
                            );
                          } else {
                            this.setState({
                              importData: {
                                ...importData,
                                successCount: undefined,
                              },
                            });
                          }
                        },
                      })
                    )
                  ),
                  h$1(ButtonWithPopup, {
                    disabled: usingDefaults,
                    buttonContent: "Reset to defaults",
                    popupContent: ({ close }) =>
                      h$1(
                        "div",
                        { className: "SpacedVertical" },
                        h$1(
                          "p",
                          null,
                          h$1(
                            "strong",
                            null,
                            "This will reset all options to their defaults."
                          )
                        ),
                        h$1(
                          "button",
                          {
                            type: "button",
                            onClick: () => {
                              this.resetOptions();
                              close();
                            },
                          },
                          "Yes, reset all options"
                        )
                      ),
                  })
                ),
            })
          ),

          h$1(
            "div",
            { className: "Paper" },
            h$1(Field, {
              id: "testLinks",
              label: "Test links",
              span: true,
              changed: false,
              render: () => h$1(TestLinks, null),
            })
          )
        )
      );
    }

    onKeyboardShortcutAddChange = (isAdding) => {
      this.setState({ capturedKeypressWithTimestamp: undefined });
      this.sendMessage({
        type: "ToggleKeyboardCapture",
        capture: isAdding,
      });
    };

    scrollKeyIntoView(code) {
      const id = makeKeysRowId(code);
      const element = document.getElementById(id);
      const keysTable = this.keysTableRef.current;

      if (keysTable === null || element === null) {
        return;
      }

      element.classList.remove("is-animated");

      const elementRect = element.getBoundingClientRect();
      const keysTableRect = keysTable.getBoundingClientRect();
      const headingsHeight = Math.max(
        0,
        ...Array.from(
          keysTable.querySelectorAll("thead th"),
          (th) => th.offsetHeight
        )
      );

      const diffTop = elementRect.top - keysTableRect.top - headingsHeight;
      const diffBottom = elementRect.bottom - keysTableRect.bottom;

      if (diffTop < 0) {
        keysTable.scrollTop += diffTop;
      } else if (diffBottom > 0) {
        keysTable.scrollTop += diffBottom;
      }

      element.classList.add("is-animated");
      // Remove the animation when finished to avoid it running again when
      // toggling the radio buttons back and forth.
      element.addEventListener(
        "animationend",
        () => {
          element.classList.remove("is-animated");
        },
        { once: true }
      );
    }

    onScroll() {}

    savePosition() {}

    async restorePosition() {}

    async detectKeyboard() {
      try {
        if (getLayoutMap === undefined) {
          throw new Error(
            "Your browser does not support detecting your keyboard layout after all."
          );
        }

        const layoutMap = await getLayoutMap();

        const { options: optionsData } = this.state;
        if (optionsData === undefined) {
          throw new Error("Failed to save key translations.");
        }

        const { keyTranslations } = optionsData.values;

        const codes = Object.keys(keyTranslations);
        const newCodes = Array.from(layoutMap.keys()).filter(
          (code) => !codes.includes(code)
        );

        const results = codes
          .map((code) => {
            const pair = keyTranslations[code];
            const key = layoutMap.get(code);
            if (key === undefined) {
              return ["NotUpdated", code, pair];
            }
            if (isShiftable(key)) {
              const newPair = [key, key.toUpperCase()];
              return deepEqual(pair, newPair)
                ? ["AlreadyFullyUpdated", code, pair]
                : ["FullyUpdated", code, newPair];
            }
            return key === pair[0]
              ? ["AlreadyPartiallyUpdated", code, pair]
              : ["PartiallyUpdated", code, [key, "?"]];
          })
          .concat(
            newCodes.flatMap((code) => {
              const key = layoutMap.get(code);
              return key === undefined
                ? []
                : isShiftable(key)
                ? [["FullyUpdated", code, [key, key.toUpperCase()]]]
                : [["PartiallyUpdated", code, [key, "?"]]];
            })
          );

        function count(updateStatus) {
          return results.filter(
            ([updateStatus2]) => updateStatus2 === updateStatus
          ).length;
        }

        const newKeyTranslations = Object.fromEntries(
          results.map(([, code, pair]) => [code, pair])
        );

        this.saveOptions({ keyTranslations: newKeyTranslations });
        this.setState({
          keyboardDetect: {
            numReceived: layoutMap.size,
            numFullyUpdated: count("FullyUpdated"),
            numAlreadyFullyUpdated: count("AlreadyFullyUpdated"),
            numPartiallyUpdated: count("PartiallyUpdated"),
            numAlreadyPartiallyUpdated: count("AlreadyPartiallyUpdated"),
            numNotUpdated: count("NotUpdated"),
          },
        });
      } catch (errorAny) {
        const error = errorAny;
        this.setState({ keyboardDetect: error });
      }
    }
  }

  function wrapMessage(message) {
    return {
      type: "FromOptions",
      message,
    };
  }

  function updateKeyTranslations({ code, key, shift }, keyTranslations) {
    const previousPair = Object.prototype.hasOwnProperty.call(
      keyTranslations,
      code
    )
      ? keyTranslations[code]
      : undefined;

    const newPair = updatePair({ key, shift }, previousPair);
    const changed =
      previousPair === undefined || !deepEqual(newPair, previousPair);
    return changed ? { ...keyTranslations, [code]: newPair } : undefined;
  }

  function updatePair({ key, shift }, previousPair) {
    if (!shift && key.length === 1 && key.toLowerCase() !== key.toUpperCase()) {
      return [key, key.toUpperCase()];
    }
    if (previousPair !== undefined) {
      const [unshifted, shifted] = previousPair;
      return shift ? [unshifted, key] : [key, shifted];
    }
    return [key, key];
  }

  function isShiftable(key) {
    return key.length === 1 && key !== key.toUpperCase();
  }

  function makeKeysRowId(code) {
    return `KeysTable-row-${code}`;
  }

  function ActivateHighlightedKey({ mac, mappings, defaultMappings }) {
    const first = mappings.find((mapping) => mapping.action === "ActivateHint");

    if (first !== undefined) {
      return h$1(KeyboardShortcut, { mac: mac, shortcut: first.shortcut });
    }

    const firstDefault = defaultMappings.find(
      (mapping) => mapping.action === "ActivateHint"
    );

    const fallback =
      firstDefault !== undefined ? firstDefault.shortcut : { key: "error" };

    return h$1(
      "span",
      null,
      h$1(KeyboardShortcut, { mac: mac, shortcut: fallback }),
      " (note: you’ve disabled that shortcut)"
    );
  }

  function saveFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = fileName;
    a.dispatchEvent(new MouseEvent("click"));
    URL.revokeObjectURL(url);
  }

  async function selectFile(accept) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.onchange = () => {
        input.onchange = null;
        if (input.files !== null) {
          resolve(input.files[0]);
        }
      };
      input.dispatchEvent(new MouseEvent("click"));
    });
  }

  async function readAsJson(file) {
    return new Response(file).json();
  }

  function toISODateString(date) {
    const pad = (num) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}`;
  }

  function start() {
    P(
      h$1(OptionsProgram, {
        ref: (program) => {
          // Attach the instance to `window` for debugging in the regular Web
          // Console.
          // @ts-expect-error Only for debugging use.
          window.optionsProgram = program;
        },
      }),
      document.body
    );
  }

  start();
})();
