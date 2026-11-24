// Converts demo/toymatch-demo.webm to demo/toymatch-demo.mp4 (H.264) with ffmpeg.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const dir = import.meta.dirname;
const input = path.join(dir, "toymatch-demo.webm");
const output = path.join(dir, "toymatch-demo.mp4");

if (!existsSync(input)) {
  console.error("No demo/toymatch-demo.webm found. Record it first.");
  process.exit(1);
}

if (spawnSync("ffmpeg", ["-version"]).error) {
  console.log("ffmpeg is not installed, so only the .webm video was saved.");
  console.log("To also get an .mp4 on a Mac, install ffmpeg with:  brew install ffmpeg");
  process.exit(0);
}

execFileSync(
  "ffmpeg",
  ["-y", "-loglevel", "error", "-i", input, "-c:v", "libx264", "-pix_fmt", "yuv420p",
   "-crf", "20", "-preset", "slow", "-movflags", "+faststart", "-an", output],
  { stdio: "inherit" },
);
console.log(`Saved ${path.relative(process.cwd(), input)} and ${path.relative(process.cwd(), output)}`);
