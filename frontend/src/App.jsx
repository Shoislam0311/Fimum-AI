import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Sparkles,
  Moon,
  Sun,
  Languages,
  Settings
} from 'react-icons/ai';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AuthModal from './components/AuthModal';
import * as api from './services/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize app
  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('access_token');
    if (token) {
      // In a real app, you would verify the token
      setUser({
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com'
      });
    } else {
      setIsAuthModalOpen(true);
    }
    
    // Load mock conversations
    loadConversations();
    
    // Set theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const loadConversations = async () => {
    try {
      // Mock conversations
      const mockConversations = [
        { id: 'conv_1', title: 'Getting started with AI', timestamp: new Date(2024, 5, 10) },
        { id: 'conv_2', title: 'Analyze this image', timestamp: new Date(2024, 5, 9) },
        { id: 'conv_3', title: 'Build a simple app', timestamp: new Date(2024, 5, 8) }
      ];
      setConversations(mockConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleAuth = (userData) => {
    setUser(userData);
    localStorage.setItem('access_token', 'mock_token'); // In real app, use actual token
  };

  const handleSendMessage = async (text, files) => {
    if (!text.trim() && files.length === 0) return;
    
    // Add user message
    const userMessage = {
      id: `user_${Date.now()}`,
      text: text,
      sender: 'user',
      timestamp: new Date(),
      files: files
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // In a real app, this would upload files and send to backend
      // For demo, we'll simulate responses
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate AI response based on input
      let responseText = '';
      let modelUsed = '';
      let queryType = 'normal';
      
      if (text.toLowerCase().includes('image') || files.some(f => f.type.startsWith('image/'))) {
        queryType = 'image';
        modelUsed = 'Fimum Vision';
        responseText = "I've analyzed the image you provided. It appears to be a beautiful landscape with mountains and a lake. The composition follows the rule of thirds, creating a balanced and visually pleasing scene. The colors are vibrant, suggesting it was taken during golden hour. Would you like me to provide more specific analysis or help with anything related to this image?";
      } else if (text.toLowerCase().includes('code') || text.toLowerCase().includes('app')) {
        queryType = 'coding';
        modelUsed = 'Fimum Coder';
        responseText = "Here's a simple React component that displays a greeting:\n\n```jsx\nimport React from 'react';\n\nconst Greeting = ({ name }) => {\n  return (\n    <div className=\"greeting\">\n      <h1>Hello, {name}!</h1>\n      <p>Welcome to Fimum AI 🚀</p>\n    </div>\n  );\n};\n\nexport default Greeting;\n```\n\nThis component takes a `name` prop and displays a personalized greeting. You can customize the styling by adding CSS classes or using Tailwind classes.";
      } else if (text.toLowerCase().includes('think') || text.toLowerCase().includes('analyze')) {
        queryType = 'thinking';
        modelUsed = 'Fimum DeepThink';
        responseText = "Let me analyze this from multiple perspectives:\n\n🔍 **Analytical Approach**\nWhen examining this question, we need to consider the underlying principles and frameworks that govern this domain.\n\n💡 **Creative Perspective**\nLooking at this through a creative lens opens up possibilities that might not be immediately apparent.\n\n🌐 **Strategic Viewpoint**\nFrom a big-picture perspective, this connects to larger trends and patterns that extend beyond the immediate context.\n\nAfter synthesizing these perspectives, my recommendation is to approach this systematically while remaining open to innovative solutions.";
      } else {
        modelUsed = 'Fimum Basic';
        responseText = "Hello! I'm Fimum, your personal AI assistant created by STN-AI. How can I help you today? 😊\n\nI'm designed to provide helpful, professional responses while maintaining a friendly tone. Feel free to ask me anything - whether it's general knowledge, specific tasks, or just a friendly chat!";
      }
      
      // Add AI response
      const aiMessage = {
        id: `ai_${Date.now()}`,
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        model: modelUsed,
        queryType: queryType
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage = {
        id: `error_${Date.now()}`,
        text: "I apologize, but I encountered an error while processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleNewConversation = () => {
    setMessages([]);
    setActiveConversation(null);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation.id);
    setIsSidebarOpen(false);
    
    // Load mock conversation messages
    const mockMessages = [
      {
        id: '1',
        text: "Hello! I'm Fimum, your personal AI assistant created by STN-AI. How can I help you today?",
        sender: 'ai',
        timestamp: new Date(2024, 5, 10, 10, 30),
        model: 'Fimum Basic'
      },
      {
        id: '2',
        text: conversation.title,
        sender: 'user',
        timestamp: new Date(2024, 5, 10, 10, 31)
      },
      {
        id: '3',
        text: `I see you're interested in ${conversation.title.toLowerCase()}. Let me help you with that!`,
        sender: 'ai',
        timestamp: new Date(2024, 5, 10, 10, 32),
        model: 'Fimum Basic'
      }
    ];
    
    setMessages(mockMessages);
  };

  const handleDeleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversation === conversationId) {
      setMessages([]);
      setActiveConversation(null);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!user) {
    return (
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuth={handleAuth} 
      />
    );
  }

  return (
    <div className={`flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200 ${theme}`}>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={handleNewConversation}
        activeConversation={activeConversation}
        user={user}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Bar */}
        <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-gray-800 dark:text-white">Chat with Fimum</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative group">
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Languages size={18} />
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 hidden group-hover:block z-20">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    language === 'en' ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('bn')}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    language === 'bn' ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Bengali
                </button>
                <button 
                  onClick={() => setLanguage('hi')}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    language === 'hi' ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Hindi
                </button>
              </div>
            </div>
            
            {/* Theme toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            {/* Settings */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>
        
        {/* Chat Interface */}
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          isLoading={isLoading}
          theme={theme}
          setTheme={setTheme}
          language={language}
          setLanguage={setLanguage}
        />
      </div>
    </div>
  );
};

export default App;