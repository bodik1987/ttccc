import { useEffect } from "react";

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

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-end z-50"
      onClick={onClose}
    >
      <div
        className={`${modalStyles} max-w-md w-full bg-white dark:bg-app-dark-3 rounded-t-xl relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
