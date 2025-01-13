import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  modalStyles?: string;
  content: React.ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  modalStyles = "",
  content,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.1 },
          }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-end z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.1, type: "anticipate" },
            }}
            exit={{ opacity: 0, y: "100%" }}
            className={`${modalStyles} max-w-md w-full bg-white dark:bg-app-dark-3 rounded-t-xl relative`}
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
