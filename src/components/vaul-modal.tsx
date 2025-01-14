import { Drawer } from "vaul";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
};

export default function VaulModal({ isOpen, onClose, content }: Props) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-20" />
        <Drawer.Content className="bg-white dark:bg-[#242424] flex flex-col h-fit fixed bottom-0 left-0 right-0 outline-none z-30 dark:text-app-light">
          <div className="pt-4 bg-white dark:bg-[#242424] rounded-t-xl flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-app-light/50" />
            <Drawer.Title></Drawer.Title>
            {content}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
