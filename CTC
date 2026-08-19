// ASJADSCLIP
// Save this file as server.js
// Run with: node server.js
// Open on phone: http://localhost:3000
// Open from another device on the same Wi-Fi using your computer's IP address.

const http = require("http");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const clips = new Map();

const allowedExpirations = ["never", "10m", "1h", "24h", "7d", "once"];

function retentionSettings(expiration) {
  if (expiration === "once") {
    return {
      expiresAt: null,
      burnAfterRead: true,
    };
  }

  const durations = {
    "10m": 10 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };

  return {
    expiresAt: durations[expiration]
      ? new Date(Date.now() + durations[expiration]).toISOString()
      : null,
    burnAfterRead: false,
  };
}

function removeExpiredClips() {
  const now = Date.now();

  for (const [name, clip] of clips.entries()) {
    if (
      clip.expiresAt &&
      new Date(clip.expiresAt).getTime() <= now
    ) {
      clips.delete(name);
    }
  }
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });

  response.end(JSON.stringify(data));
}

function sendHtml(response) {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });

  response.end(html);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 120000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });

    request.on("error", reject);
  });
}

const html = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, viewport-fit=cover"
  />

  <title>ASJADSCLIP</title>

  <style>
    :root {
      --cream: #f7f1df;
      --cream-dark: #ece4ce;
      --navy: #202a3a;
      --navy-dark: #182131;
      --orange: #ed6841;
      --yellow: #f7cc5c;
      --green: #769e54;
      --muted: #777a7b;
      --line: rgba(32, 42, 58, 0.13);
      --radius: 18px;
    }

    * {
      box-sizing: border-box;
    }

    html {
      min-width: 320px;
      background: var(--cream);
    }

    body {
      margin: 0;
      min-height: 100vh;
      background:
        linear-gradient(
          rgba(247, 241, 223, 0.95),
          rgba(247, 241, 223, 0.95)
        ),
        repeating-linear-gradient(
          0deg,
          transparent 0,
          transparent 31px,
          rgba(32, 42, 58, 0.035) 32px
        );
      color: var(--navy);
      font-family: Arial, Helvetica, sans-serif;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    .app {
      width: min(1440px, 100%);
      min-height: 100vh;
      margin: 0 auto;
      padding: 0 48px;
      display: flex;
      flex-direction: column;
    }

    header {
      min-height: 76px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--line);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-mark {
      width: 38px;
      height: 38px;
      border-radius: 11px;
      background: var(--navy);
      color: var(--yellow);
      display: grid;
      place-items: center;
      font-size: 20px;
      box-shadow: 3px 3px 0 var(--orange);
    }

    .brand-name {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.04em;
    }

    .brand-subtitle {
      margin-top: 3px;
      color: var(--muted);
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .status {
      color: var(--muted);
      font-family: "Courier New", monospace;
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .status::before {
      content: "";
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 9px;
      border-radius: 50%;
      background: var(--green);
    }

    main {
      flex: 1;
      display: grid;
      grid-template-columns:
        minmax(0, 0.9fr)
        minmax(560px, 1.1fr);
      align-items: center;
      gap: 70px;
      padding: 90px 0;
    }

    .intro {
      max-width: 620px;
    }

    .eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
      color: var(--orange);
      font-family: "Courier New", monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }

    .eyebrow::before {
      content: "";
      width: 40px;
      height: 1px;
      background: var(--orange);
    }

    h1 {
      margin: 0;
      font-size: clamp(4rem, 8vw, 7.6rem);
      line-height: 0.88;
      letter-spacing: -0.08em;
    }

    h1 span {
      color: var(--orange);
    }

    .intro-text {
      max-width: 470px;
      margin: 34px 0 0;
      color: var(--muted);
      font-size: 17px;
      line-height: 1.7;
    }

    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 34px;
    }

    .badge {
      padding: 10px 13px;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--muted);
      font-family: "Courier New", monospace;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .workspace {
      display: grid;
      grid-template-columns: 1fr 44px 1fr;
      align-items: stretch;
      gap: 18px;
    }

    .panel {
      border: 1px solid rgba(32, 42, 58, 0.15);
      border-radius: var(--radius);
      padding: 25px;
      box-shadow: 0 18px 35px rgba(32, 42, 58, 0.12);
    }

    .save-panel {
      background: #fffdf8;
    }

    .get-panel {
      background: var(--navy);
      color: white;
    }

    .panel-heading {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 25px;
    }

    .panel-number {
      margin-bottom: 9px;
      color: var(--muted);
      font-family: "Courier New", monospace;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .get-panel .panel-number {
      color: rgba(255, 255, 255, 0.5);
    }

    h2 {
      margin: 0;
      font-size: 25px;
      letter-spacing: -0.05em;
    }

    .method {
      color: var(--muted);
      font-family: "Courier New", monospace;
      font-size: 10px;
    }

    .get-panel .method {
      color: rgba(255, 255, 255, 0.45);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .field {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      color: rgba(32, 42, 58, 0.72);
      font-family: "Courier New", monospace;
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .get-panel .field-label {
      color: rgba(255, 255, 255, 0.55);
    }

    .hint {
      color: var(--muted);
      font-family: "Courier New", monospace;
      font-size: 10px;
      letter-spacing: normal;
      text-transform: none;
    }

    input,
    textarea,
    select {
      width: 100%;
      border: 1px solid rgba(32, 42, 58, 0.18);
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.5);
      color: var(--navy);
      outline: none;
      padding: 12px;
      font-family: "Courier New", monospace;
      font-size: 13px;
    }

    input:focus,
    textarea:focus,
    select:focus {
      border-color: var(--orange);
      box-shadow:
        0 0 0 3px rgba(237, 104, 65, 0.16);
    }

    textarea {
      min-height: 170px;
      resize: vertical;
      background: var(--navy);
      color: #dce6ef;
      line-height: 1.7;
    }

    .get-panel input {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .get-panel input::placeholder,
    textarea::placeholder {
      color: rgba(255, 255, 255, 0.32);
    }

    .get-panel input:focus {
      border-color: var(--yellow);
      box-shadow:
        0 0 0 3px rgba(247, 204, 92, 0.16);
    }

    select {
      cursor: pointer;
    }

    .help-text {
      margin: 8px 0 0;
      color: var(--muted);
      font-family: "Courier New", monospace;
      font-size: 10px;
      line-height: 1.5;
    }

    button.primary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 50px;
      margin-top: 3px;
      padding: 0 16px;
      border: 0;
      border-radius: 11px;
      background: var(--orange);
      color: white;
      font-weight: 800;
      box-shadow: 3px 3px 0 rgba(32, 42, 58, 0.16);
    }

    button.primary:hover {
      background: #df5c37;
    }

    button.primary:disabled,
    button.retrieve:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .retrieve-row {
      display: flex;
      gap: 8px;
    }

    button.retrieve {
      width: 48px;
      border: 0;
      border-radius: 11px;
      background: var(--yellow);
      color: var(--navy);
      font-size: 21px;
      font-weight: 900;
    }

    .result {
      min-height: 270px;
      margin-top: 20px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      background: var(--navy-dark);
    }

    .empty,
    .error-box {
      min-height: 270px;
      display: grid;
      place-items: center;
      padding: 25px;
      text-align: center;
    }

    .empty p,
    .error-box p {
      max-width: 230px;
      color: rgba(255, 255, 255, 0.4);
      font-family: "Courier New", monospace;
      font-size: 11px;
      line-height: 1.6;
    }

    .error-box strong {
      color: #ff9a7f;
    }

    .code-header,
    .code-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 13px 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.62);
      font-family: "Courier New", monospace;
      font-size: 10px;
    }

    .code-footer {
      flex-wrap: wrap;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 0;
      color: rgba(255, 255, 255, 0.4);
    }

    .copy-button,
    .clear-button {
      border: 0;
      background: transparent;
      color: rgba(255, 255, 255, 0.62);
      font-family: "Courier New", monospace;
      font-size: 10px;
      text-transform: uppercase;
    }

    .copy-button:hover,
    .clear-button:hover {
      color: var(--yellow);
    }

    .code-body {
      max-height: 330px;
      overflow: auto;
      padding: 17px 0;
      color: #dce6ef;
      font-family: "Courier New", monospace;
      font-size: 12px;
      line-height: 1.8;
    }

    .code-line {
      display: flex;
      min-width: max-content;
      padding-right: 18px;
    }

    .line-number {
      width: 50px;
      padding-right: 14px;
      color: rgba(255, 255, 255, 0.25);
      text-align: right;
      user-select: none;
    }

    .line-code {
      white-space: pre;
    }

    .success {
      margin-top: 15px;
      padding: 12px;
      border: 1px solid rgba(118, 158, 84, 0.35);
      border-radius: 11px;
      background: rgba(118, 158, 84, 0.1);
      color: #517437;
      font-family: "Courier New", monospace;
      font-size: 11px;
      line-height: 1.5;
    }

    .failure {
      padding: 12px;
      border-radius: 11px;
      background: rgba(237, 104, 65, 0.1);
      color: #b74b2e;
      font-family: "Courier New", monospace;
      font-size: 11px;
    }

    footer {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      padding: 20px 0;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-family: "Courier New", monospace;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    @media (max-width: 1100px) {
      .app {
        padding: 0 28px;
      }

      main {
        grid-template-columns: 1fr;
        gap: 55px;
      }

      .intro {
        max-width: 700px;
      }
    }

    @media (max-width: 720px) {
      .app {
        padding: 0 20px;
      }

      header {
        min-height: 70px;
      }

      .status {
        display: none;
      }

      main {
        gap: 40px;
        padding: 55px 0;
      }

      h1 {
        font-size: clamp(3.7rem, 17vw, 6rem);
      }

      .intro-text {
        font-size: 15px;
      }

      .workspace {
        grid-template-columns: 1fr;
      }

      .panel {
        padding: 20px;
      }

      footer {
        flex-direction: column;
        line-height: 1.5;
      }
    }
  </style>
</head>

<body>
  <div class="app">

    <header>
      <div class="brand">

        <div class="brand-mark">&gt;_</div>

        <div>
          <div class="brand-name">ASJADSCLIP</div>
          <div class="brand-subtitle">clipboard / 01</div>
        </div>

      </div>

      <div class="status">ready for handoff</div>
    </header>

    <main>

      <section class="intro">

        <div class="eyebrow">
          A calmer way to move code
        </div>

        <h1>
          Code in.<br />
          <span>Code out.</span>
        </h1>

        <p class="intro-text">
          Move a code snippet from one device to another using a simple name.
          No Bluetooth. No account. No pairing.
        </p>

        <div class="badges">
          <div class="badge">No accounts</div>
          <div class="badge">Any device</div>
          <div class="badge">Auto-delete</div>
        </div>

      </section>

      <section class="workspace">

        <article class="panel save-panel">

          <div class="panel-heading">

            <div>
              <div class="panel-number">01 / send</div>
              <h2>Leave a clip</h2>
            </div>

            <div class="method">POST</div>

          </div>

          <form id="save-form">

            <div class="field">

              <label class="field-label" for="save-name">
                <span>clip name</span>
                <span class="hint">required</span>
              </label>

              <input
                id="save-name"
                maxlength="80"
                placeholder="morning-query"
                required
              />

            </div>

            <div class="field">

              <label class="field-label" for="save-language">
                <span>language</span>
                <span class="hint">optional</span>
              </label>

              <input
                id="save-language"
                maxlength="40"
                placeholder="javascript"
              />

            </div>

            <div class="field">

              <label class="field-label" for="save-expiration">
                <span>availability</span>
                <span class="hint">privacy</span>
              </label>

              <select id="save-expiration">

                <option value="never">
                  Keep until replaced
                </option>

                <option value="10m">
                  Delete after 10 minutes
                </option>

                <option value="1h">
                  Delete after 1 hour
                </option>

                <option value="24h">
                  Delete after 24 hours
                </option>

                <option value="7d">
                  Delete after 7 days
                </option>

                <option value="once">
                  View once, then destroy
                </option>

              </select>

              <p id="expiration-help" class="help-text">
                The clip is automatically removed when this window ends.
              </p>

            </div>

            <div class="field">

              <label class="field-label" for="save-code">
                <span>code</span>
                <span id="char-count" class="hint">
                  0 chars
                </span>
              </label>

              <textarea
                id="save-code"
                maxlength="100000"
                placeholder="const handoff = true;

// paste something useful here"
                required
              ></textarea>

            </div>

            <button
              class="primary"
              id="save-button"
              type="submit"
            >
              <span>Leave clip</span>
              <span>&gt;</span>
            </button>

          </form>

          <div id="save-message"></div>

        </article>

        <div></div>

        <article class="panel get-panel">

          <div class="panel-heading">

            <div>
              <div class="panel-number">02 / receive</div>
              <h2>Find your clip</h2>
            </div>

            <div class="method">GET</div>

          </div>

          <form id="get-form">

            <div class="retrieve-row">

              <input
                id="get-name"
                placeholder="type the clip name"
                required
              />

              <button
                class="retrieve"
                id="get-button"
                type="submit"
              >
                &gt;
              </button>

            </div>

          </form>

          <div class="result" id="result">

            <div class="empty">

              <div>

                <div style="font-size: 30px; opacity: .45;">
                  &lt;/&gt;
                </div>

                <p>
                  Enter a clip name to pull it across.
                </p>

              </div>

            </div>

          </div>

        </article>

      </section>

    </main>

    <footer>
      <span>Built for the in-between moments</span>
      <span>temporary by design · private by default</span>
    </footer>

  </div>

  <script>
    const saveForm = document.getElementById("save-form");
    const getForm = document.getElementById("get-form");

    const saveName =
      document.getElementById("save-name");

    const saveLanguage =
      document.getElementById("save-language");

    const saveExpiration =
      document.getElementById("save-expiration");

    const saveCode =
      document.getElementById("save-code");

    const saveButton =
      document.getElementById("save-button");

    const saveMessage =
      document.getElementById("save-message");

    const getName =
      document.getElementById("get-name");

    const getButton =
      document.getElementById("get-button");

    const result =
      document.getElementById("result");

    const charCount =
      document.getElementById("char-count");

    const expirationHelp =
      document.getElementById("expiration-help");

    saveCode.addEventListener("input", () => {
      charCount.textContent =
        saveCode.value.length.toLocaleString() +
        " chars";
    });

    saveExpiration.addEventListener("change", () => {

      if (saveExpiration.value === "once") {

        expirationHelp.textContent =
          "The first successful retrieval permanently destroys this clip.";

      } else if (saveExpiration.value === "never") {

        expirationHelp.textContent =
          "The clip remains available until another clip uses the same name.";

      } else {

        expirationHelp.textContent =
          "The clip is automatically removed when this window ends.";

      }
    });

    function formatDate(value) {

      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value));

    }

    function retentionText(clip) {

      if (clip.burnAfterRead) {
        return "view once · disappears after retrieval";
      }

      if (clip.expiresAt) {
        return "expires " + formatDate(clip.expiresAt);
      }

      return "stays until replaced";
    }

    function showError(message) {

      result.innerHTML =
        '<div class="error-box">' +
        '<div>' +
        '<strong>Clip unavailable</strong>' +
        '<p>' +
        message +
        '</p>' +
        '<button class="clear-button" onclick="resetResult()">' +
        'Clear' +
        '</button>' +
        '</div>' +
        '</div>';

    }

    function resetResult() {

      result.innerHTML =
        '<div class="empty">' +
        '<div>' +
        '<div style="font-size: 30px; opacity: .45;">' +
        '&lt;/&gt;' +
        '</div>' +
        '<p>Enter a clip name to pull it across.</p>' +
        '</div>' +
        '</div>';

    }

    function showClip(clip) {

      const lines = clip.code.split("\\n");

      const lineHtml = lines
        .map((line, index) => {

          return (
            '<div class="code-line">' +
            '<span class="line-number">' +
            String(index + 1).padStart(2, "0") +
            '</span>' +
            '<code class="line-code"></code>' +
            '</div>'
          );

        })
        .join("");

      result.innerHTML =
        '<div class="code-header">' +
        '<span>' +
        clip.name +
        '</span>' +
        '<button class="copy-button" id="copy-button">' +
        'copy' +
        '</button>' +
        '</div>' +

        '<div class="code-body" id="code-body">' +
        lineHtml +
        '</div>' +

        '<div class="code-footer">' +
        '<span>' +
        (clip.language || "plain text") +
        '</span>' +
        '<span>' +
        retentionText(clip) +
        '</span>' +
        '<span>' +
        lines.length +
        (lines.length === 1 ? " line" : " lines") +
        '</span>' +
        '</div>' +

        '<div style="padding: 0 15px 14px;">' +
        '<button class="clear-button" id="clear-button">' +
        'clear' +
        '</button>' +
        '</div>';

      const codeElements =
        result.querySelectorAll(".line-code");

      codeElements.forEach((element, index) => {
        element.textContent =
          lines[index] || " ";
      });

      document
        .getElementById("copy-button")
        .addEventListener("click", async () => {

          await navigator.clipboard.writeText(clip.code);

          document.getElementById(
            "copy-button"
          ).textContent = "copied";

        });

      document
        .getElementById("clear-button")
        .addEventListener(
          "click",
          resetResult
        );
    }

    saveForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        const name =
          saveName.value.trim();

        const code =
          saveCode.value;

        if (!name || !code.trim()) {
          return;
        }

        saveButton.disabled = true;

        saveButton.querySelector(
          "span"
        ).textContent = "Saving...";

        saveMessage.innerHTML = "";

        try {

          const response =
            await fetch("/api/clips", {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name,
                code,
                language:
                  saveLanguage.value.trim() ||
                  null,
                expiration:
                  saveExpiration.value,
              }),
            });

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
              "The clip could not be saved."
            );
          }

          saveMessage.innerHTML =
            '<div class="success">' +
            "Clip saved as <strong>" +
            data.name +
            "</strong>.<br />" +
            retentionText(data) +
            "." +
            "</div>";

          getName.value = data.name;

        } catch (error) {

          saveMessage.innerHTML =
            '<div class="failure">' +
            (error.message ||
              "The clip could not be saved.") +
            "</div>";

        } finally {

          saveButton.disabled = false;

          saveButton.querySelector(
            "span"
          ).textContent = "Leave clip";

        }

      }
    );

    getForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        const name =
          getName.value.trim();

        if (!name) {
          return;
        }

        getButton.disabled = true;

        result.innerHTML =
          '<div class="empty">' +
          '<p>Loading your clip...</p>' +
          '</div>';

        try {

          const response =
            await fetch(
              "/api/clips/" +
              encodeURIComponent(name)
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
              "No clip found with that name."
            );
          }

          showClip(data);

        } catch (error) {

          showError(
            error.message ||
            "No clip found with that name."
          );

        } finally {

          getButton.disabled = false;

        }

      }
    );
  </script>

</body>
</html>`;

const server = http.createServer(
  async (request, response) => {

    try {

      removeExpiredClips();

      const requestUrl = new URL(
        request.url || "/",
        "http://" +
          (request.headers.host || "localhost")
      );

      if (request.method === "OPTIONS") {

        response.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type",
        });

        response.end();
        return;
      }

      if (
        request.method === "GET" &&
        requestUrl.pathname === "/"
      ) {

        sendHtml(response);
        return;
      }

      if (
        request.method === "POST" &&
        requestUrl.pathname === "/api/clips"
      ) {

        let body;

        try {

          body = await readJson(request);

        } catch (error) {

          sendJson(response, 400, {
            error: error.message,
          });

          return;
        }

        const name =
          typeof body.name === "string"
            ? body.name.trim()
            : "";

        const code =
          typeof body.code === "string"
            ? body.code
            : "";

        const language =
          typeof body.language === "string" &&
          body.language.trim()
            ? body.language.trim()
            : null;

        const expiration =
          typeof body.expiration === "string"
            ? body.expiration
            : "never";

        if (!name) {

          sendJson(response, 400, {
            error: "Clip name is required.",
          });

          return;
        }

        if (name.length > 80) {

          sendJson(response, 400, {
            error:
              "Clip name must be 80 characters or fewer.",
          });

          return;
        }

        if (!code.trim()) {

          sendJson(response, 400, {
            error: "Code is required.",
          });

          return;
        }

        if (code.length > 100000) {

          sendJson(response, 400, {
            error:
              "Code must be 100,000 characters or fewer.",
          });

          return;
        }

        if (
          !allowedExpirations.includes(
            expiration
          )
        ) {

          sendJson(response, 400, {
            error:
              "Invalid expiration option.",
          });

          return;
        }

        const retention =
          retentionSettings(expiration);

        const now =
          new Date().toISOString();

        const clip = {
          id: String(Date.now()),
          name,
          code,
          language,
          expiresAt:
            retention.expiresAt,
          burnAfterRead:
            retention.burnAfterRead,
          createdAt: now,
          updatedAt: now,
        };

        clips.set(name, clip);

        sendJson(response, 201, clip);
        return;
      }

      if (
        request.method === "GET" &&
        requestUrl.pathname.startsWith(
          "/api/clips/"
        )
      ) {

        const encodedName =
          requestUrl.pathname.slice(
            "/api/clips/".length
          );

        const name =
          decodeURIComponent(encodedName);

        const clip =
          clips.get(name);

        if (!clip) {

          sendJson(response, 404, {
            error:
              "No clip found with that name.",
          });

          return;
        }

        if (
          clip.expiresAt &&
          new Date(
            clip.expiresAt
          ).getTime() <= Date.now()
        ) {

          clips.delete(name);

          sendJson(response, 404, {
            error:
              "This clip has expired.",
          });

          return;
        }

        const responseClip = {
          ...clip,
        };

        if (clip.burnAfterRead) {
          clips.delete(name);
        }

        sendJson(
          response,
          200,
          responseClip
        );

        return;
      }

      sendJson(response, 404, {
        error: "Not found.",
      });

    } catch (error) {

      sendJson(response, 500, {
        error: "Internal server error.",
      });

    }
  }
);

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "ASJADSCLIP running on port " +
      PORT
    );
  }
);
