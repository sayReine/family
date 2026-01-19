import { createContext } from "react";
import type { BackendAuthContextType } from "./BackendAuthTypes";

export const BackendAuthContext = createContext<BackendAuthContextType | undefined>(undefined);