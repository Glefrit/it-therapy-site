import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual component's handlers with isolated browser side effects.
// Rendering/accessibility are also checked against the exported site in a browser.
function diagnostic({ denyClipboard = false } = {}) {
  let cursor = 0;
  const state = [];
  const copies = [];
  const unexpected = () => { throw new Error("Unexpected network or storage access"); };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = value; }];
    },
    useMemo(fn) { return fn(); },
  };
  const jsx = (type, props) => ({ type, props });
  const ui = new Proxy({}, { get: (_, name) => name });
  const exports = {};
  const source = readFileSync(new URL("../app/diagnostic-form.tsx", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name.startsWith("@/components/ui/")) return ui;
      throw new Error(`Unexpected import: ${name}`);
    },
    navigator: { clipboard: { async writeText(value) {
      if (denyClipboard) throw new Error("Clipboard denied");
      copies.push(value);
    } }, sendBeacon: unexpected },
    window: new Proxy({}, { get: unexpected }),
    fetch: unexpected, XMLHttpRequest: unexpected, WebSocket: unexpected,
    localStorage: new Proxy({}, { get: unexpected }),
    sessionStorage: new Proxy({}, { get: unexpected }),
    document: new Proxy({}, { get: unexpected }),
  });
  function render() {
    cursor = 0;
    const nodes = [];
    function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== "object") return;
      nodes.push(node);
      visit(node.props?.children);
    }
    visit(exports.DiagnosticForm());
    return nodes;
  }
  function fill() {
    const nodes = render();
    nodes.filter(n => n.type === "Select").forEach((n, i) => n.props.onValueChange(`Choice ${i}`));
    nodes.find(n => n.type === "Textarea" && !n.props.readOnly).props.onChange({ target: { value: "PRIVATE TEST & ? # <script>" } });
  }
  const button = (nodes, text) => nodes.find(n => n.type === "button" && n.props.children === text);
  return { render, fill, button, copies };
}

test("answers remain local; copy is explicit and contact URLs never contain answers", async () => {
  const form = diagnostic();
  assert.equal(form.button(form.render(), "Скопировать текст").props.disabled, true);
  form.fill();
  const nodes = form.render();
  assert.equal(form.copies.length, 0);
  const links = nodes.filter(n => n.type === "a");
  assert.deepEqual(links.map(n => n.props.href), [
    "/privacy", "mailto:info@it-therapy.ru", "https://wa.me/79163090129", "https://t.me/virdsh",
  ]);
  for (const link of links) assert.equal(link.props.onClick, undefined);
  const preview = nodes.find(n => n.type === "Textarea" && n.props.readOnly).props.value;
  assert.match(preview, /PRIVATE TEST & \? # <script>/);
  await form.button(nodes, "Скопировать текст").props.onClick();
  assert.deepEqual(form.copies, [preview]);
  form.button(form.render(), "Очистить ответы").props.onClick();
  assert.equal(form.button(form.render(), "Скопировать текст").props.disabled, true);
  assert.equal(form.render().some(n => n.type === "Textarea" && n.props.readOnly), false);
});

test("denied clipboard preserves a manual-copy fallback without opening an external service", async () => {
  const form = diagnostic({ denyClipboard: true });
  form.fill();
  await form.button(form.render(), "Скопировать текст").props.onClick();
  assert.equal(form.copies.length, 0);
  assert.match(form.render().find(n => n.props.role === "status").props.children, /вручную/);
  assert.ok(form.render().find(n => n.type === "Textarea" && n.props.readOnly));
});
