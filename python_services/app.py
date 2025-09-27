from flask import Flask, render_template, request
import os
from heart_rate_model import process_video

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_video():
    model_type = request.form.get('model')
    video = request.files['video']
    video_path = os.path.join('static', 'input_video.mp4')
    os.makedirs('static', exist_ok=True)
    video.save(video_path)

    result = process_video(video_path, model_type)
    return render_template('result.html', model=model_type.upper(), **result)

if __name__ == '__main__':
    app.run(debug=True)
