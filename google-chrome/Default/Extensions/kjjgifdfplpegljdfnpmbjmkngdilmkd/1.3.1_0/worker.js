(function () {
  "use strict";

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
  function fields(callback, { exact = "allow extra", allow = "object" } = {}) {
    return function fieldsDecoder(value) {
      const object =
        allow === "array" ? unknownArray(value) : unknownRecord(value);
      const knownFields = Object.create(null);
      function field(key, decoder) {
        try {
          const result = decoder(object[key]);
          knownFields[key] = null;
          return result;
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      const result = callback(field, object);
      if (exact !== "allow extra") {
        const unknownFields = Object.keys(object).filter(
          (key) => !Object.prototype.hasOwnProperty.call(knownFields, key)
        );
        if (unknownFields.length > 0) {
          throw new DecoderError({
            tag: "exact fields",
            knownFields: Object.keys(knownFields),
            got: unknownFields,
          });
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
  function fieldsUnion(key, mapping) {
    // eslint-disable-next-line prefer-arrow-callback
    return fields(function fieldsUnionFields(field, object) {
      const tag = field(key, string);
      if (Object.prototype.hasOwnProperty.call(mapping, tag)) {
        const decoder = mapping[tag];
        return decoder(object);
      }
      throw new DecoderError({
        tag: "unknown fieldsUnion tag",
        knownTags: Object.keys(mapping),
        got: tag,
        key,
      });
    });
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

  // It's tempting to put a random number or something in the ID, but in case
  // something goes wrong and a rogue container is left behind it's always
  // possible to find and remove it if the ID is known. Also, RendererProgram and
  // ElementManager might not get the same random number.
  const CONTAINER_ID = `__${"LinkHints"}WebExt`;

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

  /**
   * Divides `array` into two arrays, `left`, and `right`, using `fn`. If
   * `fn(item)` returns `true`, `item` is placed in `left`, otherwise in `right`.
   */
  function partition(array, fn) {
    const left = [];
    const right = [];

    array.forEach((item, index) => {
      if (fn(item, index, array)) {
        left.push(item);
      } else {
        right.push(item);
      }
    });

    return [left, right];
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

  function getViewport() {
    // In `<frameset>` documents `.scrollingElement` is null so fall back to
    // `.documentElement`.
    const scrollingElement =
      document.scrollingElement ?? document.documentElement;

    if (scrollingElement === null) {
      return {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }

    // `scrollingElement.client{Width,Height}` is the size of the viewport without
    // scrollbars (unlike `window.inner{Width,Height}` which include the
    // scrollbars). This works in both Firefox and Chrome, quirks and non-quirks
    // mode and with strange styling like setting a width on `<html>`.
    return {
      x: 0,
      y: 0,
      width: scrollingElement.clientWidth,
      height: scrollingElement.clientHeight,
    };
  }

  const NON_WHITESPACE = /\S/;
  const LAST_NON_WHITESPACE = /\S\s*$/;

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

  function getElementsFromPoint(element, x, y) {
    const root = element.getRootNode();
    const doc =
      root instanceof Document || root instanceof ShadowRoot ? root : document;
    return doc.elementsFromPoint(x, y);
  }

  function getLabels(element) {
    // @ts-expect-error Only some types of elements have `.labels`, and I'm not going to `instanceof` check them all.
    const labels = element.labels; // eslint-disable-line prefer-destructuring
    return labels instanceof NodeList ? labels : undefined;
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

  const UnsignedFloat = chain(number, (value) => {
    if (!(Number.isFinite(value) && value >= 0)) {
      throw new DecoderError({
        message: "Expected an unsigned finite float",
        value,
      });
    }
    return value;
  });

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

  class TimeTracker {
    _durations = [];

    _current = undefined;

    start(label) {
      this.stop();

      this._current = {
        label,
        timestamp: Date.now(),
      };
    }

    stop() {
      const current = this._current;
      if (current === undefined) {
        return;
      }

      const duration = Date.now() - current.timestamp;

      const previous = this._durations.find(
        ([label]) => label === current.label
      );
      if (previous !== undefined) {
        previous[1] += duration;
      } else {
        this._durations.push([current.label, duration]);
      }

      this._current = undefined;
    }

    export() {
      this.stop();
      return this._durations.slice();
    }
  }

  const ElementType = stringUnion({
    "clickable-event": null,
    clickable: null,
    label: null,
    link: null,
    scrollable: null,
    selectable: null,
    textarea: null,
  });

  const ElementTypes = multi({
    array: array(ElementType),
    string: stringUnion({
      selectable: null,
    }),
  });

  const DEBUG_PREFIX = "debug.";

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

  const Viewports = array(
    fieldsAuto({
      // A viewport of a frame can be partially off-screen.
      x: number,
      y: number,
      width: UnsignedFloat,
      height: UnsignedFloat,
    })
  );

  const FrameMessage = fieldsUnion("type", {
    FindElements: fieldsAuto({
      type: () => "FindElements",
      token: () => "",
      types: ElementTypes,
      viewports: Viewports,
    }),
    UpdateElements: fieldsAuto({
      type: () => "UpdateElements",
      token: () => "",
      viewports: Viewports,
    }),
  });

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

  var injected = (communicator) => {
    // Refers to the page `window` both in Firefox and other browsers.
    const win = window;

    // These arrays are replaced in by ElementManager; only refer to them once.
    const clickableEventNames = CLICKABLE_EVENT_NAMES;
    const clickableEventProps = CLICKABLE_EVENT_PROPS;

    // When this was written, <https://jsfiddle.net/> overrides `Event` (which was
    // used before switching to `CustomEvent`) with a buggy implementation that
    // throws an error. To work around that, make sure that the page can't
    // interfere with the crucial parts by saving copies of important things.
    // Remember that this runs _before_ any page scripts.
    const CustomEvent2 = CustomEvent;
    const HTMLElement2 = HTMLElement;
    const ShadowRoot2 = ShadowRoot;
    // Don't use the usual `log` function here, too keep this file small.
    const { error: consoleLogError, log: consoleLog } = console;
    const createElement = document.createElement.bind(document);
    /* eslint-disable @typescript-eslint/unbound-method */
    const { appendChild, removeChild, getRootNode } = Node.prototype;
    const { replaceWith } = Element.prototype;
    const { addEventListener, dispatchEvent } = EventTarget.prototype;
    const { apply } = Reflect;
    const { get: mapGet } = Map.prototype;
    /* eslint-enable @typescript-eslint/unbound-method */

    function logError(...args) {
      consoleLogError(`[${"LinkHints"}]`, ...args);
    }

    const infiniteDeadline = {
      timeRemaining: () => Infinity,
    };

    class HookManager {
      fnMap = new Map();

      resetFns = [];

      reset() {
        // Reset all overridden methods.
        for (const resetFn of this.resetFns) {
          resetFn();
        }

        this.fnMap.clear();
        this.resetFns = [];
      }

      // Hook into whenever `obj[name]()` (such as
      // `EventTarget.prototype["addEventListener"]`) is called, by calling
      // `hook`. This is done by overriding the method, but in a way that makes it
      // really difficult to detect that the method has been overridden. There are
      // two reasons for covering our tracks:
      //
      // 1. We don’t want to break websites. For example, naively overriding
      //    `addEventListener` breaks CKEditor: <https://jsfiddle.net/tv5x6zuj/>
      //    See also: <https://github.com/philc/vimium/issues/2900> (and its
      //    linked issues and PRs).
      // 2. We don’t want developers to see strange things in the console when
      //    they debug stuff.
      //
      // `hook` is run _after_ the original function. If you need to do something
      // _before_ the original function is called, use a `prehook`.
      hookInto(
        passedObj,
        name,
        hook,

        prehook
      ) {
        const obj = passedObj;
        const descriptor = Reflect.getOwnPropertyDescriptor(obj, name);
        const prop = "value" in descriptor ? "value" : "set";
        const originalFn = descriptor[prop];

        const { fnMap } = this;

        const fn = dynamicallyNamedFunction(
          originalFn.name,
          hook === undefined
            ? (that, ...args) =>
                // In the cases where no hook is provided we just want to make sure that
                // the method (such as `toString`) is called with the _original_ function,
                // not the overriding function.
                apply(originalFn, apply(mapGet, fnMap, [that]) ?? that, args)
            : (that, ...args) => {
                let wrappedArgs = args;

                let prehookData = undefined;
                if (prehook !== undefined) {
                  try {
                    prehookData = prehook(that, ...wrappedArgs);
                  } catch (errorAny) {
                    const error = errorAny;
                    logHookError(error, obj, name);
                  }
                }

                // Since Firefox does not support running cleanups when an
                // extension is disabled/updated (<bugzil.la/1223425>), hooks
                // from the previous version will still be around (until the
                // page is reloaded). `apply(originalFn, this, args)` fails with
                // "can't access dead object" for the old hooks will fail, so
                // ignore that error and abort those hooks.
                let returnValue = undefined;
                {
                  returnValue = apply(originalFn, that, args);
                }

                // In case there's a mistake in `hook` it shouldn't cause the entire
                // overridden method to fail and potentially break the whole page.
                try {
                  // Remember that `hook` can be called with _anything,_ because the
                  // user can pass invalid arguments and use `.call`.
                  const result = hook(
                    { returnValue, prehookData },
                    that,
                    ...wrappedArgs
                  );
                  if (
                    typeof result === "object" &&
                    result !== null &&
                    typeof result.then === "function"
                  ) {
                    result.then(
                      undefined,
                      // .catch does not exist on `PromiseLike`.
                      // eslint-disable-next-line no-restricted-syntax
                      (error) => {
                        logHookError(error, obj, name);
                      }
                    );
                  }
                } catch (errorAny) {
                  const error = errorAny;
                  logHookError(error, obj, name);
                }

                return returnValue;
              }
        );

        // Make sure that `.length` is correct. This has to be done _after_
        // `exportFunction`.
        const setLength = (target) => {
          Reflect.defineProperty(target, "length", {
            ...Reflect.getOwnPropertyDescriptor(Function.prototype, "length"),
            value: originalFn.length,
          });
        };

        // Save the overriding and original functions so we can map overriding to
        // original in the case with no `hook` above.
        fnMap.set(fn, originalFn);

        let newDescriptor = { ...descriptor, [prop]: fn };

        setLength(newDescriptor[prop]);

        // Finally override the method with the created function.
        Reflect.defineProperty(obj, name, newDescriptor);
        this.resetFns.push(() => {
          Reflect.defineProperty(obj, name, descriptor);
        });
      }

      // Make sure that `Function.prototype.toString.call(element.addEventListener)`
      // returns "[native code]". This is used by lodash's `_.isNative`.
      // `.toLocaleString` is automatically taken care of when patching `.toString`.
      conceal() {
        // This isn’t needed in Firefox, thanks to `exportFunction`.
        {
          this.hookInto(win.Function.prototype, "toString");
        }
      }
    }

    // `f = { [name]: function(){} }[name]` is a way of creating a dynamically
    // named function (where `f.name === name`).
    function dynamicallyNamedFunction(n, f) {
      return {
        // Despite our best efforts, it’s still possible to detect our injection
        // in Chrome by using an iframe. So keep this function as short and vague
        // as possible. Keep it on one line to not leak the indentation. Include
        // the standard “native code” stuff in an attempt to work with naive
        // string matching code.
        // prettier-ignore
        [n](...a) { "function () { [native code] }"; return f(this, ...a); },
      }[n];
    }

    function logHookError(error, obj, name) {
      logError(`Failed to run hook for ${name} on`, obj, error);
    }

    class ClickListenerTracker {
      clickListenersByElement = new Map();

      queue = makeEmptyQueue();

      sendQueue = makeEmptyQueue();

      idleCallbackId = undefined;

      reset() {
        if (this.idleCallbackId !== undefined) {
          cancelIdleCallback(this.idleCallbackId);
        }

        this.clickListenersByElement = new Map();
        this.queue = makeEmptyQueue();
        this.sendQueue = makeEmptyQueue();
        this.idleCallbackId = undefined;
      }

      queueItem(item) {
        const numItems = this.queue.items.push(item);
        this.requestIdleCallback();

        if (numItems === 1 && this.sendQueue.items.length === 0) {
          if (communicator !== undefined) {
            communicator.onInjectedMessage({ type: "Queue", hasQueue: true });
          } else {
            sendWindowEvent(QUEUE_EVENT, true);
          }
        }
      }

      requestIdleCallback() {
        if (this.idleCallbackId === undefined) {
          this.idleCallbackId = requestIdleCallback((deadline) => {
            this.idleCallbackId = undefined;
            this.flushQueue(deadline);
          });
        }
      }

      flushQueue(deadline) {
        const hadQueue =
          this.queue.items.length > 0 || this.sendQueue.items.length > 0;
        this._flushQueue(deadline);
        const hasQueue =
          this.queue.items.length > 0 || this.sendQueue.items.length > 0;
        if (hadQueue && !hasQueue) {
          if (communicator !== undefined) {
            communicator.onInjectedMessage({ type: "Queue", hasQueue: false });
          } else {
            sendWindowEvent(QUEUE_EVENT, false);
          }
        }
      }

      _flushQueue(deadline) {
        const done = this.flushSendQueue(deadline);

        if (!done || this.queue.items.length === 0) {
          return;
        }

        // Track elements that got their first listener, or lost their last one.
        // The data structure simplifies additions and removals: If first adding
        // an element and then removing it, it’s the same as never having added or
        // removed the element at all (and vice versa).
        const addedRemoved = new AddedRemoved();

        const startQueueIndex = this.queue.index;
        let timesUp = false;

        for (; this.queue.index < this.queue.items.length; this.queue.index++) {
          if (
            this.queue.index > startQueueIndex &&
            deadline.timeRemaining() <= 0
          ) {
            timesUp = true;
            break;
          }

          const item = this.queue.items[this.queue.index];

          // `.onclick` or similar changed.
          if (item.type === "prop") {
            const { hadListener, element } = item;
            // If the element has click listeners added via `.addEventListener`
            // changing `.onclick` can't affect whether the element has at least
            // one click listener.
            if (!this.clickListenersByElement.has(element)) {
              const hasListener = hasClickListenerProp(element);
              if (!hadListener && hasListener) {
                addedRemoved.add(element);
              } else if (hadListener && !hasListener) {
                addedRemoved.remove(element);
              }
            }
          }
          // `.addEventListener`
          else if (item.added) {
            const gotFirst = this.add(item);
            if (gotFirst) {
              addedRemoved.add(item.element);
            }
          }
          // `.removeEventListener`
          else {
            const lostLast = this.remove(item);
            if (lostLast) {
              addedRemoved.remove(item.element);
            }
          }
        }

        if (!timesUp) {
          this.queue = makeEmptyQueue();
        }

        const { added, removed } = addedRemoved;

        for (const element of added) {
          this.sendQueue.items.push({ added: true, element });
        }

        for (const element of removed) {
          this.sendQueue.items.push({ added: false, element });
        }

        if (timesUp) {
          this.requestIdleCallback();
        } else {
          this.flushSendQueue(deadline);
        }
      }

      flushSendQueue(deadline) {
        const startQueueIndex = this.sendQueue.index;
        for (
          ;
          this.sendQueue.index < this.sendQueue.items.length;
          this.sendQueue.index++
        ) {
          if (
            this.sendQueue.index > startQueueIndex &&
            deadline.timeRemaining() <= 0
          ) {
            this.requestIdleCallback();
            return false;
          }

          const item = this.sendQueue.items[this.sendQueue.index];

          if (communicator !== undefined) {
            communicator.onInjectedMessage({
              type: "ClickableChanged",
              target: item.element,
              clickable: item.added,
            });
          } else {
            sendElementEvent(CLICKABLE_CHANGED_EVENT, item.element, item.added);
          }
        }

        this.sendQueue = makeEmptyQueue();
        return true;
      }

      add({ element, eventName, listener, options }) {
        const optionsString = stringifyOptions(eventName, options);
        const optionsByListener = this.clickListenersByElement.get(element);

        // No previous click listeners.
        if (optionsByListener === undefined) {
          this.clickListenersByElement.set(
            element,
            new Map([[listener, new Set([optionsString])]])
          );

          if (!hasClickListenerProp(element)) {
            // The element went from no click listeners to one.
            return true;
          }

          return false;
        }

        const optionsSet = optionsByListener.get(listener);

        // New listener function.
        if (optionsSet === undefined) {
          optionsByListener.set(listener, new Set([optionsString]));
          return false;
        }

        // Already seen listener function, but new options and/or event type.
        if (!optionsSet.has(optionsString)) {
          optionsSet.add(optionsString);
          return false;
        }

        // Duplicate listener. Nothing to do.
        return false;
      }

      remove({ element, eventName, listener, options }) {
        const optionsString = stringifyOptions(eventName, options);
        const optionsByListener = this.clickListenersByElement.get(element);

        // The element has no click listeners.
        if (optionsByListener === undefined) {
          // If the element was created and given a listener in another frame and
          // then was inserted in another frame, the element might actually have
          // had a listener after all that was now removed. In Chrome this is
          // tracked correctly, but in Firefox we need to "lie" here and say that
          // the last listener was removed in case it was.
          return "chrome" === "firefox";
        }

        const optionsSet = optionsByListener.get(listener);

        // The element has click listeners, but not with `listener` as a callback.
        if (optionsSet === undefined) {
          return false;
        }

        // The element has `listener` as a click callback, but with different
        // options and/or event type.
        if (!optionsSet.has(optionsString)) {
          return false;
        }

        // Match! Remove the current options.
        optionsSet.delete(optionsString);

        // If that was the last options for `listener`, remove `listener`.
        if (optionsSet.size === 0) {
          optionsByListener.delete(listener);

          // If that was the last `listener` for `element`, remove `element`.
          if (optionsByListener.size === 0) {
            this.clickListenersByElement.delete(element);

            if (!hasClickListenerProp(element)) {
              // The element went from one click listener to none.
              return true;
            }
          }
        }

        return false;
      }
    }

    function makeEmptyQueue() {
      return {
        items: [],
        index: 0,
      };
    }

    class AddedRemoved {
      added = new Set();

      removed = new Set();

      add(item) {
        if (this.removed.has(item)) {
          this.removed.delete(item);
        } else {
          this.added.add(item);
        }
      }

      remove(item) {
        if (this.added.has(item)) {
          this.added.delete(item);
        } else {
          this.removed.add(item);
        }
      }
    }

    function stringifyOptions(eventName, options) {
      const normalized =
        typeof options === "object" && options !== null
          ? options
          : { capture: Boolean(options) };
      // Only the value of the `capture` option (regardless of how it was set) matters:
      // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#matching_event_listeners_for_removal
      const capture = Boolean(normalized.capture).toString();
      return `${eventName}:${capture}`;
    }

    function hasClickListenerProp(element) {
      return clickableEventProps.some(
        (prop) => typeof element[prop] === "function"
      );
    }

    function sendWindowEvent(eventName, detail) {
      apply(dispatchEvent, window, [new CustomEvent2(eventName, { detail })]);
    }

    function makeSecretElement() {
      // Content scripts running at `document_start` actually execute _before_
      // `document.head` exists! `document.documentElement` seems to be completely
      // empty when this runs (in new tabs). Just to be extra safe, use a `<head>`
      // element as the secret element. `<head>` is invisible (`display: none;`)
      // and a valid child of `<html>`. I’m worried injecting some other element
      // could cause the browser to paint that, resulting in a flash of unstyled
      // content.
      // A super edge case is when `document.documentElement` is missing. It’s
      // possible to do for example `document.documentElement.remove()` and later
      // `document.append(newRoot)`.
      const [root, secretElement] =
        document.documentElement === null
          ? [document, createElement("html")]
          : [document.documentElement, createElement("head")];
      if (communicator === undefined) {
        apply(appendChild, root, [secretElement]);
        apply(dispatchEvent, secretElement, [
          new CustomEvent2(REGISTER_SECRET_ELEMENT_EVENT),
        ]);
        apply(removeChild, root, [secretElement]);
      }
      return secretElement;
    }

    // In Firefox, it is also possible to use `sendWindowEvent` passing `element`
    // as `detail`, but that does not work properly in all cases when an element
    // is inserted into another frame. Chrome does not allow passing DOM elements
    // as `detail` from a page to an extension at all.
    const secretElement = makeSecretElement();
    function sendElementEvent(
      eventName,
      element,
      detail = undefined,
      root = getOpenComposedRootNode(element)
    ) {
      const send = () => {
        apply(dispatchEvent, element, [
          // `composed: true` is used to allow the event to be observed outside
          // the current ShadowRoot (if any).
          new CustomEvent2(eventName, { detail, composed: true }),
        ]);
      };

      switch (root.type) {
        // The element has 0 or more _open_ shadow roots above it and is connected
        // to the page. Nothing more to do – just fire the event.
        case "Document":
          send();
          break;

        // For the rest of the cases, the element is not inserted into the page
        // (yet/anymore), which means that ElementManager’s window event listeners
        // won’t fire. Instead, temporarily insert the element into a disconnected
        // element that ElementManager knows about and listens to, but nobody else
        // knows about. This avoids triggering MutationObservers on the page.
        // Note that the element might still have parent elements (which aren’t
        // inserted into the page either), so one cannot just insert `element`
        // into `secretElement` and then remove `element` again – then `element`
        // would also be removed from its original parent, and be missing when the
        // parent is inserted into the page.

        // We end up here if:
        // - `element` has no parents at all (if so, `element === root.element`).
        // - `element` has a (grand-)parent element that has no parents.
        // - `element` has one or more _open_ shadow roots above it, and the host
        //   element of the topmost shadow root has no parents.
        // In these cases, it’s the easiest and less invasive to move the entire
        // tree temporarily to the secret element.
        case "Element":
          apply(appendChild, secretElement, [root.element]);
          send();
          apply(removeChild, secretElement, [root.element]);
          break;

        // If there’s a _closed_ shadow root somewhere up the chain, we must
        // temporarily move `element` out of the top-most closed shadow root
        // before we can dispatch events. Replace `element` with a dummy element,
        // move it into the secret element, and then replace the dummy back with
        // `element` again.
        case "Closed": {
          const tempElement = createElement("div");
          apply(replaceWith, element, [tempElement]);
          apply(appendChild, secretElement, [element]);
          send();
          apply(replaceWith, tempElement, [element]);
          break;
        }
      }
    }

    function getOpenComposedRootNode(element) {
      const root = apply(getRootNode, element, []);

      return root === element
        ? { type: "Element", element }
        : root instanceof ShadowRoot2
        ? root.mode === "open"
          ? getOpenComposedRootNode(root.host)
          : { type: "Closed" }
        : { type: "Document" };
    }

    const clickListenerTracker = new ClickListenerTracker();
    const hookManager = new HookManager();

    function onAddEventListener(element, eventName, listener, options) {
      if (
        !(
          typeof eventName === "string" &&
          clickableEventNames.includes(eventName) &&
          element instanceof HTMLElement2 &&
          (typeof listener === "function" ||
            (typeof listener === "object" &&
              listener !== null &&
              typeof listener.handleEvent === "function"))
        )
      ) {
        return;
      }

      // If `{ once: true }` is used, listen once ourselves so we can track the
      // removal of the listener when it has triggered.
      if (
        typeof options === "object" &&
        options !== null &&
        Boolean(options.once)
      ) {
        apply(addEventListener, element, [
          eventName,
          () => {
            onRemoveEventListener(element, eventName, listener, options);
          },
          options,
        ]);
      }

      clickListenerTracker.queueItem({
        type: "method",
        added: true,
        element,
        eventName,
        listener,
        options,
      });
    }

    function onRemoveEventListener(element, eventName, listener, options) {
      if (
        !(
          typeof eventName === "string" &&
          clickableEventNames.includes(eventName) &&
          element instanceof HTMLElement2 &&
          (typeof listener === "function" ||
            (typeof listener === "object" &&
              listener !== null &&
              typeof listener.handleEvent === "function"))
        )
      ) {
        return;
      }

      clickListenerTracker.queueItem({
        type: "method",
        added: false,
        element,
        eventName,
        listener,
        options,
      });
    }

    function onPropChangePreHook(element) {
      if (!(element instanceof HTMLElement2)) {
        return undefined;
      }

      return {
        type: "prop",
        hadListener: hasClickListenerProp(element),
        element,
      };
    }

    function onPropChange({ prehookData }) {
      if (prehookData !== undefined) {
        clickListenerTracker.queueItem(prehookData);
      }
    }

    function onShadowRootCreated({ returnValue: shadowRoot }) {
      if (communicator !== undefined) {
        communicator.onInjectedMessage({
          type: "ShadowRootCreated",
          shadowRoot,
        });
      } else if (shadowRoot.mode === "open") {
        // In “open” mode, ElementManager can access shadow roots via the
        // `.shadowRoot` property on elements. All we need to do here is tell
        // the ElementManager that a shadow root has been created.
        sendElementEvent(OPEN_SHADOW_ROOT_CREATED_EVENT, shadowRoot.host);
      } else {
        // In “closed” mode, ElementManager cannot easily access shadow roots.
        // By creating a temporary element inside the shadow root and emitting
        // events on that element, ElementManager can obtain the shadow root
        // via the `.getRootNode()` method and store it in a WeakMap. This is
        // done in two steps – see the listeners in ElementManager to learn why.
        const tempElement = createElement("div");
        // Expose `tempElement`:
        sendElementEvent(CLOSED_SHADOW_ROOT_CREATED_1_EVENT, tempElement);
        apply(appendChild, shadowRoot, [tempElement]);
        // Expose `shadowRoot`:
        sendElementEvent(
          CLOSED_SHADOW_ROOT_CREATED_2_EVENT,
          tempElement,
          undefined,
          {
            // Force firing the event while `tempElement` is still inside the
            // closed shadow root. Normally we don’t do that, since events from
            // within closed shadow roots appear to come from its host element,
            // and the whole point of `sendElementEvent` is to set
            // `event.target` to `element`, not to some shadow root. But in this
            // special case `event.target` doesn’t matter and we _need_
            // `tempElement` to be inside `shadowRoot` so that `.getRootNode()`
            // returns it.
            type: "Document",
          }
        );
        apply(removeChild, shadowRoot, [tempElement]);
      }
    }

    function onFlush() {
      clickListenerTracker.flushQueue(infiniteDeadline);
    }

    function onReset() {
      // ElementManager removes listeners itself on reset.
      if (communicator === undefined) {
        document.removeEventListener(FLUSH_EVENT, onFlush, true);
        document.removeEventListener(RESET_EVENT, onReset, true);
      }

      // Reset the overridden methods when the extension is shut down.
      clickListenerTracker.reset();
      hookManager.reset();
    }

    // Use `document` rather than `window` in order not to appear in the “Global
    // event listeners” listing in devtools.
    const target = communicator ?? document;
    target.addEventListener(FLUSH_EVENT, onFlush, true);
    target.addEventListener(RESET_EVENT, onReset, true);

    hookManager.hookInto(
      win.EventTarget.prototype,
      "addEventListener",
      (_data, ...args) => {
        onAddEventListener(...args);
      }
    );

    hookManager.hookInto(
      win.EventTarget.prototype,
      "removeEventListener",
      (_data, ...args) => {
        onRemoveEventListener(...args);
      }
    );

    // Hook into `.onclick` and similar.
    for (const prop of clickableEventProps) {
      hookManager.hookInto(
        win.HTMLElement.prototype,
        prop,
        onPropChange,
        onPropChangePreHook
      );
    }

    hookManager.hookInto(
      win.Element.prototype,
      "attachShadow",
      onShadowRootCreated
    );

    hookManager.conceal();
  };

  // Keep the above imports and this object in sync. See injected.ts.
  const constants = {
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
  };

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

  const tMeta = tweakable("ElementManager", t$1);

  const infiniteDeadline = {
    timeRemaining: () => Infinity,
  };

  class ElementManager {
    onMutationExternal;

    queue = makeEmptyQueue();

    injectedHasQueue = false;

    injectedListeners = new Map();

    elements = new Map();

    visibleElements = new Set();

    visibleFrames = new Set();

    elementsWithClickListeners = new WeakSet();

    elementsWithScrollbars = new WeakSet();

    shadowRoots = new WeakMap();

    idleCallbackId = undefined;

    bailed = false;

    secretElementResets = new Resets();

    resets = new Resets();

    intersectionObserver = new IntersectionObserver(
      this.onIntersection.bind(this)
    );

    frameIntersectionObserver = new IntersectionObserver(
      this.onFrameIntersection.bind(this)
    );

    mutationObserver = new MutationObserver(this.onMutation.bind(this));

    removalObserver = new MutationObserver(this.onRemoval.bind(this));

    constructor({ onMutation }) {
      this.onMutationExternal = onMutation;
    }

    async start() {
      // When adding new event listeners, consider also subscribing in
      // `onRegisterSecretElement` and `setShadowRoot`.
      {
        this.resets.add(
          addEventListener(
            window,
            CLICKABLE_CHANGED_EVENT,
            this.onClickableChanged.bind(this),
            "ElementManager#onClickableChanged"
          ),
          addEventListener(
            window,
            QUEUE_EVENT,
            this.onInjectedQueue.bind(this),
            "ElementManager#onInjectedQueue"
          ),
          addEventListener(
            window,
            OPEN_SHADOW_ROOT_CREATED_EVENT,
            this.onOpenShadowRootCreated.bind(this),
            "ElementManager#onOpenShadowRootCreated"
          ),
          addEventListener(
            window,
            CLOSED_SHADOW_ROOT_CREATED_1_EVENT,
            this.onClosedShadowRootCreated.bind(this),
            "ElementManager#onClosedShadowRootCreated"
          ),
          addEventListener(
            window,
            REGISTER_SECRET_ELEMENT_EVENT,
            this.onRegisterSecretElement.bind(this),
            "ElementManager#onRegisterSecretElement"
          )
        );
      }

      this.resets.add(
        addEventListener(
          window,
          "overflow",
          this.onOverflowChange.bind(this),
          "ElementManager#onOverflowChange"
        ),
        addEventListener(
          window,
          "underflow",
          this.onOverflowChange.bind(this),
          "ElementManager#onOverflowChange"
        )
      );

      this.injectScript();

      // Wait for tweakable values to load before starting the MutationObserver,
      // in case the user has changed `ATTRIBUTES_MUTATION`. After the
      // MutationObserver has been started, queue all elements and frames added
      // before the observer was running.
      await tMeta.loaded;

      mutationObserve(this.mutationObserver, document);

      // Pick up all elements present in the initial HTML payload. Large HTML
      // pages are usually streamed in chunks. As later chunks arrive and are
      // rendered, each new element will trigger the MutationObserver.
      if (document.documentElement !== null) {
        const records = [
          {
            addedNodes: [document.documentElement],
            removedNodes: [],
            attributeName: null,
            target: document.documentElement,
          },
        ];
        this.queueRecords(records);
      }

      for (const frame of document.querySelectorAll("iframe, frame")) {
        this.frameIntersectionObserver.observe(frame);
      }
    }

    stop() {
      if (this.idleCallbackId !== undefined) {
        cancelIdleCallback(this.idleCallbackId);
      }

      this.intersectionObserver.disconnect();
      this.frameIntersectionObserver.disconnect();
      this.mutationObserver.disconnect();
      this.removalObserver.disconnect();
      this.queue = makeEmptyQueue();
      this.injectedHasQueue = false;
      this.injectedListeners = new Map();
      this.elements.clear();
      this.visibleElements.clear();
      this.visibleFrames.clear();
      // `WeakSet`s don’t have a `.clear()` method.
      this.elementsWithClickListeners = new WeakSet();
      this.elementsWithScrollbars = new WeakSet();
      this.shadowRoots = new WeakMap();
      this.idleCallbackId = undefined;
      this.resets.reset();
      this.secretElementResets.reset();
      this.sendInjectedEvent(RESET_EVENT);
    }

    // Stop using the intersection observer for everything except frames. The
    // reason to still track frames is because it saves more than half a second
    // when generating hints on the single-page HTML specification.
    bail() {
      if (this.bailed) {
        return;
      }

      const { size } = this.elements;

      this.intersectionObserver.disconnect();
      this.visibleElements.clear();
      this.bailed = true;

      log(
        "warn",
        "ElementManager#bail",
        size,
        t$1.MAX_INTERSECTION_OBSERVED_ELEMENTS
      );
    }

    injectScript() {
      // Neither Chrome nor Firefox allow inline scripts in the options page. It’s
      // not needed there anyway.
      if (window.location.protocol.endsWith("-extension:")) {
        return;
      }

      const rawCode = replaceConstants(injected.toString());
      const code = `(${rawCode})()`;
      const script = document.createElement("script");

      // Chrome nicely allows inline scripts inserted by an extension regardless
      // of CSP. I look forward to the day Firefox works this way too. See
      // <bugzil.la/1446231> and <bugzil.la/1267027>.
      script.textContent = code;

      (document.documentElement ?? document).append(script);
      script.remove();
    }

    makeStats(durations) {
      return {
        url: window.location.href,
        numTotalElements: Array.from(this.getAllElements(document)).length,
        numTrackedElements: this.elements.size,
        numVisibleElements: this.visibleElements.size,
        numVisibleFrames: this.visibleFrames.size,
        bailed: this.bailed ? 1 : 0,
        durations,
      };
    }

    *getAllElements(node) {
      const children =
        node instanceof ShadowRoot
          ? node.querySelectorAll("*")
          : // This call only takes 0–1 ms even on the single-page HTML
            // specification (which is huge!).
            node.getElementsByTagName("*");

      for (const child of children) {
        yield child;

        const root = this.shadowRoots.get(child);
        if (root !== undefined) {
          yield* this.getAllElements(root.shadowRoot);
        }
      }
    }

    getActiveElement(node) {
      const { activeElement } = node;
      if (activeElement === null) {
        return undefined;
      }
      const root = this.shadowRoots.get(activeElement);
      if (root !== undefined) {
        return this.getActiveElement(root.shadowRoot);
      }
      return activeElement;
    }

    queueItem(item) {
      this.queue.items.push(item);
      this.requestIdleCallback();
    }

    queueRecords(records, { removalsOnly = false } = {}) {
      if (records.length > 0) {
        this.queueItem({
          type: "Records",
          records,
          recordIndex: 0,
          addedNodeIndex: 0,
          removedNodeIndex: 0,
          childIndex: 0,
          children: undefined,
          removalsOnly,
        });
      }
    }

    requestIdleCallback() {
      if (this.idleCallbackId === undefined) {
        this.idleCallbackId = requestIdleCallback((deadline) => {
          this.idleCallbackId = undefined;
          this.flushQueue(deadline);
        });
      }
    }

    onIntersection(entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.visibleElements.add(entry.target);
        } else {
          this.visibleElements.delete(entry.target);
        }
      }
    }

    onFrameIntersection(entries) {
      for (const entry of entries) {
        const element = entry.target;
        if (
          element instanceof HTMLIFrameElement ||
          element instanceof HTMLFrameElement
        ) {
          if (entry.isIntersecting) {
            this.visibleFrames.add(element);
          } else {
            this.visibleFrames.delete(element);
          }
        }
      }
    }

    onMutation(records) {
      if (records.length > 0) {
        this.queueRecords(records);
        this.observeRemovals(records);
        this.onMutationExternal(records);
      }
    }

    onRemoval(records) {
      this.queueRecords(records, {
        // Ignore added nodes and changed attributes.
        removalsOnly: true,
      });
      this.observeRemovals(records);
    }

    // Imagine this scenario:
    //
    // 1. A grand-parent of a clickable element is removed.
    // 2. This triggers `onMutation`.
    // 3. The page removes the clickable element (or a parent of it) from the
    //    grand-parent for some reason (even though the grand-parent is already
    //    removed from the DOM).
    // 4. This does not trigger `onMutation`, since it listens to changes inside
    //    `document`, but this happens in a detached tree.
    // 5. The queue is flushed. Running `.querySelectorAll("*")` on the
    //    grand-parent now won’t include the clickable element, leaving it behind in
    //    `this.elements` even though it has been removed.
    //
    // For this reason, we have to immediately observe all removed nodes for more
    // removals in their subtree, so that we don’t miss any removed elements.
    // MutationObservers don’t have an `.unobserve` method, so all of these are
    // unsubscribed in bulk when `this.queue` is emptied by calling
    // `.disconnect()`.
    observeRemovals(records) {
      for (const record of records) {
        for (const node of record.removedNodes) {
          this.removalObserver.observe(node, {
            childList: true,
            subtree: true,
          });
        }
      }
    }

    onClickableChanged(event) {
      this.onInjectedMessage({
        type: "ClickableChanged",
        target: getTarget(event),
        clickable: Boolean(event.detail),
      });
    }

    onInjectedQueue(event) {
      this.onInjectedMessage({
        type: "Queue",
        hasQueue: Boolean(event.detail),
      });
    }

    onOpenShadowRootCreated(event) {
      const target = getTarget(event);
      if (target instanceof HTMLElement) {
        const { shadowRoot } = target;
        if (shadowRoot !== null) {
          log("log", "ElementManager#onOpenShadowRootCreated", shadowRoot);
          this.onInjectedMessage({ type: "ShadowRootCreated", shadowRoot });
        }
      }
    }

    onClosedShadowRootCreated(event) {
      const target = getTarget(event);
      if (target instanceof HTMLElement) {
        // Closed shadow roots are reported in two phases. First, a temporary
        // element is created and `CLOSED_SHADOW_ROOT_CREATED_1_EVENT` is
        // dispatched on it. That’s `target` here.
        // Then, the temporary element is moved into the closed shadow root and
        // `CLOSED_SHADOW_ROOT_CREATED_2_EVENT` is dispatched on it. Now we can
        // call `target.getRootNode()` to obtain the closed shadow root.
        // So why are two phases needed? In `CLOSED_SHADOW_ROOT_CREATED_2_EVENT`,
        // we can never get a reference to the temporary element, because that’s
        // how closed shadow roots work. Events from within closed shadow roots
        // appear to come from its host element.
        target.addEventListener(
          CLOSED_SHADOW_ROOT_CREATED_2_EVENT,
          () => {
            // This has to be done immediately (cannot be done when flushing the
            // queue), since `target` is a temporary element that is removed just
            // after this event listener is finished.
            const root = target.getRootNode();
            if (root instanceof ShadowRoot) {
              log("log", "ElementManager#onClosedShadowRootCreated", root);
              this.onInjectedMessage({
                type: "ShadowRootCreated",
                shadowRoot: root,
              });
            }
          },
          { capture: true, passive: true, once: true }
        );
      }
    }

    onRegisterSecretElement(event) {
      const target = getTarget(event);
      if (target instanceof HTMLElement) {
        log("log", "ElementManager#onRegisterSecretElement", target);
        this.secretElementResets.reset();
        this.secretElementResets.add(
          addEventListener(
            target,
            CLICKABLE_CHANGED_EVENT,
            this.onClickableChanged.bind(this),
            "ElementManager#onClickableChanged"
          ),
          addEventListener(
            target,
            OPEN_SHADOW_ROOT_CREATED_EVENT,
            this.onOpenShadowRootCreated.bind(this),
            "ElementManager#onOpenShadowRootCreated"
          ),
          addEventListener(
            target,
            CLOSED_SHADOW_ROOT_CREATED_1_EVENT,
            this.onClosedShadowRootCreated.bind(this),
            "ElementManager#onClosedShadowRootCreated"
          )
        );
      }
    }

    onOverflowChange(event) {
      const target = getTarget(event);
      this.queueItem({ type: "OverflowChanged", target });
    }

    onInjectedMessage(message) {
      switch (message.type) {
        case "ClickableChanged":
          this.queueItem(message);
          break;

        case "ShadowRootCreated":
          this.setShadowRoot(message.shadowRoot);
          break;

        case "Queue":
          this.injectedHasQueue = message.hasQueue;
          break;
      }
    }

    addEventListener(eventName, fn) {
      const previous = this.injectedListeners.get(eventName) ?? [];
      this.injectedListeners.set(eventName, previous.concat(fn));
    }

    sendInjectedEvent(eventName) {
      {
        document.dispatchEvent(new CustomEvent(eventName));
      }
    }

    setShadowRoot(shadowRoot) {
      // MutationObservers don’t have an `.unobserve` method, so each shadow root
      // has its own MutationObserver, which can be `.disconnect()`:ed when hosts
      // are removed.
      const mutationObserver = new MutationObserver(this.onMutation.bind(this));
      const resets = new Resets();

      mutationObserve(mutationObserver, shadowRoot);

      resets.add(
        addEventListener(
          shadowRoot,
          "overflow",
          this.onOverflowChange.bind(this),
          "ElementManager#onOverflowChange"
        ),
        addEventListener(
          shadowRoot,
          "underflow",
          this.onOverflowChange.bind(this),
          "ElementManager#onOverflowChange"
        )
      );

      this.shadowRoots.set(shadowRoot.host, {
        shadowRoot,
        mutationObserver,
        resets,
        active: true,
      });

      // Note that when shadow roots are brand new (just created by
      // `.attachShadow`), `childNodes` is always empty since the page hasn’t had
      // time to add any nodes to it yet. But if a shadow dom host element is
      // removed from the page and then re-inserted again then there _are_
      // elements in there that need to be queued.
      const { childNodes } = shadowRoot;
      if (childNodes.length > 0) {
        const records = [
          {
            addedNodes: childNodes,
            removedNodes: [],
            attributeName: null,
            target: shadowRoot,
          },
        ];
        this.queueRecords(records);
      }
    }

    // Note that shadow roots are not removed from `this.shadowRoots` when their
    // host elements are removed, in case the host elements are inserted back into
    // the page. If so, we need access to closed shadow roots again. Since
    // `this.shadowRoots` is a `WeakMap`, items should disappear from it
    // automatically as the host elements are garbage collected.
    deactivateShadowRoot(root) {
      root.mutationObserver.disconnect();
      root.resets.reset();
      root.active = false;

      const { childNodes } = root.shadowRoot;
      if (childNodes.length > 0) {
        const records = [
          {
            addedNodes: [],
            removedNodes: childNodes,
            attributeName: null,
            target: root.shadowRoot,
          },
        ];
        this.queueRecords(records);
      }
    }

    addOrRemoveElement(mutationType, element) {
      if (
        element instanceof HTMLIFrameElement ||
        element instanceof HTMLFrameElement
      ) {
        switch (mutationType) {
          case "added":
            // In theory, this can lead to more than
            // `maxIntersectionObservedElements` frames being tracked by the
            // intersection observer, but in practice there are never that many
            // frames. YAGNI.
            this.frameIntersectionObserver.observe(element);
            break;
          case "removed":
            this.frameIntersectionObserver.unobserve(element);
            this.visibleFrames.delete(element); // Just to be sure.
            break;
        }
        return;
      }

      const type =
        mutationType === "removed" ? undefined : this.getElementType(element);
      if (type === undefined) {
        if (mutationType !== "added") {
          this.elements.delete(element);
          // Removing an element from the DOM also triggers the
          // IntersectionObserver (removing it from `this.visibleElements`), but
          // changing an attribute of an element so that it isn't considered
          // clickable anymore requires a manual deletion from
          // `this.visibleElements` since the element might still be on-screen.
          this.visibleElements.delete(element);
          this.intersectionObserver.unobserve(element);
          // The element must not be removed from `elementsWithClickListeners`
          // or `elementsWithScrollbars` (if `mutationType === "removed"`), even
          // though it might seem logical at first. But the element (or one of
          // its parents) could temporarily be removed from the paged and then
          // re-inserted. Then it would still have its click listener, but we
          // wouldn’t know. So instead of removing `element` here a `WeakSet` is
          // used, to avoid memory leaks. An example of this is the sortable
          // table headings on Wikipedia:
          // <https://en.wikipedia.org/wiki/Help:Sorting>
          // this.elementsWithClickListeners.delete(element);
          // this.elementsWithScrollbars.delete(element);
        }
      } else {
        const alreadyIntersectionObserved = this.elements.has(element);
        this.elements.set(element, type);
        if (!alreadyIntersectionObserved && !this.bailed) {
          // We won’t know if this element is visible or not until the next time
          // intersection observers are run. If we enter hints mode before that,
          // we would miss this element. This happens a lot on Gmail. First, the
          // intersection observer fires on the splash screen. Then _a lot_ of DOM
          // nodes appear at once when the inbox renders. The mutation observer
          // fires kind of straight away, but the intersection observer is slow.
          // If hints mode was entered before that, no elements would be found.
          // But the elements are clearly visible on screen! For this reason we
          // consider _all_ new elements as visible until proved otherwise.
          this.visibleElements.add(element);
          this.intersectionObserver.observe(element);
          if (
            this.elements.size > t$1.MAX_INTERSECTION_OBSERVED_ELEMENTS.value
          ) {
            this.bail();
          }
        }
      }

      if (mutationType === "added") {
        const root = this.shadowRoots.get(element);
        if (root !== undefined) {
          if (!root.active) {
            // If an element has been removed and then re-inserted again, set up
            // tracking of its shadow root again (if any). However, when
            // `someElement.attachShadow()` is called, `someElement` might
            // already have been in the queue. So if the tracking of the shadow
            // root is already active, there’s no need to do it again.
            this.setShadowRoot(root.shadowRoot);
          }
        } else if (element.shadowRoot !== null) {
          // Just after the extension is installed or updated, we might have
          // missed a bunch of `.attachShadow` calls. Luckily, we can still get
          // _open_ shadow roots through the `.shadowRoot` property.
          this.setShadowRoot(element.shadowRoot);
        }
      } else if (mutationType === "removed") {
        const root = this.shadowRoots.get(element);
        if (root !== undefined) {
          this.deactivateShadowRoot(root);
        }
      }
    }

    flushQueue(deadline) {
      const startQueueIndex = this.queue.index;

      log(
        "debug",
        "ElementManager#flushQueue",
        { length: this.queue.items.length, index: startQueueIndex },
        { ...this.queue.items[startQueueIndex] }
      );

      for (; this.queue.index < this.queue.items.length; this.queue.index++) {
        if (
          this.queue.index > startQueueIndex &&
          deadline.timeRemaining() <= 0
        ) {
          this.requestIdleCallback();
          return;
        }

        const item = this.queue.items[this.queue.index];

        switch (item.type) {
          // This case is really tricky as all of the loops need to be able to
          // resume where they were during the last idle callback. That’s why we
          // mutate stuff on the current item, saving the indexes for the next
          // idle callback. Be careful not to cause duplicate work.
          case "Records": {
            const startRecordIndex = item.recordIndex;

            for (; item.recordIndex < item.records.length; item.recordIndex++) {
              if (
                item.recordIndex > startRecordIndex &&
                deadline.timeRemaining() <= 0
              ) {
                this.requestIdleCallback();
                return;
              }

              const record = item.records[item.recordIndex];
              const startAddedNodeIndex = item.addedNodeIndex;
              const startRemovedNodeIndex = item.removedNodeIndex;

              if (!item.removalsOnly) {
                for (
                  ;
                  item.addedNodeIndex < record.addedNodes.length;
                  item.addedNodeIndex++
                ) {
                  if (
                    item.addedNodeIndex > startAddedNodeIndex &&
                    deadline.timeRemaining() <= 0
                  ) {
                    this.requestIdleCallback();
                    return;
                  }

                  const element = record.addedNodes[item.addedNodeIndex];
                  let { children } = item;

                  if (
                    children === undefined &&
                    element instanceof HTMLElement
                  ) {
                    // When a streaming HTML chunk arrives, _all_ elements in it
                    // will produce its own MutationRecord, even nested elements.
                    // Parent elements come first. Since we do a
                    // `element.querySelectorAll("*")` below, after processing the
                    // first element we have already gone through that entire
                    // subtree. So the next MutationRecord (for a child of the
                    // first element) will be duplicate work. So if we’ve already
                    // gone through an addition of an element in this queue,
                    // simply skip to the next one.
                    // When inserting elements with JavaScript, the number of
                    // MutationRecords for an insert depends on how the code was
                    // written. Every `.append()` on an element that is in the DOM
                    // causes a record. But `.append()` on a non-yet-inserted
                    // element does not. So we can’t simply skip the
                    // `.querySelectorAll("*")` business.
                    // It should be safe to keep the `.addedElements` set even
                    // though the queue lives over time. If an already gone
                    // through element is changed, that will cause removal or
                    // attribute mutations, which will be run eventually.
                    if (this.queue.addedElements.has(element)) {
                      continue;
                    }

                    // In my testing on the single-page HTML specification (which
                    // is huge!), `.getElementsByTagName("*")` is faster, but it’s
                    // not like `.querySelectorAll("*")` is super slow. We can’t use
                    // the former because it returns a live `HTMLCollection` which
                    // mutates as the DOM mutates. If for example a bunch of nodes
                    // are removed, `item.addedNodeIndex` could now be too far
                    // ahead in the list, missing some added elements.
                    children = element.querySelectorAll("*");
                    item.children = children;

                    this.addOrRemoveElement("added", element);
                    this.queue.addedElements.add(element);

                    if (deadline.timeRemaining() <= 0) {
                      this.requestIdleCallback();
                      return;
                    }
                  }

                  if (children !== undefined && children.length > 0) {
                    const startChildIndex = item.childIndex;
                    for (
                      ;
                      item.childIndex < children.length;
                      item.childIndex++
                    ) {
                      if (
                        item.childIndex > startChildIndex &&
                        deadline.timeRemaining() <= 0
                      ) {
                        this.requestIdleCallback();
                        return;
                      }
                      const child = children[item.childIndex];
                      if (!this.queue.addedElements.has(child)) {
                        this.addOrRemoveElement("added", child);
                        this.queue.addedElements.add(child);
                      }
                    }
                  }

                  item.childIndex = 0;
                  item.children = undefined;
                }
              }

              for (
                ;
                item.removedNodeIndex < record.removedNodes.length;
                item.removedNodeIndex++
              ) {
                if (
                  item.removedNodeIndex > startRemovedNodeIndex &&
                  deadline.timeRemaining() <= 0
                ) {
                  this.requestIdleCallback();
                  return;
                }

                const element = record.removedNodes[item.removedNodeIndex];
                let { children } = item;

                if (children === undefined && element instanceof HTMLElement) {
                  children = element.querySelectorAll("*");
                  item.children = children;
                  this.addOrRemoveElement("removed", element);
                  this.queue.addedElements.delete(element);
                  if (deadline.timeRemaining() <= 0) {
                    this.requestIdleCallback();
                    return;
                  }
                }

                if (children !== undefined && children.length > 0) {
                  const startChildIndex = item.childIndex;
                  for (; item.childIndex < children.length; item.childIndex++) {
                    if (
                      item.childIndex > startChildIndex &&
                      deadline.timeRemaining() <= 0
                    ) {
                      this.requestIdleCallback();
                      return;
                    }
                    const child = children[item.childIndex];
                    this.addOrRemoveElement("removed", child);
                    // The same element might be added, removed and then added
                    // again, all in the same queue. So unmark it as already gone
                    // through so it can be re-added again.
                    this.queue.addedElements.delete(child);
                  }
                }

                item.childIndex = 0;
                item.children = undefined;
              }

              item.addedNodeIndex = 0;
              item.removedNodeIndex = 0;

              if (!item.removalsOnly && record.attributeName !== null) {
                const element = record.target;
                if (element instanceof HTMLElement) {
                  this.addOrRemoveElement("changed", element);
                }
              }
            }
            break;
          }

          case "ClickableChanged": {
            const element = item.target;
            if (element instanceof HTMLElement) {
              if (item.clickable) {
                this.elementsWithClickListeners.add(element);
              } else {
                this.elementsWithClickListeners.delete(element);
              }
              this.addOrRemoveElement("changed", element);
            }
            break;
          }

          case "OverflowChanged": {
            const element = item.target;
            if (element instanceof HTMLElement) {
              // An element might have `overflow-x: hidden; overflow-y: auto;`. The events
              // don't tell which direction changed its overflow, so we must check that
              // ourselves. We're only interested in elements with scrollbars, not with
              // hidden overflow.
              if (isScrollable(element)) {
                if (!this.elementsWithScrollbars.has(element)) {
                  this.elementsWithScrollbars.add(element);
                  this.addOrRemoveElement("changed", element);
                }
              } else if (this.elementsWithScrollbars.has(element)) {
                this.elementsWithScrollbars.delete(element);
                this.addOrRemoveElement("changed", element);
              }
            }
            break;
          }
        }
      }

      this.queue = makeEmptyQueue();
      this.removalObserver.disconnect();
      log("debug", "ElementManager#flushQueue", "Empty queue.");
    }

    getVisibleElements(types, viewports, time, passedCandidates) {
      const startTime = Date.now();

      const isUpdate = passedCandidates !== undefined;
      const prefix = `ElementManager#getVisibleElements${
        isUpdate ? " (update)" : ""
      }`;

      time.start("flush queues");

      const injectedNeedsFlush = this.injectedHasQueue;

      if (injectedNeedsFlush) {
        log("log", prefix, "flush injected");
        this.sendInjectedEvent(FLUSH_EVENT);
      }

      this.onMutation(this.mutationObserver.takeRecords());

      // If `injectedNeedsFlush` then `this.queue` will be modified, so check the
      // length _after_ flushing injected.ts.
      const needsFlush = this.queue.items.length > 0;

      if (needsFlush) {
        log("log", prefix, "flush queue", this.queue);
        this.flushQueue(infiniteDeadline);
      }

      this.onIntersection(this.intersectionObserver.takeRecords());

      const candidates =
        passedCandidates !== undefined
          ? passedCandidates
          : types === "selectable"
          ? this.getAllElements(document)
          : this.bailed
          ? this.elements.keys()
          : this.visibleElements;
      const range = document.createRange();
      const deduper = new Deduper();

      const maybeResults = Array.from(candidates, (element) => {
        time.start("loop:start");

        const duration = Date.now() - startTime;
        if (duration > t$1.MAX_DURATION.value) {
          return {
            isRejected: true,
            debug: {
              reason: "slow",
              duration,
              max: t$1.MAX_DURATION.value,
              element,
            },
          };
        }

        const type =
          types === "selectable"
            ? this.getElementTypeSelectable(element)
            : this.elements.get(element);

        if (type === undefined) {
          return {
            isRejected: true,
            debug: {
              reason: "no ElementType",
              element,
            },
          };
        }

        if (types !== "selectable" && !types.includes(type)) {
          return {
            isRejected: true,
            debug: {
              reason: "wrong ElementType",
              type,
              types,
              element,
            },
          };
        }

        // Ignore `<label>` elements with no control and no click listeners.
        if (
          type === "label" &&
          element instanceof HTMLLabelElement &&
          element.control === null
        ) {
          return {
            isRejected: true,
            debug: {
              reason: "<label> with no control and no click listeners",
              element,
            },
          };
        }

        time.start("loop:measurements");
        const measurements = getMeasurements(
          element,
          type,
          viewports,
          range,
          time
        );

        if ("isRejected" in measurements) {
          return {
            isRejected: true,
            debug: {
              reason: "no measurements",
              type,
              element,
              viewports,
              inner: measurements.debug,
            },
          };
        }

        time.start("loop:visibleElement");
        const visibleElement = {
          element,
          type,
          measurements,
          hasClickListener: this.elementsWithClickListeners.has(element),
        };

        time.start("loop:dedupe");
        // In selectable mode we need to be able to select `<label>` text, and
        // click listeners aren't taken into account at all, so skip the deduping.
        // Also, a paragraph starting with an inline element shouldn't be deduped
        // away – both should be selectable.
        if (types !== "selectable") {
          deduper.add(visibleElement);
        }

        return visibleElement;
      });

      log("log", prefix, "results (including rejected)", maybeResults);

      time.start("check duration");
      const slow = maybeResults.filter(
        (result) => "isRejected" in result && result.debug.reason === "slow"
      ).length;
      if (slow > 0) {
        log("warn", prefix, `Skipped ${slow} element(s) due to timeout`, {
          duration: Date.now() - startTime,
          max: t$1.MAX_DURATION.value,
        });
      }

      time.start("filter");
      const results = maybeResults.map((result) =>
        "isRejected" in result || deduper.rejects(result) ? undefined : result
      );

      const timeLeft = t$1.MAX_DURATION.value - (Date.now() - startTime);
      return [results, timeLeft];
    }

    getVisibleFrames(viewports) {
      // In theory this might need flushing, but in practice this method is always
      // called _after_ `getVisibleElements`, so everything should already be
      // flushed.
      return Array.from(this.visibleFrames).flatMap((element) => {
        if (
          // Needed on reddit.com. There's a Google Ads iframe where
          // `contentWindow` is null.
          element.contentWindow === null
        ) {
          return [];
        }

        const box = getVisibleBox(element.getBoundingClientRect(), viewports);

        // Frames are slow to visit. Gmail has ~10 weird frames that are super
        // small. Not sure what they do. But not visiting those saves around ~80ms
        // on my machine.
        if (
          box === undefined ||
          box.width < t$1.MIN_SIZE_FRAME.value ||
          box.height < t$1.MIN_SIZE_FRAME.value
        ) {
          return [];
        }

        const elementsAtPoint = getElementsFromPoint(
          element,
          Math.round(box.x + box.width / 2),
          Math.round(box.y + box.height / 2)
        );

        // Make sure that the frame is visible – for example, not `visibility:
        // hidden`. Frames are generally quite large and might be partially
        // covered at different spots, but we can’t know if those spots cover
        // links or not.
        if (!elementsAtPoint.includes(element)) {
          return [];
        }

        return element;
      });
    }

    getElementType(element) {
      if (isDisabled(element)) {
        return undefined;
      }

      switch (element.localName) {
        case "a":
          return element?.localName === "a"
            ? getLinkElementType(element)
            : undefined;
        case "button":
        case "select":
        case "summary":
        case "audio":
        case "video":
          return "clickable";
        case "input":
          return element?.localName === "input" && element.type !== "hidden"
            ? "clickable"
            : undefined;
        // Twitter and DuckDuckGo have useless click handlers on the `<form>`
        // around their search inputs, whose hints end up below the hint of the
        // input. It feels like `<form>`s are never relevant to click, so exclude
        // them.
        case "form":
          return undefined;
        case "textarea":
          return "textarea";
        default: {
          const document = element.ownerDocument;

          // Even `<html>` and `<body>` can be contenteditable. That trumps all
          // the below types.
          // Note: For SVG elements, `.contentEditable` is `undefined`.
          if (
            element.contentEditable !== undefined &&
            !t$1.VALUES_NON_CONTENTEDITABLE.value.has(element.contentEditable)
          ) {
            return "textarea";
          }

          if (
            this.elementsWithScrollbars.has(element) &&
            // Allow `<html>` (or `<body>`) to get hints only if they are
            // scrollable and in a frame. This allows focusing frames to scroll
            // them. In Chrome, `iframeElement.focus()` allows for scrolling a
            // specific frame, but I haven’t found a good way to show hints only
            // for _scrollable_ frames. Chrome users can use the "select element"
            // command instead. See `getElementTypeSelectable`.
            !(element === document.scrollingElement && window.top === window)
          ) {
            return "scrollable";
          }

          // `<html>` and `<body>` might have click listeners or role attributes
          // etc. but we never want hints for them.
          if (
            element === document.documentElement ||
            element === document.body
          ) {
            return undefined;
          }

          const role = element.getAttribute("role");
          if (role !== null && t$1.ROLES_CLICKABLE.value.has(role)) {
            return "clickable";
          }

          if (t$1.REGEX_CLICKABLE_CLASS.value.test(element.className)) {
            return "clickable";
          }

          // "clickable-event" matched in the next `if` is the lowest quality and
          // has the biggest risk of false positives. Make sure that some of them
          // don’t get hints.
          if (
            Array.from(t$1.ATTRIBUTES_NOT_CLICKABLE.value).some((attr) =>
              element.hasAttribute(attr)
            )
          ) {
            return undefined;
          }

          if (
            hasClickListenerProp(element) ||
            this.elementsWithClickListeners.has(element) ||
            Array.from(t$1.ATTRIBUTES_CLICKABLE.value).some((attr) =>
              element.hasAttribute(attr)
            )
          ) {
            return "clickable-event";
          }

          // Match `<label>` elements last so that labels without controls but
          // with click listeners are matched as clickable.
          if (element.localName === "label") {
            return "label";
          }

          return undefined;
        }
      }
    }

    getElementTypeSelectable(element) {
      // A shadow host element usually has 0 children, but it _can_ have children,
      // although they are never displayed. So it never makes sense to consider
      // shadow hosts selectable.
      if (isDisabled(element) || this.shadowRoots.has(element)) {
        return undefined;
      }

      switch (element.localName) {
        // Always consider the following elements as selectable, regardless of their
        // children, since they have special context menu items. A
        // `<canvas><p>fallback</p></canvas>` could be considered a wrapper element
        // and be skipped otherwise. Making frames selectable also allows Chrome
        // users to scroll frames using the arrow keys. It would be convenient to
        // give frames hints during regular click hints mode for that reason, but
        // unfortunately for example Twitter uses iframes for many of its little
        // widgets/embeds which would result in many unnecessary/confusing hints.
        case "a":
        case "audio":
        case "button":
        case "select":
        case "textarea":
        case "video":
          return "clickable";
        case "input":
          return element?.localName === "input" && element.type !== "hidden"
            ? "clickable"
            : undefined;
        case "canvas":
        case "embed":
        case "frame":
        case "iframe":
        case "img":
        case "object":
        case "pre":
        case "svg":
          return "selectable";
        default: {
          // If an element has no child _elements_ (but possibly child text nodes),
          // consider it selectable. This allows focusing `<div>`-based "buttons"
          // with only a background image as icon inside. It also catches many
          // elements with text without having to iterate through all child text
          // nodes.
          if (
            element.childElementCount === 0 &&
            element instanceof HTMLElement
          ) {
            return "selectable";
          }

          // If the element has at least one immediate non-blank text node, consider
          // it selectable. If an element contains only other elements, whitespace
          // and comments it is a "wrapper" element that would just cause duplicate
          // hints.
          for (const node of element.childNodes) {
            if (node?.nodeType === 3 && NON_WHITESPACE.test(node.data)) {
              return "selectable";
            }
          }
          return undefined;
        }
      }
    }
  }

  function makeEmptyQueue() {
    return {
      items: [],
      index: 0,
      addedElements: new Set(),
    };
  }

  // Attempt to remove hints that do the same thing as some other element
  // (`<label>`–`<input>` pairs) or hints that are most likely false positives
  // (`<div>`s with click listeners wrapping a `<button>`).
  class Deduper {
    positionMap = new Map();

    rejected = new Set();

    add(visibleElement) {
      const { element } = visibleElement;

      // Exclude `<label>` elements whose associated control has a hint.
      const labels = getLabels(element);
      if (labels !== undefined) {
        for (const label of labels) {
          this.rejected.add(label);
        }
      }

      const key = hintPositionKey(visibleElement.measurements);
      const elements = this.positionMap.get(key);

      if (elements === undefined) {
        this.positionMap.set(key, [visibleElement]);
        return;
      }

      elements.push(visibleElement);

      const [bad, good] = partition(elements, ({ type }) =>
        t$1.ELEMENT_TYPES_LOW_QUALITY.value.has(type)
      );

      // If hints are positioned in the exact same spot, reject those of low
      // quality (for example those that only have click listeners and nothing
      // else) since they are likely just noise. Many `<button>`s and `<a>`s on
      // Twitter and Gmail are wrapped in `<div>`s with click listeners. And on
      // GitHub there are dropdown menus near the top where the hint for the
      // `<summary>` elements that open them are covered by the hint for a
      // `<details>` element with a click listener that doesn't do anything when
      // clicked.
      if (bad.length > 0) {
        if (good.length > 0) {
          // If there are high quality elements, reject all low quality ones.
          for (const { element: badElement } of bad) {
            this.rejected.add(badElement);
          }
        } else {
          // Otherwise keep the best of the worst.
          const sorted = bad.slice().sort((a, b) =>
            // Prefer elements with click listeners.
            a.hasClickListener && !b.hasClickListener
              ? -1
              : !a.hasClickListener && b.hasClickListener
              ? 1
              : // Then, prefer elements with higher weight.
                b.measurements.weight - a.measurements.weight
          );
          for (const { element: badElement } of sorted.slice(1)) {
            this.rejected.add(badElement);
          }
        }
      }
    }

    rejects({ element }) {
      return this.rejected.has(element);
    }
  }

  function hintPositionKey(measurements) {
    return [
      Math.round(measurements.x).toString(),
      Math.round(measurements.y).toString(),
      measurements.align,
    ].join(",");
  }

  function getMeasurements(
    element,
    elementType,
    viewports,
    // The `range` is passed in since it is faster to re-use the same one than
    // creating a new one for every element candidate.
    range,
    time
  ) {
    // If an inline `<a>` wraps a block `<div>`, the link gets three rects. The
    // first and last have 0 width. The middle is the "real" one. Remove the
    // "empty" ones, so that the link is considered a "card" and not a
    // line-wrapped text link.
    time.start("measurements:rects");
    const allRects = Array.from(element.getClientRects());
    const filteredRects = allRects.filter(
      (rect) =>
        rect.width >= t$1.MIN_SIZE_TEXT_RECT.value &&
        rect.height >= t$1.MIN_SIZE_TEXT_RECT.value
    );
    // For links with only floated children _all_ rects might have 0 width/height.
    // In that case, use the "empty" ones after all. Floated children is handled
    // further below.
    const rects = filteredRects.length > 0 ? filteredRects : allRects;

    // Ignore elements with only click listeners that are really large. These are
    // most likely not clickable, and only used for event delegation.
    time.start("measurements:large-clickable");
    if (elementType === "clickable-event" && rects.length === 1) {
      if (area(rects[0]) > t$1.MAX_CLICKABLE_EVENT_AREA.value) {
        return {
          isRejected: true,
          debug: {
            reason: "element with only click listeners that is really large",
            rect: rects[0],
            max: t$1.MAX_CLICKABLE_EVENT_AREA.value,
          },
        };
      }
    }

    time.start("measurements:offsets");
    const [offsetX, offsetY] = viewports.reduceRight(
      ([x, y], viewport) => [x + viewport.x, y + viewport.y],
      [0, 0]
    );

    time.start("measurements:visibleBoxes");
    const visibleBoxes = Array.from(rects)
      .flatMap((rect) => getVisibleBox(rect, viewports) ?? [])
      // Remove `offsetX` and `offsetY` to turn `x` and `y` back to the coordinate
      // system of the current frame. This is so we can easily make comparisons
      // with other rects of the frame.
      .map((box) => ({ ...box, x: box.x - offsetX, y: box.y - offsetY }));

    time.start("measurements:noVisibleBoxes");
    if (visibleBoxes.length === 0) {
      // If there’s only one rect and that rect has no width it means that all
      // children are floated or absolutely positioned (and that `element` hasn’t
      // been made to “contain” the floats). For example, a link in a menu could
      // contain a span of text floated to the left and an icon floated to the
      // right. Those are still clickable. So return the measurements of one of
      // the children instead. At least for now we just pick the first (in DOM
      // order), but there might be a more clever way of doing it.
      if (rects.length === 1) {
        const rect = rects[0];
        if (rect.width === 0) {
          for (const child of element.children) {
            const measurements = getMeasurements(
              child,
              elementType,
              viewports,
              range,
              time
            );
            if (!("isRejected" in measurements)) {
              return measurements;
            }
          }
        }
      }

      return {
        isRejected: true,
        debug: {
          reason: "no visibleBoxes",
          rects,
        },
      };
    }

    const hintPoint =
      rects.length === 1
        ? getSingleRectPoint({
            element,
            elementType,
            rect: rects[0],
            visibleBox: visibleBoxes[0],
            viewports,
            range,
            time,
          })
        : getMultiRectPoint({ element, visibleBoxes, viewports, range, time });

    const maxX = Math.max(...visibleBoxes.map((box) => box.x + box.width));

    // Check that the element isn’t covered. A little bit expensive, but totally
    // worth it since it makes hints in fixed menus so much easier find.
    // If this runs in a frame, the element can still be covered by something in a
    // parent frame, but it's not worth the trouble to try and check that.
    const nonCoveredPoint = getNonCoveredPoint(element, {
      // Rounding upwards is required in html/tridactyl/index.html.
      x: Math.ceil(hintPoint.x),
      y: Math.round(hintPoint.y),
      maxX,
      time,
    });

    time.start("measurements:noNonCoveredPoint");
    if (nonCoveredPoint === undefined) {
      // Putting a large `<input type="file">` inside a smaller wrapper element
      // with `overflow: hidden;` seems to be a common pattern, used both on
      // addons.mozilla.org and <https://blueimp.github.io/jQuery-File-Upload/>.
      if (
        element?.localName === "input" &&
        element.type === "file" &&
        element.parentNode instanceof HTMLElement &&
        area(element.parentNode.getBoundingClientRect()) < area(rects[0])
      ) {
        const measurements = getMeasurements(
          element.parentNode,
          elementType,
          viewports,
          range,
          time
        );
        return "isRejected" in measurements
          ? {
              ...measurements,
              debug: {
                reason: "wrapped file input without nonCoveredPoint",
                inner: measurements.debug,
              },
            }
          : measurements;
      }

      // CodeMirror editor uses a tiny hidden textarea positioned at the caret.
      // Targeting those are the only reliable way of focusing CodeMirror
      // editors, and doing so without moving the caret.
      // <https://codemirror.net/demo/complete.html>
      if (
        !(
          element.localName === "textarea" &&
          // Use `element.clientWidth` instead of `pointBox.width` because the
          // latter includes the width of the borders of the textarea, which are
          // unreliable.
          element.clientWidth <= 1
        )
      ) {
        return {
          isRejected: true,
          debug: {
            reason: "no nonCoveredPoint",
            visibleBoxes,
            hintPoint,
            maxX,
          },
        };
      }
    }

    time.start("measurements:end");
    const { x, y } =
      nonCoveredPoint === undefined ? hintPoint : nonCoveredPoint;

    // Where to place the hint and the weight of the element.
    return {
      x: x + offsetX,
      y: y + offsetY,
      align: hintPoint.align,
      maxX: maxX + offsetX,
      weight: hintWeight(elementType, visibleBoxes),
      debug: hintPoint.debug,
    };
  }

  function getSingleRectPoint({
    element,
    elementType,
    rect,
    visibleBox,
    viewports,
    range,
    time,
  }) {
    // Scrollbars are usually on the right side, so put the hint there, making it
    // easier to see that the hint is for scrolling and reducing overlap.
    time.start("getSingleRectPoint:scrollable");
    if (elementType === "scrollable") {
      return {
        ...getXY(visibleBox),
        x: visibleBox.x + visibleBox.width - 1,
        align: "right",
        debug: "getSingleRectPoint scrollable",
      };
    }

    // Always put hints for "tall" elements at the left-center edge – except in
    // selectable mode (long paragraphs). Then it is nicer to put the marker at
    // the start of the text.
    // Also do not look for text nodes or images in `<textarea>` (which does have
    // hidden text nodes) and `contenteditable` elements, since it looks nicer
    // always placing the hint at the edge for such elements. Usually they are
    // tall enough to have their hint end up there. This ensures the hint is
    // _always_ placed there for consistency.
    time.start("getSingleRectPoint:tall");
    if (
      elementType === "textarea" ||
      (elementType !== "selectable" && rect.height >= t$1.MIN_HEIGHT_BOX.value)
    ) {
      return {
        ...getXY(visibleBox),
        align: "left",
        debug: `getSingleRectPoint tall (elementType: ${elementType}, height: ${rect.height})`,
      };
    }

    function isAcceptable(point) {
      return isWithin(point, visibleBox);
    }

    // Try to place the hint at the text of the element.
    // Don’t try to look for text nodes in `<select>` elements. There
    // _are_ text nodes inside the `<option>` elements and their rects _can_ be
    // measured, but if the dropdown opens _upwards_ the `elementAtPoint` check
    // will fail. An example is the signup form at <https://www.facebook.com/>.
    // Also, ignore fallback content inside `<canvas>`, `<audio>` and `<video>`.
    time.start("getSingleRectPoint:textPoint");
    if (!SKIP_TEXT_ELEMENTS.has(element.localName)) {
      const textPoint = getBestNonEmptyTextPoint({
        element,
        elementRect: rect,
        viewports,
        isAcceptable,
        preferTextStart: elementType === "selectable",
        range,
      });

      if (textPoint !== undefined) {
        return {
          ...textPoint,
          debug: `getSingleRectPoint textPoint: ${textPoint.debug}`,
        };
      }
    }

    // Try to place the hint near an image. Many buttons have just an icon and no
    // (visible) text.
    time.start("getSingleRectPoint:imagePoint");
    const imagePoint = getFirstImagePoint(element, viewports);
    if (
      imagePoint !== undefined &&
      // For images that are taller than the element, allow the point to be
      // outside the rects. It's common to find `p > a > img` where the `<a>` is
      // just a regular inline element with the `<img>` sticking out the top.
      (isAcceptable(imagePoint.point) || rect.height < imagePoint.rect.height)
    ) {
      return {
        ...imagePoint.point,
        debug: `getSingleRectPoint imagePoint: ${imagePoint.point.debug}`,
      };
    }

    // Checkboxes and radio buttons are typically small and we don't want to cover
    // them with the hint.
    time.start("getSingleRectPoint:checkbox/radio");
    if (
      element?.localName === "input" &&
      (element.type === "checkbox" || element.type === "radio")
    ) {
      return {
        ...getXY(visibleBox),
        align: "right",
        debug: "getSingleRectPoint checkbox/radio",
      };
    }

    // Take border and padding into account. This is nice since it places the hint
    // nearer the placeholder in `<input>` elements and nearer the text in `<input
    // type="button">` and `<select>`.
    time.start("getSingleRectPoint:borderAndPaddingPoint");
    if (element.localName === "input" || element.localName === "select") {
      const borderAndPaddingPoint = getBorderAndPaddingPoint(
        element,
        rect,
        visibleBox
      );
      if (isAcceptable(borderAndPaddingPoint)) {
        return {
          ...borderAndPaddingPoint,
          debug: `getSingleRectPoint borderAndPaddingPoint (localName: ${element.localName}): ${borderAndPaddingPoint.debug}`,
        };
      }
    }

    time.start("getSingleRectPoint:default");
    return {
      ...getXY(visibleBox),
      align: "left",
      debug: "getSingleRectPoint default",
    };
  }

  function getMultiRectPoint({
    element,
    visibleBoxes,
    viewports,
    range,
    time,
  }) {
    function isAcceptable(point) {
      return visibleBoxes.some((box) => isWithin(point, box));
    }

    time.start("getMultiRectPoint:textPoint");
    const textPoint = getBestNonEmptyTextPoint({
      element,
      elementRect: element.getBoundingClientRect(),
      viewports,
      isAcceptable,
      preferTextStart: true,
      range,
    });
    if (textPoint !== undefined) {
      return {
        ...textPoint,
        debug: `getMultiRectPoint textPoint: ${textPoint.debug}`,
      };
    }

    time.start("getMultiRectPoint:default");
    const minY = Math.min(...visibleBoxes.map((box) => box.y));
    const maxY = Math.max(...visibleBoxes.map((box) => box.y + box.height));

    return {
      x: Math.min(...visibleBoxes.map((box) => box.x)),
      y: (minY + maxY) / 2,
      align: "right",
      debug: "getMultiRectPoint default",
    };
  }

  function getFirstImagePoint(element, viewports) {
    const images = [
      // First try to find an image _child._ For example, <button
      // class="icon-button"><img></button>`. (This button should get the hint at
      // the image, not at the edge of the button.)
      ...element.querySelectorAll(t$1.SELECTOR_IMAGE.value),
      // Then, see if the element itself is an image. For example, `<button
      // class="Icon Icon-search"></button>`. The element itself can also be an
      // `<img>` due to the `float` case in `getMeasurements`.
      ...(element.matches(t$1.SELECTOR_IMAGE.value) ? [element] : []),
    ];

    // Some buttons on Twitter have two icons inside – one shown, one hidden (and
    // it toggles between them based on if the button is active or not). At least
    // for now we just pick the first image (in DOM order) that gets a
    // `visibleBox`, but there might be a more clever way of doing it.
    for (const image of images) {
      const rect = image.getBoundingClientRect();
      const visibleBox = getVisibleBox(rect, viewports);

      if (visibleBox !== undefined) {
        const borderAndPaddingPoint = getBorderAndPaddingPoint(
          image,
          rect,
          visibleBox
        );
        return {
          point: {
            // The image might have padding around it.
            ...borderAndPaddingPoint,
            align: rect.height >= t$1.MIN_HEIGHT_BOX.value ? "left" : "right",
            debug: `getFirstImagePoint borderAndPaddingPoint: ${borderAndPaddingPoint.debug}`,
          },
          rect,
        };
      }
    }

    return undefined;
  }

  function getBorderAndPaddingPoint(element, rect, visibleBox) {
    const computedStyle = window.getComputedStyle(element);

    const left =
      parseFloat(computedStyle.getPropertyValue("border-left-width")) +
      parseFloat(computedStyle.getPropertyValue("padding-left")) +
      parseFloat(computedStyle.getPropertyValue("text-indent"));

    return {
      ...getXY(visibleBox),
      x: rect.left + left,
      align:
        element?.localName === "input" &&
        (element.type === "file" ||
          (element.type === "image" && element.src !== ""))
          ? "left"
          : "right",
      debug: `getBorderAndPaddingPoint default/only (left: ${left})`,
    };
  }

  function getNonCoveredPoint(element, { x, y, maxX, time }) {
    time.start("getNonCoveredPoint:getElementFromPoint");
    const elementAtPoint = getElementFromPoint(element, x, y);

    // (x, y) is off-screen.
    if (elementAtPoint === undefined) {
      return undefined;
    }

    // `.contains` also checks `element === elementAtPoint`.
    time.start("getNonCoveredPoint:contains");
    if (element.contains(elementAtPoint)) {
      return { x, y };
    }

    time.start("getNonCoveredPoint:getBoundingClientRect");
    // If we found something inside an SVG but not looking for an SVG element,
    // then look to the right of the actual SVG container (such as an icon),
    // rather than at the right of some random path inside the SVG.
    const parent =
      element instanceof HTMLElement &&
      elementAtPoint instanceof SVGElement &&
      elementAtPoint.ownerSVGElement !== null
        ? elementAtPoint.ownerSVGElement
        : elementAtPoint;
    const rect = parent.getBoundingClientRect();

    // `.getBoundingClientRect()` does not include pseudo-elements that are
    // absolutely positioned so that they go outside of the element, but calling
    // `.elementFromPoint()` on the pseudo-element _does_ return the element. For
    // `/###\`-looking tabs, which overlap each other slightly, the slanted parts
    // are often made using pseudo-elements. When trying to position a hint for
    // tab 2, `.elementFromPoint()` might return tab 1. So if we get a nonsensical
    // rect (one that does not cover (x, y)) for the "covering" element it's
    // better to treat (x, y) as non-covered.
    // This also happens for Bootstrap v4 checkboxes. They are constructed as
    // follows: A `<div>` has a bit of `padding-left`. In that padding, the
    // `<input type="checkbox">` is placed with `label::before` and `label::after`
    // stacked on top, all using `position: absolute;`. The `<input>` is hidden
    // via `z-index: -1;` and the pseudo elements are styled as a checkbox and
    // positioned _outside_ the `<label>` element. So running
    // `.getElementFromPoint()` where the checkbox looks to be returns the
    // `<label>` element. Treating the checkbox as non-covered means that the hint
    // will end up next to the checkbox rather than next to the label text.
    if (rect.left > x || rect.right <= x || rect.top > y || rect.bottom <= y) {
      return { x, y };
    }

    time.start("getNonCoveredPoint:attempt2");
    const newX = Math.round(rect.right + 1);

    // Try once to the right of the covering element (if it doesn't cover all the
    // way to the right of `element`). For example, there could be an absolutely
    // positioned search icon at the left of an `<input>`. Just trying once to the
    // right seemed to be a good tradeoff between correctness and performance in
    // the VimFx add-on.
    if (newX > x && newX <= maxX) {
      const elementAtPoint2 = getElementFromPoint(element, newX, y);

      if (elementAtPoint2 !== undefined && element.contains(elementAtPoint2)) {
        return { x: newX, y };
      }
    }

    return undefined;
  }

  // Try to find the best piece of text to place the hint at. This is difficult,
  // since lots of types of elements end up here: Everything from simple text
  // links to "cards" with titles, subtitles, badges and price tags. See the
  // inline comments for more details.
  function getBestNonEmptyTextPoint({
    element,
    elementRect,
    viewports,
    isAcceptable,
    preferTextStart = false,
    range,
  }) {
    const align = "right";

    // This goes through _all_ text nodes inside the element. That sounds
    // expensive, but in reality I have not noticed this to slow things down. Note
    // that `range.selectNodeContents(element); range.getClientRects()` might seem
    // easier to use, but it takes padding and such of child elements into
    // account. Also, it would count leading visible whitespace as the first
    // character.
    const rects = [];
    for (const textNode of walkTextNodes(element)) {
      const start = textNode.data.search(NON_WHITESPACE);
      const end = textNode.data.search(LAST_NON_WHITESPACE);
      if (start >= 0 && end >= 0) {
        range.setStart(textNode, start);
        range.setEnd(textNode, end + 1);
        for (const rect of range.getClientRects()) {
          const point = {
            ...getXY(rect),
            align,
            debug: "getBestNonEmptyTextPoint intermediate",
          };
          // Make sure that the text is inside the element.
          if (rect.height > 0 && isAcceptable(point)) {
            rects.push(rect);
          }
        }
      }
    }

    if (rects.length === 0) {
      return undefined;
    }

    // In selectable mode, prefer placing the hint at the start of the text
    // (visually) rather than at the most eye-catching text. Also used for
    // line-wrapped links, where the hint should be at the start of the link (if
    // possible), not at the left-most part of it:
    //
    //     text text text [F]link
    //     link text text
    //
    if (preferTextStart) {
      // Prefer the top-most part of the line. In case of a tie, prefer the
      // left-most one.
      const leftMostRect = rects.reduce((a, b) =>
        b.top < a.top ? b : b.top === a.top && b.left < a.left ? b : a
      );
      return {
        ...getXY(leftMostRect),
        align,
        debug: "getBestNonEmptyTextPoint preferTextStart",
      };
    }

    // Prefer the tallest one. In case of a tie, prefer the left-most one.
    const largestRect = rects.reduce((a, b) =>
      b.height > a.height ? b : b.height === a.height && b.left < a.left ? b : a
    );

    // There could be smaller text just to the left of the tallest text. It feels
    // more natural to be looking for the tallest _line_ rather than the tallest
    // piece of text and place the hint at the beginning of the line.
    const sameLineRects = rects.filter(
      (rect) => rect.top < largestRect.bottom && rect.bottom > largestRect.top
    );

    // Prefer the left-most part of the line. In case of a tie, prefer the
    // top-most one.
    const leftMostRect = sameLineRects.reduce((a, b) =>
      b.left < a.left ? b : b.left === a.left && b.top < a.top ? b : a
    );

    // If the text of the element is a single line and there's room to the left of
    // the text for an icon, look for an icon (image) and place the hint there
    // instead. It is common to have a little icon before the text of buttons.
    // This avoids covering the icon with the hint.
    const isSingleLine = sameLineRects.length === rects.length;
    if (
      isSingleLine &&
      // There’s space for an image to the left.
      leftMostRect.left >= elementRect.left + t$1.MIN_SIZE_ICON.value
    ) {
      const imagePoint = getFirstImagePoint(element, viewports);
      if (
        imagePoint !== undefined &&
        // The image is further to the left than the text.
        imagePoint.point.x < leftMostRect.left &&
        // The image is on the same line as the text.
        imagePoint.rect.top < leftMostRect.bottom &&
        imagePoint.rect.bottom > leftMostRect.top &&
        isAcceptable(imagePoint.point)
      ) {
        return {
          ...imagePoint.point,
          debug: `getBestNonEmptyTextPoint imagePoint: ${imagePoint.point.debug}`,
        };
      }
    }

    return {
      ...getXY(leftMostRect),
      align,
      debug: "getBestNonEmptyTextPoint default",
    };
  }

  function isWithin(point, box) {
    return (
      point.x >= box.x &&
      point.x <= box.x + box.width * t$1.MAX_HINT_X_PERCENTAGE_OF_WIDTH.value &&
      point.y >= box.y &&
      // Use `<`, not `<=`, since a point at `box.y + box.height` is located at
      // the first pixel _below_ the box.
      point.y < box.y + box.height
    );
  }

  function replaceConstants(code) {
    return code.replace(
      RegExp(`\\b(${Object.keys(constants).join("|")})\\b`, "g"),
      (name) => constants[name]
    );
  }

  function isScrollable(element) {
    const computedStyle = window.getComputedStyle(element);

    // `.scrollLeftMax` and `.scrollTopMax` are Firefox-only, but this function is
    // only called from the "overflow" and "underflow" event listeners, and those
    // are Firefox-only as well. Those properties are the easiest way to check if
    // an element overflows in either the X or Y direction.
    return (
      // @ts-expect-error See above.
      (element.scrollLeftMax > 0 &&
        (t$1.VALUES_SCROLLABLE_OVERFLOW.value.has(
          computedStyle.getPropertyValue("overflow-x")
        ) ||
          element === document.scrollingElement)) ||
      // @ts-expect-error See above.
      (element.scrollTopMax > 0 &&
        (t$1.VALUES_SCROLLABLE_OVERFLOW.value.has(
          computedStyle.getPropertyValue("overflow-y")
        ) ||
          element === document.scrollingElement))
    );
  }

  function hasClickListenerProp(element) {
    // Adding a `onclick="..."` attribute in HTML automatically sets
    // `.onclick` of the element to a function. But in Chrome, `.onclick`
    // is `undefined` when inspected from a content script, so we need to
    // use `.hasAttribute` instead. That works, except in rare edge cases
    // where `.onclick = null` is set afterwards (the attribute string
    // will remain but the listener will be gone).
    return CLICKABLE_EVENT_PROPS.some((prop) => element.hasAttribute(prop));
  }

  function getXY(passedBox) {
    // Chrome and Firefox _do_ support `.x` and `.y` on ClientRects (aka
    // DOMRects), but TypeScript does not include them.
    const box = passedBox;
    return {
      x: box.x,
      y: box.y + box.height / 2,
    };
  }

  function area(rect) {
    return rect.width * rect.height;
  }

  function hintWeight(elementType, visibleBoxes) {
    // Use the height as the weight. In a list of links, all links will then get
    // the same weight, since they have the same weight. (They’re all as important
    // as the other.) A multiline link gets the height of one of its lines as
    // weight. But use the width as weight if it is smaller so that very tall but
    // not very wide elements aren’t over powered.
    // If there are a bunch boxes next to each other with seemingly the same size
    // (and no other clickable elements around) the first box should get the first
    // hint chars as a hint, the second should get the second hint char, and so
    // on. However, the sizes of the boxes can differ ever so slightly (by less
    // than 1px). So round the weight to make the order more predictable.
    const weight = Math.round(
      Math.min(
        Math.max(...visibleBoxes.map((box) => box.width)),
        Math.max(...visibleBoxes.map((box) => box.height))
      )
    );

    // Use logarithms too make the difference between small and large elements
    // smaller. Instead of an “image card” being 10 times heavier than a
    // navigation link, it’ll only be about 3 times heavier. Give worse hints to
    // some types, such as scrollable elements, by using a logarithm with a higher
    // base. A tall scrollable element (1080px) gets a weight slightly smaller
    // than that of a small link (12px high).
    const lg = t$1.ELEMENT_TYPES_WORSE.value.has(elementType)
      ? Math.log10
      : Math.log2;

    return Math.max(1, lg(weight));
  }

  function getLinkElementType(element) {
    const hrefAttr = element.getAttribute("href");
    return (
      // Exclude `<a>` tags used as buttons.
      typeof hrefAttr === "string" &&
        hrefAttr !== "" &&
        hrefAttr !== "#" &&
        // Exclude `javascript:`, `mailto:`, `tel:` and other protocols that
        // don’t make sense to open in a new tab.
        t$1.PROTOCOLS_LINK.value.has(element.protocol)
        ? "link"
        : "clickable"
    );
  }

  function isDisabled(element) {
    // @ts-expect-error Not all HTMLElements have the `disabled` property, but for performance we don’t check.
    return element.disabled === true;
  }

  // If `event` originates from an open shadow root, `event.target` is the same as
  // `shadowRoot.host`, while `event.composedPath()[0]` is the actual element that
  // the event came from.
  function getTarget(event) {
    const path = event.composedPath();
    return path.length > 0 ? path[0] : event.target;
  }

  function mutationObserve(mutationObserver, node) {
    mutationObserver.observe(node, {
      childList: true,
      subtree: true,
      attributeFilter: Array.from(t$1.ATTRIBUTES_MUTATION.value),
    });
  }

  const t = {
    // How long a copied element should be selected.
    FLASH_COPIED_ELEMENT_DURATION: unsignedInt(200), // ms
    // Elements that look bad when inverted.
    FLASH_COPIED_ELEMENT_NO_INVERT_SELECTOR: selectorString(
      "img, audio, video, object, embed, iframe, frame, input, textarea, select, progress, meter, canvas"
    ),
    HINTS_REFRESH_IDLE_CALLBACK_TIMEOUT: unsignedInt(100), // ms
  };

  tweakable("Worker", t);

  class WorkerProgram {
    isPinned = true;

    keyboardShortcuts = [];

    keyboardMode = "Normal";

    keyTranslations = {};

    current = undefined;

    oneTimeWindowMessageToken = undefined;

    mac = false;

    suppressNextKeyup = undefined;

    resets = new Resets();

    elementManager = new ElementManager({
      onMutation: this.onMutation.bind(this),
    });

    async start() {
      this.resets.add(
        addListener(
          browser.runtime.onMessage,
          this.onMessage.bind(this),
          "WorkerProgram#onMessage"
        ),
        addEventListener(
          window,
          "keydown",
          this.onKeydown.bind(this),
          "WorkerProgram#onKeydown",
          { passive: false }
        ),
        addEventListener(
          window,
          "keyup",
          this.onKeyup.bind(this),
          "WorkerProgram#onKeyup",
          { passive: false }
        ),
        addEventListener(
          window,
          "message",
          this.onWindowMessage.bind(this),
          "WorkerProgram#onWindowMessage"
        ),
        addEventListener(
          window,
          "pagehide",
          this.onPageHide.bind(this),
          "WorkerProgram#onPageHide"
        ),
        addEventListener(
          window,
          "pageshow",
          this.onPageShow.bind(this),
          "WorkerProgram#onPageShow"
        )
      );
      await this.elementManager.start();

      this.markTutorial();

      // See `RendererProgram#start`.
      try {
        await browser.runtime.sendMessage(
          wrapMessage({ type: "WorkerScriptAdded" })
        );
      } catch {
        return;
      }
      browser.runtime.connect().onDisconnect.addListener(() => {
        this.stop();
      });
    }

    stop() {
      log("log", "WorkerProgram#stop");
      this.resets.reset();
      this.elementManager.stop();
      this.oneTimeWindowMessageToken = undefined;
      this.suppressNextKeyup = undefined;
      this.clearCurrent();
    }

    sendMessage(message) {
      log("log", "WorkerProgram#sendMessage", message.type, message);
      fireAndForget(
        browser.runtime.sendMessage(wrapMessage(message)).then(() => undefined),
        "WorkerProgram#sendMessage",
        message
      );
    }

    onMessage(wrappedMessage) {
      // See `RendererProgram#onMessage`.
      if (wrappedMessage.type === "FirefoxWorkaround") {
        this.sendMessage({ type: "WorkerScriptAdded" });
        return;
      }

      if (wrappedMessage.type !== "ToWorker") {
        return;
      }

      const { message } = wrappedMessage;

      log("log", "WorkerProgram#onMessage", message.type, message);

      switch (message.type) {
        case "StateSync":
          log.level = message.logLevel;
          this.isPinned = message.isPinned;
          this.keyboardShortcuts = message.keyboardShortcuts;
          this.keyboardMode = message.keyboardMode;
          this.keyTranslations = message.keyTranslations;
          this.oneTimeWindowMessageToken = message.oneTimeWindowMessageToken;
          this.mac = message.mac;

          if (message.clearElements) {
            this.clearCurrent();
          }
          break;

        case "StartFindElements": {
          const run = (types) => {
            const { oneTimeWindowMessageToken } = this;
            if (oneTimeWindowMessageToken === undefined) {
              log("error", "missing oneTimeWindowMessageToken", message);
              return;
            }
            const viewport = getViewport();
            this.reportVisibleElements(
              types,
              [viewport],
              oneTimeWindowMessageToken
            );
          };

          if (this.current === undefined) {
            run(message.types);
          } else {
            this.current.types = message.types;
            switch (this.current.waitId.tag) {
              case "NotWaiting": {
                const id1 = requestAnimationFrame(() => {
                  if (this.current !== undefined) {
                    const id2 = requestIdleCallback(
                      () => {
                        if (this.current !== undefined) {
                          this.current.waitId = { tag: "NotWaiting" };
                          run(this.current.types);
                        }
                      },
                      { timeout: t.HINTS_REFRESH_IDLE_CALLBACK_TIMEOUT.value }
                    );
                    this.current.waitId = {
                      tag: "RequestIdleCallback",
                      id: id2,
                    };
                  }
                });
                this.current.waitId = { tag: "RequestAnimationFrame", id: id1 };
                break;
              }
            }
          }
          break;
        }

        case "UpdateElements": {
          const { current, oneTimeWindowMessageToken } = this;
          if (current === undefined) {
            return;
          }

          current.viewports = [getViewport()];

          this.updateVisibleElements({
            current,
            oneTimeWindowMessageToken,
          });
          break;
        }

        case "GetTextRects": {
          const { current } = this;
          if (current === undefined) {
            return;
          }

          const { indexes, words } = message;
          current.indexes = indexes;
          current.words = words;

          const elements = current.elements.filter((_elementData, index) =>
            indexes.includes(index)
          );
          const wordsSet = new Set(words);
          const rects = elements.flatMap((elementData) =>
            getTextRectsHelper({
              element: elementData.element,
              type: elementData.type,
              viewports: current.viewports,
              words: wordsSet,
            })
          );

          this.sendMessage({
            type: "ReportTextRects",
            rects,
          });

          break;
        }

        case "FocusElement": {
          const elementData = this.getElement(message.index);
          if (elementData === undefined) {
            log(
              "error",
              "FocusElement: Missing element",
              message,
              this.current
            );
            return;
          }

          const { element } = elementData;
          const activeElement = this.elementManager.getActiveElement(document);
          const textInputIsFocused =
            activeElement !== undefined && isTextInput(activeElement);

          // Allow opening links in new tabs without losing focus from a text
          // input.
          if (!textInputIsFocused) {
            element.focus();
          }

          break;
        }

        case "ClickElement": {
          const elementData = this.getElement(message.index);

          if (elementData === undefined) {
            log(
              "error",
              "ClickElement: Missing element",
              message,
              this.current
            );
            return;
          }

          log("log", "WorkerProgram: ClickElement", elementData);

          const { element } = elementData;

          const defaultPrevented = this.clickElement(element);

          if (
            !defaultPrevented &&
            elementData.type === "link" &&
            element?.localName === "a" &&
            !isInternalHashLink(element)
          ) {
            // I think it’s fine to send this even if the link opened in a new tab.
            this.sendMessage({ type: "ClickedLinkNavigatingToOtherPage" });
          }

          break;
        }

        case "SelectElement": {
          const elementData = this.getElement(message.index);
          if (elementData === undefined) {
            log(
              "error",
              "SelectElement: Missing element",
              message,
              this.current
            );
            return;
          }

          log("log", "WorkerProgram: SelectElement", elementData);

          const { element } = elementData;

          if (
            element?.localName === "input" ||
            element instanceof HTMLTextAreaElement
          ) {
            // Focus and, if possible, select the text inside. There are two cases
            // here: "Text input" (`<textarea>`, `<input type="text">`, `<input
            // type="search">`, `<input type="unknown">`, etc) style elements
            // technically only need `.select()`, but it doesn't hurt calling
            // `.focus()` first. For all other types (`<input type="checkbox">`,
            // `<input type="color">`, etc) `.select()` seems to be a no-op, so
            // `.focus()` is strictly needed but calling `.select()` also doesn't
            // hurt.
            element.focus();
            element.select();
          } else if (
            // Text inside `<button>` elements can be selected and copied just
            // fine in Chrome, but not in Firefox. In Firefox,
            // `document.elementFromPoint(x, y)` returns the `<button>` for
            // elements nested inside, causing them not to get hints either.
            // `<select>` elements _can_ be selected, but you seem to get the
            // empty string when trying to copy them.
            element instanceof HTMLSelectElement ||
            // Frame elements can be selected in Chrome, but that just looks
            // weird. The reason to focus a frame element is to allow the arrow
            // keys to scroll them.
            element instanceof HTMLIFrameElement ||
            element instanceof HTMLFrameElement
          ) {
            element.focus();
          } else {
            // Focus the element, even if it isn't usually focusable.
            if (element !== this.elementManager.getActiveElement(document)) {
              focusElement(element);
            }

            // Try to select the text of the element, or the element itself.
            const selection = window.getSelection();
            if (selection !== null) {
              // Firefox won’t select text inside a ShadowRoot without this timeout.
              setTimeout(() => {
                const range = selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
              }, 0);
            }
          }

          break;
        }

        case "CopyElement": {
          const elementData = this.getElement(message.index);
          if (elementData === undefined) {
            log("error", "CopyElement: Missing element", message, this.current);
            return;
          }

          log("log", "WorkerProgram: CopyElement", elementData);

          const { element } = elementData;
          const text =
            element?.localName === "a"
              ? element.href
              : element instanceof HTMLImageElement ||
                element instanceof HTMLMediaElement
              ? element.currentSrc
              : element instanceof HTMLObjectElement
              ? element.data
              : element instanceof HTMLEmbedElement ||
                element instanceof HTMLIFrameElement ||
                element instanceof HTMLFrameElement
              ? element.src
              : element?.localName === "input" ||
                element instanceof HTMLTextAreaElement ||
                element instanceof HTMLSelectElement
              ? element.value
              : element instanceof HTMLProgressElement ||
                element instanceof HTMLMeterElement
              ? element.value.toString()
              : element instanceof HTMLCanvasElement
              ? element.toDataURL()
              : element instanceof HTMLPreElement
              ? extractText(element)
              : // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                normalizeWhitespace(extractText(element)) || element.outerHTML;

          fireAndForget(
            navigator.clipboard.writeText(text),
            "WorkerProgram#onMessage->CopyElement->clipboard.writeText",
            message,
            text
          );

          flashElement(element);

          break;
        }

        // Used instead of `browser.tabs.create` in Chrome, to have the opened tab
        // end up in the same position as if you'd clicked a link with the mouse.
        // This technique does not seem to work in Firefox, but it's not needed
        // there anyway (see background/Program.ts).
        case "OpenNewTab": {
          const { url, foreground } = message;
          const link = document.createElement("a");
          link.href = url;
          link.dispatchEvent(
            new MouseEvent("click", {
              ctrlKey: true,
              metaKey: true,
              shiftKey: foreground,
            })
          );
          break;
        }

        case "Escape": {
          const activeElement = this.elementManager.getActiveElement(document);
          if (activeElement !== undefined) {
            activeElement.blur();
          }
          const selection = window.getSelection();
          if (selection !== null) {
            selection.removeAllRanges();
          }
          break;
        }

        case "ReverseSelection": {
          const selection = window.getSelection();
          if (selection !== null) {
            reverseSelection(selection);
          }
          break;
        }
      }
    }

    onWindowMessage(event) {
      const { oneTimeWindowMessageToken } = this;

      if (
        oneTimeWindowMessageToken !== undefined &&
        typeof event.data === "object" &&
        event.data !== null &&
        !Array.isArray(event.data) &&
        event.data.token === oneTimeWindowMessageToken &&
        typeof event.data.type === "string"
      ) {
        let message = undefined;
        try {
          message = decode(FrameMessage, event.data);
        } catch (error) {
          log(
            "warn",
            "Ignoring bad window message",
            oneTimeWindowMessageToken,
            event,
            error
          );
          return;
        }

        this.oneTimeWindowMessageToken = undefined;
        log("log", "WorkerProgram#onWindowMessage", message);

        switch (message.type) {
          case "FindElements":
            this.sendMessage({ type: "ReportVisibleFrame" });
            this.reportVisibleElements(
              message.types,
              message.viewports,
              oneTimeWindowMessageToken
            );
            break;

          case "UpdateElements": {
            const { current } = this;
            if (current === undefined) {
              return;
            }

            current.viewports = message.viewports;
            this.updateVisibleElements({
              current,
              oneTimeWindowMessageToken,
            });
            break;
          }
        }
      }
    }

    // This is run in the capture phase of the keydown event, overriding any site
    // shortcuts. The initial idea was to run in the bubble phase (mostly) and let
    // sites use `event.preventDefault()` to override the extension shortcuts
    // (just like any other browser shortcut). However, duckduckgo.com has "j/k"
    // shortcuts for navigation, but don't check for the alt key and don't call
    // `event.preventDefault()`, making it impossible to use alt-j as an extension
    // shortcut without causing side-effects. This feels like a common thing, so
    // (at least for now) the extension shortcuts always do their thing (making it
    // impossible to trigger a site shortcut using the same keys).
    onKeydown(event) {
      if (!event.isTrusted) {
        log(
          "log",
          "WorkerProgram#onKeydown",
          "ignoring untrusted event",
          event
        );
        return;
      }

      const keypress = normalizeKeypress({
        keypress: keyboardEventToKeypress(event),
        keyTranslations: this.keyTranslations,
      });

      const match = this.keyboardShortcuts.find((mapping) => {
        const { shortcut } = mapping;
        return (
          keypress.key === shortcut.key &&
          keypress.alt === shortcut.alt &&
          keypress.cmd === shortcut.cmd &&
          keypress.ctrl === shortcut.ctrl &&
          (keypress.shift === undefined || keypress.shift === shortcut.shift)
        );
      });

      const suppress =
        // If we matched one of our keyboard shortcuts, always suppress.
        match !== undefined ||
        // Just after activating a hint, suppress everything for a short while.
        this.keyboardMode === "PreventOverTyping" ||
        // When capturing keypresses in the Options UI, always suppress.
        this.keyboardMode === "Capture" ||
        // Allow ctrl and cmd system shortcuts in hints mode (but always suppress
        // pressing modifier keys _themselves_ in case the page does unwanted
        // things when holding down alt for example). ctrl and cmd can't safely be
        // combined with hint chars anyway, due to some keyboard shortcuts not
        // being suppressible (such as ctrl+n, ctrl+q, ctrl+t, ctrl+w) (and
        // ctrl+alt+t opens a terminal by default in Ubuntu).
        // This always uses `event.key` since we are looking for _actual_ modifier
        // keypresses (keys may be rebound).
        // Note: On mac, alt/option is used to type special characters, while most
        // (if not all) ctrl shortcuts are up for grabs by extensions, so on mac
        // ctrl is used to activate hints in a new tab instead of alt.
        // In hints mode…
        (this.keyboardMode === "Hints" &&
          // …suppress lone modifier keypresses (as mentioned above)…
          (isModifierKey(event.key) ||
            // …or any other keypress really, with a few exceptions:
            (this.mac
              ? // On mac, allow cmd shortcuts (option is not used for shortcuts
                // but for typing special characters, and ctrl is used to
                // activate hints in new tabs):
                !event.metaKey
              : // On Windows and Linux, allow ctrl and win/super system shortcuts
                // (alt is used to activate hints in new tabs):
                !event.ctrlKey && !event.metaKey)));

      if (suppress) {
        suppressEvent(event);
        // `keypress` events are automatically suppressed when suppressing
        // `keydown`, but `keyup` needs to be manually suppressed. Note that if a
        // keyboard shortcut is alt+j it's possible to either release the alt key
        // first or the J key first, so we have to store _which_ key we want to
        // suppress the `keyup` event for.
        this.suppressNextKeyup = {
          key: event.key,
          code: event.code,
        };
        log("log", "WorkerProgram#onKeydown", "suppressing event", {
          key: event.key,
          code: event.code,
          event,
          match,
          keyboardMode: this.keyboardMode,
          suppressNextKeyup: this.suppressNextKeyup,
        });
      }

      // The "keydown" event fires at an interval while it is pressed. We're only
      // interested in the event where the key was actually pressed down. Ignore
      // the rest. Don't log this since it results in a _lot_ of logs. This is
      // done _after_ suppression – we still want to consistently suppress the key,
      // but don't want it to trigger more actions.
      if (event.repeat) {
        return;
      }

      if (this.keyboardMode === "Capture") {
        if (!isModifierKey(event.key)) {
          this.sendMessage({
            type: "KeypressCaptured",
            keypress,
          });
        }
      } else if (match !== undefined) {
        this.sendMessage({
          type: "KeyboardShortcutMatched",
          action: match.action,
          timestamp: Date.now(),
        });
      } else if (this.keyboardMode === "Hints" && suppress) {
        this.sendMessage({
          type: "NonKeyboardShortcutKeypress",
          keypress,
          timestamp: Date.now(),
        });
      }
    }

    onKeyup(event) {
      if (!event.isTrusted) {
        log("log", "WorkerProgram#onKeyup", "ignoring untrusted event", event);
        return;
      }

      if (this.suppressNextKeyup !== undefined) {
        const { key, code } = this.suppressNextKeyup;
        if (event.key === key && event.code === code) {
          log("log", "WorkerProgram#onKeyup", "suppressing event", {
            event,
            keyboardMode: this.keyboardMode,
            suppressNextKeyup: this.suppressNextKeyup,
          });
          suppressEvent(event);
          this.suppressNextKeyup = undefined;
        }
      }
    }

    onMutation(records) {
      const { current } = this;
      if (current === undefined) {
        return;
      }

      const newElements = this.getAllNewElements(records);
      updateElementsWithEqualOnes(current, newElements);

      // In addition to the "UpdateElements" polling, update as soon as possible
      // when elements are removed/added/changed for better UX. For example, if a
      // modal closes it looks nicer if the hints for elements in the modal
      // disappear immediately rather than after a small delay.
      // Just after entering hints mode a mutation _always_ happens – inserting
      // the div with the hints. Don’t let that trigger an update.
      if (!(newElements.length === 1 && newElements[0].id === CONTAINER_ID)) {
        this.updateVisibleElements({
          current,
          // Skip updating child frames since we only know that things changed in
          // _this_ frame. Child frames will be updated during the next poll.
          oneTimeWindowMessageToken: undefined,
        });
      }
    }

    onPageHide(event) {
      if (!event.isTrusted) {
        log(
          "log",
          "WorkerProgram#onPageHide",
          "ignoring untrusted event",
          event
        );
        return;
      }

      if (window.top === window) {
        // The top page is about to be “die.”
        this.sendMessage({ type: "TopPageHide" });
      }
    }

    onPageShow(event) {
      if (!event.isTrusted) {
        log(
          "log",
          "WorkerProgram#onPageShow",
          "ignoring untrusted event",
          event
        );
        return;
      }

      if (event.persisted) {
        // We have returned to the page via the back/forward buttons.
        this.sendMessage({ type: "PersistedPageShow" });
      }
    }

    getAllNewElements(records) {
      const elements = new Set();

      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement && !elements.has(node)) {
            elements.add(node);
            const children = this.elementManager.getAllElements(node);
            for (const child of children) {
              elements.add(child);
            }
          }
        }
      }

      return Array.from(elements);
    }

    getElement(index) {
      return this.current === undefined
        ? undefined
        : this.current.elements[index];
    }

    reportVisibleElements(types, viewports, oneTimeWindowMessageToken) {
      const time = new TimeTracker();

      const [elementsWithNulls, timeLeft] =
        this.elementManager.getVisibleElements(types, viewports, time);
      const elements = elementsWithNulls.flatMap((elementData) =>
        elementData === undefined ? [] : elementData
      );

      time.start("frames");
      const frames = this.elementManager.getVisibleFrames(viewports);
      for (const frame of frames) {
        if (frame.contentWindow !== null) {
          const message = {
            type: "FindElements",
            token: oneTimeWindowMessageToken,
            types,
            viewports: viewports.concat(getFrameViewport(frame)),
          };
          frame.contentWindow.postMessage(message, "*");
        }
      }

      time.start("element reports");
      const elementReports = makeElementReports(elements, {
        maxDuration: timeLeft,
        prefix: "WorkerProgram#reportVisibleElements",
      });

      time.start("send results");
      this.sendMessage({
        type: "ReportVisibleElements",
        elements: elementReports,
        numFrames: frames.length,
        stats: this.elementManager.makeStats(time.export()),
      });

      this.current = {
        elements,
        frames,
        viewports,
        types,
        indexes: [],
        words: [],
        waitId: { tag: "NotWaiting" },
      };
    }

    updateVisibleElements({ current, oneTimeWindowMessageToken }) {
      const [elements, timeLeft] = this.elementManager.getVisibleElements(
        current.types,
        current.viewports,
        new TimeTracker(),
        current.elements.map(({ element }) => element)
      );

      const { words } = current;

      if (oneTimeWindowMessageToken !== undefined) {
        for (const frame of current.frames) {
          // Removing an iframe from the DOM nukes its page (this will be detected
          // by the port disconnecting). Re-inserting it causes the page to be
          // loaded anew.
          if (frame.contentWindow !== null) {
            const message = {
              type: "UpdateElements",
              token: oneTimeWindowMessageToken,
              viewports: current.viewports.concat(getFrameViewport(frame)),
            };
            frame.contentWindow.postMessage(message, "*");
          }
        }
      }

      const wordsSet = new Set(words);
      const rects =
        words.length === 0
          ? []
          : elements.flatMap((maybeItem, index) => {
              if (maybeItem === undefined || !current.indexes.includes(index)) {
                return [];
              }
              const { element, type } = maybeItem;
              return getTextRectsHelper({
                element,
                type,
                viewports: current.viewports,
                words: wordsSet,
              });
            });

      const elementReports = makeElementReports(elements, {
        maxDuration: timeLeft,
        prefix: "WorkerProgram#updateVisibleElements",
      });

      this.sendMessage({
        type: "ReportUpdatedElements",
        elements: elementReports,
        rects,
      });
    }

    // Let the tutorial page know that Link Hints is installed, so it can toggle
    // some content.
    markTutorial() {
      if (
        (window.location.origin + window.location.pathname ===
          "https://lydell.github.io/LinkHints/tutorial.html" ||
          !true) &&
        document.documentElement !== null
      ) {
        document.documentElement.classList.add("is-installed");
      }
    }

    clickElement(element) {
      if (element instanceof HTMLMediaElement) {
        element.focus();
        if (element.paused) {
          fireAndForget(
            element.play(),
            "WorkerProgram#clickElement->play",
            element
          );
        } else {
          element.pause();
        }
        return false;
      }

      const targetElement = getTargetElement(element);

      const rect = targetElement.getBoundingClientRect();
      const options = {
        // Mimic real events as closely as possible.
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: 1,
        view: window,
        // These seem to automatically set `x`, `y`, `pageX` and `pageY` as well.
        // There’s also `screenX` and `screenY`, but we can’t know those.
        clientX: Math.round(rect.left),
        clientY: Math.round(rect.top + rect.height / 2),
      };

      // Just calling `.click()` isn’t enough to open dropdowns in gmail. That
      // requires the full mousedown+mouseup+click event sequence.
      const mousedownEvent = new MouseEvent("mousedown", {
        ...options,
        buttons: 1,
      });
      const mouseupEvent = new MouseEvent("mouseup", options);
      const clickEvent = new MouseEvent("click", options);

      // When clicking a link for real the focus happens between the mousedown and
      // the mouseup, but moving this line between those two `.dispatchEvent` calls
      // below causes dropdowns in gmail not to be triggered anymore.
      // Note: The target element is clicked, but the original element is
      // focused. The idea is that the original element is a link or button, and
      // the target element might be a span or div.
      element.focus();

      targetElement.dispatchEvent(mousedownEvent);
      targetElement.dispatchEvent(mouseupEvent);
      let defaultPrevented = !targetElement.dispatchEvent(clickEvent);

      return defaultPrevented;
    }

    clearCurrent() {
      if (this.current !== undefined) {
        const { waitId } = this.current;
        switch (waitId.tag) {
          case "NotWaiting":
            break;

          case "RequestAnimationFrame":
            cancelAnimationFrame(waitId.id);
            break;

          case "RequestIdleCallback":
            cancelIdleCallback(waitId.id);
            break;
        }
        this.current = undefined;
      }
    }
  }

  function wrapMessage(message) {
    return {
      type: "FromWorker",
      message,
    };
  }

  function getFrameViewport(frame) {
    const rect = frame.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(frame);
    const border = {
      left: parseFloat(computedStyle.getPropertyValue("border-left-width")),
      right: parseFloat(computedStyle.getPropertyValue("border-right-width")),
      top: parseFloat(computedStyle.getPropertyValue("border-top-width")),
      bottom: parseFloat(computedStyle.getPropertyValue("border-bottom-width")),
    };
    const padding = {
      left: parseFloat(computedStyle.getPropertyValue("padding-left")),
      right: parseFloat(computedStyle.getPropertyValue("padding-right")),
      top: parseFloat(computedStyle.getPropertyValue("padding-top")),
      bottom: parseFloat(computedStyle.getPropertyValue("padding-bottom")),
    };
    return {
      x: rect.left + border.left + padding.left,
      y: rect.top + border.top + padding.top,
      width:
        rect.width - border.left - border.right - padding.left - padding.right,
      height:
        rect.height - border.top - border.bottom - padding.top - padding.bottom,
    };
  }

  // Focus any element. Temporarily alter tabindex if needed, and properly
  // restore it again when blurring.
  function focusElement(element) {
    const focusable = isFocusable(element);
    const tabIndexAttr = element.getAttribute("tabindex");

    if (!focusable) {
      element.setAttribute("tabindex", "-1");
    }

    element.focus();

    if (!focusable) {
      let tabIndexChanged = false;

      const stop = () => {
        element.removeEventListener("blur", stop, options);
        mutationObserver.disconnect();

        if (!tabIndexChanged) {
          if (tabIndexAttr === null) {
            element.removeAttribute("tabindex");
          } else {
            element.setAttribute("tabindex", tabIndexAttr);
          }
        }
      };

      const options = { capture: true, passive: true };
      element.addEventListener("blur", stop, options);

      const mutationObserver = new MutationObserver((records) => {
        const removed = !element.isConnected;
        tabIndexChanged = records.some(
          (record) => record.type === "attributes"
        );

        if (removed || tabIndexChanged) {
          stop();
        }
      });

      mutationObserver.observe(element, {
        attributes: true,
        attributeFilter: ["tabindex"],
      });

      for (const root of getRootNodes(element)) {
        mutationObserver.observe(root, {
          childList: true,
          subtree: true,
        });
      }
    }
  }

  function* getRootNodes(fromNode) {
    let node = fromNode;
    do {
      const root = node.getRootNode();
      yield root;
      if (root instanceof ShadowRoot) {
        node = root.host;
      } else {
        break;
      }
    } while (true);
  }

  // When triggering a click on an element, it might actually make more sense to
  // trigger the click on one of its children. If `element` contains a single
  // child element (and no non-blank text nodes), use that child element instead
  // (recursively). Clicking an element _inside_ a link or button still triggers
  // the link or button.
  // This is because sites with bad markup might have links and buttons with an
  // inner element with where the actual click listener is attached. When clicking
  // the link or button with a real mouse, you actually click the inner element
  // and as such trigger the click listener. The actual link or button has no
  // click listener itself, so triggering a click there doesn’t do anything. Using
  // this function, we can try to simulate a real mouse click. If a link or button
  // has multiple children it is unclear which (if any!) child we should click, so
  // then we use the original element.
  function getTargetElement(element) {
    const children = Array.from(element.childNodes).filter(
      (node) => !(node?.nodeType === 3 && node.data.trim() === "")
    );
    const onlyChild = children.length === 1 ? children[0] : undefined;
    return onlyChild instanceof HTMLElement
      ? getTargetElement(onlyChild)
      : element;
  }

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-integers
  const TABINDEX = /^\s*([+-]?\d+)\s*$/;

  // Returns whether `element.focus()` will do anything or not.
  function isFocusable(element) {
    const propValue = element.tabIndex;

    // `<a>`, `<button>`, etc. are natively focusable (`.tabIndex === 0`).
    // `.tabIndex` can also be set if the HTML contains a valid `tabindex`
    // attribute.
    // `-1` means either that the element isn't focusable, or that
    // `tabindex="-1"` was set, so we have to use `.getAttribute` to
    // disambiguate.
    if (propValue !== -1) {
      return true;
    }

    // Contenteditable elements are always focusable.
    if (element.isContentEditable) {
      return true;
    }

    const attrValue = element.getAttribute("tabindex");

    if (attrValue === null) {
      return false;
    }

    return TABINDEX.test(attrValue);
  }

  function isTextInput(element) {
    return (
      element.isContentEditable ||
      element instanceof HTMLTextAreaElement ||
      // `.selectionStart` is set to a number for all `<input>` types that you can
      // type regular text into (`<input type="text">`, `<input type="search">`,
      // `<input type="unknown">`, etc), but not for `<input type="email">` and
      // `<input type="number">` for some reason.
      (element?.localName === "input" &&
        (element.selectionStart !== null ||
          element.type === "email" ||
          element.type === "number"))
    );
  }

  function reverseSelection(selection) {
    const direction = getSelectionDirection(selection);

    if (direction === undefined) {
      return;
    }

    const range = selection.getRangeAt(0);
    const [edgeNode, edgeOffset] = direction
      ? [range.startContainer, range.startOffset]
      : [range.endContainer, range.endOffset];

    range.collapse(!direction);
    selection.removeAllRanges();
    selection.addRange(range);
    selection.extend(edgeNode, edgeOffset);
  }

  // true → forward, false → backward, undefined → unknown
  function getSelectionDirection(selection) {
    if (selection.isCollapsed) {
      return undefined;
    }

    const { anchorNode, focusNode } = selection;

    if (anchorNode === null || focusNode === null) {
      return undefined;
    }

    const range = document.createRange();
    range.setStart(anchorNode, selection.anchorOffset);
    range.setEnd(focusNode, selection.focusOffset);
    return !range.collapsed;
  }

  // Select the text of an element (if any – otherwise select the whole element
  // (such as an image)), ignoring leading and trailing whitespace.
  function selectNodeContents(element) {
    const range = document.createRange();
    let start = undefined;
    let end = undefined;

    for (const textNode of walkTextNodes(element)) {
      if (start === undefined) {
        const index = textNode.data.search(NON_WHITESPACE);
        if (index >= 0) {
          start = { textNode, index };
        }
      }
      if (start !== undefined) {
        const index = textNode.data.search(LAST_NON_WHITESPACE);
        if (index >= 0) {
          end = { textNode, index: index + 1 };
        }
      }
    }

    let method = undefined;
    if (start !== undefined && end !== undefined) {
      method = "text nodes";
      range.setStart(start.textNode, start.index);
      range.setEnd(end.textNode, end.index);
    } else if (element.childNodes.length === 0) {
      method = "selectNode";
      range.selectNode(element);
    } else {
      method = "selectNodeContents";
      range.selectNodeContents(element);
    }
    log("log", "selectNodeContents", { method, start, end, element });

    return range;
  }

  function getTextWeight(text, weight) {
    // The weight used for hints after filtering by text is the number of
    // non-whitespace characters, plus a tiny bit of the regular hint weight in
    // case of ties.
    return Math.max(1, text.replace(/\s/g, "").length + Math.log10(weight));
  }

  function suppressEvent(event) {
    event.preventDefault();
    // `event.stopPropagation()` prevents the event from propagating further
    // up and down the DOM tree. `event.stopImmediatePropagation()` also
    // prevents additional listeners on the same node (`window` in this case)
    // from being called.
    event.stopImmediatePropagation();

    // `event.preventDefault()` doesn’t work for `accesskey="x"` in Chrome. See:
    // https://stackoverflow.com/a/34008999/2010616
    // Instead, temporarily remove all accesskeys.
    {
      const elements = document.querySelectorAll("[accesskey]");
      const accesskeyMap = new Map();
      for (const element of elements) {
        const accesskey = element.getAttribute("accesskey");
        if (accesskey !== null) {
          accesskeyMap.set(element, accesskey);
          element.removeAttribute("accesskey");
        }
      }
      setTimeout(() => {
        for (const [element, accesskey] of accesskeyMap) {
          element.setAttribute("accesskey", accesskey);
        }
      }, 0);
    }
  }

  function makeElementReports(elements, { maxDuration, prefix }) {
    const startTime = Date.now();

    const elementReports = elements.flatMap((elementData, index) =>
      elementData !== undefined
        ? visibleElementToElementReport(elementData, {
            index,
            textContent: Date.now() - startTime > maxDuration,
          })
        : []
    );

    const skipped = elementReports.filter((report) => report.textContent);
    if (skipped.length > 0) {
      log(
        "warn",
        prefix,
        `Used .textContent for ${skipped.length} element(s) due to timeout`,
        {
          duration: Date.now() - startTime,
          max: maxDuration,
          skipped,
        }
      );
    }

    return elementReports;
  }

  function visibleElementToElementReport(
    { element, type, measurements, hasClickListener },
    { index, textContent }
  ) {
    const text = textContent
      ? element.textContent ?? ""
      : extractTextHelper(element, type);
    return {
      type,
      index,
      url:
        type === "link" && element?.localName === "a"
          ? element.href
          : undefined,
      urlWithTarget:
        type === "link" && element?.localName === "a"
          ? getUrlWithTarget(element)
          : undefined,
      text,
      textContent,
      textWeight: getTextWeight(text, measurements.weight),
      isTextInput: isTextInput(element),
      hasClickListener,
      hintMeasurements: measurements,
    };
  }

  function updateElementsWithEqualOnes(current, newElements) {
    if (newElements.length === 0) {
      return;
    }

    for (const item of current.elements) {
      // If an element with a hint has been removed, try to find a new element
      // that seems to be equal. If only one is found – go for it and use the new
      // one. Some sites, like Gmail and GitHub, replace elements with new,
      // identical ones shortly after things load. That caused hints to disappear
      // for seemingly no reason (one cannot tell with one’s eyes that the hint’s
      // element had _technically_ been removed). This is an attempt to give such
      // hints new elements.
      if (!item.element.isConnected) {
        const equalElements = newElements.filter((element) =>
          item.element.isEqualNode(element)
        );
        if (equalElements.length === 1) {
          item.element = equalElements[0];
        }
      }
    }
  }

  function extractTextHelper(element, type) {
    // Scrollable elements do have `.textContent`, but it’s not intuitive to
    // filter them by text (especially since the matching text might be scrolled
    // away). Treat them more like frames (where you can’t look inside).
    if (type === "scrollable") {
      return "";
    }

    // For text inputs, textareas, checkboxes, selects, etc, use their label text
    // for filtering. For buttons with a label, use both the button text and the
    // label text.
    const labels = getLabels(element);
    if (labels !== undefined) {
      return normalizeWhitespace(
        [extractText(element)]
          .concat(Array.from(labels, (label) => extractText(label)))
          .join(" ")
      );
    }

    return normalizeWhitespace(extractText(element));
  }

  function normalizeWhitespace(string) {
    return string.trim().replace(/\s+/g, " ");
  }

  function getTextRectsHelper({
    element,
    type,
    viewports,
    words,
    checkElementAtPoint,
  }) {
    // See `extractTextHelper`.
    if (type === "scrollable") {
      return [];
    }

    // See `extractTextHelper`.
    const labels = getLabels(element);
    if (labels !== undefined) {
      return [element].concat(Array.from(labels)).flatMap((element2) =>
        getTextRects({
          element: element2,
          viewports,
          words,
          checkElementAtPoint,
        })
      );
    }

    return getTextRects({ element, viewports, words, checkElementAtPoint });
  }

  // Used to decide if two links can get the same hint. If they have the same href
  // and target they can. For some targets the frame must be the same as well.
  function getUrlWithTarget(link) {
    const target = link.target.toLowerCase();

    const [caseTarget, frameHref] =
      target === "" || target === "_blank" || target === "_top"
        ? [target, ""] // Case insensitive target, not frame specific.
        : target === "_self" || target === "_parent"
        ? [target, window.location.href] // Case insensitive target, frame specific.
        : [link.target, window.location.href]; // Case sensitive target, frame specific.

    // `|` is not a valid URL character, so it is safe to use as a separator.
    return `${encodeURIComponent(caseTarget)}|${frameHref}|${link.href}`;
  }

  function isInternalHashLink(element) {
    return (
      element.href.includes("#") &&
      stripHash(element.href) === stripHash(window.location.href)
    );
  }

  function stripHash(url) {
    const index = url.indexOf("#");
    return index === -1 ? url : url.slice(0, index);
  }

  function flashElement(element) {
    const selector = t.FLASH_COPIED_ELEMENT_NO_INVERT_SELECTOR.value;
    const changes = [
      temporarilySetFilter(
        element,
        element.matches(selector) ? "contrast(0.5)" : "invert(0.75)"
      ),
      ...Array.from(element.querySelectorAll(selector), (image) =>
        temporarilySetFilter(image, "invert(1)")
      ),
    ];
    for (const { apply } of changes) {
      apply();
    }
    setTimeout(() => {
      for (const { reset } of changes) {
        reset();
      }
    }, t.FLASH_COPIED_ELEMENT_DURATION.value);
  }

  function temporarilySetFilter(element, value) {
    const prop = "filter";
    const originalValue = element.style.getPropertyValue(prop);
    const important = element.style.getPropertyPriority(prop);
    const newValue = `${originalValue} ${value}`.trim();
    return {
      apply: () => {
        element.style.setProperty(prop, newValue, "important");
      },
      reset: () => {
        if (
          element.style.getPropertyValue(prop) === newValue &&
          element.style.getPropertyPriority(prop) === "important"
        ) {
          element.style.setProperty(prop, originalValue, important);
        }
      },
    };
  }

  // In Firefox, `match_about_blank: true` triggers even if you visit
  // `about:blank` directly, not just blank iframes and `window.open()`.
  // It makes no sense doing anything in a completely blank page.
  if (!(window.location.href === "about:blank" && window.top === window)) {
    const program = new WorkerProgram();
    fireAndForget(program.start(), "main->WorkerProgram#start");
  }
})();
