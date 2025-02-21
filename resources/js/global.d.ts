// resources/js/global.d.ts  (ou resources/js/types/global.d.ts)

import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export {}; // Important: fait de ce fichier un module