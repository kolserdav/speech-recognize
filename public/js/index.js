// @ts-check

/**
 * @type {{
 *   continuous: boolean;
 *   interimResults: boolean;
 *   onstart: () => void;
 *   lang: string;
 *   onerror: (e: Error) => void;
 *   onresult: (e: {
 *    results?: { isFinal: boolean; 0: { transcript: string } }[];
 *   resultIndex: number;
 *  }) => void;
 *  onend: (() => void) | null;
 *  start: () => void;
 * stop: () => void;
 * }} webkitSpeechRecognition
 */
// @ts-ignore
const recognition = new webkitSpeechRecognition();

(async () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognitiion not accepted on this browser");
    return;
  }
  const microAllow = await new Promise((resolve) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        console.error("Error get user media", err);
        resolve(false);
      });
  });
  if (!microAllow) {
    alert("Microphone is not allowed");
    return;
  }

  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    console.info("Start speech recognize");
  };

  recognition.onerror = (event) => {
    // @ts-ignore
    const error = event.error;
    console.error(`Error speech recogn ${error}`, event, true);
  };

  recognition.onend = () => {
    console.info("End speech recognize");
  };
  const data = document.querySelector("#data");
  if (!data) {
    console.error("Block data is not found");
    return;
  }

  let intTranscipt = {};
  recognition.onresult = (event) => {
    console.log(event.results);
    if (!event.results) {
      console.warn("Results is", event.results);
      return;
    }
    for (let i = 0; event.results[i]; i++) {
      intTranscipt[i] = event.results[i][0].transcript
        .replace("тчк", ".")
        .replace("зпт", ",");
      intTranscipt[i] = intTranscipt[i];
      if (event.results[i].isFinal) {
        let _data = "";
        for (let _i = 0; intTranscipt[_i]; _i++) {
          _data += intTranscipt[_i];
          data.innerHTML = _data;
        }
      }
    }
  };

  recognition.lang = "ru";

  const buttonStart = document.querySelector("#start");
  const buttonStop = document.querySelector("#stop");
  if (!buttonStart) {
    console.error("Button start is missing");
    return;
  }
  if (!buttonStop) {
    console.error("Button stop is missing");
    return;
  }
  buttonStart.addEventListener("click", () => {
    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition is already started", e);
    }
  });

  buttonStop.addEventListener("click", () => {
    try {
      recognition.stop();
      console.log(intTranscipt);
      intTranscipt = {};
    } catch (e) {
      console.error("Recognition is already stoped", e);
    }
  });
})();
