import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/appContext';
import { assets } from '../assets/assets';
import Message from './messageBox';
import toast from 'react-hot-toast';

const ChatBox = () => {
  const containerRef = useRef(null);

  const { 
    selectedChat, 
    setSelectedChat, 
    chats, 
    createNewChat, 
    user,
    theme,
    axios,     
    token, 
    setUser 
  } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('text');
  const [isPublished, setIsPublished] = useState(false);

  // Auto create new chat
  useEffect(() => {
    if (user && (!chats || chats.length === 0)) {
      createNewChat();
    }
  }, [user, chats?.length, createNewChat]);

  // Load messages
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    }
  }, [selectedChat]);

  // Auto scroll
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to send message");
    if (!selectedChat?._id) return toast.error("No chat selected");

    const promptCopy = prompt.trim();
    if (!promptCopy) return;

    setLoading(true);
    setPrompt('');

    // Optimistic UI - Add user message
    const userMessage = { 
      role: 'user', 
      content: promptCopy, 
      timestamp: Date.now() 
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const { data } = await axios.post(
        `/api/message/${mode}`,
        { 
          chatId: selectedChat._id, 
          prompt: promptCopy, 
          isPublished: mode === 'image' ? isPublished : false 
        },
        { headers: { Authorization: token } }
      );

      if (data.success && data.reply) {
        setMessages(prev => [...prev, data.reply]);

        // Update credits from backend (safer)
        if (data.newCredits !== undefined) {
          setUser(prev => ({ ...prev, credits: data.newCredits }));
        }
      } else {
        toast.error(data.message || "Failed to get response");
        // Remove last user message on failure (optional)
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>
      {/* Header */}
      {selectedChat && (
        <div className='mb-4 flex justify-end'>
          <div className='flex flex-col gap-2 p-3 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md w-fit min-w-60'>
            <p className='font-medium dark:text-white'>{selectedChat.name}</p>
            <span className='text-gray-400 text-sm'>
              {selectedChat.updatedAt ? new Date(selectedChat.updatedAt).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll custom-scrollbar'>
        {!selectedChat ? (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img src={theme === 'dark' ? assets.logo_full_dark : assets.logo_full} alt="" className='w-full max-w-56 sm:max-w-68' />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white'>Ask me anything.</p>
          </div>
        ) : (
          messages.map((msg, i) => <Message key={i} message={msg} />)
        )}

        {loading && (
          <div className="loader flex items-center gap-1.5 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e) => setMode(e.target.value)} value={mode} className="text-sm pl-3 pr-2 outline-none bg-transparent">
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>

        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          type="text"
          placeholder="Type your prompt here..."
          className="flex-1 w-full text-sm outline-none bg-transparent"
          disabled={loading}
        />

        <button type="submit" disabled={loading || !prompt.trim()}>
          <img src={loading ? assets.stop_icon : assets.send_icon} className="w-8 cursor-pointer" alt="send" />
        </button>
      </form>

      {mode === "image" && (
        <label className='inline-flex items-center gap-2 mt-3 text-sm mx-auto'>
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          <p className='text-xs'>Publish to Community</p>
        </label>
      )}
    </div>
  );
};

export default ChatBox;