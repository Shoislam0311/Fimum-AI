import React, { useState, useEffect, useRef } from 'react';
import { Mic, Upload, MessageSquare, ChevronLeft, Settings, LogOut, Search, X, ChevronRight, FileText, Image, Play, Pause, Trash2, Check, XCircle, LogIn, User, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [recognition, setRecognition] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [tone, setTone] = useState('Professional');

  useEffect(() => {
    const token = localStorage.getItem('fimum_token');
    if (token) {
      setIsAuthenticated(true);
      setUser({ email: 'user@example.com' });
    }
  }, []);

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = language;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };
      setRecognition(recognition);
    }
  }, [language]);

  useEffect(() => {
    if (currentChatId) {
      const currentChat = chatHistory.find(chat => chat.id === currentChatId);
      if (currentChat) {
        setMessages(currentChat.messages);
      }
    }
  }, [currentChatId, chatHistory]);

  const startRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const addMessage = (message) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    
    const updatedHistory = chatHistory.map(chat => {
      if (chat.id === currentChatId) {
        return { ...chat, messages: newMessages };
      }
      return chat;
    });
    setChatHistory(updatedHistory);
  };

  const handleSend = () => {
    if (inputText.trim() === '' && !file) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText || '',
      type: file ? 'file' : 'text',
      filename: file?.name || '',
      size: file ? `${(file.size / 1024).toFixed(1)} KB` : '',
    };
    addMessage(userMessage);

    setInputText('');
    setFile(null);
    setIsSending(true);

    setTimeout(() => {
      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'This is a simulated response from Fimum. In a real application, this would process your request using OpenRouter API and backend.',
        type: 'text'
      };
      addMessage(assistantMessage);
      setIsSending(false);
    }, 1500);
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: `New chat ${chatHistory.length + 1}`,
      messages: []
    };
    setChatHistory([...chatHistory, newChat]);
    setCurrentChatId(newChat.id);
  };

  const handleRemoveChat = (id) => {
    setChatHistory(chatHistory.filter(chat => chat.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(chatHistory[0]?.id || null);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('fimum_token', 'fake-jwt-token');
    setIsAuthenticated(true);
    setUser({ email });
  };

  const handleLogout = () => {
    localStorage.removeItem('fimum_token');
    setIsAuthenticated(false);
    setChatHistory([]);
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex justify-center mb-6">
            <img src="https://placehold.co/40x40?text=FI" alt="Fimum Logo" className="mr-2" />
            <h1 className="text-xl font-bold text-gray-800">Fimum</h1>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">Login to Fimum</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center text-gray-500">
            <p>Don't have an account? <a href="#" className="text-blue-500">Sign up</a></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <img src="https://placehold.co/40x40?text=FI" alt="Fimum Logo" className="mr-2" />
          <h1 className="text-xl font-bold text-gray-800">Fimum</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={handleSettingsToggle} className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <Settings size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            {user?.email?.[0].toUpperCase()}
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={handleSettingsToggle} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Tone</label>
              <select 
                value={tone} 
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="Professional">Professional</option>
                <option value="Casual">Casual</option>
                <option value="Benglish Blunt">Benglish Blunt</option>
                <option value="Poetic">Poetic</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Language</label>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="en-US">English</option>
                <option value="hi-IN">Hindi</option>
                <option value="bn-BD">Bengali</option>
              </select>
            </div>
            <button 
              onClick={() => {
                setChatHistory([]);
                setCurrentChatId(null);
                setMessages([]);
                setIsSettingsOpen(false);
              }}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 mb-4"
            >
              Clear All Chats
            </button>
            <button 
              onClick={handleSettingsToggle}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r bg-white p-4 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
            <button 
              onClick={handleNewChat}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <MessageSquare size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chatHistory.map(chat => (
              <div 
                key={chat.id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer mb-2 transition-colors ${
                  currentChatId === chat.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentChatId(chat.id)}
              >
                <div className="truncate max-w-48">
                  {chat.title}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveChat(chat.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white shadow-sm border border-gray-200'
                  }`}
                >
                  {message.type === 'file' ? (
                    <div className="flex items-center space-x-2">
                      <FileText size={16} />
                      <span className="text-sm">{message.filename}</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white shadow-sm border border-gray-200 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-2 h-2 bg-gray-500 rounded-full"
                    />
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, delay: 0.2, repeat: Infinity }}
                      className="w-2 h-2 bg-gray-500 rounded-full"
                    />
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, delay: 0.4, repeat: Infinity }}
                      className="w-2 h-2 bg-gray-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Message Fimum..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputText.trim() !== '') {
                    handleSend();
                  }
                }}
              />
              
              <button 
                onClick={handleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100'
                }`}
              >
                <Mic size={20} />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Upload size={20} />
              </button>
              
              <button 
                onClick={handleSend}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;