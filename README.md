# Speech Recognizer

A modern web-based speech recognition application that converts spoken language into text in real-time. Built with the Web Speech API and styled with Tailwind CSS.

## Features

- **Real-time speech recognition** - Converts speech to text as you speak
- **Continuous mode** - Keeps listening until you stop manually
- **Russian language support** - Optimized for Russian language recognition
- **Modern UI** - Beautiful gradient design with smooth animations
- **Copy to clipboard** - One-click copy for recognized text
- **Toast notifications** - Non-intrusive feedback for user actions

## Demo

![Speech Recognizer UI](https://via.placeholder.com/800x600/1e293b/6366f1?text=Speech+Recognizer+Preview)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/speech-recognizer.git
cd speech-recognizer
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Start Recording** - Click the green "Start" button to begin speech recognition
2. **Speak** - Speak clearly in Russian (or other supported language)
3. **Stop Recording** - Click the red "Stop" button when finished
4. **Copy Text** - Click the blue "Copy" button to copy the recognized text to clipboard

## Browser Support

This application works in browsers that support the Web Speech API:

- Google Chrome (recommended)
- Microsoft Edge
- Safari (iOS 14+)

## Configuration

The language can be changed in [`public/js/index.js`](public/js/index.js):

```javascript
recognition.lang = "ru-RU"; // Change to your preferred language
```

## Technologies

- **HTML5** - Semantic markup
- **CSS3** - Tailwind CSS for styling
- **JavaScript (ES6+)** - Speech Recognition API
- **Node.js** - Backend server (Fastify)

## License

ISC License - see [LICENSE](LICENSE) for details.

## Author

kolserdav

## Acknowledgments

- Built with [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
