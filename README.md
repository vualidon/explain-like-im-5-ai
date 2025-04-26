# Explain Like I'm 5

A fun web application that explains complex topics in simple terms with cute illustrations, designed for children or anyone who wants easy-to-understand explanations.

![Explain Like I'm 5 App](https://i.imgur.com/placeholder.png)

## Features

- **Simple Explanations**: Get complex topics explained in child-friendly language
- **Cute Illustrations**: Each explanation comes with adorable stick-figure drawings
- **Interactive Interface**: Click on example questions or type your own
- **Export to PDF**: Save explanations as PDF files with the topic as the filename
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

This application uses Google's Gemini AI to:

1. Take your question about any complex topic
2. Generate a simple explanation using child-friendly language
3. Create cute illustrations for each part of the explanation
4. Present everything in a fun, interactive slideshow format

## Technologies Used

- TypeScript
- Vite
- Google Gemini AI API
- HTML2PDF.js for PDF export
- Marked for Markdown parsing

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- A Google Gemini API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vualidon/explain-like-im-5-ai.git
   cd explain-things-with-lots-of-tiny-cats
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your Gemini API key:

   ```env
   API_KEY=your_gemini_api_key_here
   ```
4. Start the development server:

   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Usage

1. Type a question in the input field or click on one of the example questions
2. Press Enter to generate the explanation
3. Scroll through the slides to see the explanation with illustrations
4. Click the "Save as PDF" button to download the explanation as a PDF file

## Example Questions

- "Explain how quantum computing works."
- "Explain how the internet works."
- "Explain how the human brain works."
- "Explain what causes rainbows."
- "Explain why the sky is blue."

## Customization

You can customize the appearance by modifying the `index.css` file. The application uses the following Google Fonts:

- 'Gloria Hallelujah' for the main text
- 'Indie Flower' for the slide content

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering the explanations and illustrations
- The creators of html2pdf.js, marked, and other open-source libraries used in this project
