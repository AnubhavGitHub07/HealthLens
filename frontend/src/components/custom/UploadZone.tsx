import { useState } from "react";
import { Upload, File, CheckCircle } from "lucide-react";
import "../../styles/UploadZone.css";

interface UploadZoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
}

const UploadZone = ({ onFileChange, file }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const input = document.createElement("input");
      input.type = "file";
      const files = e.dataTransfer.files;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      input.files = dataTransfer.files;

      const changeEvent = new Event("change", { bubbles: true });
      Object.defineProperty(changeEvent, "target", {
        writable: false,
        value: input,
      });
      onFileChange(changeEvent as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="premium-upload-zone-container">
      <div
        className={`premium-upload-zone ${isDragging ? "dragging" : ""} ${
          file ? "has-file" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          onChange={onFileChange}
          className="file-input"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />

        <label htmlFor="file-input" className="premium-upload-label">
          {file ? (
            <div className="file-preview">
              <div className="file-icon">
                <CheckCircle size={40} className="success-icon" />
              </div>
              <h3>File Selected</h3>
              <div className="file-info">
                <File size={16} />
                <span>{file.name}</span>
              </div>
              <p className="file-size">{getFileSize(file.size)}</p>
              <p className="upload-hint-success">Ready to analyze</p>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon-wrapper">
                <Upload size={48} className="upload-icon" />
              </div>
              <h3>Drop your medical report here</h3>
              <p className="upload-hint">
                or click to browse from your device
              </p>
              <p className="upload-formats">
                PDF, JPG, PNG, DOC, DOCX • Max 10MB
              </p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default UploadZone;
