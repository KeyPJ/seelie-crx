import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import '@assets/styles/tailwind.css';
import ExDialog from "@pages/popup/SeelieExDialog";

function init() {
  const rootContainer = document.querySelector("#_root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<ExDialog />);
}

init();
