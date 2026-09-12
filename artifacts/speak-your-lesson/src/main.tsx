import { createRoot } from "react-dom/client";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import { getCredential } from "./lib/auth-session";
import { getApiBaseUrl } from "./lib/api-base-url";
import "./index.css";

setBaseUrl(getApiBaseUrl());
setAuthTokenGetter(getCredential);

createRoot(document.getElementById("root")!).render(<App />);
