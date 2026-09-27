import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, X, Loader2 } from 'lucide-react';
import { compressImage, formatBytes } from '../../utils/imageCompression';
import ErrorMessage from './ErrorMessage';

const FileUpload = ({
  id,
  label,
  required = false,
  accept = { 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] },
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 3,
  value = [], // Array of file metadata objects
  onChange,
  renderPreview, // Render prop support
  helpText,
  error,
  className = '',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [localError, setLocalError] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      setLocalError(null);

      if (rejectedFiles && rejectedFiles.length > 0) {
        const firstRejection = rejectedFiles[0];
        if (firstRejection.errors[0]?.code === 'file-too-large') {
          setLocalError(`File size exceeds limit of ${formatBytes(maxSize)}`);
        } else if (firstRejection.errors[0]?.code === 'file-invalid-type') {
          setLocalError('Invalid file format. Only PDF, JPG, and PNG are accepted.');
        } else {
          setLocalError(firstRejection.errors[0]?.message || 'File upload failed');
        }
        return;
      }

      if (value.length + acceptedFiles.length > maxFiles) {
        setLocalError(`Maximum ${maxFiles} file(s) allowed for this document.`);
        return;
      }

      setIsProcessing(true);
      setUploadProgress(10);
      setUploadStatusMsg('Processing and compressing file(s)...');

      try {
        const processedList = await Promise.all(
          acceptedFiles.map(async (file) => {
            if (file.type.startsWith('image/')) {
              const comp = await compressImage(file);
              return {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                name: comp.file.name,
                type: comp.file.type,
                originalSize: comp.originalSize,
                size: comp.compressedSize,
                reductionRatio: comp.reductionRatio,
                previewUrl: comp.previewUrl,
                uploadedAt: new Date().toISOString(),
              };
            }
            // PDF file (not compressed client-side as per spec)
            return {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              name: file.name,
              type: file.type,
              originalSize: file.size,
              size: file.size,
              reductionRatio: 0,
              previewUrl: null,
              uploadedAt: new Date().toISOString(),
            };
          })
        );

        const updated = [...value, ...processedList];
        if (onChange) onChange(updated);
        setUploadProgress(100);
        setIsProcessing(false);
        setUploadStatusMsg(`${acceptedFiles.length} file(s) uploaded successfully`);
      } catch (err) {
        console.error('File compression/upload error:', err);
        setLocalError('Error processing file. Please try again.');
        setIsProcessing(false);
        setUploadProgress(0);
      }
    },
    [value, onChange, maxFiles, maxSize]
  );

  const removeFile = (fileId) => {
    const filtered = value.filter((f) => f.id !== fileId);
    if (onChange) onChange(filtered);
    setUploadStatusMsg('File removed');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled: isProcessing || value.length >= maxFiles,
  });

  const displayError = error || localError;

  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            {label}
            {required && <span className="text-brand-red ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only"> (required)</span>}
          </label>
          <span className="text-xs text-slate-500">
            {value.length}/{maxFiles} uploaded (Max {formatBytes(maxSize)})
          </span>
        </div>
      )}

      {/* ARIA Live Region for Screen Reader Announcements */}
      <div aria-live="polite" className="sr-only">
        {uploadStatusMsg}
      </div>

      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[120px] ${
            isDragActive
              ? 'border-brand-blue bg-blue-50/50 scale-[1.01]'
              : displayError
              ? 'border-brand-red/60 bg-red-50/20 hover:bg-red-50/30'
              : 'border-slate-300 hover:border-brand-blue bg-white hover:bg-slate-50/60'
          }`}
        >
          <input {...getInputProps({ id })} />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 text-brand-blue animate-spin" />
              <p className="text-xs text-slate-600 font-medium">{uploadStatusMsg}</p>
              <div className="w-36 bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className="bg-brand-blue h-1.5 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-2">
                <UploadCloud className="w-5 h-5 text-brand-blue" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                <span className="text-brand-blue font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PDF, JPG, or PNG (up to {formatBytes(maxSize)})
              </p>
            </div>
          )}
        </div>
      )}

      {helpText && !displayError && (
        <p className="text-xs text-slate-500 mt-1">{helpText}</p>
      )}

      {displayError && <ErrorMessage message={displayError} />}

      {/* Render Props or Default Uploaded Files Preview */}
      {renderPreview ? (
        renderPreview({ files: value, onRemove: removeFile })
      ) : (
        value.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            {value.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-9 h-9 object-cover rounded border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{formatBytes(file.size)}</span>
                      {file.reductionRatio > 0 && (
                        <span className="text-brand-green font-medium">
                          (-{file.reductionRatio}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    aria-label={`Remove ${file.name}`}
                    className="p-1 text-slate-400 hover:text-brand-red rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default FileUpload;
