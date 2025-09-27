import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { processVideo } from '../services/api';

const VideoUpload = ({ onUpload, onError, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [method, setMethod] = useState('ica');
  const [isUploading, setIsUploading] = useState(false);

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
        // Always pass the result - the parent will handle it
        onUpload({
          sessionId: result.sessionId,
          method: method,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          result: result // Always pass the result
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

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <div className="card animate-slide-in-up">
        <div className="card-header flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <Video className="text-blue-500" size={24} />
            <h2 className="text-2xl font-bold">Upload Video</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Select a video file for physiological analysis
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Method Selection */}
            <div className="form-group">
              <label className="form-label">Processing Method</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="ica"
                    checked={method === 'ica'}
                    onChange={(e) => setMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                    method === 'ica' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}>
                    <div className="font-semibold">ICA</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Independent Component Analysis
                    </div>
                  </div>
                </label>
                
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="pca"
                    checked={method === 'pca'}
                    onChange={(e) => setMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                    method === 'pca' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}>
                    <div className="font-semibold">PCA</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Principal Component Analysis
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="form-group">
              <label className="form-label">Video File</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                {isDragActive ? (
                  <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                    Drop the video file here...
                  </p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop a video file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      MP4, AVI, MOV, WebM up to 100MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Video className="text-green-600" size={20} />
                  <div className="flex-1">
                    <div className="font-medium text-green-800 dark:text-green-200">
                      {selectedFile.name}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-300">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onBack}
                className="btn btn-outline flex-1"
                disabled={isUploading}
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="spinner" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload & Process
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 card">
        <div className="card-body">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-500 mt-1" size={20} />
            <div>
              <h3 className="font-semibold mb-2">Tips for Best Results</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Ensure good lighting and clear visibility of the face</li>
                <li>• Keep the camera stable during recording</li>
                <li>• Record for at least 10-30 seconds for accurate results</li>
                <li>• Avoid excessive movement or talking during recording</li>
                <li>• ICA method works better for complex lighting conditions</li>
                <li>• PCA method is faster but may be less accurate in some cases</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
