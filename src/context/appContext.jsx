import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const AppContext = createContext({});

const AppContextProvider = ({ children }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let mySubscription = null;
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [routeHash, setRouteHash] = useState("");
  const [isOnBottom, setIsOnBottom] = useState(false);
  const [newIncomingMessageTrigger, setNewIncomingMessageTrigger] = useState(null);
  const [unviewedMessageCount, setUnviewedMessageCount] = useState(0);
  const [countryCode, setCountryCode] = useState(""); // State to store country code

  const getLocation = async () => {
    try {
      const res = await fetch("http://ip-api.com/json/");
      const data = await res.json();

      const { countryCode, message } = data;
      if (message === 'private range' || message === 'reserved range') {
        throw new Error('Private or Reserved IP Address');
      }

      if (countryCode) {
        setCountryCode(countryCode); // Set country code to state
      } else {
        throw new Error('Country code not found');
      }
    } catch (error) {
      console.error(
        `Error getting location from http://ip-api.com/json/:`,
        error.message
      );
    }
  };

  const randomUsername = () => {
    return `@user${Date.now().toString().substr(-4)}`;
  };
  const initializeUser = () => {
    const user = supabase.auth.user();
    let username;
    if (user) {
      username = user.user_metadata.user_name;
    } else {
      username = localStorage.getItem("username") || randomUsername();
    }
    setUsername(username);
    localStorage.setItem("username", username);
  };

  useEffect(() => {
    initializeUser();
    getMessagesAndSubscribe();

    const storedCountryCode = localStorage.getItem("countryCode");
    if (storedCountryCode && storedCountryCode !== "undefined") {
      setCountryCode(storedCountryCode);
    } else {
      getLocation(); // Fetch location if not stored in localStorage
    }

    supabase.auth.onAuthStateChange((event, session) => {
      console.log("onAuthStateChange", { event, session });
      if (event === "SIGNED_IN") initializeUser();
    });

    return () => {
      supabase.removeSubscription();
      console.log("Remove supabase subscription by useEffect unmount");
    };
  }, []);

  useEffect(() => {
    if (newIncomingMessageTrigger?.username === username) scrollToBottom();
    else setUnviewedMessageCount((prevCount) => prevCount + 1);
  }, [newIncomingMessageTrigger]);

  const handleNewMessage = (payload) => {
    setMessages((prevMessages) => [payload.new, ...prevMessages]);
    setNewIncomingMessageTrigger(payload.new);
  };

  const getInitialMessages = async () => {
    if (!messages.length) {
      const { data, error } = await supabase
        .from("messages")
        .select()
        .range(0, 49)
        .order("id", { ascending: false });
      setLoadingInitial(false);
      if (error) {
        setError(error.message);
        supabase.removeSubscription(mySubscription);
        mySubscription = null;
        return;
      }
      setMessages(data);
      scrollToBottom();
    }
  };

  const getMessagesAndSubscribe = async () => {
    setError("");
    if (!mySubscription) {
      getInitialMessages();
      mySubscription = supabase
        .from("messages")
        .on("*", (payload) => {
          handleNewMessage(payload);
        })
        .subscribe();
    }
  };

  const scrollRef = useRef();
  const onScroll = async ({ target }) => {
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 1) {
      setUnviewedMessageCount(0);
      setIsOnBottom(true);
    } else {
      setIsOnBottom(false);
    }

    if (target.scrollTop === 0) {
      const { data, error } = await supabase
        .from("messages")
        .select()
        .range(messages.length, messages.length + 49)
        .order("id", { ascending: false });
      if (error) {
        setError(error.message);
        return;
      }
      target.scrollTop = 1;
      setMessages((prevMessages) => [...prevMessages, ...data]);
    }
  };

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  return (
    <AppContext.Provider
      value={{
        supabase,
        auth: supabase.auth,
        messages,
        loadingInitial,
        error,
        getMessagesAndSubscribe,
        username,
        setUsername,
        randomUsername,
        routeHash,
        scrollRef,
        onScroll,
        scrollToBottom,
        isOnBottom,
        country: countryCode,
        unviewedMessageCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export { AppContext as default, AppContextProvider, useAppContext };
