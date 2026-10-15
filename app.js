/* Novatix Image AI Studio — client-side AI background removal */
import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm";

const $ = (id) => document.getElementById(id);
const dropzone = $("dropzone");
const fileInput = $("fileInput");
const editor = $("editor");
const compare = $("compare");
const imgBefore = $("imgBefore");
const imgAfter = $("imgAfter");
const afterWrap = $("afterWrap");
const slider = $("compareSlider");
const handle = $("compareHandle");
const progressOverlay = $("progressOverlay");
const progressLabel = $("progressLabel");
const progressFill = $("progressFill");
const progressNote = $("progressNote");
const errorBox = $("errorBox");
const downloadBtn = $("downloadBtn");
const newImageBtn = $("newImageBtn");

let resultUrl = null;
let modelReady = false;
let processing = false;
const MAX_SIZE = 25 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp"];

/* ---------- Compare slider ---------- */
function setCompare(pct) {
  pct = Math.max(0, Math.min(100, pct));
  afterWrap.style.width = pct + "%";
  handle.style.left = pct + "%";
}
slider.addEventListener("input", (e) => setCompare(+e.target.value));
compare.addEventListener("pointerdown", (e) => {
  const move = (ev) => {
    const r = compare.getBoundingClientRect();
    setCompare(((ev.clientX - r.left) / r.width) * 100);
  };
  move(e);
  const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
});
setCompare(50);

/* ---------- Upload handling ---------- */
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fileInput.click(); });
fileInput.addEventListener("change", () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); fileInput.value = ""; });
["dragenter", "dragover"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("dragover"); }));
["dragleave", "drop"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("dragover"); }));
dropzone.addEventListener("drop", (e) => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) handleFile(f);
});
document.addEventListener("paste", (e) => {
  const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
  if (item) handleFile(item.getAsFile());
});

newImageBtn.addEventListener("click", reset);

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
}
function clearError() { errorBox.hidden = true; errorBox.textContent = ""; }

function reset() {
  if (resultUrl) { URL.revokeObjectURL(resultUrl); resultUrl = null; }
  editor.hidden = true;
  dropzone.style.display = "";
  clearError();
  downloadBtn.disabled = true;
  setCompare(50);
  editor.scrollIntoView({ behavior: "smooth", block: "start" });
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function handleFile(file) {
  if (processing) return;
  clearError();
  if (!OK_TYPES.includes(file.type)) { showError("Please upload a JPG, PNG or WebP image."); return; }
  if (file.size > MAX_SIZE) { showError("That image is over 25MB — please use a smaller file."); return; }

  const originalUrl = URL.createObjectURL(file);
  imgBefore.src = originalUrl;
  imgAfter.removeAttribute("src");
  dropzone.style.display = "none";
  editor.hidden = false;
  downloadBtn.disabled = true;
  setCompare(50);
  document.getElementById("studio").scrollIntoView({ behavior: "smooth", block: "start" });

  processing = true;
  progressOverlay.hidden = false;
  setProgress(2, "Loading AI model…", modelReady
    ? "Model is cached — this will be quick."
    : "First run downloads the AI model (~40MB). One time only, then it's cached.");

  try {
    const blob = await removeBackground(file, {
      progress: (key, current, total) => {
        // key examples: 'fetch:onnx/model', 'compute:inference'
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        if (key.startsWith("fetch:")) {
          setProgress(Math.min(90, Math.round(pct * 0.9)), "Downloading AI model… " + pct + "%",
            "The model runs on your device — your photo never leaves this page.");
        } else if (key.startsWith("compute:")) {
          setProgress(92 + Math.round(pct * 0.08), "Removing background… " + pct + "%", "Almost there.");
        } else {
          setProgress(95, "Finishing up…", "");
        }
      },
    });
    modelReady = true;
    resultUrl = URL.createObjectURL(blob);
    imgAfter.src = resultUrl;
    setProgress(100, "Done!", "");
    setTimeout(() => { progressOverlay.hidden = true; }, 400);
    downloadBtn.disabled = false;
  } catch (err) {
    console.error(err);
    progressOverlay.hidden = true;
    const msg = /memory|wasm|webgl|simd/i.test(String(err && err.message))
      ? "Your browser couldn't run the AI engine (WebAssembly unavailable). Try the latest Chrome, Edge or Firefox on desktop."
      : "Something went wrong while processing. Please try a different image or reload the page.";
    showError(msg);
  } finally {
    processing = false;
    URL.revokeObjectURL(originalUrl);
  }
}

function setProgress(pct, label, note) {
  progressFill.style.width = pct + "%";
  progressLabel.textContent = label;
  progressNote.textContent = note || "";
}

/* ---------- Download ---------- */
downloadBtn.addEventListener("click", () => {
  if (!resultUrl) return;
  const a = document.createElement("a");
  a.href = resultUrl;
  a.download = "novatix-bg-removed.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
});
