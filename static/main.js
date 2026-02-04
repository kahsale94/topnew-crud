import "./core/config.js";
import "./core/api.js";
import "./core/auth.js";
import "./core/guard.js";

import { bootstrap } from "./app/bootstrap.js";

document.addEventListener("DOMContentLoaded", () => {
    bootstrap();
});