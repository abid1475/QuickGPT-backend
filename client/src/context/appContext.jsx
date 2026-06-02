import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
  dummyChats,
  dummyUserData
} from "../assets/assets";

const appContext = createContext();

export const AppContextProvider = ({ children }) => {

  const navigate = useNavigate();

  // User State
  const [user, setUser] = useState(null);

  // Chats State
  const [chats, setChats] = useState([]);

  // Selected Chat State
  const [selectedChat, setSelectedChat] = useState(null);

  // Theme State
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  // Fetch User
  const fetchUser = async () => {

    setUser(dummyUserData);

  };

  // Fetch User Chats
  const fetchUserChats = async () => {

    setChats(dummyChats);

    // Select First Chat Automatically
    if (dummyChats.length > 0) {
      setSelectedChat(dummyChats[0]);
    }

  };

  // Theme Effect
  useEffect(() => {

    if (theme === 'dark') {

      document.documentElement.classList.add('dark');

    } else {

      document.documentElement.classList.remove('dark');

    }

    localStorage.setItem('theme', theme);

  }, [theme]);

  // User Effect
  useEffect(() => {

    if (user) {

      fetchUserChats();

    } else {

      setChats([]);
      setSelectedChat(null);

    }

  }, [user]);

  // Initial Load
  useEffect(() => {

    fetchUser();

  }, []);

  // Context Values
  const value = {

    navigate,

    user,
    setUser,
    fetchUser,

    chats,
    setChats,

    selectedChat,
    setSelectedChat,

    theme,
    setTheme

  };

  return (

    <appContext.Provider value={value}>

      {children}

    </appContext.Provider>

  );

};

export const useAppContext = () => useContext(appContext);