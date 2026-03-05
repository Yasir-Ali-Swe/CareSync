import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/provider/ThemeProvider";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <TooltipProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </TooltipProvider>
    <Toaster position="bottom-right" />
  </BrowserRouter>,
);
