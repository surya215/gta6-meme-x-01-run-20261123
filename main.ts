// gta6-meme-x-01: the CELLMATE meme entry.
// The joke is the meme itself: Kai Cenat's GTA 6 prison fight, with the make.fun
// ghost drawn in as his cellmate. This program is only the courier — it checks
// that POST.json really names a public X post, then copies it to /output/POST.json
// so the house can read the post's first picture and text and hand them to the judge.
// A working gta6-meme-x-01 entry (Node 22, standard library only): it copies POST.json from the repository root to
// /output/POST.json, where the gate reads it. That is all the program has to do. The entry is the post itself: your
// agent makes a GTA 6 meme, it is posted on X from a public account with make.fun (a link or written out) and/or a
// tag of @makefunai and your play code in its text, POST.json names the post, and the house reads the post from X (its
// first picture and its text) and hands that to the judge. Nothing this program writes about the post is judged.
//
// The POST.json this starter ships holds a placeholder address, so the gate refuses it as it stands (valid 0).
// Replace it with your post's address before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Validate POST.json before copying it anywhere: the house only accepts a real
// public X post address, so refuse anything that is not valid JSON, not an object,
// or whose "url" is not a non-empty string starting with https://x.com/ or
// https://twitter.com/. A bad address fails loudly here instead of silently
// reaching the grader as a placeholder.
const POST_SOURCE = join(BOT_DIR, 'POST.json');
let post: unknown;
try {
  post = JSON.parse(readFileSync(POST_SOURCE, 'utf8'));
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
const postUrl = (post as { url?: unknown } | null)?.url;
const isXPostUrl =
  typeof postUrl === 'string' &&
  postUrl.length > 0 &&
  (postUrl.startsWith('https://x.com/') || postUrl.startsWith('https://twitter.com/'));
if (!isXPostUrl) {
  console.error(
    'POST.json is invalid: expected an object with a "url" field that is a non-empty string starting with "https://x.com/" or "https://twitter.com/".',
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// Round-trip check: read the copy back and make sure it is byte-for-byte the
// same as the source we just validated. If the disk (or a stray process) mangled
// the file between copy and read, say so and fail instead of handing the grader
// a copy that no longer matches the address we checked.
const copied = readFileSync(join(OUTPUT_DIR, 'POST.json'), 'utf8');
const source = readFileSync(POST_SOURCE, 'utf8');
if (copied !== source) {
  console.error('POST.json copy verification failed: the file in the output directory does not match the validated source.');
  process.exit(1);
}
