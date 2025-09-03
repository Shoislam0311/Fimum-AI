import React from 'react';
import { X, FileText, Image as ImageIcon } from 'react-icons/ai';

const FilePreview = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  
  return (
    <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 max-w-xs">
      <div className="flex items-center">
        {isImage ? (
          <ImageIcon className="text-blue-500 mr-2" size={20} />
        ) : (
          <FileText className="text-gray-500 mr-2" size={20} />
        )}
        <div className="truncate max-w-[120px] text-sm">
          {file.name}
        </div>
      </div>
      <button 
        onClick={onRemove}
        className="ml-2 text-gray-500 hover:text-red-500"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default FilePreview;