/**
 * Plik: main.jsx
 * Autor: landzi
 * Opis: Moduł odpowiedzialny za logikę powiązaną z src/main.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import "./styles/globals.css";
import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
