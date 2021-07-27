import React from "react";
import { ModalContextAction, modalContextReducer } from "./reducer";

export interface ModalContextState {
  isSelectPairModalOpen: boolean;
  isDonateModalOpen: boolean;
}
const initialState: ModalContextState = {
  isSelectPairModalOpen: true,
  isDonateModalOpen: false,
};

interface ModalContextProviderProps {
  children: React.ReactNode;
}
const ModalContext = React.createContext<
  | { state: ModalContextState; dispatch: (action: ModalContextAction) => void }
  | undefined
>(undefined);

const ModalContextProvider = ({ children }: ModalContextProviderProps) => {
  const [state, dispatch] = React.useReducer(modalContextReducer, initialState);
  const value = { state, dispatch };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

function useModalContext() {
  const context = React.useContext(ModalContext);
  if (context === undefined) {
    throw new Error(
      "useModalContext must be used within a ModalContextProvider"
    );
  }
  return context;
}

export { ModalContextProvider, useModalContext };