import { spawn } from "child_process";
import { bin } from "cloudflared";
spawn(bin, ["tunnel", "create", "Potentastic"], { stdio: "inherit" });
