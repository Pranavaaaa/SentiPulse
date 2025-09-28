// File: VideoUpload.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, AlertCircle, ArrowLeft, Camera, Square, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { processVideo } from '../services/api';
import './css/VideoUpload.css';

const VideoUpload = ({ onUpload, onError, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [method, setMethod] = useState('ica');
  const [isUploading, setIsUploading] = useState(false);

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'record'

  // Refs for video recording
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 100MB.');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload a video file.');
      } else {
        toast.error('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      toast.success('Video file selected successfully!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.webm', '.mkv']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a video file first.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('method', method);

      const result = await processVideo(formData);

      if (result.success) {
        onUpload({
          sessionId: result.sessionId,
          method: method,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          result: result
        });

        if (result.heart_rate !== undefined) {
          toast.success('Video processed successfully!');
        } else {
          toast.success('Video uploaded successfully! Processing started...');
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload video. Please try again.');
      onError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Video recording functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      toast.success('Camera activated successfully!');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setRecordingTime(0);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoFile = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
        setRecordedVideo(videoFile);
        setSelectedFile(videoFile);
        toast.success('Recording completed!');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="vu-page">
      <div className="vu-card">
        <div className="vu-card-header">
          <div className="vu-header-left">
            <button onClick={onBack} className="vu-icon-btn" aria-label="Back">
              <ArrowLeft />
            </button>
            <Video className="vu-header-icon" />
            <h2 className="vu-title">Upload Video</h2>
          </div>
          <p className="vu-sub">Select a video file for physiological analysis</p>
        </div>

        <div className="vu-card-body">
          <form onSubmit={handleSubmit} className="vu-form">
            {/* Upload Mode Selection */}
            <div className="vu-form-group">
              <label className="vu-label">Upload Method</label>
              <div className="vu-choice-grid">
                <label className={`vu-choice ${uploadMode === 'file' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="file"
                    checked={uploadMode === 'file'}
                    onChange={(e) => {
                      setUploadMode(e.target.value);
                      if (isCameraActive) stopCamera();
                    }}
                    className="vu-sr"
                  />
                  <div className="vu-choice-card">
                    <Upload className="vu-choice-icon" />
                    <div className="vu-choice-title">Upload File</div>
                    <div className="vu-choice-sub">Select from computer</div>
                  </div>
                </label>

                <label className={`vu-choice ${uploadMode === 'record' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="record"
                    checked={uploadMode === 'record'}
                    onChange={(e) => setUploadMode(e.target.value)}
                    className="vu-sr"
                  />
                  <div className="vu-choice-card">
                    <Camera className="vu-choice-icon" />
                    <div className="vu-choice-title">Record Video</div>
                    <div className="vu-choice-sub">Use camera</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Method Selection */}
            <div className="vu-form-group">
              <label className="vu-label">Processing Method</label>
              <div className="vu-choice-grid">
                <label className={`vu-choice ${method === 'ica' ? 'active-purple' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="ica"
                    checked={method === 'ica'}
                    onChange={(e) => setMethod(e.target.value)}
                    className="vu-sr"
                  />
                  <div className="vu-choice-card">
                    <div className="vu-choice-title">ICA</div>
                    <div className="vu-choice-sub">Independent Component Analysis</div>
                  </div>
                </label>

                <label className={`vu-choice ${method === 'pca' ? 'active-purple' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="pca"
                    checked={method === 'pca'}
                    onChange={(e) => setMethod(e.target.value)}
                    className="vu-sr"
                  />
                  <div className="vu-choice-card">
                    <div className="vu-choice-title">PCA</div>
                    <div className="vu-choice-sub">Principal Component Analysis</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Recording Interface */}
            {uploadMode === 'record' && (
              <div className="vu-form-group">
                <label className="vu-label">Camera Recording</label>
                <div className="vu-recording">
                  <div className="vu-camera-box">
                    <video ref={videoRef} autoPlay muted playsInline className={`vu-video ${!isCameraActive ? 'hidden' : ''}`} />
                    {!isCameraActive && (
                      <div className="vu-camera-empty">
                        <Camera size={48} />
                        <p>Camera not active</p>
                      </div>
                    )}

                    {isRecording && (
                      <div className="vu-rec-indicator">
                        <div className="vu-rec-dot" />
                        <span className="vu-rec-text">REC {formatTime(recordingTime)}</span>
                      </div>
                    )}
                  </div>

                  <div className="vu-record-controls">
                    {!isCameraActive ? (
                      <button type="button" onClick={startCamera} className="vu-btn primary">
                        <Camera /> Start Camera
                      </button>
                    ) : (
                      <>
                        {!isRecording ? (
                          <button type="button" onClick={startRecording} className="vu-btn primary">
                            <Play /> Start Recording
                          </button>
                        ) : (
                          <button type="button" onClick={stopRecording} className="vu-btn danger">
                            <Square /> Stop Recording
                          </button>
                        )}
                        <button type="button" onClick={stopCamera} className="vu-btn outline">
                          Stop Camera
                        </button>
                      </>
                    )}
                  </div>

                  {recordedVideo && (
                    <div className="vu-file-info success">
                      <div className="vu-file-left">
                        <Video />
                        <div>
                          <div className="vu-file-name">{recordedVideo.name}</div>
                          <div className="vu-file-meta">{formatFileSize(recordedVideo.size)} • Duration: {formatTime(recordingTime)}</div>
                        </div>
                      </div>
                      <button type="button" className="vu-remove" onClick={() => { setRecordedVideo(null); setSelectedFile(null); setRecordingTime(0); }}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* File Upload Area */}
            {uploadMode === 'file' && (
              <div className="vu-form-group">
                <label className="vu-label">Video File</label>
                <div {...getRootProps()} className={`vu-dropzone ${isDragActive ? 'active' : ''}`}>
                  <input {...getInputProps()} />
                  <Upload className="vu-drop-icon" />
                  {isDragActive ? (
                    <p className="vu-drop-text">Drop the video file here...</p>
                  ) : (
                    <div>
                      <p className="vu-drop-title">Drag & drop a video file here, or click to select</p>
                      <p className="vu-drop-sub">MP4, AVI, MOV, WebM up to 100MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected File Info */}
            {selectedFile && uploadMode === 'file' && (
              <div className="vu-file-info success">
                <div className="vu-file-left">
                  <Video />
                  <div>
                    <div className="vu-file-name">{selectedFile.name}</div>
                    <div className="vu-file-meta">{formatFileSize(selectedFile.size)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="vu-actions">
              <button type="button" onClick={onBack} className="vu-btn outline" disabled={isUploading}>
                <ArrowLeft /> Back
              </button>

              <button type="submit" className="vu-btn primary wide" disabled={!selectedFile || isUploading || (uploadMode === 'record' && isCameraActive && !recordedVideo)}>
                {isUploading ? (
                  <>
                    <span className="vu-spinner" />
                    {uploadMode === 'record' ? 'Processing...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    {uploadMode === 'record' ? <Camera /> : <Upload />} 
                    {uploadMode === 'record' ? 'Process Recording' : 'Upload & Process'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Section */}
      <div className="vu-card vu-help">
        <div className="vu-help-body">
          <div className="vu-help-left">
            <AlertCircle />
          </div>
          <div>
            <h3 className="vu-help-title">Tips for Best Results</h3>
            <ul className="vu-help-list">
              <li>Ensure good lighting and clear visibility of the face</li>
              <li>Keep the camera stable during recording</li>
              <li>Record for at least 10-30 seconds for accurate results</li>
              <li>Avoid excessive movement or talking during recording</li>
              <li>ICA method works better for complex lighting conditions</li>
              <li>PCA method is faster but may be less accurate in some cases</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
