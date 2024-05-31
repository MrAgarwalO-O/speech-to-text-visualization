import speech_recognition as sr
from pydub import AudioSegment

def convert_audio_to_text(audio_file):
    recognizer = sr.Recognizer()
    audio = AudioSegment.from_file(audio_file)
    audio.export("temp.wav", format="wav")
    with sr.AudioFile("temp.wav") as source:
        audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        return text

audio_files = ["audioSegments/audio_segment_1.flac", "audioSegments/audio_segment_2.flac", "audioSegments/audio_segment_3.flac", "audioSegments/audio_segment_4.flac", "audioSegments/audio_segment_5.flac", "audioSegments/audio_segment_6.flac", "audioSegments/audio_segment_7.flac", "audioSegments/audio_segment_8.flac", "audioSegments/audio_segment_9.flac", "audioSegments/audio_segment_10.flac"]
transcriptions = []

for file in audio_files:
    text = convert_audio_to_text(file)
    transcriptions.append(text)

with open("transcriptions_1.txt", "w") as f:
    for i, transcription in enumerate(transcriptions):
        f.write(f"Audio {i+1}: {transcription}\n")
