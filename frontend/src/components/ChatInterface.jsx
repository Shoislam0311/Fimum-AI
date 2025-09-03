import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Paperclip, 
  X, 
  Loader2, 
  Settings, 
  Languages, 
  Moon, 
  Sun,
  Sparkles,
  Image as ImageIcon,
  FileText
} from 'react-icons/ai';
import MessageBubble from './MessageBubble';
import FilePreview from './FilePreview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import * as api from '../services/api';

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  onDeleteMessage, 
  isLoading,
  theme,
  setTheme,
  language,
  setLanguage
}) => {
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);
  
  // Speech recognition
  const { isSupported, isListening, startListening, stopListening } = useSpeechRecognition(
    (transcript) => {
      setInput(transcript);
    }
  );
  
  const handleSendMessage = () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;
    
    onSendMessage(input, selectedFiles);
    setInput('');
    setSelectedFiles([]);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };
  
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const toggleRecording = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      // Set language based on selected language
      const langCode = language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US';
      startListening(langCode);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Fimum AI
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Your personal AI assistant created by STN-AI. I'm here to help with anything - from casual conversation to complex problem solving.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded">Default</span>
                  Fimum Basic
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  General purpose AI for everyday conversations and tasks
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-2">Fimum Coder</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced coding assistance with multiple AI models
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-2">Fimum DeepThink</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deep analysis and multi-perspective thinking
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-2">Fimum Vision</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Image analysis and visual understanding
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p>AI models created by STN-AI • 34B parameters • CEO: Showaib Islam</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                onDelete={onDeleteMessage}
              />
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* File previews */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-4">
              {selectedFiles.map((file, index) => (
                <FilePreview 
                  key={index} 
                  file={file} 
                  onRemove={() => removeFile(index)} 
                />
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2">
            {/* File upload button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Paperclip size={20} />
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            
            {/* Text input */}
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Fimum..."
                className="w-full resize-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-40"
                rows="1"
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-2.5 flex items-center gap-2">
                {/* Voice button */}
                <button 
                  onClick={toggleRecording}
                  disabled={!isSupported}
                  className={`p-1.5 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Mic size={18} />
                </button>
                
                {/* Send button */}
                <button 
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                  className={`p-1.5 rounded-full transition-colors ${
                    (!input.trim() && selectedFiles.length === 0) || isLoading
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-2 px-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <div>
              Powered by OpenRouter • AI models created by STN-AI • 34B parameters
            </div>
            <div>
              CEO: Showaib Islam
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;