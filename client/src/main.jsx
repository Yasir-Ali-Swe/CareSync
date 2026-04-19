import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store/store";
import { queryClient } from "@/lib/queryClient";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </TooltipProvider>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>,
);
