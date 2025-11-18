import { createContext } from "react";

// Tipos
export type User = {
    displayName: string | undefined;
    id: number;
    name?: string;
    lastName: string;
    email?: string;
    role?: string;
    avatar: string;
};

export type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    loginWithToken: (token: string) => Promise<void>;
    logout: () => Promise<void>;
};

// Context (solo se crea y exporta aquí, no hay componentes)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);