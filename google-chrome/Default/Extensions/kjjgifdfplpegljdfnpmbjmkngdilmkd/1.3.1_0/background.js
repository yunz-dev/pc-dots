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

  // Generated by CoffeeScript 1.12.7

  /*
   * Copyright 2014, 2015, 2016 Simon Lydell
   * X11 (“MIT”) Licensed. (See LICENSE.)
   */
  var BranchPoint, createTree;

  createTree = function (elements, numBranches, options) {
    var branchPointIndex,
      branchPoints,
      childIndex,
      children,
      element,
      elementIndex,
      latestBranchPointIndex,
      lowestWeight,
      nextBranchPoint,
      nextElement,
      numBranchPoints,
      numChildren,
      numElements,
      numPadding,
      root,
      weight;
    if (options == null) {
      options = {};
    }
    if (!(numBranches >= 2)) {
      throw new RangeError("`n` must be at least 2");
    }
    numElements = elements.length;
    if (numElements === 0) {
      return new BranchPoint([], 0);
    }
    if (numElements === 1) {
      element = elements[0];
      return new BranchPoint([element], element.weight);
    }
    if (!options.sorted) {
      elements = elements.slice(0).sort(function (a, b) {
        return b.weight - a.weight;
      });
    }
    numBranchPoints = Math.ceil((numElements - 1) / (numBranches - 1));
    numPadding = 1 + (numBranches - 1) * numBranchPoints - numElements;
    branchPoints = Array(numBranchPoints);
    latestBranchPointIndex = 0;
    branchPointIndex = 0;
    elementIndex = numElements - 1;
    if (numPadding > 0) {
      numChildren = numBranches - numPadding;
      weight = 0;
      children = Array(numChildren);
      childIndex = 0;
      while (childIndex < numChildren) {
        element = elements[elementIndex];
        children[childIndex] = element;
        weight += element.weight;
        elementIndex--;
        childIndex++;
      }
      branchPoints[0] = new BranchPoint(children, weight);
      latestBranchPointIndex = 1;
    }
    nextElement = elementIndex >= 0 ? elements[elementIndex] : null;
    while (latestBranchPointIndex < numBranchPoints) {
      weight = 0;
      children = Array(numBranches);
      childIndex = 0;
      nextBranchPoint = branchPoints[branchPointIndex];
      while (childIndex < numBranches) {
        if (
          nextElement == null ||
          (nextBranchPoint != null &&
            nextBranchPoint.weight <= nextElement.weight)
        ) {
          lowestWeight = nextBranchPoint;
          branchPointIndex++;
          nextBranchPoint = branchPoints[branchPointIndex];
        } else {
          lowestWeight = nextElement;
          elementIndex--;
          nextElement = elementIndex >= 0 ? elements[elementIndex] : null;
        }
        children[childIndex] = lowestWeight;
        weight += lowestWeight.weight;
        childIndex++;
      }
      branchPoints[latestBranchPointIndex] = new BranchPoint(children, weight);
      latestBranchPointIndex++;
    }
    root = branchPoints[numBranchPoints - 1];
    return root;
  };

  BranchPoint = (function () {
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

  var nAryHuffman = {
    createTree: createTree,
    BranchPoint: BranchPoint,
  };

  const ElementType = stringUnion({
    "clickable-event": null,
    clickable: null,
    label: null,
    link: null,
    scrollable: null,
    selectable: null,
    textarea: null,
  });

  function elementKey(element) {
    const { x, y, align } = element.hintMeasurements;
    return [x, y, align, element.hint].join("\n");
  }

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

  // Allow exiting hints mode if we ever get stuck in Prevent overtyping mode.
  const PREVENT_OVERTYPING_ALLOWED_KEYBOARD_ACTIONS = new Set([
    "Escape",
    "ExitHintsMode",
  ]);

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

  const EN_US_QWERTY_TRANSLATIONS = {
    Backquote: ["`", "~"],
    Backslash: ["\\", "|"],
    BracketLeft: ["[", "{"],
    BracketRight: ["]", "}"],
    Comma: [",", "<"],
    Digit0: ["0", ")"],
    Digit1: ["1", "!"],
    Digit2: ["2", "@"],
    Digit3: ["3", "#"],
    Digit4: ["4", "$"],
    Digit5: ["5", "%"],
    Digit6: ["6", "^"],
    Digit7: ["7", "&"],
    Digit8: ["8", "*"],
    Digit9: ["9", "("],
    Equal: ["=", "+"],
    KeyA: ["a", "A"],
    KeyB: ["b", "B"],
    KeyC: ["c", "C"],
    KeyD: ["d", "D"],
    KeyE: ["e", "E"],
    KeyF: ["f", "F"],
    KeyG: ["g", "G"],
    KeyH: ["h", "H"],
    KeyI: ["i", "I"],
    KeyJ: ["j", "J"],
    KeyK: ["k", "K"],
    KeyL: ["l", "L"],
    KeyM: ["m", "M"],
    KeyN: ["n", "N"],
    KeyO: ["o", "O"],
    KeyP: ["p", "P"],
    KeyQ: ["q", "Q"],
    KeyR: ["r", "R"],
    KeyS: ["s", "S"],
    KeyT: ["t", "T"],
    KeyU: ["u", "U"],
    KeyV: ["v", "V"],
    KeyW: ["w", "W"],
    KeyX: ["x", "X"],
    KeyY: ["y", "Y"],
    KeyZ: ["z", "Z"],
    Minus: ["-", "_"],
    Period: [".", ">"],
    Quote: ["'", '"'],
    Semicolon: [";", ":"],
    Slash: ["/", "?"],
  };

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

  function getDefaults({ mac }) {
    function shortcut({
      key,
      alt = false,
      cmd = false,
      ctrl = false,
      shift = false,
    }) {
      return { key, alt, cmd, ctrl, shift };
    }

    function mainShortcut(key) {
      return {
        key,
        alt: !mac,
        cmd: false,
        ctrl: mac,
        shift: false,
      };
    }

    return {
      chars: "fjdkslaurieowhgmvcn",
      autoActivate: true,
      // This is the "prevent overtyping" timeout from VimFx.
      overTypingDuration: 400, // ms
      css: "",
      logLevel: DEFAULT_LOG_LEVEL,
      useKeyTranslations: false,
      keyTranslations: EN_US_QWERTY_TRANSLATIONS,
      normalKeyboardShortcuts: [
        {
          shortcut: mainShortcut("j"),
          action: "EnterHintsMode_Click",
        },
        {
          shortcut: mainShortcut("k"),
          action: "EnterHintsMode_BackgroundTab",
        },
        {
          shortcut: mainShortcut("l"),
          action: "EnterHintsMode_ForegroundTab",
        },
        {
          shortcut: mainShortcut("J"),
          action: "EnterHintsMode_ManyClick",
        },
        {
          shortcut: mainShortcut("K"),
          action: "EnterHintsMode_ManyTab",
        },
        {
          shortcut: mainShortcut("L"),
          action: "EnterHintsMode_Select",
        },
        {
          shortcut: shortcut({
            key: "ArrowUp",
            alt: !mac,
            ctrl: mac,
            shift: true,
          }),
          action: "ReverseSelection",
        },
        {
          shortcut: shortcut({
            key: "Escape",
            shift: true,
          }),
          action: "Escape",
        },
      ],
      hintsKeyboardShortcuts: [
        {
          shortcut: shortcut({
            key: "Enter",
          }),
          action: "ActivateHint",
        },
        {
          shortcut: shortcut({
            key: "Enter",
            alt: !mac,
            ctrl: mac,
          }),
          action: "ActivateHintAlt",
        },
        {
          shortcut: shortcut({
            key: "Backspace",
          }),
          action: "Backspace",
        },
        {
          shortcut: shortcut({
            key: "Tab",
          }),
          action: "RotateHintsForward",
        },
        {
          shortcut: shortcut({
            key: "Tab",
            shift: true,
          }),
          action: "RotateHintsBackward",
        },
        {
          shortcut: shortcut({
            key: "r",
            cmd: mac,
            ctrl: !mac,
          }),
          action: "RefreshHints",
        },
        {
          shortcut: shortcut({
            key: "p",
            cmd: mac,
            ctrl: !mac,
          }),
          action: "TogglePeek",
        },
        {
          shortcut: shortcut({
            key: "Escape",
          }),
          action: "ExitHintsMode",
        },
        {
          shortcut: shortcut({
            key: "Escape",
            shift: true,
          }),
          action: "Escape",
        },
      ],
    };
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

  async function getRawOptions() {
    const raw = await browser.storage.sync.get();
    // Exclude all tweakables since they are handled completely differently.
    return Object.fromEntries(
      Object.entries(raw).filter(([key]) => !key.startsWith(DEBUG_PREFIX))
    );
  }

  function diffOptions(defaults, fullOptions, saved) {
    const keysToRemove = [];
    const optionsToSet = {};

    // `defaults` and `fullOptions` have some keys in common. `fullOptions` might
    // have removed some keys present in `defaults`, and added some new ones. If
    // added ones are later removed, those are only present in `saved`.
    const allKeys = new Set([
      ...Object.keys(defaults),
      ...Object.keys(fullOptions),
      ...Object.keys(saved),
    ]);

    for (const key of allKeys) {
      if (
        Object.prototype.hasOwnProperty.call(defaults, key) &&
        !Object.prototype.hasOwnProperty.call(fullOptions, key)
      ) {
        // Default deleted; only set if needed.
        if (saved[key] !== null) {
          // Mark as deleted.
          optionsToSet[key] = null;
        }
      } else if (
        !Object.prototype.hasOwnProperty.call(defaults, key) &&
        Object.prototype.hasOwnProperty.call(fullOptions, key)
      ) {
        // Added new; only set if needed.
        if (!deepEqual(fullOptions[key], saved[key])) {
          optionsToSet[key] = fullOptions[key];
        }
      } else if (deepEqual(fullOptions[key], defaults[key])) {
        // Option is the same as default; remove if needed.
        if (Object.prototype.hasOwnProperty.call(saved, key)) {
          keysToRemove.push(key);
        }
      } else if (
        Object.prototype.hasOwnProperty.call(saved, key) &&
        !Object.prototype.hasOwnProperty.call(fullOptions, key)
      ) {
        // Extra deleted; remove.
        keysToRemove.push(key);
      } else if (!deepEqual(fullOptions[key], saved[key])) {
        // Set user option, if needed.
        optionsToSet[key] = fullOptions[key];
      }
    }

    return {
      keysToRemove,
      optionsToSet,
    };
  }

  const MAX_PERF_ENTRIES = 9;

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

  // As far as I can tell, the top frameId is always 0. This is also mentioned here:
  // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/Tabs/executeScript
  // “frameId: Optional integer. The frame where the code should be injected.
  // Defaults to 0 (the top-level frame).”
  const TOP_FRAME_ID = 0;

  const t = {
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

  tweakable("Background", t);

  class BackgroundProgram {
    options;

    tabState = new Map();

    restoredTabsPerf = {};

    oneTimeWindowMessageToken = makeRandomToken();

    resets = new Resets();

    constructor() {
      const mac = false;
      const defaults = getDefaults({ mac });
      this.options = {
        defaults,
        values: defaults,
        raw: {},
        errors: [],
        mac,
      };
    }

    async start() {
      log("log", "BackgroundProgram#start", "chrome", true);

      try {
        await this.updateOptions({ isInitial: true });
      } catch (errorAny) {
        const error = errorAny;
        this.options.errors = [error.message];
      }

      const tabs = await browser.tabs.query({});

      this.resets.add(
        addListener(
          browser.runtime.onMessage,
          this.onMessage.bind(this),
          "BackgroundProgram#onMessage"
        ),
        addListener(
          browser.runtime.onConnect,
          this.onConnect.bind(this),
          "BackgroundProgram#onConnect"
        ),
        addListener(
          browser.tabs.onActivated,
          this.onTabActivated.bind(this),
          "BackgroundProgram#onTabActivated"
        ),
        addListener(
          browser.tabs.onCreated,
          this.onTabCreated.bind(this),
          "BackgroundProgram#onTabCreated"
        ),
        addListener(
          browser.tabs.onUpdated,
          this.onTabUpdated.bind(this),
          "BackgroundProgram#onTabUpdated",
          // Chrome doesn’t support filters.
          undefined
        ),
        addListener(
          browser.tabs.onRemoved,
          this.onTabRemoved.bind(this),
          "BackgroundProgram#onTabRemoved"
        )
      );

      for (const tab of tabs) {
        if (tab.id !== undefined) {
          fireAndForget(
            this.updateIcon(tab.id),
            "BackgroundProgram#start->updateIcon",
            tab
          );
        }
      }

      fireAndForget(
        browser.browserAction.setBadgeBackgroundColor({ color: "#323234" }),
        "BackgroundProgram#start->setBadgeBackgroundColor"
      );

      fireAndForget(
        this.maybeOpenTutorial(),
        "BackgroundProgram#start->maybeOpenTutorial"
      );

      fireAndForget(
        this.maybeReopenOptions(),
        "BackgroundProgram#start->maybeReopenOptions"
      );

      // Firefox automatically loads content scripts into existing tabs, while
      // Chrome only automatically loads content scripts into _new_ tabs.
      // Firefox requires a workaround (see renderer/Program.ts), while we
      // manually load the content scripts into existing tabs in Chrome.
      {
        await runContentScripts(tabs);
      }
    }

    stop() {
      log("log", "BackgroundProgram#stop");
      this.resets.reset();
    }

    sendWorkerMessage(message, recipient) {
      log("log", "BackgroundProgram#sendWorkerMessage", message, recipient);
      fireAndForget(
        this.sendContentMessage({ type: "ToWorker", message }, recipient),
        "BackgroundProgram#sendWorkerMessage",
        message,
        recipient
      );
    }

    sendRendererMessage(message, { tabId }) {
      const recipient = { tabId, frameId: TOP_FRAME_ID };
      log("log", "BackgroundProgram#sendRendererMessage", message, recipient);
      fireAndForget(
        this.sendContentMessage({ type: "ToRenderer", message }, recipient),
        "BackgroundProgram#sendRendererMessage",
        message,
        recipient
      );
    }

    sendPopupMessage(message) {
      log("log", "BackgroundProgram#sendPopupMessage", message);
      fireAndForget(
        this.sendBackgroundMessage({ type: "ToPopup", message }),
        "BackgroundProgram#sendPopupMessage",
        message
      );
    }

    sendOptionsMessage(message) {
      const optionsTabOpen = Array.from(this.tabState).some(
        ([, tabState]) => tabState.isOptionsPage
      );
      // Trying to send a message to Options when no Options tab is open results
      // in "errors" being logged to the console.
      if (optionsTabOpen) {
        log("log", "BackgroundProgram#sendOptionsMessage", message);
        fireAndForget(
          this.sendBackgroundMessage({ type: "ToOptions", message }),
          "BackgroundProgram#sendOptionsMessage",
          message
        );
      }
    }

    // This might seem like sending a message to oneself, but
    // `browser.runtime.sendMessage` seems to only send messages to *other*
    // background scripts, such as the popup script.
    async sendBackgroundMessage(message) {
      await browser.runtime.sendMessage(message);
    }

    async sendContentMessage(message, { tabId, frameId }) {
      await (frameId === "all_frames"
        ? browser.tabs.sendMessage(tabId, message)
        : browser.tabs.sendMessage(tabId, message, { frameId }));
    }

    // Warning: Don’t make this method async! If a new tab gets for example 3
    // events in a short time just after being opened, those three events might
    // overwrite each other. Expected execution:
    //
    // 1. Process event1.
    // 2. Process event2.
    // 3. Process event3.
    //
    // Async execution (for very close events):
    //
    // 1. Start processing event1 until the first `await`.
    // 2. Start processing event2 until the first `await`.
    // 3. Start processing event3 until the first `await`.
    // 4. Finish processing event1 (assuming no more `await`s).
    // 5. Finish processing event2 (assuming no more `await`s).
    // 6. Finish processing event3 (assuming no more `await`s).
    //
    // In the async case, all of the events might try to do `this.tabState.set()`.
    //
    // This happens when opening the Options page: WorkerScriptAdded,
    // OptionsScriptAdded and RendererScriptAdded are all triggered very close to
    // each other. An overwrite can cause us to lose `tabState.isOptionsPage`,
    // breaking shortcuts customization.
    onMessage(message, sender) {
      // `info` can be missing when the message comes from for example the popup
      // (which isn’t associated with a tab). The worker script can even load in
      // an `about:blank` frame somewhere when hovering the browserAction!
      const info = makeMessageInfo(sender);

      const tabStateRaw =
        info === undefined ? undefined : this.tabState.get(info.tabId);
      const tabState =
        tabStateRaw === undefined
          ? makeEmptyTabState(info?.tabId)
          : tabStateRaw;

      if (info !== undefined && tabStateRaw === undefined) {
        const { [info.tabId.toString()]: perf = [] } = this.restoredTabsPerf;
        tabState.perf = perf;
        this.tabState.set(info.tabId, tabState);
      }

      switch (message.type) {
        case "FromWorker":
          if (info !== undefined) {
            try {
              this.onWorkerMessage(message.message, info, tabState);
            } catch (error) {
              log(
                "error",
                "BackgroundProgram#onWorkerMessage",
                error,
                message.message,
                info
              );
            }
          }
          break;

        case "FromRenderer":
          if (info !== undefined) {
            try {
              this.onRendererMessage(message.message, info, tabState);
            } catch (error) {
              log(
                "error",
                "BackgroundProgram#onRendererMessage",
                error,
                message.message,
                info
              );
            }
          }
          break;

        case "FromPopup":
          fireAndForget(
            this.onPopupMessage(message.message),
            "BackgroundProgram#onPopupMessage",
            message.message,
            info
          );
          break;

        case "FromOptions":
          if (info !== undefined) {
            fireAndForget(
              this.onOptionsMessage(message.message, info, tabState),
              "BackgroundProgram#onOptionsMessage",
              message.message,
              info
            );
          }
          break;
      }
    }

    onConnect(port) {
      port.onDisconnect.addListener(({ sender }) => {
        const info = sender === undefined ? undefined : makeMessageInfo(sender);
        if (info !== undefined) {
          // A frame was removed. If in hints mode, hide all hints for elements in
          // that frame.
          this.hideElements(info);
        }
      });
    }

    onWorkerMessage(message, info, tabState) {
      log("log", "BackgroundProgram#onWorkerMessage", message, info);

      switch (message.type) {
        case "WorkerScriptAdded":
          this.sendWorkerMessage(
            // Make sure that the added worker script gets the same token as all
            // other frames in the page. Otherwise the first hints mode won't
            // reach into any frames.
            this.makeWorkerState(tabState, { refreshToken: false }),
            {
              tabId: info.tabId,
              frameId: info.frameId,
            }
          );
          break;

        case "KeyboardShortcutMatched":
          this.onKeyboardShortcut(message.action, info, message.timestamp);
          break;

        case "NonKeyboardShortcutKeypress":
          this.handleHintInput(info.tabId, message.timestamp, {
            type: "Input",
            keypress: message.keypress,
          });
          break;

        case "KeypressCaptured":
          this.sendOptionsMessage({
            type: "KeypressCaptured",
            keypress: message.keypress,
          });
          break;

        case "ReportVisibleFrame": {
          const { hintsState } = tabState;
          if (hintsState.type !== "Collecting") {
            return;
          }

          const { pendingFrames } = hintsState.pendingElements;
          pendingFrames.answering = Math.max(0, pendingFrames.answering - 1);
          pendingFrames.collecting += 1;
          break;
        }

        case "ReportVisibleElements": {
          const { hintsState } = tabState;
          if (hintsState.type !== "Collecting") {
            return;
          }

          const elements = message.elements.map((element) => ({
            ...element,
            // Move the element index into the `.frame` property. `.index` is set
            // later (in `this.maybeStartHinting`) and used to map elements in
            // BackgroundProgram to DOM elements in RendererProgram.
            index: -1,
            frame: { id: info.frameId, index: element.index },
            hidden: false,
          }));

          hintsState.pendingElements.elements.push(...elements);

          const { pendingFrames } = hintsState.pendingElements;
          pendingFrames.answering += message.numFrames;
          pendingFrames.collecting = Math.max(0, pendingFrames.collecting - 1);

          hintsState.stats.push(message.stats);

          if (message.numFrames === 0) {
            this.maybeStartHinting(info.tabId);
          } else {
            pendingFrames.lastStartWaitTimestamp = Date.now();
            this.setTimeout(info.tabId, t.FRAME_REPORT_TIMEOUT.value);
          }
          break;
        }

        case "ReportUpdatedElements": {
          const { hintsState } = tabState;
          if (hintsState.type !== "Hinting") {
            return;
          }

          const updatedElementsWithHints = mergeElements(
            hintsState.elementsWithHints,
            message.elements,
            info.frameId
          );

          const { enteredChars, enteredText } = hintsState;

          const { allElementsWithHints, updates } = updateHints({
            mode: hintsState.mode,
            enteredChars,
            enteredText,
            elementsWithHints: updatedElementsWithHints,
            highlighted: hintsState.highlighted,
            chars: this.options.values.chars,
            autoActivate: this.options.values.autoActivate,
            matchHighlighted: false,
            updateMeasurements: true,
          });

          hintsState.elementsWithHints = allElementsWithHints;

          this.sendRendererMessage(
            {
              type: "UpdateHints",
              updates,
              enteredText,
            },
            { tabId: info.tabId }
          );

          this.sendRendererMessage(
            {
              type: "RenderTextRects",
              rects: message.rects,
              frameId: info.frameId,
            },
            { tabId: info.tabId }
          );

          this.updateBadge(info.tabId);

          if (info.frameId === TOP_FRAME_ID) {
            const { updateState } = hintsState;

            const now = Date.now();
            const elapsedTime = now - updateState.lastUpdateStartTimestamp;
            const timeout = Math.max(
              t.UPDATE_MIN_TIMEOUT.value,
              t.UPDATE_INTERVAL.value - elapsedTime
            );

            log("log", "Scheduling next elements update", {
              elapsedTime,
              timeout,
              UPDATE_INTERVAL: t.UPDATE_INTERVAL.value,
              UPDATE_MIN_TIMEOUT: t.UPDATE_MIN_TIMEOUT.value,
            });

            hintsState.updateState = {
              type: "WaitingForTimeout",
              lastUpdateStartTimestamp: updateState.lastUpdateStartTimestamp,
            };

            this.setTimeout(info.tabId, timeout);
          }
          break;
        }

        case "ReportTextRects":
          this.sendRendererMessage(
            {
              type: "RenderTextRects",
              rects: message.rects,
              frameId: info.frameId,
            },
            { tabId: info.tabId }
          );
          break;

        // When clicking a link using the extension that causes a page load (no
        // `.preventDefault()`, no internal fragment identifier, no `javascript:`
        // protocol, etc), exit hints mode. This is especially nice for the
        // "ManyClick" mode since it makes the hints go away immediately when
        // clicking the link rather than after a little while when the "pagehide"
        // event has fired.
        case "ClickedLinkNavigatingToOtherPage": {
          const { hintsState } = tabState;
          if (hintsState.type !== "Idle") {
            // Exit in “Delayed” mode so that the matched hints still show as
            // highlighted.
            this.exitHintsMode({ tabId: info.tabId, delayed: true });
          }
          break;
        }

        // If the user clicks a link while hints mode is active, exit it.
        // Otherwise you’ll end up in hints mode on the new page (it is still the
        // same tab, after all) but with no hints. If changing the address bar of
        // the tab to for example `about:preferences` it is too late to send
        // message to the content scripts (“Error: Receiving end does not exist”).
        // Instead, syncing `WorkerProgram`s and unrendering is taken care of
        // if/when returning to the page via the back button. (See below.)
        case "TopPageHide": {
          const { hintsState } = tabState;
          if (hintsState.type !== "Idle") {
            this.exitHintsMode({ tabId: info.tabId, sendMessages: false });
          }
          break;
        }

        // When clicking the back button In Firefox, the content scripts of the
        // previous page aren’t re-run but instead pick up from where they were
        // when leaving the page. If the user clicked a link while in hints mode
        // and then pressed the back button, the `tabState` for the tab won’t be
        // in hints mode, but the content scripts of the page might be out of
        // sync. They never got any messages saying that hints mode was exited,
        // and now they pick up from where they were. So after returning to a page
        // via the back/forward buttons, make sure that the content scripts are in
        // sync.
        case "PersistedPageShow":
          this.sendWorkerMessage(this.makeWorkerState(tabState), {
            tabId: info.tabId,
            frameId: "all_frames",
          });
          break;
      }
    }

    // Instead of doing `setTimeout(doSomething, duration)`, call
    // `this.setTimeout(tabId, duration)` instead and add
    // `this.doSomething(tabId)` to `onTimeout` below. Every method called from
    // `onTimeout` is responsible for checking that everything is in the correct
    // state and that the correct amount of time has passed. No matter when or
    // from where or in which state `onTimeout` is called, it should always do the
    // correct thing. This means that we never have to clear any timeouts, which
    // is very tricky to keep track of.
    setTimeout(tabId, duration) {
      setTimeout(() => {
        try {
          this.onTimeout(tabId);
        } catch (error) {
          log("error", "BackgroundProgram#onTimeout", error, tabId);
        }
      }, duration);
    }

    onTimeout(tabId) {
      this.updateBadge(tabId);
      this.maybeStartHinting(tabId);
      this.updateElements(tabId);
      this.unhighlightHints(tabId);
      this.stopPreventOvertyping(tabId);
    }

    getTextRects({ enteredChars, allElementsWithHints, words, tabId }) {
      const indexesByFrame = new Map();
      for (const { text, hint, frame } of allElementsWithHints) {
        const previous = indexesByFrame.get(frame.id) ?? [];
        indexesByFrame.set(frame.id, previous);
        if (matchesText(text, words) && hint.startsWith(enteredChars)) {
          previous.push(frame.index);
        }
      }
      for (const [frameId, indexes] of indexesByFrame) {
        this.sendWorkerMessage(
          {
            type: "GetTextRects",
            indexes,
            words,
          },
          { tabId, frameId }
        );
      }
    }

    handleHintInput(tabId, timestamp, input) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      const { hintsState } = tabState;
      if (hintsState.type !== "Hinting") {
        return;
      }

      // Ignore unknown/non-text keys.
      if (input.type === "Input" && input.keypress.printableKey === undefined) {
        return;
      }

      const isHintKey =
        (input.type === "Input" &&
          input.keypress.printableKey !== undefined &&
          this.options.values.chars.includes(input.keypress.printableKey)) ||
        (input.type === "Backspace" && hintsState.enteredChars !== "");

      // Disallow filtering by text after having started entering hint chars.
      if (
        !isHintKey &&
        input.type !== "ActivateHint" &&
        hintsState.enteredChars !== ""
      ) {
        return;
      }

      // Update entered chars (either text chars or hint chars).
      const updated = updateChars(
        isHintKey ? hintsState.enteredChars : hintsState.enteredText,
        input
      );
      const enteredChars = isHintKey ? updated : hintsState.enteredChars;
      const enteredText = isHintKey
        ? hintsState.enteredText
        : updated
            .toLowerCase()
            // Trim leading whitespace and allow only one trailing space.
            .replace(/^\s+/, "")
            .replace(/\s+$/, " ");

      const {
        allElementsWithHints,
        match: actualMatch,
        updates,
        words,
      } = updateHints({
        mode: hintsState.mode,
        enteredChars,
        enteredText,
        elementsWithHints: hintsState.elementsWithHints,
        highlighted: hintsState.highlighted,
        chars: this.options.values.chars,
        autoActivate: this.options.values.autoActivate,
        matchHighlighted: input.type === "ActivateHint",
        updateMeasurements: false,
      });

      // Disallow matching hints (by text) by backspacing away chars. This can
      // happen if your entered text matches two links and then the link you
      // were after is removed.
      const [match, preventOverTyping] =
        input.type === "Backspace" || actualMatch === undefined
          ? [undefined, false]
          : [actualMatch.elementWithHint, actualMatch.autoActivated];

      // If pressing a hint char that is currently unused, ignore it.
      if (enteredChars !== "" && updates.every((update) => update.hidden)) {
        return;
      }

      const now = Date.now();
      const highlighted =
        match !== undefined
          ? allElementsWithHints
              .filter((element) => element.hint === match.hint)
              .map((element) => ({ sinceTimestamp: now, element }))
          : [];

      hintsState.enteredChars = enteredChars;
      hintsState.enteredText = enteredText;
      hintsState.elementsWithHints = allElementsWithHints;
      hintsState.highlighted = hintsState.highlighted.concat(highlighted);

      this.getTextRects({
        enteredChars,
        allElementsWithHints,
        words,
        tabId,
      });

      const shouldContinue =
        match === undefined
          ? true
          : this.handleHintMatch({
              tabId,
              match,
              updates,
              preventOverTyping,
              alt:
                // By holding a modifier while typing the last character to
                // activate a hint forces opening links in new tabs. On Windows
                // and Linux, alt is used (since it is the only safe modifier). On
                // mac, ctrl is used since alt/option types special characters and
                // cmd is not safe.
                (input.type === "Input" &&
                  (this.options.mac
                    ? input.keypress.ctrl
                    : input.keypress.alt)) ||
                (input.type === "ActivateHint" && input.alt),
              timestamp,
            });

      // Some hint modes handle updating hintsState and sending messages
      // themselves. The rest share the same implementation below.
      if (!shouldContinue) {
        return;
      }

      this.sendRendererMessage(
        {
          type: "UpdateHints",
          updates,
          enteredText,
        },
        { tabId }
      );

      if (match !== undefined) {
        tabState.hintsState = {
          type: "Idle",
          highlighted: hintsState.highlighted,
        };
        this.setTimeout(tabId, t.MATCH_HIGHLIGHT_DURATION.value);
        this.updateWorkerStateAfterHintActivation({
          tabId,
          preventOverTyping,
        });
      }

      this.updateBadge(tabId);
    }

    // Executes some action on the element of the matched hint. Returns whether
    // the "NonKeyboardShortcutKeypress" handler should continue with its default
    // implementation for updating hintsState and sending messages or not. Some
    // hint modes handle that themselves.
    handleHintMatch({
      tabId,
      match,
      updates,
      preventOverTyping,
      alt,
      timestamp,
    }) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return true;
      }

      const { hintsState } = tabState;
      if (hintsState.type !== "Hinting") {
        return true;
      }

      const { url } = match;

      const mode =
        url !== undefined && alt && hintsState.mode !== "Select"
          ? "ForegroundTab"
          : hintsState.mode;

      switch (mode) {
        case "Click":
          this.sendWorkerMessage(
            {
              type: "ClickElement",
              index: match.frame.index,
            },
            {
              tabId,
              frameId: match.frame.id,
            }
          );
          return true;

        case "ManyClick": {
          if (match.isTextInput) {
            this.sendWorkerMessage(
              {
                type: "ClickElement",
                index: match.frame.index,
              },
              {
                tabId,
                frameId: match.frame.id,
              }
            );
            return true;
          }

          this.sendWorkerMessage(
            {
              type: "ClickElement",
              index: match.frame.index,
            },
            {
              tabId,
              frameId: match.frame.id,
            }
          );

          // Highlight the matched hints immediately, but hide others when the
          // highlight duration is over. Likely, the same hints will appear again
          // when the “next” hints mode is started. This reduces flicker.
          this.sendRendererMessage(
            {
              type: "UpdateHints",
              updates: updates.filter((update) => update.type !== "Hide"),
              enteredText: hintsState.enteredText,
            },
            { tabId }
          );

          // In case the “next” hints mode takes longer than the highlight
          // duration, remove the shruggie. It might flicker by otherwise, and we
          // don’t need it, just like we don’t show it when entering hints mode
          // initially.
          this.sendRendererMessage({ type: "RemoveShruggie" }, { tabId });

          this.updateWorkerStateAfterHintActivation({
            tabId,
            preventOverTyping,
          });

          this.enterHintsMode({
            tabId,
            timestamp,
            mode: hintsState.mode,
          });

          this.setTimeout(tabId, t.MATCH_HIGHLIGHT_DURATION.value);

          return false;
        }

        case "ManyTab": {
          if (url === undefined) {
            log(
              "error",
              "Cannot open background tab (many) due to missing URL",
              match
            );
            return true;
          }

          const matchedIndexes = new Set(
            hintsState.elementsWithHints
              .filter((element) => element.hint === match.hint)
              .map((element) => element.index)
          );

          const highlightedKeys = new Set(
            hintsState.highlighted.map(({ element }) => elementKey(element))
          );

          hintsState.enteredChars = "";
          hintsState.enteredText = "";

          this.openNewTab({
            url,
            elementIndex: match.frame.index,
            tabId,
            frameId: match.frame.id,
            foreground: false,
          });

          this.sendRendererMessage(
            {
              type: "UpdateHints",
              updates: assignHints(hintsState.elementsWithHints, {
                mode: "ManyTab",
                chars: this.options.values.chars,
                hasEnteredText: false,
              }).map((element, index) => ({
                type: "UpdateContent",
                index: element.index,
                order: index,
                matchedChars: "",
                restChars: element.hint,
                highlighted:
                  matchedIndexes.has(element.index) ||
                  highlightedKeys.has(elementKey(element)),
                hidden: element.hidden,
              })),
              enteredText: "",
            },
            { tabId }
          );

          this.updateWorkerStateAfterHintActivation({
            tabId,
            preventOverTyping,
          });

          this.updateBadge(tabId);
          this.setTimeout(tabId, t.MATCH_HIGHLIGHT_DURATION.value);

          return false;
        }

        case "BackgroundTab":
          if (url === undefined) {
            log(
              "error",
              "Cannot open background tab due to missing URL",
              match
            );
            return true;
          }
          this.openNewTab({
            url,
            elementIndex: match.frame.index,
            tabId,
            frameId: match.frame.id,
            foreground: false,
          });
          return true;

        case "ForegroundTab":
          if (url === undefined) {
            log(
              "error",
              "Cannot open foreground tab due to missing URL",
              match
            );
            return true;
          }
          this.openNewTab({
            url,
            elementIndex: match.frame.index,
            tabId,
            frameId: match.frame.id,
            foreground: true,
          });
          return true;

        case "Select":
          this.sendWorkerMessage(
            alt
              ? {
                  type: "CopyElement",
                  index: match.frame.index,
                }
              : {
                  type: "SelectElement",
                  index: match.frame.index,
                },
            {
              tabId,
              frameId: match.frame.id,
            }
          );
          return true;
      }
    }

    refreshHintsRendering(tabId) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      const { hintsState } = tabState;
      if (hintsState.type !== "Hinting") {
        return;
      }

      const { enteredChars, enteredText } = hintsState;

      const { allElementsWithHints, updates, words } = updateHints({
        mode: hintsState.mode,
        enteredChars,
        enteredText,
        elementsWithHints: hintsState.elementsWithHints,
        highlighted: hintsState.highlighted,
        chars: this.options.values.chars,
        autoActivate: this.options.values.autoActivate,
        matchHighlighted: false,
        updateMeasurements: false,
      });

      this.getTextRects({ enteredChars, allElementsWithHints, words, tabId });

      this.sendRendererMessage(
        {
          type: "UpdateHints",
          updates,
          enteredText,
        },
        { tabId }
      );

      this.updateBadge(tabId);
    }

    openNewTab({ url, elementIndex, tabId, frameId, foreground }) {
      this.sendWorkerMessage(
        {
          type: "FocusElement",
          index: elementIndex,
        },
        { tabId, frameId }
      );

      // In Firefox, creating a tab with `openerTabId` works just like
      // right-clicking a link and choosing "Open Link in New Tab" (basically,
      // it's opened to the right of the current tab). In Chrome, created tabs are
      // always opened at the end of the tab strip. However, dispatching a
      // ctrl-click on an `<a>` element opens a tab just like ctrl-clicking it for
      // real. I considered keeping track of where to open tabs manually for
      // Chrome, but the logic for where to open tabs turned out to be too
      // complicated to replicate in a good way, and there does not seem to be a
      // downside of using the fake ctrl-click method in Chrome. In fact, there’s
      // even an upside to the ctrl-click method: The HTTP Referer header is sent,
      // just as if you had clicked the link for real. See: <bugzil.la/1615860>.
      if (t.PREFER_WINDOWS.value) {
        fireAndForget(
          browser.windows
            .create({
              focused: foreground,
              url,
            })
            .then(() => undefined),
          "BackgroundProgram#openNewTab (PREFER_WINDOWS)",
          url
        );
      } else {
        this.sendWorkerMessage(
          {
            type: "OpenNewTab",
            url,
            foreground,
          },
          { tabId, frameId: TOP_FRAME_ID }
        );
      }
    }

    maybeStartHinting(tabId) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      const { hintsState } = tabState;
      if (hintsState.type !== "Collecting") {
        return;
      }

      const { pendingFrames } = hintsState.pendingElements;
      const frameWaitDuration =
        Date.now() - pendingFrames.lastStartWaitTimestamp;
      if (
        pendingFrames.collecting > 0 ||
        (pendingFrames.answering > 0 &&
          frameWaitDuration < t.FRAME_REPORT_TIMEOUT.value)
      ) {
        return;
      }

      const { time } = hintsState;
      time.start("assign hints");

      const elementsWithHints = assignHints(
        hintsState.pendingElements.elements.map((element, index) => ({
          ...element,
          // These are filled in by `assignHints` but need to be set here for type
          // checking reasons.
          weight: 0,
          hint: "",
          // This is set for real in the next couple of lines, but set here also
          // to be extra sure that the sorting really is stable.
          index,
        })),
        {
          mode: hintsState.mode,
          chars: this.options.values.chars,
          hasEnteredText: false,
        }
        // `.index` was set to `-1` in "ReportVisibleElements" (and to a temporary
        // index above). Now set it for real to map these elements to DOM elements
        // in RendererProgram.
      ).map((element, index) => ({ ...element, index }));

      const elementKeys = new Set(
        elementsWithHints.map((element) => elementKey(element))
      );
      const highlightedKeys = new Set(
        hintsState.highlighted.map(({ element }) => elementKey(element))
      );

      const [alreadyHighlighted, extraHighlighted] = partition(
        hintsState.highlighted,
        ({ element }) => elementKeys.has(elementKey(element))
      );

      const updateIndex = ({ element, sinceTimestamp }, index) => ({
        element: { ...element, index },
        sinceTimestamp,
      });

      const numElements = elementsWithHints.length;
      const highlighted = extraHighlighted
        // Add indexes to the highlighted hints that get extra DOM nodes.
        .map((item, index) => updateIndex(item, numElements + index))
        // Other highlighted hints don’t get extra DOM nodes – they instead
        // highlight new hints with the same characters and position. Mark them
        // with an index of -1 for `unhighlightHints`’s sakes.
        .concat(alreadyHighlighted.map((item) => updateIndex(item, -1)));

      const elementRenders = elementsWithHints
        .map((element, index) => ({
          hintMeasurements: element.hintMeasurements,
          hint: element.hint,
          // Hints at the same position and with the same hint characters as a
          // previously matched hint are marked as highlighted.
          highlighted: highlightedKeys.has(elementKey(element)),
          invertedZIndex: index + 1,
        }))
        // Other previously matched hints are rendered (but not stored in
        // `hintsState.elementsWithHints`).
        .concat(
          extraHighlighted.map(({ element }) => ({
            hintMeasurements: element.hintMeasurements,
            hint: element.hint,
            highlighted: true,
            // Previously matched hints are always shown on top over regular hints.
            invertedZIndex: 0,
          }))
        );

      tabState.hintsState = {
        type: "Hinting",
        mode: hintsState.mode,
        startTime: hintsState.startTime,
        time,
        stats: hintsState.stats,
        enteredChars: "",
        enteredText: "",
        elementsWithHints,
        highlighted,
        updateState: {
          type: "WaitingForTimeout",
          lastUpdateStartTimestamp: hintsState.startTime,
        },
        peeking: false,
      };
      this.sendWorkerMessage(this.makeWorkerState(tabState), {
        tabId,
        frameId: "all_frames",
      });
      this.setTimeout(tabId, t.UPDATE_INTERVAL.value);

      time.start("render");
      this.sendRendererMessage(
        {
          type: "Render",
          elements: elementRenders,
          mixedCase: isMixedCase(this.options.values.chars),
        },
        { tabId }
      );
      this.updateBadge(tabId);
    }

    updateElements(tabId) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      const { hintsState } = tabState;
      if (hintsState.type !== "Hinting") {
        return;
      }

      const { updateState } = hintsState;
      if (updateState.type !== "WaitingForTimeout") {
        return;
      }

      if (
        Date.now() - updateState.lastUpdateStartTimestamp >=
        t.UPDATE_INTERVAL.value
      ) {
        if (hintsState.elementsWithHints.every((element) => element.hidden)) {
          this.enterHintsMode({
            tabId,
            timestamp: Date.now(),
            mode: hintsState.mode,
          });
        } else {
          hintsState.updateState = {
            type: "WaitingForResponse",
            lastUpdateStartTimestamp: Date.now(),
          };

          // Refresh `oneTimeWindowMessageToken`.
          this.sendWorkerMessage(this.makeWorkerState(tabState), {
            tabId,
            frameId: "all_frames",
          });

          this.sendWorkerMessage(
            { type: "UpdateElements" },
            {
              tabId,
              frameId: TOP_FRAME_ID,
            }
          );
        }
      }
    }

    hideElements(info) {
      const tabState = this.tabState.get(info.tabId);
      if (tabState === undefined) {
        return;
      }

      const { hintsState } = tabState;

      if (hintsState.type !== "Hinting") {
        return;
      }

      if (info.frameId === TOP_FRAME_ID) {
        log(
          "log",
          "BackgroundProgram#hideElements",
          "Skipping because this should not happen for the top frame.",
          info
        );
        return;
      }

      log("log", "BackgroundProgram#hideElements", info);

      for (const element of hintsState.elementsWithHints) {
        if (element.frame.id === info.frameId) {
          element.hidden = true;
        }
      }

      const { enteredChars, enteredText } = hintsState;

      const { allElementsWithHints, updates } = updateHints({
        mode: hintsState.mode,
        enteredChars,
        enteredText,
        elementsWithHints: hintsState.elementsWithHints,
        highlighted: hintsState.highlighted,
        chars: this.options.values.chars,
        autoActivate: this.options.values.autoActivate,
        matchHighlighted: false,
        updateMeasurements: false,
      });

      hintsState.elementsWithHints = allElementsWithHints;

      this.sendRendererMessage(
        {
          type: "RenderTextRects",
          rects: [],
          frameId: info.frameId,
        },
        { tabId: info.tabId }
      );

      this.sendRendererMessage(
        {
          type: "UpdateHints",
          updates,
          enteredText,
        },
        { tabId: info.tabId }
      );

      this.updateBadge(info.tabId);
    }

    onRendererMessage(message, info, tabState) {
      log("log", "BackgroundProgram#onRendererMessage", message, info);

      switch (message.type) {
        case "RendererScriptAdded":
          this.sendRendererMessage(
            {
              type: "StateSync",
              css: this.options.values.css,
              logLevel: log.level,
            },
            { tabId: info.tabId }
          );
          // Both uBlock Origin and Adblock Plus use `browser.tabs.insertCSS` with
          // `{ display: none !important; }` and `cssOrigin: "user"` to hide
          // elements. I’ve seen LinkHint’s container to be hidden by a
          // `[style*="animation:"]` filter. This makes sure that the container
          // cannot be hidden by adblockers.
          // In Chrome, 255 ids have the same specificity as >=256 (for Firefox,
          // it’s 1023). One can increase the specificity even more by adding
          // classes, but I don’t think it’s worth the trouble.
          fireAndForget(
            browser.tabs.insertCSS(info.tabId, {
              code: `${`#${CONTAINER_ID}`.repeat(
                255
              )} { display: block !important; }`,
              cssOrigin: "user",
              runAt: "document_start",
            }),
            "BackgroundProgram#onRendererMessage",
            "Failed to insert adblock workaround CSS",
            message,
            info
          );
          break;

        case "Rendered": {
          const { hintsState } = tabState;
          if (hintsState.type !== "Hinting") {
            return;
          }
          const { startTime, time, stats: collectStats } = hintsState;
          time.stop();
          const { durations, firstPaintTimestamp, lastPaintTimestamp } =
            message;
          const timeToFirstPaint = firstPaintTimestamp - startTime;
          const timeToLastPaint = lastPaintTimestamp - startTime;
          tabState.perf = [
            {
              timeToFirstPaint,
              timeToLastPaint,
              topDurations: time.export(),
              collectStats,
              renderDurations: durations,
            },
            ...tabState.perf,
          ].slice(0, MAX_PERF_ENTRIES);
          this.sendOptionsMessage({
            type: "PerfUpdate",
            perf: { [info.tabId]: tabState.perf },
          });
          break;
        }
      }
    }

    async onPopupMessage(message) {
      log("log", "BackgroundProgram#log", message);

      switch (message.type) {
        case "PopupScriptAdded": {
          const tab = await getCurrentTab();
          const tabState =
            tab.id === undefined ? undefined : this.tabState.get(tab.id);
          this.sendPopupMessage({
            type: "Init",
            logLevel: log.level,
            isEnabled: tabState !== undefined,
          });
          break;
        }
      }
    }

    async onOptionsMessage(message, info, tabState) {
      log("log", "BackgroundProgram#onOptionsMessage", message, info);

      switch (message.type) {
        case "OptionsScriptAdded": {
          tabState.isOptionsPage = true;
          this.updateOptionsPageData();
          this.sendOptionsMessage({
            type: "StateSync",
            logLevel: log.level,
            options: this.options,
          });
          const perf = Object.fromEntries(
            Array.from(this.tabState, ([tabId, tabState2]) => [
              tabId.toString(),
              tabState2.perf,
            ])
          );
          this.sendOptionsMessage({ type: "PerfUpdate", perf });
          break;
        }

        case "SaveOptions":
          await this.saveOptions(message.partialOptions);
          this.updateTabsAfterOptionsChange();
          break;

        case "ResetOptions":
          await this.resetOptions();
          this.updateTabsAfterOptionsChange();
          break;

        case "ResetPerf":
          for (const tabState2 of this.tabState.values()) {
            tabState2.perf = [];
          }
          break;

        case "ToggleKeyboardCapture":
          tabState.keyboardMode = message.capture
            ? { type: "Capture" }
            : { type: "FromHintsState" };
          this.sendWorkerMessage(this.makeWorkerState(tabState), {
            tabId: info.tabId,
            frameId: "all_frames",
          });
          break;
      }
    }

    onKeyboardShortcut(action, info, timestamp) {
      const enterHintsMode = (mode) => {
        this.enterHintsMode({
          tabId: info.tabId,
          timestamp,
          mode,
        });
      };

      switch (action) {
        case "EnterHintsMode_Click":
          enterHintsMode("Click");
          break;

        case "EnterHintsMode_BackgroundTab":
          enterHintsMode("BackgroundTab");
          break;

        case "EnterHintsMode_ForegroundTab":
          enterHintsMode("ForegroundTab");
          break;

        case "EnterHintsMode_ManyClick":
          enterHintsMode("ManyClick");
          break;

        case "EnterHintsMode_ManyTab":
          enterHintsMode("ManyTab");
          break;

        case "EnterHintsMode_Select":
          enterHintsMode("Select");
          break;

        case "ExitHintsMode":
          this.exitHintsMode({ tabId: info.tabId });
          break;

        case "RotateHintsForward":
          this.sendRendererMessage(
            {
              type: "RotateHints",
              forward: true,
            },
            { tabId: info.tabId }
          );
          break;

        case "RotateHintsBackward":
          this.sendRendererMessage(
            {
              type: "RotateHints",
              forward: false,
            },
            { tabId: info.tabId }
          );
          break;

        case "RefreshHints": {
          const tabState = this.tabState.get(info.tabId);
          if (tabState === undefined) {
            return;
          }

          const { hintsState } = tabState;
          if (hintsState.type !== "Hinting") {
            return;
          }

          // Refresh `oneTimeWindowMessageToken`.
          this.sendWorkerMessage(this.makeWorkerState(tabState), {
            tabId: info.tabId,
            frameId: "all_frames",
          });

          enterHintsMode(hintsState.mode);
          break;
        }

        case "TogglePeek": {
          const tabState = this.tabState.get(info.tabId);
          if (tabState === undefined) {
            return;
          }

          const { hintsState } = tabState;
          if (hintsState.type !== "Hinting") {
            return;
          }

          this.sendRendererMessage(
            hintsState.peeking ? { type: "Unpeek" } : { type: "Peek" },
            { tabId: info.tabId }
          );

          hintsState.peeking = !hintsState.peeking;
          break;
        }

        case "Escape":
          this.exitHintsMode({ tabId: info.tabId });
          this.sendWorkerMessage(
            { type: "Escape" },
            { tabId: info.tabId, frameId: "all_frames" }
          );
          break;

        case "ActivateHint":
          this.handleHintInput(info.tabId, timestamp, {
            type: "ActivateHint",
            alt: false,
          });
          break;

        case "ActivateHintAlt":
          this.handleHintInput(info.tabId, timestamp, {
            type: "ActivateHint",
            alt: true,
          });
          break;

        case "Backspace":
          this.handleHintInput(info.tabId, timestamp, { type: "Backspace" });
          break;

        case "ReverseSelection":
          this.sendWorkerMessage(
            { type: "ReverseSelection" },
            { tabId: info.tabId, frameId: "all_frames" }
          );
          break;
      }
    }

    enterHintsMode({ tabId, timestamp, mode }) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      const time = new TimeTracker();
      time.start("collect");

      this.sendWorkerMessage(
        {
          type: "StartFindElements",
          types: getElementTypes(mode),
        },
        {
          tabId,
          frameId: TOP_FRAME_ID,
        }
      );

      const refreshing = tabState.hintsState.type !== "Idle";

      tabState.hintsState = {
        type: "Collecting",
        mode,
        pendingElements: {
          pendingFrames: {
            answering: 0,
            collecting: 1, // The top frame is collecting.
            lastStartWaitTimestamp: Date.now(),
          },
          elements: [],
        },
        startTime: timestamp,
        time,
        stats: [],
        refreshing,
        highlighted: tabState.hintsState.highlighted,
      };

      this.updateBadge(tabId);
      this.setTimeout(tabId, t.BADGE_COLLECTING_DELAY.value);
    }

    exitHintsMode({ tabId, delayed = false, sendMessages = true }) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      if (sendMessages) {
        if (delayed) {
          this.setTimeout(tabId, t.MATCH_HIGHLIGHT_DURATION.value);
        } else {
          this.sendRendererMessage({ type: "Unrender" }, { tabId });
        }
      }

      tabState.hintsState = {
        type: "Idle",
        highlighted: tabState.hintsState.highlighted,
      };

      if (sendMessages) {
        this.sendWorkerMessage(this.makeWorkerState(tabState), {
          tabId,
          frameId: "all_frames",
        });
      }

      this.updateBadge(tabId);
    }

    unhighlightHints(tabId) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      const { hintsState } = tabState;

      if (hintsState.highlighted.length === 0) {
        return;
      }

      const now = Date.now();
      const [doneWaiting, stillWaiting] = partition(
        hintsState.highlighted,
        ({ sinceTimestamp }) =>
          now - sinceTimestamp >= t.MATCH_HIGHLIGHT_DURATION.value
      );

      const hideDoneWaiting = ({ refresh = false } = {}) => {
        if (doneWaiting.length > 0) {
          this.sendRendererMessage(
            {
              type: "UpdateHints",
              updates: doneWaiting
                // Highlighted elements with -1 as index don’t have their own DOM
                // nodes – instead, they have highlighted a new hint with the same
                // characters and position. They unhighlighted using
                // `this.refreshHintsRendering` below.
                .filter(({ element }) => element.index !== -1)
                .map(({ element }) => ({
                  type: "Hide",
                  index: element.index,
                  hidden: true,
                })),
              enteredText: "",
            },
            { tabId }
          );
          if (refresh) {
            this.refreshHintsRendering(tabId);
          }
        }
      };

      hintsState.highlighted = stillWaiting;

      switch (hintsState.type) {
        case "Idle":
        case "Collecting":
          if (stillWaiting.length === 0) {
            this.sendRendererMessage({ type: "Unrender" }, { tabId });
          } else {
            hideDoneWaiting();
          }
          break;

        case "Hinting": {
          hideDoneWaiting({ refresh: true });
          break;
        }
      }
    }

    stopPreventOvertyping(tabId) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      const { keyboardMode } = tabState;
      if (
        keyboardMode.type === "PreventOverTyping" &&
        Date.now() - keyboardMode.sinceTimestamp >=
          this.options.values.overTypingDuration
      ) {
        tabState.keyboardMode = { type: "FromHintsState" };
        this.sendWorkerMessage(this.makeWorkerState(tabState), {
          tabId,
          frameId: "all_frames",
        });
      }
    }

    onTabCreated(tab) {
      if (tab.id !== undefined) {
        fireAndForget(
          this.updateIcon(tab.id),
          "BackgroundProgram#onTabCreated->updateIcon",
          tab
        );
      }
    }

    onTabActivated() {
      this.updateOptionsPageData();
    }

    onTabUpdated(tabId, changeInfo) {
      if (changeInfo.status !== undefined) {
        fireAndForget(
          this.updateIcon(tabId),
          "BackgroundProgram#onTabUpdated->updateIcon",
          tabId
        );
      }

      const tabState = this.tabState.get(tabId);
      if (tabState !== undefined && changeInfo.status === "loading") {
        tabState.isOptionsPage = false;
        this.updateOptionsPageData();
      }

      if (tabState !== undefined && changeInfo.pinned !== undefined) {
        tabState.isPinned = changeInfo.pinned;
        this.sendWorkerMessage(this.makeWorkerState(tabState), {
          tabId,
          frameId: "all_frames",
        });
      }
    }

    onTabRemoved(tabId) {
      this.deleteTabState(tabId);
    }

    deleteTabState(tabId) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      this.tabState.delete(tabId);

      if (!tabState.isOptionsPage) {
        this.sendOptionsMessage({
          type: "PerfUpdate",
          perf: { [tabId]: [] },
        });
      }

      this.updateOptionsPageData();
    }

    async updateIcon(tabId) {
      // In Chrome the below check fails for the extension options page, so check
      // for the options page explicitly.
      const tabState = this.tabState.get(tabId);
      let enabled = tabState !== undefined ? tabState.isOptionsPage : false;

      // Check if we’re allowed to execute content scripts on this page.
      if (!enabled) {
        try {
          await browser.tabs.executeScript(tabId, {
            code: "",
            runAt: "document_start",
          });
          enabled = true;
        } catch {
          enabled = false;
        }
      }

      const type = enabled ? "normal" : "disabled";
      const icons = getIcons(type);
      log("log", "BackgroundProgram#updateIcon", tabId, type);
      await browser.browserAction.setIcon({ path: icons, tabId });
    }

    updateBadge(tabId) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      const { hintsState } = tabState;

      fireAndForget(
        browser.browserAction.setBadgeText({
          text: getBadgeText(hintsState),
          tabId,
        }),
        "BackgroundProgram#updateBadge->setBadgeText"
      );
    }

    async updateOptions({ isInitial = false } = {}) {
      const info = await browser.runtime.getPlatformInfo();
      const mac = info.os === "mac";
      const defaults = getDefaults({ mac });
      const rawOptions = await getRawOptions();
      const defaulted = { ...flattenOptions(defaults), ...rawOptions };
      const [unflattened, map] = unflattenOptions(defaulted);
      const options = decode(Options, unflattened, map);

      log("log", "BackgroundProgram#updateOptions", {
        defaults,
        rawOptions,
        defaulted,
        unflattened,
        options,
        decodeErrors: [],
      });

      this.options = {
        values: options,
        defaults,
        raw: rawOptions,
        errors: [],
        mac,
      };

      log.level = options.logLevel;
    }

    async saveOptions(partialOptions) {
      // The options are stored flattened to increase the chance of the browser
      // sync not overwriting things when options has changed from multiple
      // places. This means we have to retrieve the whole storage, unflatten it,
      // merge in the `partialOptions`, flatten that and finally store it. Just
      // flattening `partialOptions` and storing that would mean that you couldn't
      // remove any `options.keys`, for example.
      try {
        const rawOptions = await getRawOptions();
        const { keysToRemove, optionsToSet } = diffOptions(
          flattenOptions(this.options.defaults),
          flattenOptions({ ...this.options.values, ...partialOptions }),
          rawOptions
        );
        log("log", "BackgroundProgram#saveOptions", {
          partialOptions,
          keysToRemove,
          optionsToSet,
        });
        await browser.storage.sync.remove(keysToRemove);
        await browser.storage.sync.set(optionsToSet);
        await this.updateOptions();
      } catch (errorAny) {
        const error = errorAny;
        this.options.errors = [error.message];
      }
    }

    async resetOptions() {
      try {
        await browser.storage.sync.clear();
        await this.updateOptions();
      } catch (errorAny) {
        const error = errorAny;
        this.options.errors = [error.message];
      }
    }

    updateTabsAfterOptionsChange() {
      this.sendOptionsMessage({
        type: "StateSync",
        logLevel: log.level,
        options: this.options,
      });
      for (const tabId of this.tabState.keys()) {
        // This also does a "StateSync" for all workers.
        this.exitHintsMode({ tabId });
        this.sendRendererMessage(
          {
            type: "StateSync",
            css: this.options.values.css,
            logLevel: log.level,
          },
          { tabId }
        );
      }
    }

    makeWorkerState(tabState, { refreshToken = true } = {}) {
      const { hintsState } = tabState;

      if (refreshToken) {
        this.oneTimeWindowMessageToken = makeRandomToken();
      }

      const common = {
        logLevel: log.level,
        keyTranslations: this.options.values.useKeyTranslations
          ? this.options.values.keyTranslations
          : {},
        oneTimeWindowMessageToken: this.oneTimeWindowMessageToken,
        mac: this.options.mac,
        isPinned: tabState.isPinned,
      };

      const getKeyboardShortcuts = (shortcuts) =>
        tabState.keyboardMode.type === "PreventOverTyping"
          ? shortcuts.filter((shortcut) =>
              PREVENT_OVERTYPING_ALLOWED_KEYBOARD_ACTIONS.has(shortcut.action)
            )
          : shortcuts;

      const getKeyboardMode = (mode) =>
        tabState.keyboardMode.type === "FromHintsState"
          ? mode
          : tabState.keyboardMode.type;

      return hintsState.type === "Hinting"
        ? {
            type: "StateSync",
            clearElements: false,
            keyboardShortcuts: getKeyboardShortcuts(
              this.options.values.hintsKeyboardShortcuts
            ),
            keyboardMode: getKeyboardMode("Hints"),
            ...common,
          }
        : {
            type: "StateSync",
            clearElements: hintsState.type === "Idle",
            keyboardShortcuts: getKeyboardShortcuts(
              this.options.values.normalKeyboardShortcuts
            ),
            keyboardMode: getKeyboardMode("Normal"),
            ...common,
          };
    }

    // Send a "StateSync" message to WorkerProgram. If a hint was auto-activated
    // by text filtering, prevent “over-typing” (continued typing after the hint
    // got matched, before realizing it got matched) by temporarily removing all
    // keyboard shortcuts and suppressing all key presses for a short time.
    updateWorkerStateAfterHintActivation({ tabId, preventOverTyping }) {
      const tabState = this.tabState.get(tabId);
      if (tabState === undefined) {
        return;
      }

      if (preventOverTyping) {
        tabState.keyboardMode = {
          type: "PreventOverTyping",
          sinceTimestamp: Date.now(),
        };
        this.setTimeout(tabId, this.options.values.overTypingDuration);
      }

      this.sendWorkerMessage(this.makeWorkerState(tabState), {
        tabId,
        frameId: "all_frames",
      });
    }

    updateOptionsPageData() {}

    async maybeOpenTutorial() {
      const { tutorialShown } = await browser.storage.local.get(
        "tutorialShown"
      );
      if (tutorialShown !== true) {
        if (t.PREFER_WINDOWS.value) {
          await browser.windows.create({
            focused: true,
            url: "https://lydell.github.io/LinkHints/tutorial.html",
          });
        } else {
          await browser.tabs.create({
            active: true,
            url: "https://lydell.github.io/LinkHints/tutorial.html",
          });
        }
        await browser.storage.local.set({ tutorialShown: true });
      }
    }

    async maybeReopenOptions() {}

    async restoreTabsPerf() {}
  }

  function makeEmptyTabState(tabId) {
    const tabState = {
      hintsState: {
        type: "Idle",
        highlighted: [],
      },
      keyboardMode: { type: "FromHintsState" },
      perf: [],
      isOptionsPage: false,
      isPinned: false,
    };

    if (tabId !== undefined) {
      // This is a really ugly hack. `makeEmptyTabState` is used within
      // `BackgroundProgram#onMessage`. As mentioned over there, that method must
      // _not_ be async. So instead of waiting for `browser.tabs.get` (returning a
      // Promise), we just mutate the tab state as soon as possible. This means
      // that code trying to access `tabState.isPinned` right after
      // `makeEmptyTabState` might get the wrong value. At the time of this
      // writing, no code does that so the hack holds.
      browser.tabs
        .get(tabId)
        .then((tab) => {
          tabState.isPinned = tab.pinned;
        })
        .catch((error) => {
          log(
            "error",
            "makeEmptyTabState",
            `Failed to get tab ${tabId}.`,
            error
          );
        });
    }

    return tabState;
  }

  const CLICK_TYPES = [
    "clickable",
    "clickable-event",
    "label",
    "link",
    "scrollable",
    "textarea",
  ];

  const TAB_TYPES = ["link"];

  function getElementTypes(mode) {
    switch (mode) {
      case "Click":
        return CLICK_TYPES;

      case "BackgroundTab":
        return TAB_TYPES;

      case "ForegroundTab":
        return TAB_TYPES;

      case "ManyClick":
        return CLICK_TYPES;

      case "ManyTab":
        return TAB_TYPES;

      case "Select":
        return "selectable";
    }
  }

  function getCombiningUrl(mode, element) {
    switch (mode) {
      case "Click":
        return shouldCombineHintsForClick(element)
          ? element.urlWithTarget
          : undefined;

      case "BackgroundTab":
        return element.url;

      case "ForegroundTab":
        return element.url;

      case "ManyClick":
        return shouldCombineHintsForClick(element)
          ? element.urlWithTarget
          : undefined;

      case "ManyTab":
        return element.url;

      case "Select":
        return undefined;
    }
  }

  function shouldCombineHintsForClick(element) {
    const { url, hasClickListener } = element;
    // The diff expander buttons on GitHub are links to the same fragment
    // identifier. So are Bootstrap carousel next/previous “buttons”. So it’s not
    // safe to combine links with fragment identifiers at all. (They may be
    // powered by delegated event listeners.) I guess they aren’t as common
    // anyway. Also don’t combine if the elements themselves have click listeners.
    // Some sites use `<a>` as buttons with click listeners but still include an
    // href for some reason.
    return url !== undefined && !url.includes("#") && !hasClickListener;
  }

  async function runContentScripts(tabs) {
    const manifest = browser.runtime.getManifest();

    const detailsList =
      manifest.content_scripts === undefined
        ? []
        : manifest.content_scripts
            .filter((script) => script.matches.includes("<all_urls>"))
            .flatMap((script) =>
              script.js === undefined
                ? []
                : script.js.map((file) => ({
                    file,
                    allFrames: script.all_frames,
                    matchAboutBlank: script.match_about_blank,
                    runAt: script.run_at,
                  }))
            );

    return Promise.all(
      tabs.flatMap((tab) =>
        detailsList.map(async (details) => {
          if (tab.id === undefined) {
            return [];
          }
          try {
            return await browser.tabs.executeScript(tab.id, details);
          } catch {
            // If `executeScript` fails it means that the extension is not
            // allowed to run content scripts in the tab. Example: most
            // `chrome://*` pages. We don’t need to do anything in that case.
            return [];
          }
        })
      )
    );
  }

  async function getCurrentTab() {
    const tabs = await browser.tabs.query({
      active: true,
      windowId: browser.windows.WINDOW_ID_CURRENT,
    });
    if (tabs.length !== 1) {
      throw new Error(
        `getCurrentTab: Got an unexpected amount of tabs: ${tabs.length}`
      );
    }
    return tabs[0];
  }

  function getIcons(type) {
    const manifest = browser.runtime.getManifest();
    return Object.fromEntries(
      Object.entries(manifest.browser_action?.default_icon ?? {}).flatMap(
        ([key, value]) => {
          if (typeof value === "string") {
            const newValue = value.replace(/(\$)\w+/, `$1${type}`);
            // Default icons are always PNG in development to support Chrome. Switch
            // to SVG in Firefox during development to make it easier to work on the
            // SVG icon source (automatic reloading). This also requires a
            // cache-bust.
            const finalValue = newValue;
            return [[key, finalValue]];
          }
          return [];
        }
      )
    );
  }

  // Left to right, top to bottom.
  function comparePositions(a, b) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return a.x - b.x || a.y - b.y;
  }

  function getBadgeText(hintsState) {
    switch (hintsState.type) {
      case "Idle":
        return "";

      case "Collecting":
        // Only show the badge “spinner” if the hints are slow. But show it
        // immediately when refreshing so that one can see it flash in case you
        // get exactly the same hints after refreshing, so that you understand
        // that something happened. It’s also nice to show in "ManyClick" mode.
        return Date.now() - hintsState.startTime >
          t.BADGE_COLLECTING_DELAY.value || hintsState.refreshing
          ? "…"
          : "";

      case "Hinting": {
        const { enteredChars, enteredText } = hintsState;
        const words = splitEnteredText(enteredText);
        return hintsState.elementsWithHints
          .filter(
            (element) =>
              // "Hidden" elements have been removed from the DOM or moved off-screen.
              !element.hidden &&
              matchesText(element.text, words) &&
              element.hint.startsWith(enteredChars)
          )
          .length.toString();
      }
    }
  }

  class Combined {
    children;

    weight;

    constructor(children) {
      this.children = children;
      this.weight = Math.max(...children.map((child) => child.weight));
    }
  }

  function combineByHref(elements, mode) {
    const map = new Map();
    const rest = [];

    for (const element of elements) {
      const url = getCombiningUrl(mode, element);
      if (url !== undefined) {
        const previous = map.get(url);
        if (previous !== undefined) {
          previous.push(element);
        } else {
          map.set(url, [element]);
        }
      } else {
        rest.push(element);
      }
    }

    return Array.from(map.values())
      .map((children) => new Combined(children))
      .concat(rest);
  }

  function assignHints(passedElements, { mode, chars, hasEnteredText }) {
    const largestTextWeight = hasEnteredText
      ? Math.max(1, ...passedElements.map((element) => element.textWeight))
      : 0;

    // Sort the elements so elements with more weight get higher z-index.
    const elements = passedElements
      .map((element) => ({
        ...element,
        // When filtering by text, give better hints to elements with shorter
        // text. The more of the text that is matched, the more likely to be what
        // the user is looking for.
        weight: hasEnteredText
          ? largestTextWeight - element.textWeight + 1
          : element.hintMeasurements.weight,
        // This is set to the real thing below.
        hint: "",
      }))
      .sort(
        (a, b) =>
          // Higher weights first.
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          b.weight - a.weight ||
          // If the weights are the same, sort by on-screen position, left to
          // right and then top to bottom (reading order in LTR languages). If you
          // scroll _down_ to a list of same-weight links they usually end up in
          // the order naturally, but if you scroll _up_ to the same list the
          // IntersectionObserver fires in a different order, so it’s important
          // not to rely on that to get consistent hints.
          comparePositions(a.hintMeasurements, b.hintMeasurements) ||
          // `hintsState.elementsWithHints` changes order as
          // `hintsState.enteredText` come and go. Sort on `.index` if all other
          // things are equal, so that elements don’t unexpectedly swap hints after
          // erasing some text chars.
          a.index - b.index
      );

    const combined = combineByHref(elements, mode);

    const tree = nAryHuffman.createTree(combined, chars.length, {
      // Even though we sorted `elements` above, `combined` might not be sorted.
      sorted: false,
    });

    tree.assignCodeWords(chars, (item, codeWord) => {
      if (item instanceof Combined) {
        for (const child of item.children) {
          child.hint = codeWord;
        }
      } else {
        item.hint = codeWord;
      }
    });

    return elements;
  }

  function makeMessageInfo(sender) {
    return sender.tab?.id !== undefined && sender.frameId !== undefined
      ? { tabId: sender.tab.id, frameId: sender.frameId, url: sender.url }
      : undefined;
  }

  function updateChars(chars, input) {
    switch (input.type) {
      case "Input": {
        const key = input.keypress.printableKey;
        return key !== undefined ? `${chars}${key}` : chars;
      }
      case "ActivateHint":
        return chars;
      case "Backspace":
        return chars.slice(0, -1);
    }
  }

  function updateHints({
    mode,
    enteredChars,
    enteredText,
    elementsWithHints: passedElementsWithHints,
    highlighted,
    chars,
    autoActivate: autoActivateOption,
    matchHighlighted,
    updateMeasurements,
  }) {
    const hasEnteredText = enteredText !== "";
    const hasEnteredTextOnly = hasEnteredText && enteredChars === "";
    const words = splitEnteredText(enteredText);

    // Filter away elements/hints not matching by text.
    const [matching, nonMatching] = partition(
      passedElementsWithHints,
      (element) => matchesText(element.text, words)
    );

    // Update the hints after the above filtering.
    const elementsWithHintsAndMaybeHidden = assignHints(matching, {
      mode,
      chars,
      hasEnteredText,
    });

    // Filter away elements that have become hidden _after_ assigning hints, so
    // that the hints stay the same.
    const elementsWithHints = elementsWithHintsAndMaybeHidden.filter(
      (element) => !element.hidden
    );

    // Find which hints to highlight (if any), and which to activate (if
    // any). This depends on whether only text chars have been entered, if
    // auto activation is enabled, if the Enter key is pressed and if hint
    // chars have been entered.
    const allHints = elementsWithHints
      .map((element) => element.hint)
      .filter((hint) => hint.startsWith(enteredChars));
    const matchingHints = allHints.filter((hint) => hint === enteredChars);
    const autoActivate = hasEnteredTextOnly && autoActivateOption;
    const matchingHintsSet = autoActivate
      ? new Set(allHints)
      : new Set(matchingHints);
    const matchedHint =
      matchingHintsSet.size === 1 ? Array.from(matchingHintsSet)[0] : undefined;
    const highlightedHint = hasEnteredText ? allHints[0] : undefined;
    const match = elementsWithHints.find(
      (element) =>
        element.hint === matchedHint ||
        (matchHighlighted && element.hint === highlightedHint)
    );

    const highlightedKeys = new Set(
      highlighted.map(({ element }) => elementKey(element))
    );

    const updates = elementsWithHintsAndMaybeHidden
      .map((element, index) => {
        const matches = element.hint.startsWith(enteredChars);
        const isHighlighted =
          (match !== undefined && element.hint === match.hint) ||
          element.hint === highlightedHint ||
          highlightedKeys.has(elementKey(element));

        return updateMeasurements
          ? {
              // Update the position of the hint.
              type: "UpdatePosition",
              index: element.index,
              order: index,
              hint: element.hint,
              hintMeasurements: element.hintMeasurements,
              highlighted: isHighlighted,
              hidden: element.hidden || !matches,
            }
          : matches && (match === undefined || isHighlighted)
          ? {
              // Update the hint (which can change based on text filtering),
              // which part of the hint has been matched and whether it
              // should be marked as highlighted/matched.
              type: "UpdateContent",
              index: element.index,
              order: index,
              matchedChars: enteredChars,
              restChars: element.hint.slice(enteredChars.length),
              highlighted: isHighlighted,
              hidden: element.hidden,
            }
          : {
              // Hide hints that don’t match the entered hint chars.
              type: "Hide",
              index: element.index,
              hidden: true,
            };
      })
      .concat(
        nonMatching.map((element) => ({
          // Hide hints for elements filtered by text.
          type: "Hide",
          index: element.index,
          hidden: true,
        }))
      );

    const allElementsWithHints =
      elementsWithHintsAndMaybeHidden.concat(nonMatching);

    return {
      elementsWithHints,
      allElementsWithHints,
      match:
        match === undefined
          ? undefined
          : {
              elementWithHint: match,
              autoActivated: autoActivate,
            },
      updates,
      words,
    };
  }

  function mergeElements(elementsWithHints, updates, frameId) {
    const updateMap = new Map(updates.map((update) => [update.index, update]));

    return elementsWithHints.map((element) => {
      if (element.frame.id !== frameId) {
        return element;
      }

      const update = updateMap.get(element.frame.index);

      if (update === undefined) {
        return { ...element, hidden: true };
      }

      return {
        type: update.type,
        index: element.index,
        hintMeasurements: {
          ...update.hintMeasurements,
          // Keep the original weight so that hints don't change.
          weight: element.hintMeasurements.weight,
        },
        url: update.url,
        urlWithTarget: update.urlWithTarget,
        text: update.text,
        textContent: update.textContent,
        // Keep the original text weight so that hints don't change.
        textWeight: element.textWeight,
        isTextInput: update.isTextInput,
        hasClickListener: update.hasClickListener,
        frame: element.frame,
        hidden: false,
        weight: element.weight,
        hint: element.hint,
      };
    });
  }

  function matchesText(passedText, words) {
    const text = passedText.toLowerCase();
    return words.every((word) => text.includes(word));
  }

  const program = new BackgroundProgram();

  fireAndForget(program.start(), "main->BackgroundProgram#start");

  // Attach the instance to the background page's `window` for debugging. This
  // means one can type `program` in the console opened from `about:debugging` or
  // `chrome://extensions` to look at the current state of things.
  // @ts-expect-error This is for debugging only, and should never be accessed in the code.
  window.program = program;
})();
