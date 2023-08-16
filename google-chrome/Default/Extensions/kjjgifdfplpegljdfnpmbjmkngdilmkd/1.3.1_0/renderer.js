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

  function setStyles(element, styles) {
    for (const [property, value] of Object.entries(styles)) {
      element.style.setProperty(property, value, "important");
    }
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

  const CONTAINER_STYLES = {
    all: "unset",
    position: "fixed",
    "z-index": MAX_Z_INDEX.toString(),
    "pointer-events": "none",
    overflow: "hidden",
  };

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

  const DEBUG_PREFIX = "debug.";

  function unsignedInt(value) {
    return {
      type: "UnsignedInt",
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

  const t = {
    MAX_IMMEDIATE_HINT_MOVEMENTS: unsignedInt(50),
  };

  tweakable("Renderer", t);

  class RendererProgram {
    hints = [];

    rects = new Map();

    enteredText = "";

    resets = new Resets();

    shruggieElement;

    statusElement;

    statusText;

    hintSize;

    container;

    css = {
      text: CSS,
      parsed: undefined,
    };

    constructor() {
      this.shruggieElement = createHintElement(SHRUGGIE);
      this.shruggieElement.classList.add(SHRUGGIE_CLASS);
      setStyles(this.shruggieElement, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        "z-index": MAX_Z_INDEX.toString(),
      });

      this.statusElement = document.createElement("div");
      this.statusElement.classList.add(STATUS_CLASS);
      this.statusText = document.createTextNode("");
      this.statusElement.append(this.statusText);
      setStyles(this.statusElement, {
        position: "absolute",
        "z-index": MAX_Z_INDEX.toString(),
      });

      this.hintSize = {
        widthBase: 0,
        widthPerLetter: 0,
        height: 0,
      };

      const container = document.createElement("div");
      container.id = CONTAINER_ID;
      setStyles(container, CONTAINER_STYLES);

      // Using `mode: "closed"` means that ElementManager won’t be able to get
      // into this shadow root, which is a small optimization. (The override of
      // `.attachShadow` in injected.ts does not apply to code running in the
      // extension context, only in the page context).
      const shadowRoot = container.attachShadow({ mode: "closed" });

      const root = document.createElement("div");
      root.className = ROOT_CLASS;

      this.container = {
        element: container,
        root,
        shadowRoot,
        resets: new Resets(),
        intersectionObserver: new IntersectionObserver(
          this.onIntersection.bind(this),
          {
            // Make sure the container stays within the viewport.
            threshold: 1,
          }
        ),
      };
    }

    async start() {
      // This is useful during development. If reloading the extension during
      // hints mode, the old hints will be removed as soon as the new version
      // starts.
      this.unrender();

      this.resets.add(
        addListener(
          browser.runtime.onMessage,
          this.onMessage.bind(this),
          "RendererProgram#onMessage"
        ),
        addEventListener(
          window,
          "pageshow",
          this.onPageShow.bind(this),
          "RendererProgram#onPageShow"
        )
      );

      try {
        // Don’t use `this.sendMessage` since it automatically catches and logs
        // errors.
        await browser.runtime.sendMessage(
          wrapMessage({ type: "RendererScriptAdded" })
        );
      } catch {
        // In Firefox, content scripts are loaded automatically in already
        // existing tabs. (Chrome only automatically loads content scripts into
        // _new_ tabs.) The content scripts run before the background scripts, so
        // this message can fail since there’s nobody listening on the other end.
        // Instead, the background script will send the "FirefoxWorkaround"
        // message to all existing tabs when it starts, allowing us to retry
        // sending "RendererScriptAdded" at that point. See: <bugzil.la/1474727>

        // Don’t set up the port below, since it will just immediately disconnect
        // (since the background script isn’t ready to connect yet). That would
        // cause `this.stop()` to be called, but we actually want to continue
        // running. As mentioned below, WebExtensions can’t really run any cleanup
        // logic in Firefox anyway.
        return;
      }

      // In Chrome, content scripts continue to live after the extension has been
      // disabled, uninstalled or reloaded. A way to detect this is to make a
      // `Port` and listen for `onDisconnect`. Then one can run some cleanup to
      // make the effectively disable the script.
      // In Firefox, content scripts are nuked when uninstalling. `onDisconnect`
      // never runs. Hopefully this changes some day, since we’d ideally want to
      // clean up injected.ts. There does not seem to be any good way of running
      // cleanups when a WebExtension is disabled in Firefox. See:
      // <bugzil.la/1223425>
      browser.runtime.connect().onDisconnect.addListener(() => {
        this.stop();
      });
    }

    stop() {
      log("log", "RendererProgram#stop");
      this.resets.reset();
      this.unrender();
    }

    sendMessage(message) {
      log("log", "RendererProgram#sendMessage", message.type, message);
      fireAndForget(
        browser.runtime.sendMessage(wrapMessage(message)).then(() => undefined),
        "RendererProgram#sendMessage",
        message
      );
    }

    onMessage(wrappedMessage) {
      // As mentioned in `this.start`, re-send the "RendererScriptAdded" message
      // in Firefox as a workaround for its content script loading quirks.
      if (wrappedMessage.type === "FirefoxWorkaround") {
        this.sendMessage({ type: "RendererScriptAdded" });
        return;
      }

      if (wrappedMessage.type !== "ToRenderer") {
        return;
      }

      const { message } = wrappedMessage;

      log("log", "RendererProgram#onMessage", message.type, message);

      switch (message.type) {
        case "StateSync": {
          const newCSS = `${CSS}\n\n${message.css}`;
          this.css.text !== newCSS;
          this.css.text = newCSS;
          log.level = message.logLevel;
          break;
        }

        case "Render":
          fireAndForget(
            this.render(message.elements, { mixedCase: message.mixedCase }),
            "RendererProgram#onMessage->render",
            message
          );
          break;

        case "UpdateHints":
          this.updateHints(message.updates, message.enteredText);
          break;

        case "RemoveShruggie":
          this.shruggieElement.remove();
          break;

        case "RotateHints":
          this.rotateHints({ forward: message.forward });
          break;

        case "RenderTextRects":
          this.unrenderTextRects(message.frameId);
          this.renderTextRects(message.rects, message.frameId);
          break;

        case "Peek":
          this.togglePeek({ peek: true });
          break;

        case "Unpeek":
          this.togglePeek({ peek: false });
          break;

        case "Unrender":
          this.unrender();
          break;
      }
    }

    onIntersection(entries) {
      // There will only be one entry.
      const entry = entries[0];
      if (entry.intersectionRatio !== 1) {
        requestAnimationFrame(() => {
          try {
            this.updateContainer(
              // `entry.rootBounds` is supposed to be the viewport size, but I've
              // noticed it being way larger in Chrome sometimes, so calculate it
              // manually there.
              "chrome" === "chrome"
                ? getViewport()
                : entry.rootBounds ?? getViewport()
            );
          } catch (error) {
            log(
              "error",
              "RendererProgram#onIntersection->updateContainer",
              entry,
              error
            );
          }
        });
      }
    }

    onResize() {
      this.updateContainer(getViewport());
    }

    // When coming back to a page via the back button in Firefox, there might be
    // left-over hints on screen that never got a chance to be unrendered. This
    // happens if the user clicks a link while hints mode is active, or if
    // clicking a link to a JSON file using hints. So always unrender when we
    // return to the page via the back/forward buttons.
    // `BackgroundProgram` also gets events when this happens from
    // `WorkerProgram`, so we _could_ do this in response to a message from
    // `BackgroundProgram` instead. However, by having our own listener we can
    // unrender faster, to avoid old hints flashing by on screen.
    onPageShow(event) {
      if (event.persisted) {
        this.unrender();
      }
    }

    updateContainer(viewport) {
      const container = this.container.element;

      setStyles(container, {
        left: "0",
        top: "0",
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
      });

      // If the `<html>` element has `transform: translate(...);` (some sites push
      // the entire page to the side when opening a sidebar menu using this
      // technique) we need to take that into account.
      const rect = container.getBoundingClientRect();
      if (rect.left !== 0) {
        setStyles(container, { left: `${-rect.left}px` });
      }
      if (rect.top !== 0) {
        setStyles(container, { top: `${-rect.top}px` });
      }
    }

    updateHintSize() {
      // Note: This requires that the container has been placed into the DOM.
      const { root } = this.container;

      // "W" is usually (one of) the widest character(s). This is surprisingly
      // cheap to calculate.
      const probe1 = createHintElement("W");
      const probe2 = createHintElement("WW");
      setStyles(probe1, { position: "absolute" });
      setStyles(probe2, { position: "absolute" });
      root.append(probe1);
      root.append(probe2);
      this.maybeApplyStyles(probe1);
      this.maybeApplyStyles(probe2);

      const rect1 = probe1.getBoundingClientRect();
      const rect2 = probe2.getBoundingClientRect();
      const widthPerLetter = rect2.width - rect1.width;
      const widthBase = rect1.width - widthPerLetter;
      const { height } = rect1;

      probe1.remove();
      probe2.remove();

      this.hintSize = {
        widthBase,
        widthPerLetter,
        height,
      };
    }

    async render(elements, { mixedCase }) {
      const time = new TimeTracker();

      time.start("prepare");
      this.unrender();
      const viewport = getViewport();
      const { root, shadowRoot } = this.container;

      // `style.sheet` below is only available after the container has been
      // inserted into the DOM.
      if (document.documentElement !== null) {
        document.documentElement.append(this.container.element);
      }

      if (this.css.parsed === undefined) {
        // Inserting a `<style>` element is way faster than doing
        // `element.style.setProperty()` on every element.
        const style = document.createElement("style");
        style.append(document.createTextNode(this.css.text));
        shadowRoot.append(style);
      }

      shadowRoot.append(root);
      this.maybeApplyStyles(root);
      this.updateContainer(viewport);
      this.updateHintSize();
      this.container.intersectionObserver.observe(this.container.element);
      this.container.resets.add(
        addEventListener(
          window,
          "resize",
          this.onResize.bind(this),
          "RendererProgram#onResize"
        ),
        addEventListener(
          window,
          "underflow",
          this.onResize.bind(this),
          "RendererProgram#onResize"
        )
      );

      if (elements.length === 0) {
        root.append(this.shruggieElement);
        this.maybeApplyStyles(this.shruggieElement);
        return;
      }

      const edgeElements = [];
      const restElements = [];
      let numEdgeElements = 0;

      for (const {
        hintMeasurements,
        hint,
        highlighted,
        invertedZIndex,
      } of elements) {
        time.start("loop:create");
        const element = createHintElement(hint);
        element.classList.toggle(HIGHLIGHTED_HINT_CLASS, highlighted);
        if (mixedCase) {
          element.classList.add(MIXED_CASE_CLASS);
        }

        time.start("loop:position");
        const { styles, maybeOutsideHorizontally } = getHintPosition({
          hintSize: this.hintSize,
          hint,
          hintMeasurements,
          viewport,
        });
        setStyles(element, {
          ...styles,
          // Remove 1 so that all hints stay below the status.
          "z-index": (MAX_Z_INDEX - invertedZIndex - 1).toString(),
        });

        time.start("loop:append");
        root.append(element);
        this.hints.push(element);

        this.maybeApplyStyles(element);

        if (
          numEdgeElements < t.MAX_IMMEDIATE_HINT_MOVEMENTS.value &&
          maybeOutsideHorizontally
        ) {
          numEdgeElements = edgeElements.push(element);
        } else {
          restElements.push(element);
        }
      }

      // This are appended last, so that the shruggie can be shown based on if
      // there are any non-hidden hints before it using CSS selectors.
      root.append(this.shruggieElement);
      root.append(this.statusElement);
      this.maybeApplyStyles(this.shruggieElement);
      this.maybeApplyStyles(this.statusElement);

      // Most hints are already correctly positioned, but some near the edges
      // might need to be moved a tiny bit to avoid being partially off-screen.
      // Do this in a separate animation frame if there are a lot of hints so
      // that the hints appear on screen as quickly as possible. Adjusting
      // positions is just a tweak – that can be delayed a little bit.
      time.start("move inside 1");
      if (numEdgeElements > 0) {
        this.moveInsideViewport(edgeElements, viewport);
      }

      time.start("waitUntilBeforeNextRepaint 1");
      await waitUntilBeforeNextRepaint();
      const firstPaintTimestamp = Date.now();

      time.start("move inside 2");
      // We just waited until just before the next repaint. Wait just a little bit
      // more (but not a full ~16ms frame) to let the hints appear on screen
      // before moving the remaining hints.
      await wait0();
      const moved = this.moveInsideViewport(restElements, viewport);

      // Only measure the next paint if we actually moved any hints inside the
      // viewport during the second round. This makes the performance report more
      // relevant.
      time.start("waitUntilBeforeNextRepaint 2");
      if (moved) {
        await waitUntilBeforeNextRepaint();
      }

      const lastPaintTimestamp = Date.now();

      this.sendMessage({
        type: "Rendered",
        firstPaintTimestamp,
        lastPaintTimestamp,
        durations: time.export(),
      });
    }

    updateHints(updates, enteredText) {
      const viewport = getViewport();
      const maybeNeedsMoveInsideViewport = [];

      for (const update of updates) {
        const child = this.hints[update.index];

        if (child === undefined) {
          log("error", "RendererProgram#updateHints: missing child", update);
          continue;
        }

        // Remember that `HIDDEN_CLASS` just sets `opacity: 0`, so rects will
        // still be available. If that opacity is customized, the chars and
        // position should still be correct.
        switch (update.type) {
          case "Hide":
            child.classList.add(HIDDEN_CLASS);
            break;

          case "UpdateContent": {
            // Avoid unnecessary flashing in the devtools when inspecting the hints.
            const zeroWidthSpace = "\u200B";
            const needsTextUpdate =
              child.textContent !==
              `${update.matchedChars}${zeroWidthSpace}${update.restChars}`;

            if (needsTextUpdate) {
              child.replaceChildren();
            }

            const hasMatchedChars = update.matchedChars !== "";

            child.classList.toggle(HIDDEN_CLASS, update.hidden);
            child.classList.toggle(HAS_MATCHED_CHARS_CLASS, hasMatchedChars);
            child.classList.toggle(HIGHLIGHTED_HINT_CLASS, update.highlighted);

            if (hasMatchedChars && needsTextUpdate) {
              const matched = document.createElement("span");
              matched.className = MATCHED_CHARS_CLASS;
              matched.append(document.createTextNode(update.matchedChars));
              child.append(matched);
              this.maybeApplyStyles(matched);
            }

            if (enteredText !== this.enteredText) {
              setStyles(child, {
                // Only update `z-index` when the entered text chars have changed
                // (that's the only time `z-index` _needs_ updating), to avoid
                // hints rotating back when entering hint chars.
                "z-index": (MAX_Z_INDEX - update.order).toString(),
              });
              // If the entered text chars have changed, the hints might have
              // changed as well and might not fit inside the viewport.
              maybeNeedsMoveInsideViewport.push(child);
            }

            if (needsTextUpdate) {
              child.append(
                document.createTextNode(`${zeroWidthSpace}${update.restChars}`)
              );
            }

            break;
          }

          case "UpdatePosition": {
            child.classList.toggle(HIDDEN_CLASS, update.hidden);
            child.classList.toggle(HIGHLIGHTED_HINT_CLASS, update.highlighted);
            const { styles } = getHintPosition({
              hintSize: this.hintSize,
              hint: update.hint,
              hintMeasurements: update.hintMeasurements,
              viewport,
            });
            const needsUpdate = Object.entries(styles).some(
              ([property, value]) =>
                child.style.getPropertyValue(property) !== value
            );
            if (needsUpdate) {
              // `update.order` could be used to update the z-index, but that is
              // currently unused due to the hints rotation feature.
              setStyles(child, styles);
              maybeNeedsMoveInsideViewport.push(child);
            }
            break;
          }
        }

        // Hidden hints get negative z-index so that visible hints are always
        // shown on top.
        const zIndex = Number(child.style.zIndex);
        const zIndexNeedsUpdate = child.classList.contains(HIDDEN_CLASS)
          ? zIndex > 0
          : zIndex < 0;
        if (zIndexNeedsUpdate) {
          setStyles(child, { "z-index": (-zIndex).toString() });
        }

        this.maybeApplyStyles(child);
      }

      this.maybeApplyStyles(this.shruggieElement);

      this.setStatus(enteredText.replace(/\s/g, "\u00a0"));

      if (maybeNeedsMoveInsideViewport.length > 0) {
        this.moveInsideViewport(maybeNeedsMoveInsideViewport, viewport);
      }

      this.enteredText = enteredText;
    }

    rotateHints({ forward }) {
      const sign = forward ? 1 : -1;
      const stacks = getStacks(this.hints, this.rects);
      for (const stack of stacks) {
        if (stack.length >= 2) {
          // All `z-index`:es are unique, so there’s no need for a stable sort.
          stack.sort(
            (a, b) => (Number(a.style.zIndex) - Number(b.style.zIndex)) * sign
          );
          const [first, ...rest] = stack.map((element) => element.style.zIndex);
          const zIndexes = [...rest, first];
          for (const [index, element] of stack.entries()) {
            setStyles(element, { "z-index": zIndexes[index] });
          }
        }
      }
    }

    renderTextRects(rects, frameId) {
      const { root } = this.container;
      for (const rect of rects) {
        const element = document.createElement("div");
        element.className = TEXT_RECT_CLASS;
        element.setAttribute("data-frame-id", frameId.toString());
        setStyles(element, {
          position: "absolute",
          left: `${rect.x}px`,
          top: `${rect.y}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          "z-index": MIN_Z_INDEX.toString(),
        });
        root.append(element);
      }
    }

    setStatus(status) {
      // Avoid unnecessary flashing in the devtools when inspecting the hints.
      if (this.statusText.data !== status) {
        this.statusText.data = status;
      }
      this.maybeApplyStyles(this.statusElement);
    }

    togglePeek({ peek }) {
      const { root } = this.container;
      root.classList.toggle(PEEK_CLASS, peek);
      this.maybeApplyStyles(root);
    }

    unrender() {
      this.hints = [];
      this.rects.clear();

      this.container.element.remove();
      this.container.root.classList.remove(PEEK_CLASS);
      this.maybeApplyStyles(this.shruggieElement);
      this.setStatus("");
      this.container.root.replaceChildren();
      this.container.shadowRoot.replaceChildren();
      this.container.resets.reset();
      this.container.intersectionObserver.disconnect();

      // In theory there can be several left-over elements with `id=CONTAINER_ID`.
      // `querySelectorAll` finds them all.
      const containers = document.querySelectorAll(`#${CONTAINER_ID}`);
      for (const container of containers) {
        container.remove();
      }
    }

    unrenderTextRects(frameId) {
      const selector =
        frameId === undefined
          ? `.${TEXT_RECT_CLASS}`
          : `.${TEXT_RECT_CLASS}[data-frame-id="${frameId}"]`;
      for (const element of this.container.root.querySelectorAll(selector)) {
        element.remove();
      }
    }

    // It’s important to use `setStyles` instead of `.style.foo =` in this file,
    // since `applyStyles` could override inline styles otherwise.
    maybeApplyStyles(element) {}

    moveInsideViewport(elements, viewport) {
      let moved = false;

      for (const element of elements) {
        // Reset `margin-right` before measuring. That’s the easiest way, and does
        // not seem to be expensive performance wise.
        setStyles(element, { "margin-right": "" });

        const rect = element.getBoundingClientRect();

        // Save the rect for `rotateHints`.
        this.rects.set(element, rect);

        // The hints are always inside the viewport vertically, so only check
        // horizontally. Note that the width of the hints will be a fractional
        // number in Chrome.

        const left = Math.round(rect.left);
        if (left < 0) {
          setStyles(element, { "margin-right": `${left}px` });
          moved = true;
        }

        const right = Math.round(rect.right - viewport.width);
        if (right > 0) {
          setStyles(element, {
            "margin-right": `${right}px`,
          });
          moved = true;
        }
      }

      return moved;
    }
  }

  function wrapMessage(message) {
    return {
      type: "FromRenderer",
      message,
    };
  }

  function createHintElement(hint) {
    const element = document.createElement("div");
    element.className = HINT_CLASS;
    element.append(document.createTextNode(hint));
    return element;
  }

  function getStacks(originalElements, rects) {
    // `elements` will be mutated and eventually empty.
    const elements = originalElements.slice();
    const stacks = [];

    while (elements.length > 0) {
      stacks.push(getStackFor(elements.pop(), elements, rects));
    }

    return stacks;
  }

  // Get an array containing `element` and all elements that overlap `element`, if
  // any, which is called a "stack". All elements in the returned stack are spliced
  // out from `elements`, thus mutating it.
  function getStackFor(element, elements, rects) {
    const stack = [element];

    let index = 0;
    while (index < elements.length) {
      const nextElement = elements[index];

      // Stacks contain only hidden or only shown elements.
      if (
        element.classList.contains(HIDDEN_CLASS) !==
        nextElement.classList.contains(HIDDEN_CLASS)
      ) {
        index += 1;
        continue;
      }

      // In practice, `rects` will already contain all rects needed (since all
      // hint elements are run through `moveInsideViewport`), so
      // `.getBoundingClientRect()` never hits here. That is a major performance
      // boost.
      const rect = rects.get(element) ?? element.getBoundingClientRect();
      const nextRect =
        rects.get(nextElement) ?? nextElement.getBoundingClientRect();

      if (overlaps(nextRect, rect)) {
        // Also get all elements overlapping this one.
        elements.splice(index, 1);
        stack.push(...getStackFor(nextElement, elements, rects));
      } else {
        // Continue the search.
        index += 1;
      }
    }

    return stack;
  }

  function overlaps(rectA, rectB) {
    return (
      rectA.right >= rectB.left &&
      rectA.left <= rectB.right &&
      rectA.bottom >= rectB.top &&
      rectA.top <= rectB.bottom
    );
  }

  function getHintPosition({ hintSize, hint, hintMeasurements, viewport }) {
    const width = Math.ceil(
      hintSize.widthBase + hintSize.widthPerLetter * hint.length
    );

    const alignLeft =
      hintMeasurements.align === "left" &&
      // If the hint would end up covering the element, align right instead.
      // This is useful for the tiny voting arrows on hackernews.
      hintMeasurements.x + width < hintMeasurements.maxX;

    const left = Math.round(hintMeasurements.x);
    const right = Math.round(viewport.width - hintMeasurements.x);
    const top = Math.max(
      0,
      Math.min(
        Math.floor(viewport.height - hintSize.height),
        Math.round(hintMeasurements.y - hintSize.height / 2)
      )
    );

    const maybeOutsideHorizontally = alignLeft
      ? left + width >= viewport.width
      : right + width >= viewport.width;

    return {
      styles: {
        position: "absolute",
        left: alignLeft ? `${left}px` : "",
        // This could also be done using `left` and
        // `transform: translateX(-100%)`, but that results in blurry hints in
        // Chrome due to Chrome making the widths of the hints non-integer based
        // on the font.
        right: alignLeft ? "" : `${right}px`,
        top: `${top}px`,
      },
      maybeOutsideHorizontally,
    };
  }

  async function waitUntilBeforeNextRepaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  async function wait0() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  const program = new RendererProgram();
  fireAndForget(program.start(), "main->RendererProgram#start");
})();
