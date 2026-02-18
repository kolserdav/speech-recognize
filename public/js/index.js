// Check for Speech Recognition support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

(async () => {
  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser");
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
  recognition.lang = "ru-RU"; // Important: use correct language format
  recognition.maxAlternatives = 1;

  let finalTranscript = "";
  let interimTranscript = "";

  // Event handlers
  recognition.onstart = () => {
    console.info("Speech recognition started");
    finalTranscript = "";
    interimTranscript = "";
  };

  recognition.onerror = (event) => {
    console.error(`Speech recognition error: ${event.error}`, event);

    // Auto-restart on certain errors
    if (event.error === "no-speech" || event.error === "network") {
      setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart recognition:", e);
        }
      }, 1000);
    }
  };

  recognition.onend = () => {
    console.info("Speech recognition ended");
    // Update final text
    updateDisplay();
  };

  recognition.onresult = (event) => {
    interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        // Replace special markers
        const processedTranscript = transcript
          .replace(/тчк/gi, ".")
          .replace(/зпт/gi, ",")
          .replace(/\s+/g, " ")
          .trim();

        finalTranscript += (finalTranscript ? " " : "") + processedTranscript;
      } else {
        interimTranscript += transcript;
      }
    }

    updateDisplay();
  };

  // Display update function
  function updateDisplay() {
    const dataElement = document.querySelector("#data");
    if (dataElement) {
      let displayText = finalTranscript;
      if (interimTranscript) {
        displayText +=
          (displayText ? " " : "") +
          `<span style="color: #666; font-style: italic;">${interimTranscript}</span>`;
      }
      dataElement.innerHTML = displayText || "Start speaking...";
    }
  }

  // Button handlers
  const buttonStart = document.querySelector("#start");
  const buttonStop = document.querySelector("#stop");

  if (!buttonStart || !buttonStop) {
    console.error("Required buttons not found");
    return;
  }

  let isRecognizing = false;

  buttonStart.addEventListener("click", () => {
    if (!isRecognizing) {
      try {
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
        console.log("Recognition stopped");

        // Output result to console
        console.log("Final transcript:", finalTranscript);
      } catch (error) {
        console.error("Failed to stop recognition:", error);
      }
    }
  });

  // UI initialization
  buttonStop.disabled = true;
  updateDisplay();

  console.log("Speech recognition initialized successfully");
})();
