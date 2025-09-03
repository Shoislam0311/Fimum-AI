import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2 } from 'react-icons/ai';
import { format } from 'date-fns';

const MessageBubble = ({ message, onDelete, isLast }) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[85%]`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">U</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className={`relative rounded-2xl px-4 py-2 shadow-sm ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
        }`}>
          {/* Model badge for AI messages */}
          {!isUser && message.model && (
            <div className="flex items-center mb-1">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {message.model}
              </span>
              {message.queryType && (
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full ml-2">
                  {message.queryType}
                </span>
              )}
            </div>
          )}
          
          {/* Message text */}
          <div className="whitespace-pre-wrap">
            {message.text}
          </div>
          
          {/* File previews for user messages */}
          {isUser && message.files && message.files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.files.map((file, index) => (
                <div key={index} className="flex items-center bg-blue-700/20 dark:bg-blue-900/30 rounded px-2 py-1 text-xs">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon size={14} className="mr-1" />
                  ) : (
                    <FileText size={14} className="mr-1" />
                  )}
                  {file.name}
                </div>
              ))}
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
            {format(new Date(message.timestamp), 'HH:mm')}
          </div>
        </div>
        
        {/* Delete button */}
        <button 
          onClick={() => onDelete(message.id)}
          className="ml-2 mt-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default MessageBubble;