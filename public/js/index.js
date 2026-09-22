// Check for Speech Recognition support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

(async () => {
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser");
    console.error("SpeechRecognition API not available");
    return;
  }

  // Create recognition instance
  const recognition = new SpeechRecognition();

  // Check microphone access
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone access granted");
  } catch (err) {
    console.error("Error accessing microphone:", err);
    alert("Microphone access is required for speech recognition");
    return;
  }

  // Recognition settings
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "ru-RU";
  recognition.maxAlternatives = 1;

  // === State ===
  // Cursor/selection position in the textarea where final text will be inserted.
  // Captured when the user places the cursor (before or during dictation).
  let insertPosition = null; // { start, end } or null => append to end
  let interimText = ""; // current interim text shown as a hint overlay

  const dataElement = document.querySelector("#data");
  const buttonStart = document.querySelector("#start");
  const buttonStop = document.querySelector("#stop");
  const buttonCopy = document.querySelector("#copy");
  const buttonReset = document.querySelector("#reset");

  if (!buttonStart || !buttonStop || !dataElement) {
    console.error("Required elements not found");
    return;
  }

  let isRecognizing = false;

  // === Cursor position handling ===

  // Remember cursor/selection position on click, typing, or selection change
  function rememberCursorPosition() {
    if (document.activeElement === dataElement) {
      insertPosition = {
        start: dataElement.selectionStart,
        end: dataElement.selectionEnd,
      };
    }
  }

  dataElement.addEventListener("click", rememberCursorPosition);
  dataElement.addEventListener("keyup", rememberCursorPosition);
  dataElement.addEventListener("select", rememberCursorPosition);
  dataElement.addEventListener("focus", rememberCursorPosition);

  // Insert text at the saved cursor position (replacing selection if any)
  function insertTextAtCursor(text) {
    if (!text) return;

    const currentValue = dataElement.value;

    // If no position was saved, append to the end
    let start = currentValue.length;
    let end = currentValue.length;

    if (insertPosition) {
      start = Math.min(insertPosition.start, currentValue.length);
      end = Math.min(insertPosition.end, currentValue.length);
    }

    const before = currentValue.slice(0, start);
    const after = currentValue.slice(end);

    // Add space separators if needed
    let prefix = "";
    let suffix = "";

    if (before && !/\s$/.test(before)) prefix = " ";
    if (after && !/^\s/.test(after)) suffix = " ";

    const newValue = before + prefix + text + suffix + after;
    dataElement.value = newValue;

    // Move cursor right after the inserted text
    const newCursorPos = (before + prefix + text).length;
    dataElement.setSelectionRange(newCursorPos, newCursorPos);

    // Update the saved position
    insertPosition = { start: newCursorPos, end: newCursorPos };

    // Scroll to cursor
    scrollToCursor();
  }

  // Scroll the textarea so the cursor is visible
  function scrollToCursor() {
    const pos = dataElement.selectionStart;
    const value = dataElement.value;

    // Rough estimate: number of lines before the cursor
    const linesBefore = value.substring(0, pos).split("\n").length;
    const lineHeight =
      parseFloat(getComputedStyle(dataElement).lineHeight) || 24;
    const targetScroll = Math.max(0, (linesBefore - 3) * lineHeight);
    dataElement.scrollTop = targetScroll;
  }

  // === Interim text display ===
  // While recognition is in progress, show interim text as a gray italic
  // "ghost" overlay on top of the textarea.
  function updateInterimDisplay() {
    const old = document.querySelector("#interim-layer");
    if (old) old.remove();

    if (!interimText) return;

    const layer = document.createElement("div");
    layer.id = "interim-layer";
    layer.textContent = interimText;
    Object.assign(layer.style, {
      position: "absolute",
      pointerEvents: "none",
      color: "#6b7280",
      fontStyle: "italic",
      fontFamily: getComputedStyle(dataElement).fontFamily,
      fontSize: getComputedStyle(dataElement).fontSize,
      lineHeight: getComputedStyle(dataElement).lineHeight,
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      opacity: "0.8",
      zIndex: "10",
    });

    // Position the overlay roughly where the cursor is
    const rect = dataElement.getBoundingClientRect();
    const pos = dataElement.selectionStart;
    const value = dataElement.value;
    const linesBefore = value.substring(0, pos).split("\n").length;
    const lineHeight =
      parseFloat(getComputedStyle(dataElement).lineHeight) || 24;
    const paddingTop =
      parseFloat(getComputedStyle(dataElement).paddingTop) || 24;

    layer.style.left = rect.left + "px";
    layer.style.top =
      rect.top + paddingTop + (linesBefore - 1) * lineHeight + "px";
    layer.style.maxWidth = rect.width + "px";

    document.body.appendChild(layer);
  }

  function clearInterimDisplay() {
    const old = document.querySelector("#interim-layer");
    if (old) old.remove();
  }

  // === Recognition events ===

  recognition.onstart = () => {
    console.info("Speech recognition started");
    interimText = "";
    updateStatus("Recording...", "green");
  };

  recognition.onerror = (event) => {
    console.error(`Speech recognition error: ${event.error}`, event);

    if (event.error === "no-speech" || event.error === "network") {
      setTimeout(() => {
        if (isRecognizing) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart recognition:", e);
          }
        }
      }, 1000);
    }
  };

  recognition.onend = () => {
    console.info("Speech recognition ended");
    interimText = "";
    clearInterimDisplay();
    updateStatus("Waiting...", "red");

    // If the user hasn't pressed Stop, restart (continuous mode)
    if (isRecognizing) {
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to restart recognition:", e);
      }
    }
  };

  recognition.onresult = (event) => {
    interimText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        // Process special markers
        const processedTranscript = transcript
          .replace(/period/gi, ".")
          .replace(/comma/gi, ",")
          .replace(/\s+/g, " ")
          .trim();

        // Insert final text at the cursor position
        insertTextAtCursor(processedTranscript);
      } else {
        interimText += transcript;
      }
    }

    updateInterimDisplay();
  };

  // === UI helpers ===

  function updateStatus(text, color) {
    const statusIndicator = document.querySelector("#status-indicator");
    const statusText = document.querySelector("#status-text");
    if (statusIndicator) {
      statusIndicator.className =
        color === "green"
          ? "w-4 h-4 rounded-full bg-green-500 mr-3"
          : "w-4 h-4 rounded-full bg-red-500 mr-3";
    }
    if (statusText) {
      statusText.textContent = text;
    }
  }

  function showToast(message, type = "success") {
    const toast = document.querySelector("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove("opacity-0");
    toast.classList.add("opacity-100");

    // Color based on type
    toast.classList.remove("bg-green-600", "bg-red-600", "bg-gray-800");
    if (type === "success") toast.classList.add("bg-green-600");
    else if (type === "error") toast.classList.add("bg-red-600");
    else toast.classList.add("bg-gray-800");

    setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
    }, 3000);
  }

  // === Copy to clipboard ===

  async function copyToClipboard() {
    const textToCopy = dataElement.value;
    if (!textToCopy) {
      showToast("No text to copy", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      console.log("Text copied to clipboard");
      showToast("Text copied!", "success");
    } catch (err) {
      console.error("Failed to copy text:", err);
      showToast("Copy failed", "error");
    }
  }

  // === Reset ===

  function resetText() {
    const confirmed = confirm(
      "Are you sure you want to clear the input field?",
    );
    if (!confirmed) return;

    dataElement.value = "";
    insertPosition = null;
    interimText = "";
    clearInterimDisplay();
    dataElement.focus();
    showToast("Field cleared", "success");
  }

  // === Buttons ===

  buttonStart.addEventListener("click", () => {
    if (!isRecognizing) {
      try {
        // Remember the current cursor position before starting
        rememberCursorPosition();

        recognition.start();
        isRecognizing = true;
        buttonStart.disabled = true;
        buttonStop.disabled = false;
        console.log("Recognition started");
      } catch (error) {
        console.error("Failed to start recognition:", error);
        isRecognizing = false;
      }
    }
  });

  buttonStop.addEventListener("click", () => {
    if (isRecognizing) {
      try {
        recognition.stop();
        isRecognizing = false;
        buttonStart.disabled = false;
        buttonStop.disabled = true;
        interimText = "";
        clearInterimDisplay();
        updateStatus("Waiting...", "red");
        console.log("Recognition stopped");
        console.log("Final text:", dataElement.value);
      } catch (error) {
        console.error("Failed to stop recognition:", error);
      }
    }
  });

  if (buttonCopy) {
    buttonCopy.addEventListener("click", copyToClipboard);
  }

  if (buttonReset) {
    buttonReset.addEventListener("click", resetText);
  }

  // === Initialization ===

  buttonStop.disabled = true;
  updateStatus("Waiting...", "red");

  console.log("Speech recognition initialized successfully");

  function autoGrow() {
    dataElement.style.height = "auto";
    const maxHeight = window.innerHeight * 0.7;
    const newHeight = Math.min(dataElement.scrollHeight, maxHeight);
    dataElement.style.height = newHeight + "px";
  }

  dataElement.addEventListener("input", autoGrow);

  window.addEventListener("resize", autoGrow);
})();
