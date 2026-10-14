import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Image as ImageIcon, X, CheckCircle2, AlertCircle, FileCheck } from "lucide-react";

interface FileUploadProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string, file?: File) => void;
  accept?: string;
  required?: boolean;
  maxSizeMB?: number;
  description?: string;
  iconType?: "image" | "document" | "generic";
  id?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
  accept = ".jpg,.jpeg,.png,.pdf,image/*,application/pdf",
  required = false,
  maxSizeMB = 20,
  description = "Supported formats: JPG, PNG, PDF (Max 20MB)",
  iconType = "generic",
  id,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSizeStr, setFileSizeStr] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const processFile = (file: File) => {
    setErrorMsg(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setFileName(file.name);
    setFileSizeStr(formatFileSize(file.size));

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName("");
    setFileSizeStr("");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange("");
  };

  const isPDF = value?.startsWith("data:application/pdf") || fileName.toLowerCase().endsWith(".pdf");
  const isImage = value?.startsWith("data:image/") || iconType === "image";

  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-xs font-bold text-[#23125E] flex items-center justify-between">
        <span>
          {label} {required && <span className="text-rose-500 font-extrabold">*</span>}
        </span>
        {value && (
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Uploaded
          </span>
        )}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {value ? (
        /* Preview & File Info Card */
        <div className="relative border border-emerald-200 bg-emerald-50/50 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs transition-all">
          <div className="flex items-center gap-3 min-w-0">
            {isImage && value.startsWith("data:image/") ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6750A4] flex items-center justify-center shrink-0 border border-purple-200">
                {isPDF ? <FileText className="w-5 h-5 text-rose-600" /> : <FileCheck className="w-5 h-5 text-[#6750A4]" />}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {fileName || (isPDF ? "Uploaded_Document.pdf" : "Uploaded_File")}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                {fileSizeStr && <span>{fileSizeStr}</span>}
                <span className="text-emerald-700 bg-emerald-100 font-medium px-1.5 py-0.5 rounded-md">
                  Ready
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-[#6750A4] hover:bg-purple-100/70 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Drag-and-Drop Dropzone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-[#6750A4] bg-purple-50/70 scale-[1.01]"
              : "border-purple-200 hover:border-[#6750A4] bg-[#FEF7FF]/50 hover:bg-[#F4F0FF]/60"
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6750A4] flex items-center justify-center shadow-2xs">
              {iconType === "image" ? (
                <ImageIcon className="w-5 h-5" />
              ) : iconType === "document" ? (
                <FileText className="w-5 h-5" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-[#23125E] flex items-center justify-center gap-1">
                <span className="text-[#6750A4] underline underline-offset-2">Browse Files</span>
                <span className="font-normal text-slate-400">or drag & drop</span>
              </p>
              <p className="text-[10.5px] text-slate-400 mt-0.5">{description}</p>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] text-rose-600 flex items-center gap-1 font-semibold mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
        </p>
      )}
    </div>
  );
};
