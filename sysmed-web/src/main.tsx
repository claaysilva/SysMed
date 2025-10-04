import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import NotificationProvider from "./components/NotificationProvider.tsx";
import "./index.css";

console.log("main.tsx is loading");

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <NotificationProvider>
            <ToastProvider>
                <App />
            </ToastProvider>
        </NotificationProvider>
    </BrowserRouter>
);
