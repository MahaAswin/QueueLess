/// <reference types="node" />

declare module 'expo-router' {
  export const Stack: any;
  export const Tabs: any;
  export const useRouter: () => {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
  };
  export const useLocalSearchParams: <T = Record<string, string>>() => T;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
  }
}
