/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';
// Change the import to use the npm package
import html2pdf from 'html2pdf.js';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Function to create a fresh chat instance for each question
function createFreshChat() {
  return ai.chats.create({
    model: 'gemini-2.0-flash-exp',
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
    history: [],
  });
}

const userInput = document.querySelector('#input') as HTMLTextAreaElement;
const modelOutput = document.querySelector('#output') as HTMLDivElement;
const slideshow = document.querySelector('#slideshow') as HTMLDivElement;
const error = document.querySelector('#error') as HTMLDivElement;
const exportBtn = document.querySelector('#export-btn') as HTMLButtonElement;

const additionalInstructions = `
Explain this like you're talking to a 5-year-old.
Use super simple words and fun examples that kids would understand.
For each sentence, draw a simple stick-figure doodle or cartoon sketch in black ink.
Make the drawings cute and child-friendly, like something from a kid's storybook.
No grown-up words or complicated ideas - just start explaining!
Keep going until the whole story is told.`;

async function addSlide(text: string, image: HTMLImageElement) {
  const slide = document.createElement('div');
  slide.className = 'slide';
  const caption = document.createElement('div') as HTMLDivElement;
  caption.innerHTML = await marked.parse(text);
  slide.append(image);
  slide.append(caption);
  slideshow.append(slide);
}

function parseError(error: unknown): string {
  if (typeof error !== 'string') {
    return String(error);
  }

  const regex = /{"error":(.*)}/gm;
  const m = regex.exec(error);
  try {
    if (m && m[1]) {
      const err = JSON.parse(m[1]);
      return err.message || String(error);
    }
    return String(error);
  } catch (e) {
    return String(error);
  }
}

async function generate(message: string | null) {
  if (!message) return;

  userInput.disabled = true;
  exportBtn.setAttribute('hidden', '');  // Hide button initially

  // Create a fresh chat instance for this question
  const chat = createFreshChat();

  modelOutput.innerHTML = '';
  slideshow.innerHTML = '';
  error.innerHTML = '';
  error.toggleAttribute('hidden', true);

  try {
    console.log('Generating explanation for:', message);

    const userTurn = document.createElement('div') as HTMLDivElement;
    userTurn.innerHTML = await marked.parse(message);
    userTurn.className = 'user-turn';
    modelOutput.append(userTurn);
    userInput.value = '';

    console.log('Sending message to Gemini API...');
    const result = await chat.sendMessageStream({
      message: message + additionalInstructions,
    });

    let text = '';
    let img: HTMLImageElement | null = null;

    console.log('Starting to process response stream...');
    let slideCount = 0;

    for await (const chunk of result) {
      console.log('Received chunk:', chunk);

      if (chunk.candidates) {
        for (const candidate of chunk.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.text) {
                text += part.text;
                console.log('Added text:', part.text);
              } else {
                try {
                  const data = part.inlineData;
                  if (data) {
                    console.log('Received image data');
                    img = document.createElement('img');
                    img.src = `data:image/png;base64,` + data.data;
                  } else {
                    console.log('No image data in chunk:', chunk);
                  }
                } catch (e) {
                  console.error('Error processing image data:', e);
                  console.log('Problematic chunk:', chunk);
                }
              }
              if (text && img) {
                console.log('Creating slide with text and image');
                await addSlide(text, img);
                slideCount++;
                slideshow.removeAttribute('hidden');
                exportBtn.removeAttribute('hidden'); // Show export button when we have content
                text = '';
                img = null;
              }
            }
          }
        }
      }
    }

    console.log(`Finished processing response. Created ${slideCount} slides.`);
    // Handle any remaining content (text with image or just text)
    if (img) {
      console.log('Creating final slide with remaining content');
      await addSlide(text, img);
      slideCount++;
      slideshow.removeAttribute('hidden');
      exportBtn.removeAttribute('hidden'); // Show export button when we have content
      text = '';
    } else if (text) {
      console.log('Text without image remains:', text);
      // Optionally handle text without image
    }

    console.log(`Total slides created: ${slideCount}`);

    // Make sure the slideshow is visible if we have slides
    if (slideshow.children.length > 0) {
      slideshow.removeAttribute('hidden');
      exportBtn.removeAttribute('hidden');
    } else {
      console.warn('No slides were created!');
    }
  } catch (e) {
    console.error('Error generating explanation:', e);
    const msg = parseError(e);
    error.innerHTML = `Something went wrong: ${msg}`;
    error.removeAttribute('hidden');

    // Make sure slideshow is hidden when there's an error
    slideshow.setAttribute('hidden', '');
    exportBtn.setAttribute('hidden', '');
  }

  console.log('Generation process completed');
  userInput.disabled = false;
  userInput.focus();
}

userInput.addEventListener('keydown', async (e: KeyboardEvent) => {
  if (e.code === 'Enter') {
    e.preventDefault();
    const message = userInput.value;
    await generate(message);
  }
});

const examples = document.querySelectorAll('#examples li');
examples.forEach((li) =>
  li.addEventListener('click', async () => {
    await generate(li.textContent);
  }),
);

async function exportToPDF() {
  const content = document.createElement('div');
  content.className = 'export-content';

  // Add title and question
  const title = document.createElement('h1');
  title.textContent = `Explain Like I'm 5`;
  content.appendChild(title);

  const question = document.createElement('div');
  question.className = 'export-question';
  question.innerHTML = modelOutput.innerHTML;
  content.appendChild(question);

  // Add all slides
  const slides = Array.from(slideshow.children);
  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'export-slides';

  slides.forEach(slide => {
    const clonedSlide = slide.cloneNode(true) as HTMLElement;
    slidesContainer.appendChild(clonedSlide);
  });

  content.appendChild(slidesContainer);

  // Extract the user's topic from the user-turn div
  let filename = 'explain-like-im-5.pdf';
  const userTurnElement = modelOutput.querySelector('.user-turn');
  if (userTurnElement && userTurnElement.textContent) {
    // Clean up the topic for use as a filename
    let topicText = userTurnElement.textContent.trim();

    // Limit length and remove special characters that aren't allowed in filenames
    topicText = topicText.substring(0, 50); // Limit to 50 characters
    topicText = topicText.replace(/[\\/:*?"<>|]/g, ''); // Remove invalid filename characters

    if (topicText) {
      filename = `explain-${topicText}.pdf`;
    }
  }

  const opt = {
    margin: 1,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      letterRendering: true,
      useCORS: true
    },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Generating PDF...';
    await html2pdf().set(opt).from(content).save();
  } finally {
    exportBtn.disabled = false;
    exportBtn.textContent = 'Save as PDF';
  }
}

exportBtn.addEventListener('click', exportToPDF);
