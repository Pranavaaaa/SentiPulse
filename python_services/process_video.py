#!/usr/bin/env python3
"""
Python microservice for video processing
Called from Node.js Express server
"""
import sys
import json
import os
import time
from heart_rate_model import process_video

def main():
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python process_video.py <video_path> <method>"
        }))
        sys.exit(1)
    
    video_path = sys.argv[1]
    method = sys.argv[2]
    
    # Validate inputs
    if not os.path.exists(video_path):
        print(json.dumps({
            "success": False,
            "error": "Video file not found"
        }))
        sys.exit(1)
    
    if method not in ['ica', 'pca']:
        print(json.dumps({
            "success": False,
            "error": "Invalid method. Use 'ica' or 'pca'"
        }))
        sys.exit(1)
    
    try:
        start_time = time.time()
        
        # Process the video
        result = process_video(video_path, method)
        
        processing_time = time.time() - start_time
        
        # Return JSON response
        response = {
            "success": True,
            "heart_rate": result.get("heart_rate"),
            "error": result.get("error"),
            "method": method.upper(),
            "processing_time": round(processing_time, 2),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "plots": {
                "red_channel": "/static/red.png",
                "green_channel": "/static/green.png", 
                "blue_channel": "/static/blue.png",
                "signal": f"/static/signal_{method}.png",
                "fft": f"/static/fft_{method}.png"
            }
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Processing failed: {str(e)}",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
