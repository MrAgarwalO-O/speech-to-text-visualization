# Visualizing Speech-to-Text Analysis with D3.js

## Overview
This project demonstrates a comprehensive process for converting audio files into text using AI algorithms and visualizing the extracted information using D3.js. It employs open-source tools and frameworks such as SpeechRecognition, NLTK, TextBlob, and SpaCy to analyze transcribed text for various linguistic attributes and sentiments. The goal is to transform audio files into actionable insights and present them through engaging visualizations.

## Features
- **Audio to Text Conversion:** Using Google's speech recognition API to transcribe audio files.
- **Text Analysis:** Extracting meaningful information including word count, text length, POS tagging, sentiment analysis, named entity recognition (NER), and keyword frequency.
- **Data Visualization:** Utilizing D3.js to create dynamic and interactive visualizations such as bar charts, sentiment analysis heat maps, POS tag distribution pie charts, radial topic maps, and keyword frequencies bubble charts.
## Visualization Script using D3.js
The script processes data from a JSON file and generates various visualizations.

Bar Chart: Displays the number of words in each audio file.
Sentiment Analysis Heat Map: Shows sentiment polarity and subjectivity scores.
POS Tag Distribution Pie Chart: Illustrates the distribution of different POS tags.
Radial Topic Map: Visualizes keyword frequencies in a circular layout.
Keyword Frequencies Bubble Chart: Represents keyword frequencies in a bubble layout.
## Steps to run
### Install required Python libraries
```bash
pip install pydub speechrecognition nltk textblob spacy
```
### To run the analyze_text file for audio to text conversion and analysis
```bash
python analyze_text.py
```
### To run the visualizations - 
```bash
npm install -g live-server
live-server
```
## Conclusion
This project combines advanced text analysis techniques with dynamic data visualization tools to provide a comprehensive approach to understanding and interpreting audio data. By converting audio files to text and performing detailed text analysis, valuable insights into the linguistic and sentiment characteristics of the content are extracted. The visualizations make these insights accessible and facilitate a more intuitive understanding of complex textual information.
