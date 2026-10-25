const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const filename = path.resolve(__dirname, "../src/components/LightboxModal.tsx");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.React,
    esModuleInterop: true,
  },
});
const componentModule = new Module(filename, module);
componentModule.paths = Module._nodeModulePaths(path.dirname(filename));
componentModule._compile(compiled.outputText, filename);
const { LightboxModal } = componentModule.exports;

const preview = (fileName, isOpen = true) => renderToStaticMarkup(
  React.createElement(LightboxModal, {
    file: { fileName, fullPath: `fixture/${fileName}`, url: `/fixture/${fileName}` },
    isOpen,
    onClose: () => {},
  }),
);

const bouncy = preview("bouncy_preview.mp4");
for (const attribute of ["autoPlay", "loop", "muted", "playsInline", "controls"]) {
  assert.match(bouncy, new RegExp(`${attribute}=""`, "i"));
}
assert.match(bouncy, /object-contain/);
assert.match(bouncy, /min-h-0/);
assert.match(preview("BOUNCY_PREVIEW.MP4"), /autoPlay=""/i);

for (const fileName of ["session_video_vhs.mp4", "old_capture.avi", "other.mp4"]) {
  const legacy = preview(fileName);
  assert.match(legacy, /<video/);
  assert.match(legacy, /controls=""/);
  assert.doesNotMatch(legacy, /(?:autoPlay|loop|muted)=""/i);
}
assert.match(preview("original_1.jpg"), /<img/);
assert.match(preview("printable_sheet.pdf"), /<iframe/);
assert.equal(preview("bouncy_preview.mp4", false), "");
console.log("Archive playback render checks passed (Bouncy, legacy MP4/AVI, still, PDF, closed).");
