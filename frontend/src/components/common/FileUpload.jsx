import React, { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  FilmIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * FileUpload Component
 *
 * A reusable file upload component with drag-and-drop support,
 * file type validation, size limits, and preview functionality
 *
 * @param {function} onFilesChange - Callback when files change (receives array of File objects)
 * @param {array} acceptedTypes - Array of accepted MIME types (e.g., ['image/*', 'application/pdf'])
 * @param {number} maxSize - Maximum file size in MB (default: 10)
 * @param {number} maxFiles - Maximum number of files (default: 5)
 * @param {boolean} multiple - Allow multiple file selection (default: true)
 * @param {string} className - Additional CSS classes
 * @param {array} initialFiles - Initial files to display (optional)
 */
const FileUpload = ({
  onFilesChange,
  acceptedTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxSize = 10, // MB
  maxFiles = 5,
  multiple = true,
  className = '',
  initialFiles = [],
}) => {
  const [files, setFiles] = useState(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (file) => {
    const type = file.type || '';

    if (type.startsWith('image/')) return PhotoIcon;
    if (type.startsWith('video/')) return FilmIcon;
    if (type.startsWith('audio/')) return MusicalNoteIcon;
    if (type.includes('pdf')) return DocumentTextIcon;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return ArchiveBoxIcon;

    return DocumentIcon;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File "${file.name}" is too large. Maximum size is ${maxSize}MB`);
      return false;
    }

    // Check file type
    const isTypeAccepted = acceptedTypes.some(acceptedType => {
      if (acceptedType.endsWith('/*')) {
        const baseType = acceptedType.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      return file.type === acceptedType;
    });

    if (!isTypeAccepted) {
      toast.error(`File type not accepted for "${file.name}"`);
      return false;
    }

    return true;
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and filter files
    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }
      toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added`);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }
    toast.success('File removed');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }
            transition-colors
          `}>
            <CloudArrowUpIcon className="w-8 h-8" />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {acceptedTypes.includes('image/*') && 'Images, '}
              {acceptedTypes.includes('application/pdf') && 'PDF, '}
              {acceptedTypes.some(t => t.includes('document')) && 'Documents, '}
              up to {maxSize}MB each
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Uploaded Files ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              const isImage = file.type?.startsWith('image/');
              const previewUrl = isImage ? URL.createObjectURL(file) : null;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow group"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onLoad={() => URL.revokeObjectURL(previewUrl)}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove file"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
