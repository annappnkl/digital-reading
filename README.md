# 📖 Interactive AI Reading Tool for Comprehension Support

This project is a research-driven web app that explores if users understand long-form text better through interactive AI support. It allows readers to click on individual words for simplified synonyms, sentence-level explanations (future: and visual aids), making comprehension easier and more engaging. The prototype uses OpenAIs GPT 4 (3.5 fallback).

## ✨ Features

### 🔍 Word-level interactions
Click any word to receive:
A simpler synonym (S)
A sentence-level explanation (E)
Undo or retry replacement options

### 🧠 Smart logic
Ignores grammatical/obvious words
Handles named entities with tailored prompts
Expands the story when replacement words need context

### 📊 User interaction logging
Logs word clicks, actions, page, and session data for study analysis.

### 🖼️ Image generation
Select any text to trigger an AI-generated image that visualizes the section.

### 🧪 User study component
Pre-reading onboarding (demographics, reading level)
Post-reading survey (comprehension, NASA-TLX, user feedback)

### 🛠️ Tech Stack

## Stack
Frontend: Next.js, React, Tailwind CSS
AI APIs: OpenAI (GPT-3.5) for synonym/explanation/image generation
Backend: Node.js API routes
Database: Supabase (user/session/log tracking)

## 📁 Project Structure

/pages/index.tsx – Main reading interface
/api/simplify.ts – Returns a simpler synonym for a word
/api/define.ts – Returns a contextual definition
/api/classify.ts – Determines if a word is a name/place/neutral
/api/continue.ts – Extends the story if needed
/lib/log.ts – Handles user interaction logging

## 🧪 Study Design Overview

Surveys are adapted from:
PRLSQ (Pleasure Reading Likert Scale)
NASA-TLX (cognitive workload)
ReadTheory-style skill calibration
Collected data includes comprehension scores, cognitive load, and feedback on the tool.

## ✅ Progress Status

- Initial Prototype complete
- Preparations of pre and post survey are in progress

## Other

This research tool is part of a university study on improving adult reading comprehension with AI.
