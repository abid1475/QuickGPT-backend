import React, { useEffect } from 'react';
import { assets } from '../assets/assets';
import moment from 'moment';
import Markdown from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Better dark theme for code
import axios from 'axios';

const MessageBox = ({ message }) => {
  // Highlight code blocks when message changes
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  // Remove unused function or implement properly if needed
  // const replyContent = async (e) => { ... };

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group my-6 px-4`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 pt-1">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center ring-2 ring-white dark:ring-[#1f1b2e]">
              <img 
                src={assets.logo_full || assets.bot_icon} 
                alt="AI" 
                className="w-5 h-5" 
              />
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`relative px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed
              ${isUser 
                ? 'bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-white rounded-br-none' 
                : 'bg-white dark:bg-[#2A2438] border border-[#80609F]/20 dark:border-[#80609F]/40 rounded-bl-none shadow-sm'
              }`}
          >
            {message.isImage ? (
              <img
                src={message.content}
                alt="Generated image"
                className="max-w-md rounded-2xl shadow-md"
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none reset-tw">
                <Markdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return !inline ? (
                        <pre className="rounded-2xl !bg-[#1e1b2e] p-4 overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-black/20 px-1.5 py-0.5 rounded" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-[10px] text-gray-400 dark:text-[#B1A6C0] mt-1.5 px-2">
            {moment(message.timestamp || message.createdAt).fromNow()}
          </span>
        </div>

        {/* User Avatar (Right Side) */}
        {isUser && (
          <div className="flex-shrink-0 pt-1">
            <img
              src={assets.user_icon}
              alt="You"
              className="w-8 h-8 rounded-2xl object-cover ring-2 ring-white dark:ring-[#1f1b2e]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;