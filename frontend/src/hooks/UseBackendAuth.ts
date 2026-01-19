import { useContext } from "react";
import { BackendAuthContext } from "../contexts/BackendAuthContext";
import type { BackendAuthContextType } from "../contexts/BackendAuthTypes";

export const useBackendAuth = (): BackendAuthContextType => {
  const context = useContext(BackendAuthContext);
  if (!context) throw new Error("useBackendAuth must be used within a BackendAuthProvider");
  return context;
};
