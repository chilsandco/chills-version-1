// Visits from AI crawlers and AI assistants (ChatGPT search, Claude, Perplexity and others).
// Every request whose User-Agent names a known AI bot is counted, with the page and the status the
// site answered (a 403 or 503 here means the bot was turned away). The tally lives in
// ~/chils-data/ai-visits.json so it survives deploys, and /admin/ai-visits shows it.
import fs from "fs";
import type { Express, Request, Response, NextFunction } from "express";
import { dataFile } from "./storage";

export interface AiBot {
  name: string;
  company: string;
  purpose: "search" | "assistant" | "training";
  note: string;
  match: RegExp;
}

// Order matters: the more specific names come first (Perplexity-User before PerplexityBot, etc.).
export const AI_BOTS: AiBot[] = [
  { name: "OAI-SearchBot", company: "OpenAI", purpose: "search", note: "Builds ChatGPT search results. The one that gets you shown in ChatGPT.", match: /OAI-SearchBot/i },
  { name: "ChatGPT-User", company: "OpenAI", purpose: "assistant", note: "A ChatGPT user asked about a page and ChatGPT opened it.", match: /ChatGPT-User/i },
  { name: "GPTBot", company: "OpenAI", purpose: "training", note: "Collects pages for training OpenAI models.", match: /GPTBot/i },
  { name: "Claude-SearchBot", company: "Anthropic", purpose: "search", note: "Indexes pages for Claude's web search answers.", match: /Claude-SearchBot/i },
  { name: "Claude-User", company: "Anthropic", purpose: "assistant", note: "A Claude user asked about a page and Claude opened it.", match: /Claude-User/i },
  { name: "ClaudeBot", company: "Anthropic", purpose: "training", note: "Collects pages for training Anthropic models.", match: /ClaudeBot/i },
  { name: "Perplexity-User", company: "Perplexity", purpose: "assistant", note: "A Perplexity user's question opened the page.", match: /Perplexity-User/i },
  { name: "PerplexityBot", company: "Perplexity", purpose: "search", note: "Indexes pages for Perplexity answers.", match: /PerplexityBot/i },
  { name: "Google-CloudVertexBot", company: "Google", purpose: "assistant", note: "Fetches pages for Google Vertex AI agents.", match: /Google-CloudVertexBot/i },
  { name: "Meta-ExternalFetcher", company: "Meta", purpose: "assistant", note: "Meta AI opened a page a user linked or asked about.", match: /meta-externalfetcher/i },
  { name: "Meta-ExternalAgent", company: "Meta", purpose: "training", note: "Collects pages for Meta AI.", match: /meta-externalagent/i },
  { name: "Applebot", company: "Apple", purpose: "search", note: "Siri and Spotlight suggestions, and Apple Intelligence.", match: /Applebot/i },
  { name: "Amazonbot", company: "Amazon", purpose: "search", note: "Alexa answers and Amazon services.", match: /Amazonbot/i },
  { name: "DuckAssistBot", company: "DuckDuckGo", purpose: "assistant", note: "DuckDuckGo's AI answers.", match: /DuckAssistBot/i },
  { name: "MistralAI-User", company: "Mistral", purpose: "assistant", note: "Le Chat opened a page for a user.", match: /MistralAI-User/i },
  { name: "Bytespider", company: "ByteDance", purpose: "training", note: "Collects pages for ByteDance (TikTok, Doubao) models.", match: /Bytespider/i },
  { name: "CCBot", company: "Common Crawl", purpose: "training", note: "Open web archive that many AI models train on.", match: /CCBot/i },
];

export function aiBotOf(userAgent: string | undefined): AiBot | null {
  if (!userAgent) return null;
  return AI_BOTS.find(b => b.match.test(userAgent)) || null;
}

interface Visit { t: string; bot: string; path: string; status: number }
interface Tally {
  since: string;
  total: number;
  bots: Record<string, { count: number; first: string; last: string; blocked: number }>;
  days: Record<string, Record<string, number>>;
  paths: Record<string, Record<string, number>>;
  recent: Visit[];
}

const MAX_RECENT = 300;
const MAX_DAYS = 120;
const MAX_PATHS_PER_BOT = 200;
const SAVE_EVERY_MS = 30_000;

const empty = (): Tally => ({ since: new Date().toISOString(), total: 0, bots: {}, days: {}, paths: {}, recent: [] });

/** Starts counting. Call right after the app is created; it returns a function that adds the
 *  admin-only /api/admin/ai-visits route once the login check exists. */
export function startAiVisits(app: Express) {
  const file = dataFile("ai-visits.json");
  let tally: Tally = empty();
  try {
    if (fs.existsSync(file)) tally = { ...empty(), ...JSON.parse(fs.readFileSync(file, "utf-8")) };
  } catch (e: any) {
    console.error("[AI VISITS] Could not read the log, starting a new one:", e.message);
  }

  let dirty = false;
  const save = () => {
    if (!dirty) return;
    dirty = false;
    try {
      fs.writeFileSync(file + ".tmp", JSON.stringify(tally));
      fs.renameSync(file + ".tmp", file);
    } catch (e: any) {
      console.error("[AI VISITS] Could not save the log:", e.message);
    }
  };
  setInterval(save, SAVE_EVERY_MS).unref();
  process.once("beforeExit", save);
  process.once("SIGTERM", () => { save(); process.exit(0); });

  const record = (bot: string, path: string, status: number) => {
    const now = new Date();
    const t = now.toISOString();
    const day = t.slice(0, 10);

    tally.total++;
    const b = (tally.bots[bot] ||= { count: 0, first: t, last: t, blocked: 0 });
    b.count++;
    b.last = t;
    if (status === 401 || status === 403 || status === 429 || status === 503) b.blocked++;

    const d = (tally.days[day] ||= {});
    d[bot] = (d[bot] || 0) + 1;
    const dayKeys = Object.keys(tally.days);
    if (dayKeys.length > MAX_DAYS) for (const k of dayKeys.sort().slice(0, dayKeys.length - MAX_DAYS)) delete tally.days[k];

    const p = (tally.paths[bot] ||= {});
    const key = p[path] !== undefined || Object.keys(p).length < MAX_PATHS_PER_BOT ? path : "(other pages)";
    p[key] = (p[key] || 0) + 1;

    tally.recent.unshift({ t, bot, path, status });
    if (tally.recent.length > MAX_RECENT) tally.recent.length = MAX_RECENT;
    dirty = true;
  };

  // Count first, before holding mode or anything else can answer, so turned-away visits show too.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const bot = aiBotOf(req.get("user-agent"));
    if (bot) {
      const path = (req.path || "/").slice(0, 200);
      res.on("finish", () => record(bot.name, path, res.statusCode));
    }
    next();
  });

  return (...guards: Array<(req: any, res: any, next: any) => void>) => {
    app.get("/api/admin/ai-visits", ...guards, (req: any, res: Response) => {
      res.setHeader("Cache-Control", "no-store");
      res.json({
        ...tally,
        catalog: AI_BOTS.map(({ match, ...rest }) => rest),
        now: new Date().toISOString(),
      });
    });
  };
}
