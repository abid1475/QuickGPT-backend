// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState
// } from "react";

// import { useNavigate } from "react-router-dom";
// import axios from 'axios';
// import toast from "react-hot-toast";

// import { dummyChats } from "../assets/assets";

// const appContext = createContext();

// axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

// export const AppContextProvider = ({ children }) => {

//   const navigate = useNavigate();

//   const [user, setUser] = useState(null);
//   const [chats, setChats] = useState([]);
//   const [selectedChat, setSelectedChat] = useState(null);
  
//   const [token, setToken] = useState(localStorage.getItem("token") || null);
//   const [loadingUser, setLoadingUser] = useState(true);
//   const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

//   // Fetch User
//   const fetchUser = async () => {
//     if (!token) return;

//     try {
//       const { data } = await axios.get('/api/user/data', {
//         headers: { 
//           Authorization: token
//         }
//       });

//       if (data.success) {
//         setUser(data.user);
//       } else {
//         toast.error(data.message);
//         logout();
//       }
//     } catch (error) {
//       console.error("Fetch User Error:", error);

//       if (error.response?.status === 401) {
//         toast.error("Session expired or invalid token. Please login again.");
//         logout();
//       } else {
//         toast.error(error.response?.data?.message || error.message);
//       }
//     } finally {
//       setLoadingUser(false);
//     }
//   };

//   // Logout Function
//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('token');
//     toast.success("Logged out successfully");
//     navigate('/login');
//   };

//   // Create New Chat
//   const createNewChat = async () => {
//     try {
//       const { data } = await axios.post('/api/chat/new', {}, {
//         headers: { Authorization: token }
//       });

//       if (data.success) {
//         setChats(prev => [data.chat, ...prev]);
//         setSelectedChat(data.chat);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to create new chat");
//     }
//   };

//   // Fetch User Chats (Dummy for now)
//   const fetchUserChats = async () => {
//     setChats(dummyChats);
//     if (dummyChats.length > 0) {
//       setSelectedChat(dummyChats[0]);
//     }
//   };

//   // Theme Effect
//   useEffect(() => {
//     if (theme === 'dark') {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//     localStorage.setItem('theme', theme);
//   }, [theme]);

//   // Load user when token changes
//   useEffect(() => {
//     if (token) {
//       fetchUser();
//     } else {
//       setUser(null);
//       setLoadingUser(false);
//     }
//   }, [token]);

//   // Fetch chats when user is loaded
//   useEffect(() => {
//     if (user) {
//       fetchUserChats();
//     } else {
//       setChats([]);
//       setSelectedChat(null);
//     }
//   }, [user]);

//   const value = {
//     user,
//     setUser,
//     token,
//     setToken,
//     loadingUser,
//     theme,
//     setTheme,
//     logout,
//     fetchUser,
//     chats,
//     setChats,
//     selectedChat,
//     setSelectedChat,
//     fetchUserChats,
//     createNewChat,     // ✅ Now properly included
//     axios,
//   };



//   return (
//     <appContext.Provider value={value}>
//       {children}
//     </appContext.Provider>
//   );
// };

// // ✅ Correct Export
// export const useAppContext = () => useContext(appContext);


















































import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";

const appContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

export const AppContextProvider = ({ children }) => {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Fetch User
  const fetchUser = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get('/api/user/data', {
        headers: { 
          Authorization: token
        }
      });

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
        logout();
      }
    } catch (error) {
      console.error("Fetch User Error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired or invalid token. Please login again.");
        logout();
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setLoadingUser(false);
    }
  };

  // Logout Function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  // Create New Chat
  const createNewChat = async () => {
    try {
      const { data } = await axios.post('/api/chat/new', {}, {
        headers: { Authorization: token }
      });

      if (data.success) {
        setChats(prev => [data.chat, ...prev]);
        setSelectedChat(data.chat);
        toast.success("New chat created successfully!");
        return data.chat;
      } else {
        toast.error(data.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Create Chat Error:", error);
      toast.error(error.response?.data?.message || "Failed to create new chat");
      throw error;
    }
  };

  // Fetch User Chats - REAL API (Fixed)
  const fetchUserChats = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get('/api/chat', {
        headers: { Authorization: token }
      });

      if (data.success) {
        setChats(data.chats || []);
        // Auto select first chat if none selected
        if (data.chats?.length > 0 && !selectedChat) {
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message || "Failed to load chats");
      }
    } catch (error) {
      console.error("Fetch Chats Error:", error);
      toast.error("Failed to load your chats");
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

  // Load user when token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setChats([]);
      setSelectedChat(null);
      setLoadingUser(false);
    }
  }, [token]);

  // Fetch chats when user is loaded
  useEffect(() => {
    if (user && token) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user, token]);

  const value = {
    user,
    setUser,
    token,
    setToken,
    loadingUser,
    theme,
    setTheme,
    logout,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUserChats,
    createNewChat,
    axios,
  };

  return (
    <appContext.Provider value={value}>
      {children}
    </appContext.Provider>
  );
};

export const useAppContext = () => useContext(appContext);