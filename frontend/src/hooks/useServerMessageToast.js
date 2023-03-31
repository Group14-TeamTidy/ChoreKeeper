import { useRef } from "react";

// A custom hook that returns a reference and a function to show the toast with a server message
const useServerMessageToast = () => {
  const toast = useRef(null);

  const showServerMessageToast = (message, severity) => {
    toast.current.show({
      severity: severity,
      summary: "Server Message",
      detail: message,
      life: 5000,
    });
  };

  return [toast, showServerMessageToast];
};

export default useServerMessageToast;
