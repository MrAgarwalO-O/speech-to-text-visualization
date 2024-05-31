import speech_recognition as sr
from pydub import AudioSegment
import nltk
from textblob import TextBlob
import spacy
from collections import Counter
import json
import os

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('vader_lexicon')

# Load SpaCy model
nlp = spacy.load('en_core_web_sm')

def convert_audio_to_text(audio_file):
    recognizer = sr.Recognizer()
    audio = AudioSegment.from_file(audio_file)
    audio.export("temp.wav", format="wav")
    with sr.AudioFile("temp.wav") as source:
        audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        return text

def analyze_text(text):
    words = nltk.word_tokenize(text)
    num_words = len(words)
    length_text = len(text)
    
    # POS Tagging
    pos_tags = nltk.pos_tag(words)
    pos_counts = Counter(tag for word, tag in pos_tags)
    
    # Sentiment Analysis
    blob = TextBlob(text)
    sentiment = blob.sentiment
    
    # Named Entity Recognition
    doc = nlp(text)
    entities = [(entity.text, entity.label_) for entity in doc.ents]
    
    # Keyword Extraction
    keywords = [token.text for token in doc if token.is_stop != True and token.is_punct != True]
    keyword_freq = Counter(keywords)
    
    return {
        "num_words": num_words,
        "length_text": length_text,
        "pos_counts": pos_counts,
        "sentiment": sentiment,
        "entities": entities,
        "keyword_freq": keyword_freq
    }

audio_folder = "Audios"
audio_files = [os.path.join(audio_folder, f) for f in os.listdir(audio_folder) if f.endswith('.flac')]

analysis_results = []
transcriptions = []

for file in audio_files:
    text = convert_audio_to_text(file)
    transcriptions.append((file, text))
    analysis = analyze_text(text)
    analysis_results.append({
        "audio_file": file,
        "transcription": text,
        **analysis
    })

with open("transcriptions.txt", "w") as f:
    for file, transcription in transcriptions:
        f.write(f"{os.path.basename(file)}: {transcription}\n")

with open("analysis_results.json", "w") as f:
    json.dump(analysis_results, f, indent=4)
