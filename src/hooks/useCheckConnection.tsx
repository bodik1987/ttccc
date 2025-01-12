import { useState, useEffect } from "react";

export default function useCheckConnection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checkConnection] = useState(false);

  useEffect(() => {
    const onlineHandler = () => setIsOnline(true);
    const offlineHandler = () => setIsOnline(false);

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, [checkConnection]);

  return isOnline;
}
