import { bin, install } from "cloudflared";
import fs from "fs";
import { spawn } from "child_process";

if (!fs.existsSync(bin)) {
    await install(bin);
}
spawn(bin, ["tunnel", "login"], { stdio: "inherit" });