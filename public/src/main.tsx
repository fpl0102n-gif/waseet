import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from "./i18n";

// Sync <html> lang and dir with current language
const setLangDir = (lng: string) => {
	const html = document.documentElement;
	html.lang = lng;
	html.dir = lng === "ar" ? "rtl" : "ltr";
};

setLangDir(i18n.language);
i18n.on("languageChanged", setLangDir);

createRoot(document.getElementById("root")!).render(<App />);
