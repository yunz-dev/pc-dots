(function () {
  "use strict";

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

  function fireAndForget(promise, name, ...args) {
    promise.catch((error) => {
      log("error", name, error, ...args);
    });
  }

  function h(tag, props, ...children) {
    const element = document.createElement(tag);

    if (props !== null && props !== undefined) {
      const { className, onClick, ...rest } = props;

      if (className !== undefined) {
        element.className = className;
      }

      if (typeof onClick === "function") {
        element.onclick = onClick;
      }

      for (const key of Object.keys(rest)) {
        const value = rest[key];
        if (value !== undefined) {
          element.setAttribute(key, value);
        }
      }
    }

    for (const child of children) {
      if (child !== null && child !== undefined && typeof child !== "boolean") {
        element.append(
          typeof child === "string" ? document.createTextNode(child) : child
        );
      }
    }

    return element;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace

  const CONTAINER_ID = "container";

  class PopupProgram {
    debugInfo = "Debug info was never loaded.";

    resets = new Resets();

    async start() {
      log("log", "PopupProgram#start");

      this.resets.add(
        addListener(
          browser.runtime.onMessage,
          this.onMessage.bind(this),
          "PopupProgram#onMessage"
        )
      );

      this.sendMessage({ type: "PopupScriptAdded" });

      try {
        this.debugInfo = await getDebugInfo();
      } catch (errorAny) {
        const error = errorAny;
        this.debugInfo = `Failed to get debug info: ${error.message}`;
      }
    }

    stop() {
      log("log", "PopupProgram#stop");
      this.resets.reset();
    }

    sendMessage(message) {
      log("log", "PopupProgram#sendMessage", message.type, message, this);
      fireAndForget(
        browser.runtime.sendMessage(wrapMessage(message)).then(() => undefined),
        "PopupProgram#sendMessage",
        message
      );
    }

    // Technically, `ToWorker` and `ToRenderer` messages (which are part of
    // `FromBackground`) can never appear here, since they are sent using
    // `browser.tabs.sendMessage` rather than `browser.runtime.sendMessage`.
    // Instead, `FromWorker` and `FromRenderer` messages can appear (which are
    // part of `ToBackground`)! That's because a popup counts as a background
    // script, which can receive messages from content scripts. So the
    // `FromBackground` type annotation isn't entirely true, but the
    // `wrappedMessage.type` check narrows the messages down correctly anyway.
    onMessage(wrappedMessage) {
      if (wrappedMessage.type !== "ToPopup") {
        return;
      }

      const { message } = wrappedMessage;

      log("log", "PopupProgram#onMessage", message.type, message, this);

      switch (message.type) {
        case "Init":
          log.level = message.logLevel;
          this.render({ isEnabled: message.isEnabled });
          break;
      }
    }

    render({ isEnabled }) {
      const previous = document.getElementById(CONTAINER_ID);

      if (previous !== null) {
        previous.remove();
      }

      const errorElement = h("p", { className: "Error" });

      function showError(error) {
        errorElement.textContent =
          error !== undefined ? error.message : "An unknown error ocurred.";
      }

      const container = h(
        "div",
        { id: CONTAINER_ID, className: "Container" },
        h(
          "div",
          null,
          h("h1", null, "Link Hints", " ", "1.3.1"),

          h(
            "p",
            null,
            h(
              "a",
              {
                href: "https://lydell.github.io/LinkHints",
                target: "_blank",
                rel: "noreferrer",
              },
              "Homepage"
            )
          )
        ),

        !isEnabled &&
          h(
            "p",
            null,
            h(
              "strong",
              null,
              "Browser extensions are not allowed on this page."
            )
          ),

        h(
          "p",
          { className: "Buttons" },
          h(
            "button",
            {
              type: "button",
              className: "browser-style",
              onClick: () => {
                browser.runtime
                  .openOptionsPage()
                  .then(() => {
                    window.close();
                  })
                  .catch((error) => {
                    showError(error);
                  });
              },
            },
            "Options"
          ),

          h(
            "button",
            {
              type: "button",
              className: "browser-style",
              onClick: () => {
                navigator.clipboard
                  .writeText(this.debugInfo)
                  .then(() => {
                    window.close();
                  })
                  .catch((error) => {
                    showError(error);
                  });
              },
            },
            "Copy debug info"
          )
        ),

        errorElement
      );

      document.body.append(container);
    }
  }

  function wrapMessage(message) {
    return {
      type: "FromPopup",
      message,
    };
  }

  async function getDebugInfo() {
    const [browserInfo, platformInfo, storageSync, storageLocal, layoutMap] =
      await Promise.all([
        typeof browser.runtime.getBrowserInfo === "function"
          ? browser.runtime.getBrowserInfo()
          : undefined,
        browser.runtime.getPlatformInfo(),
        browser.storage.sync.get(),
        browser.storage.local.get(),
        navigator.keyboard !== undefined && navigator.keyboard !== null
          ? navigator.keyboard.getLayoutMap()
          : undefined,
      ]);

    const layout =
      layoutMap !== undefined ? Object.fromEntries(layoutMap) : undefined;

    const info = JSON.stringify(
      {
        version: "1.3.1",
        browser: "chrome",
        userAgent: navigator.userAgent,
        browserInfo,
        platformInfo,
        "storage.sync": storageSync,
        "storage.local": storageLocal,
        language: navigator.language,
        layout,
      },
      undefined,
      2
    );

    return `
<details>
<summary>Debug info</summary>

\`\`\`json
${info}
\`\`\`

</details>
    `.trim();
  }

  const program = new PopupProgram();
  fireAndForget(program.start(), "main->PopupProgram#start");
})();
