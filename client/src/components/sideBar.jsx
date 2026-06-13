import React, { useState } from 'react';
import { useAppContext } from '../context/appContext';
import { assets } from '../assets/assets';
import moment from 'moment';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SideBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats,
    setSelectedChat,
    selectedChat,
    theme,
    setTheme,
    user,
    createNewChat,
    axios,
    setChats,
    fetchUserChats,
    token,
    setToken,
  } = useAppContext();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.success('Logged Out Successfully');
  };

  // Delete Chat
  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirm = window.confirm('Are you sure you want to delete this chat?');
      if (!confirm) return;

      const { data } = await axios.post(
        '/api/chat/delete',
        { chatId },
        { headers: { Authorization: token } }
      );

      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        await fetchUserChats();
        toast.success(data.message || 'Chat deleted successfully');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Failed to delete chat'
      );
    }
  };

  // Handle New Chat
  const handleNewChat = async () => {
    try {
      await createNewChat(); // Creates chat + updates state in context
      setIsMenuOpen(false);   // Close sidebar on mobile
    } catch (error) {
      toast.error('Failed to create new chat');
    }
  };

  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b 
      from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl
      transition-all duration-500 max-md:absolute left-0 z-10 bg-white dark:bg-black
      ${!isMenuOpen && 'max-md:translate-x-full'}`}
    >
      {/* Logo */}
      <img
        src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
        alt="Logo"
        className="w-full max-w-48 mx-auto"
      />

      {/* New Chat Button - FIXED */}
      <button
        onClick={handleNewChat}
        className="flex justify-center items-center w-full py-3 mt-8 text-white 
        bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm font-medium rounded-xl 
        cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/30"
      >
        <span className="mr-2 text-2xl leading-none">+</span>
        New Chat
      </button>

      {/* Search */}
      <div className="flex items-center gap-3 p-3 mt-6 border border-gray-400 dark:border-white/20 rounded-xl bg-white/50 dark:bg-black/50">
        <img
          src={assets.search_icon}
          className="w-4 not-dark:invert"
          alt="Search"
        />
        <input
          type="text"
          placeholder="Search Conversations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm placeholder:text-gray-400 outline-none bg-transparent w-full dark:text-white"
        />
      </div>

      {/* Recent Chats Title */}
      {chats.length > 0 && (
        <p className="mt-6 text-sm font-medium dark:text-white px-1">
          Recent Chats
        </p>
      )}

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto mt-3 text-sm space-y-2 pr-2 custom-scrollbar">
        {chats
          .filter((chat) => {
            const firstMessage = chat.messages?.[0]?.content || '';
            const name = chat.name || '';
            return (
              firstMessage.toLowerCase().includes(search.toLowerCase()) ||
              name.toLowerCase().includes(search.toLowerCase())
            );
          })
          .map((chat) => {
            const isSelected = selectedChat?._id === chat._id;

            return (
              <div
                key={chat._id}
                onClick={() => {
                  navigate('/');
                  setSelectedChat(chat);
                  setIsMenuOpen(false);
                }}
                className={`group p-3 px-4 rounded-2xl cursor-pointer flex justify-between items-start transition-all duration-200 border
                  ${
                    isSelected
                      ? 'bg-purple-600/10 dark:bg-purple-600/20 border-purple-500'
                      : 'dark:bg-[#57317C]/10 bg-slate-50 border-gray-300 dark:border-[#80609F]/15 hover:bg-slate-100 dark:hover:bg-[#57317C]/20'
                  }`}
              >
                <div className="overflow-hidden flex-1 pr-2">
                  <p className="truncate font-medium dark:text-white text-[15px]">
                    {chat.messages?.length > 0
                      ? chat.messages[0].content.slice(0, 45) + '...'
                      : chat.name || 'New Chat'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#B1A6C0] mt-1">
                    {moment(chat.updatedAt).fromNow()}
                  </p>
                </div>

                {/* Delete Icon - FIXED */}
                <img
                  src={assets.bin_icon}
                  className="hidden group-hover:block w-4 h-4 cursor-pointer mt-1 not-dark:invert opacity-70 hover:opacity-100 transition-all"
                  alt="Delete"
                  onClick={(e) =>
                    toast.promise(deleteChat(e, chat._id), {
                      loading: 'Deleting...',
                      success: 'Chat deleted',
                      error: 'Failed to delete',
                    })
                  }
                />
              </div>
            );
          })}

        {chats.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10 text-sm">
            No chats yet. Create a new one!
          </p>
        )}
      </div>

      {/* Community Images */}
      <div
        onClick={() => {
          navigate('/community');
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
      >
        <img
          src={assets.gallery_icon}
          className="w-5 not-dark:invert"
          alt="Community"
        />
        <p className="dark:text-white text-sm font-medium">Community Images</p>
      </div>

      {/* Credits */}
      <div
        onClick={() => {
          navigate('/credits');
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-3 p-3 mt-3 border border-gray-300 dark:border-white/15 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
      >
        <img
          src={assets.diamond_icon}
          className="w-5 dark:invert"
          alt="Credits"
        />
        <div>
          <p className="dark:text-white text-sm font-medium">
            Credits: <span className="font-semibold">{user?.credits || 0}</span>
          </p>
          <p className="text-xs text-gray-400">Purchase more to continue</p>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center justify-between gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-2xl">
        <div className="flex items-center gap-3 text-sm">
          <img
            src={assets.theme_icon}
            className="w-5 not-dark:invert"
            alt="Theme"
          />
          <p className="dark:text-white">Dark Mode</p>
        </div>

        <label className="relative inline-flex cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={theme === 'dark'}
            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
          <div className="w-11 h-6 bg-gray-400 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600 transition-all"></div>
          <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
        </label>
      </div>

      {/* User Account */}
      <div className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-2xl cursor-pointer group">
        <img
          src={assets.user_icon}
          className="w-8 h-8 rounded-full object-cover"
          alt="User"
        />
        <p className="flex-1 text-sm dark:text-white truncate font-medium">
          {user ? user.name : 'Login to your account'}
        </p>

        {user && (
          <img
            onClick={logout}
            src={assets.logout_icon}
            className="h-5 cursor-pointer hidden group-hover:block not-dark:invert"
            alt="Logout"
          />
        )}
      </div>

      {/* Mobile Close Button */}
      <img
        onClick={() => setIsMenuOpen(false)}
        src={assets.close_icon}
        className="absolute top-4 right-4 w-6 h-6 cursor-pointer md:hidden not-dark:invert"
        alt="Close"
      />
    </div>
  );
};

export default SideBar;