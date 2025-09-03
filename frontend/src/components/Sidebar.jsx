import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  History, 
  User, 
  LogOut, 
  X, 
  Menu,
  Trash2,
  Settings
} from 'react-icons/ai';
import { format } from 'date-fns';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  conversations, 
  onSelectConversation, 
  onDeleteConversation,
  onNewConversation,
  activeConversation,
  user
}) => {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h1 className="font-bold text-lg">Fimum</h1>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <button 
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">New Chat</span>
        </button>
      </div>
      
      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Recent Chats
        </div>
        {conversations.map((conversation) => (
          <div 
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              activeConversation === conversation.id 
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <History size={16} className="flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="font-medium truncate">{conversation.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {format(new Date(conversation.timestamp), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conversation.id);
              }}
              className="text-gray-400 hover:text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      
      {/* User Profile */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
          </div>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;