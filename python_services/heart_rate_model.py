import cv2
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import FastICA, PCA
from scipy.fftpack import fft, fftfreq
from scipy.signal import find_peaks
import os

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def detect_face(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    if len(faces) == 0:
        return None
    x, y, w, h = faces[0]
    roi_y = y + int(0.15 * h)
    roi_h = int(0.2 * h)
    return frame[roi_y:roi_y + roi_h, x:x + w]

def extract_rgb_signals(video_path, frame_rate=30, duration=10):
    cap = cv2.VideoCapture(video_path)
    rgb_signals = []
    for _ in range(frame_rate * duration):
        ret, frame = cap.read()
        if not ret:
            break
        roi = detect_face(frame)
        if roi is None:
            continue
        roi = roi.astype(np.float32) / 255.0
        mean_rgb = np.mean(roi, axis=(0, 1))
        rgb_signals.append(mean_rgb)
    cap.release()
    return np.array(rgb_signals)

def apply_ica(signals):
    signals -= np.mean(signals, axis=0)
    ica = FastICA(n_components=1)
    return ica.fit_transform(signals).flatten()

def apply_pca(signals):
    signals -= np.mean(signals, axis=0)
    pca = PCA(n_components=1)
    return pca.fit_transform(signals).flatten()

def estimate_heart_rate(signal, fps=30):
    n = len(signal)
    freqs = fftfreq(n, d=1.0/fps)
    fft_values = np.abs(fft(signal))
    valid = (freqs > 0.75) & (freqs < 3.0)
    freqs = freqs[valid]
    fft_values = fft_values[valid]
    peaks, _ = find_peaks(fft_values)
    if len(peaks) == 0:
        return None
    dominant_freq = freqs[peaks[np.argmax(fft_values[peaks])]]
    return dominant_freq * 60

def save_plot(signal, title, filename, ylabel='Amplitude', color='blue'):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    plt.figure(figsize=(6,3))
    plt.plot(signal, color=color)
    plt.title(title)
    plt.ylabel(ylabel)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()

def save_fft_plot(freqs, fft_vals, filename):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    plt.figure(figsize=(6,3))
    plt.plot(freqs, fft_vals)
    plt.title("FFT Spectrum")
    plt.xlabel("Frequency (Hz)")
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()

def process_video(video_path, method='ica'):
    rgb_signals = extract_rgb_signals(video_path)
    if rgb_signals.size == 0:
        return {"heart_rate": None, "error": "No face detected."}

    if method == 'pca':
        signal = apply_pca(rgb_signals)
    else:
        signal = apply_ica(rgb_signals)

    if signal is None or len(signal) < 10:
        return {"heart_rate": None, "error": "Signal extraction failed."}

    heart_rate = estimate_heart_rate(signal)
    if heart_rate is None:
        return {"heart_rate": None, "error": "Heart rate estimation failed."}

    # Save plots
    save_plot(rgb_signals[:,0], "Red Channel", "static/red.png", color='red')
    save_plot(rgb_signals[:,1], "Green Channel", "static/green.png", color='green')
    save_plot(rgb_signals[:,2], "Blue Channel", "static/blue.png", color='blue')
    save_plot(signal, f"{method.upper()} Signal", f"static/signal_{method}.png", color='purple')
    # FFT
    n = len(signal)
    freqs = fftfreq(n, d=1.0/30)
    fft_vals = np.abs(fft(signal))
    valid = (freqs > 0.75) & (freqs < 3.0)
    freqs = freqs[valid]
    fft_vals = fft_vals[valid]
    save_fft_plot(freqs, fft_vals, f"static/fft_{method}.png")

    return {"heart_rate": round(heart_rate, 2), "error": None}
