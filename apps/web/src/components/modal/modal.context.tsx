import React, { ReactNode, createContext, useContext, useState } from "react";

type ModalContextType = {
  children: React.ReactNode;
  isOpen: boolean;
  openModal: (children: React.ReactNode) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

type ModalProviderProps = {
  children: ReactNode;
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalChildren, setModalChildren] = useState<React.ReactNode>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (children: React.ReactNode) => {
    setModalChildren(children);
    setIsOpen(true);
  };

  const closeModal = () => {
    setModalChildren(null);
    setIsOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{ children: modalChildren, isOpen, openModal, closeModal }}
    >
      <div id="modal-container z-10">{children}</div>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
