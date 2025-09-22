# Dark Pattern Detector

A tool to detect **dark patterns** in web interfaces, helping promote ethical user experience by identifying manipulative design elements.

---

## Table of Contents

- [What is a Dark Pattern](#what-is-a-dark-pattern)  
- [Problem Statement](#problem-statement)  
- [Features](#features)  
- [How It Works / Architecture](#how-it-works--architecture)  
- [Getting Started](#getting-started)  
- [Usage](#usage)  
- [Dataset / Examples](#dataset--examples)  
- [Evaluation / Results](#evaluation--results)  
- [Limitations](#limitations)  
- [Future Work](#future-work)  
- [Contributing](#contributing)  
- [License](#license)  

---

## What is a Dark Pattern

“Dark patterns” are user interface designs crafted to trick or manipulate users into doing things they might not otherwise want to do — for example, making it hard to opt-out, hiding critical information, or using default settings that benefit the service provider at the user’s expense.

---

## Problem Statement

Many websites use dark patterns, often in subtle ways, that degrade user trust and autonomy. The goal of this project is to build an automated detector that:

- scans a web page (or UI component)
- identifies presence (and type) of dark patterns
- gives explainability of what pattern was found and where

---

## Features

- Detects multiple types of dark patterns (e.g., **forced continuity**, **confirmshame**, **sneak-into-basket**, etc.)  
- Processes HTML / CSS / JS of a page snapshot  
- Visualizes the part of UI where dark pattern is present  
- Provides a confidence score or severity metric  
- Supports a web-interface / API to upload  screenshots  

---

## How It Works / Architecture

Include architecture diagram / flow. Here’s a rough sketch:

1. **Input**: A URL / screenshot / HTML snapshot  
2. **Preprocessing**: Parse DOM, extract UI elements, CSS, detect layout, visible text  
3. **Feature Extraction**: Identify features relevant to dark patterns, such as misleading buttons, hidden opt-outs, default-on toggles, etc.  
4. **Model / Rules**: Use a combination of rule-based detection + machine learning (if applicable)  
5. **Output**: List of detected dark pattern instances, locations, and explanations  

Technologies used:

- JavaScript / Python / etc.  
- Libraries / frameworks: e.g., **Beautiful Soup**, **Selenium**, **Puppeteer**, **Scikit-Learn**, **TensorFlow / PyTorch** etc.  
- Data formats: HTML, DOM, maybe image processing  

---

## Getting Started

### Requirements

- Python version Y  
- Any other dependencies (libraries, browser driver etc.)  

### Installation

```bash
git clone https://github.com/FareedaSheik/dark-pattern-detector.git
cd dark-patterns-recognition-master\dark-patterns-recognition-master\api
python app.py

## Running as a Chrome Extension

This project includes an `app/` folder which contains the Chrome Extension setup. Follow the steps below to load and run it in your browser:

1. Open **Google Chrome**.
2. Go to **Extensions** by entering the following in the address bar:
3. In the top-right corner, **enable Developer Mode**.
4. Click on **Load unpacked**.
5. Select the `app/` folder from this repository.
6. The extension will now appear in your Chrome toolbar.

### Usage
- Navigate to any website you want to test.  
- Click on the **Dark Pattern Detector** extension icon in the toolbar.  
- The extension will scan the current page and display results (patterns detected, explanations, etc.).

---

### Notes
- Make sure you have cloned this repository before loading:
```bash
git clone https://github.com/FareedaSheik/dark-pattern-detector.git
cd dark-pattern-detector


