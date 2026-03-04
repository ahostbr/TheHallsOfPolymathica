import { ipcMain, BrowserWindow, app } from "electron";
import { join } from "path";
import { readFile, mkdir, writeFile } from "fs/promises";
import { platform, homedir } from "os";
import * as pty from "node-pty";
import Database from "better-sqlite3";
import { mkdirSync, existsSync, readFileSync } from "fs";
import * as http from "http";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
let counter = 0;
const MAX_BUFFER_SIZE = 32768;
class PtyManager {
  constructor() {
    this.sessions = /* @__PURE__ */ new Map();
    this.outputBuffers = /* @__PURE__ */ new Map();
  }
  create(shell, cwd, onData, onExit) {
    const id = `pty-${++counter}-${Date.now()}`;
    const defaultShell = platform() === "win32" ? "powershell.exe" : process.env.SHELL || "/bin/bash";
    const proc = pty.spawn(shell || defaultShell, [], {
      name: "xterm-256color",
      cols: 80,
      rows: 24,
      cwd: cwd || process.cwd(),
      env: process.env
    });
    const session = { process: proc, id };
    this.sessions.set(id, session);
    this.outputBuffers.set(id, "");
    proc.onData((data) => {
      let buf = (this.outputBuffers.get(id) || "") + data;
      if (buf.length > MAX_BUFFER_SIZE) {
        buf = buf.slice(buf.length - MAX_BUFFER_SIZE);
      }
      this.outputBuffers.set(id, buf);
      onData?.(data);
    });
    proc.onExit(({ exitCode }) => {
      this.sessions.delete(id);
      this.outputBuffers.delete(id);
      onExit?.(exitCode);
    });
    return id;
  }
  write(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.process.write(data);
    return true;
  }
  resize(sessionId, cols, rows) {
    this.sessions.get(sessionId)?.process.resize(cols, rows);
  }
  kill(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.process.kill();
      this.sessions.delete(sessionId);
      this.outputBuffers.delete(sessionId);
    }
  }
  killAll() {
    this.sessions.forEach((session) => {
      session.process.kill();
    });
    this.sessions.clear();
    this.outputBuffers.clear();
  }
  readOutput(sessionId) {
    return this.outputBuffers.get(sessionId) ?? null;
  }
  listSessions() {
    return Array.from(this.sessions.values()).map((s) => ({ id: s.id, pid: s.process.pid }));
  }
}
const ptyManager = new PtyManager();
function registerPtyHandlers() {
  ipcMain.handle("pty:create", async (_e, shell, cwd) => {
    const sessionId = ptyManager.create(shell, cwd, (data) => {
      const windows = BrowserWindow.getAllWindows();
      for (const win of windows) {
        win.webContents.send(`pty:data:${sessionId}`, data);
      }
    }, (exitCode) => {
      const windows = BrowserWindow.getAllWindows();
      for (const win of windows) {
        win.webContents.send(`pty:exit:${sessionId}`, exitCode);
      }
    });
    return sessionId;
  });
  ipcMain.on("pty:write", (_e, sessionId, data) => {
    ptyManager.write(sessionId, data);
  });
  ipcMain.on("pty:resize", (_e, sessionId, cols, rows) => {
    ptyManager.resize(sessionId, cols, rows);
  });
  ipcMain.on("pty:kill", (_e, sessionId) => {
    ptyManager.kill(sessionId);
  });
}
let db = null;
function getDb() {
  if (db) return db;
  const dataDir = join(homedir(), ".polymathica");
  mkdirSync(dataDir, { recursive: true });
  const dbPath = join(dataDir, "polymathica.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}
function initSchema(db2) {
  db2.exec(`
    CREATE TABLE IF NOT EXISTS polymaths (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      agent_file TEXT NOT NULL,
      portrait_path TEXT,
      model_path TEXT,
      color TEXT,
      total_sessions INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      polymath_id TEXT NOT NULL REFERENCES polymaths(id),
      user_prompt TEXT NOT NULL,
      full_response TEXT NOT NULL,
      framework_sections JSON,
      rubric_scores JSON,
      token_count INTEGER,
      duration_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
      tag TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_polymath ON conversations(polymath_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at);
    CREATE INDEX IF NOT EXISTS idx_tags_conversation ON tags(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);
  `);
}
function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
function getAllPolymaths() {
  return getDb().prepare("SELECT * FROM polymaths ORDER BY name").all();
}
function getPolymath(id) {
  return getDb().prepare("SELECT * FROM polymaths WHERE id = ?").get(id);
}
function upsertPolymath(data) {
  getDb().prepare(`
    INSERT INTO polymaths (id, name, title, agent_file, portrait_path, model_path, color)
    VALUES (@id, @name, @title, @agent_file, @portrait_path, @model_path, @color)
    ON CONFLICT(id) DO UPDATE SET
      name = @name,
      title = COALESCE(@title, title),
      agent_file = @agent_file,
      portrait_path = COALESCE(@portrait_path, portrait_path),
      model_path = COALESCE(@model_path, model_path),
      color = COALESCE(@color, color)
  `).run({
    id: data.id,
    name: data.name,
    title: data.title ?? null,
    agent_file: data.agent_file,
    portrait_path: data.portrait_path ?? null,
    model_path: data.model_path ?? null,
    color: data.color ?? null
  });
}
function getConversations(polymathId, limit = 50, offset = 0) {
  return getDb().prepare(
    "SELECT * FROM conversations WHERE polymath_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).all(polymathId, limit, offset);
}
function getConversation(id) {
  return getDb().prepare("SELECT * FROM conversations WHERE id = ?").get(id);
}
function createConversation(data) {
  const result = getDb().prepare(`
    INSERT INTO conversations (polymath_id, user_prompt, full_response, framework_sections, rubric_scores, token_count, duration_ms)
    VALUES (@polymath_id, @user_prompt, @full_response, @framework_sections, @rubric_scores, @token_count, @duration_ms)
  `).run({
    polymath_id: data.polymath_id,
    user_prompt: data.user_prompt,
    full_response: data.full_response,
    framework_sections: data.framework_sections ?? null,
    rubric_scores: data.rubric_scores ?? null,
    token_count: data.token_count ?? null,
    duration_ms: data.duration_ms ?? null
  });
  getDb().prepare(
    "UPDATE polymaths SET total_sessions = total_sessions + 1 WHERE id = ?"
  ).run(data.polymath_id);
  return Number(result.lastInsertRowid);
}
function addTag(conversationId, tag) {
  getDb().prepare(
    "INSERT INTO tags (conversation_id, tag) VALUES (?, ?)"
  ).run(conversationId, tag);
}
function getTagsForConversation(conversationId) {
  const rows = getDb().prepare(
    "SELECT tag FROM tags WHERE conversation_id = ?"
  ).all(conversationId);
  return rows.map((r) => r.tag);
}
function searchConversations(query) {
  const pattern = `%${query}%`;
  return getDb().prepare(`
    SELECT c.*, p.name as polymath_name
    FROM conversations c
    JOIN polymaths p ON c.polymath_id = p.id
    WHERE c.user_prompt LIKE ? OR c.full_response LIKE ?
    ORDER BY c.created_at DESC
    LIMIT 100
  `).all(pattern, pattern);
}
function getPolymathStats(polymathId) {
  const row = getDb().prepare(`
    SELECT
      (SELECT total_sessions FROM polymaths WHERE id = ?) as total_sessions,
      (SELECT MAX(created_at) FROM conversations WHERE polymath_id = ?) as last_session
  `).get(polymathId, polymathId);
  return row;
}
function registerDbHandlers() {
  ipcMain.handle("db:get-all-polymaths", () => {
    return getAllPolymaths();
  });
  ipcMain.handle("db:get-polymath", (_e, id) => {
    return getPolymath(id) ?? null;
  });
  ipcMain.handle("db:get-conversations", (_e, polymathId, limit, offset) => {
    return getConversations(polymathId, limit, offset);
  });
  ipcMain.handle("db:get-conversation", (_e, id) => {
    return getConversation(id) ?? null;
  });
  ipcMain.handle("db:create-conversation", (_e, data) => {
    return createConversation(data);
  });
  ipcMain.handle("db:add-tag", (_e, conversationId, tag) => {
    addTag(conversationId, tag);
  });
  ipcMain.handle("db:get-tags", (_e, conversationId) => {
    return getTagsForConversation(conversationId);
  });
  ipcMain.handle("db:search-conversations", (_e, query) => {
    return searchConversations(query);
  });
  ipcMain.handle("db:get-polymath-stats", (_e, polymathId) => {
    return getPolymathStats(polymathId);
  });
}
const PORT = 7426;
const HOST = "127.0.0.1";
class PtyBridge {
  constructor(ptyManager2, getMainWindow) {
    this.server = null;
    this.ptyManager = ptyManager2;
    this.getMainWindow = getMainWindow;
  }
  async focusTerminal(sessionId) {
    const win = this.getMainWindow();
    if (win) {
      await win.webContents.executeJavaScript(
        `window.__focusPtySession && window.__focusPtySession('${sessionId}')`
      ).catch(() => {
      });
    }
  }
  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });
      this.server.on("error", reject);
      this.server.listen(PORT, HOST, () => {
        console.log(`PTY Bridge listening on ${HOST}:${PORT}`);
        resolve();
      });
    });
  }
  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
  handleRequest(req, res) {
    const url = req.url || "";
    const method = req.method || "";
    if (method === "GET" && url === "/pty/list") {
      const sessions = this.ptyManager.listSessions();
      this.json(res, 200, { sessions });
      return;
    }
    if (method === "POST" && (url === "/pty/read" || url === "/pty/write" || url === "/pty/talk")) {
      this.readBody(req, (err, body) => {
        if (err) {
          this.json(res, 400, { error: "Invalid request body" });
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          this.json(res, 400, { error: "Invalid JSON" });
          return;
        }
        if (url === "/pty/read") {
          this.handleRead(res, parsed);
        } else if (url === "/pty/talk") {
          this.handleTalk(res, parsed);
        } else {
          this.handleWrite(res, parsed);
        }
      });
      return;
    }
    this.json(res, 404, { error: "Not found" });
  }
  handleRead(res, body) {
    const sessionId = body.session_id;
    if (!sessionId) {
      this.json(res, 400, { error: "Missing session_id" });
      return;
    }
    const output = this.ptyManager.readOutput(sessionId);
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` });
      return;
    }
    this.json(res, 200, { session_id: sessionId, output });
  }
  handleWrite(res, body) {
    const sessionId = body.session_id;
    const data = body.data;
    if (!sessionId) {
      this.json(res, 400, { error: "Missing session_id" });
      return;
    }
    if (data === void 0 || data === null) {
      this.json(res, 400, { error: "Missing data" });
      return;
    }
    const output = this.ptyManager.readOutput(sessionId);
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` });
      return;
    }
    this.focusTerminal(sessionId).then(() => {
      setTimeout(() => {
        const success = this.ptyManager.write(sessionId, String(data));
        if (!success) {
          this.json(res, 500, { ok: false, error: `Write failed for session '${sessionId}'` });
          return;
        }
        this.json(res, 200, { ok: true, bytes: String(data).length });
      }, 200);
    });
  }
  handleTalk(res, body) {
    const sessionId = body.session_id;
    const command = body.command;
    if (!sessionId) {
      this.json(res, 400, { error: "Missing session_id" });
      return;
    }
    if (command === void 0 || command === null) {
      this.json(res, 400, { error: "Missing command" });
      return;
    }
    const output = this.ptyManager.readOutput(sessionId);
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` });
      return;
    }
    this.focusTerminal(sessionId).then(() => {
      setTimeout(() => {
        const success = this.ptyManager.write(sessionId, command + "\r");
        if (!success) {
          this.json(res, 500, { ok: false, error: `Talk failed for session '${sessionId}'` });
          return;
        }
        this.json(res, 200, { ok: true, bytes: command.length + 1 });
      }, 200);
    });
  }
  json(res, status, data) {
    const payload = JSON.stringify(data);
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    });
    res.end(payload);
  }
  readBody(req, cb) {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => cb(null, Buffer.concat(chunks).toString("utf-8")));
    req.on("error", (err) => cb(err, ""));
  }
}
class SessionSpawner {
  constructor(ptyManager2, getMainWindow) {
    this.ptyManager = ptyManager2;
    this.getMainWindow = getMainWindow;
  }
  spawn(polymathId, agentFile) {
    if (!existsSync(agentFile)) {
      throw new Error(`Agent file not found: ${agentFile}`);
    }
    const sessionId = this.ptyManager.create(
      void 0,
      // default shell
      void 0,
      // default cwd
      (data) => {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
          win.webContents.send(`pty:data:${sessionId}`, data);
        }
      },
      (exitCode) => {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
          win.webContents.send(`pty:exit:${sessionId}`, exitCode);
        }
      }
    );
    return sessionId;
  }
}
const AGENT_BASE = app.isPackaged ? join(process.resourcesPath, "agents") : join(app.getAppPath(), "agents");
const POLYMATH_REGISTRY = [
  {
    id: "feynman",
    name: "Richard Feynman",
    title: "First-Principles Reasoning",
    agentFile: join(AGENT_BASE, "polymathic-feynman.md"),
    color: "#FF6B35",
    description: "The freshman test, play as cognitive strategy. Debugging, learning new domains, explaining complex concepts."
  },
  {
    id: "carmack",
    name: "John Carmack",
    title: "Constraint-First Engineering",
    agentFile: join(AGENT_BASE, "polymathic-carmack.md"),
    color: "#00FF41",
    description: "Mathematical shortcuts, anti-abstraction discipline. Performance work, systems architecture, code review."
  },
  {
    id: "shannon",
    name: "Claude Shannon",
    title: "Signal & Noise Separation",
    agentFile: join(AGENT_BASE, "polymathic-shannon.md"),
    color: "#00E5FF",
    description: "Radical reduction, invariant structure. API design, architecture simplification, compression."
  },
  {
    id: "tao",
    name: "Terence Tao",
    title: "Structured Exploration",
    agentFile: join(AGENT_BASE, "polymathic-tao.md"),
    color: "#9D4EDD",
    description: "Cross-field arbitrage, structure-randomness decomposition. Complex problem decomposition, research strategy."
  },
  {
    id: "davinci",
    name: "Leonardo da Vinci",
    title: "Saper Vedere",
    agentFile: join(AGENT_BASE, "polymathic-davinci.md"),
    color: "#FFD700",
    description: "Knowing how to see, mechanism-hunting, cross-domain transfer. Bio-inspired design, innovation."
  },
  {
    id: "lovelace",
    name: "Ada Lovelace",
    title: "Poetical Science",
    agentFile: join(AGENT_BASE, "polymathic-lovelace.md"),
    color: "#FF69B4",
    description: "Operational structure, pattern abstraction. Technology visioning, system abstraction, cross-domain synthesis."
  },
  {
    id: "vangogh",
    name: "Vincent van Gogh",
    title: "Emotional Truth Engineering",
    agentFile: join(AGENT_BASE, "polymathic-vangogh.md"),
    color: "#FFA500",
    description: "Color as engineered language, intentional rule-breaking. UI/UX design, color systems, emotional design."
  },
  {
    id: "tesla",
    name: "Nikola Tesla",
    title: "Mental Simulation",
    agentFile: join(AGENT_BASE, "polymathic-tesla.md"),
    color: "#00BFFF",
    description: "Complete systems thinking, anti-trial-and-error. Systems architecture, infrastructure design, API design."
  },
  {
    id: "jobs",
    name: "Steve Jobs",
    title: "Intersection of Tech & Humanities",
    agentFile: join(AGENT_BASE, "polymathic-jobs.md"),
    color: "#EEEEEE",
    description: "Taste, radical simplification, reality distortion. Product vision, UX simplification, feature pruning."
  },
  {
    id: "gates",
    name: "Bill Gates",
    title: "Platform Thinking",
    agentFile: join(AGENT_BASE, "polymathic-gates.md"),
    color: "#0078D4",
    description: "Systematic deep-reading, decomposition into atomic components. Platform strategy, ecosystem design."
  },
  {
    id: "linus",
    name: "Linus Torvalds",
    title: "Good Taste in Code",
    agentFile: join(AGENT_BASE, "polymathic-linus.md"),
    color: "#F0DB4F",
    description: "Structural elegance, working code as valid argument, pragmatic empiricism. Code review, architecture taste."
  },
  {
    id: "graham",
    name: "Paul Graham",
    title: "Essay-Driven Clarity",
    agentFile: join(AGENT_BASE, "polymathic-graham.md"),
    color: "#FF4500",
    description: "Pattern observation, unscaled experimentation. Startup strategy, product-market fit, founder evaluation."
  },
  {
    id: "bezos",
    name: "Jeff Bezos",
    title: "Working Backwards",
    agentFile: join(AGENT_BASE, "polymathic-bezos.md"),
    color: "#FF9900",
    description: "PR/FAQ forcing functions, two-way vs one-way door decisions. Customer-obsessed design, product strategy."
  },
  {
    id: "andreessen",
    name: "Marc Andreessen",
    title: "Technological Discontinuities",
    agentFile: join(AGENT_BASE, "polymathic-andreessen.md"),
    color: "#1DA1F2",
    description: "Holding opinions loosely, cross-domain pattern synthesis. Market timing, technology adoption curves."
  },
  {
    id: "ogilvy",
    name: "David Ogilvy",
    title: "Research-First Advertising",
    agentFile: join(AGENT_BASE, "polymathic-ogilvy.md"),
    color: "#DC143C",
    description: "80/20 headline rule, direct response methodology. Copywriting, ad strategy, research-first marketing."
  },
  {
    id: "aurelius",
    name: "Marcus Aurelius",
    title: "Stoic Deliberation",
    agentFile: join(AGENT_BASE, "polymathic-aurelius.md"),
    color: "#C0C0C0",
    description: "Dichotomy of control, premeditatio malorum, obstacle as the way. Decision-making under pressure."
  },
  {
    id: "godin",
    name: "Seth Godin",
    title: "Smallest Viable Audience",
    agentFile: join(AGENT_BASE, "polymathic-godin.md"),
    color: "#8B5CF6",
    description: "Worldview-first positioning, permission over interruption. Marketing strategy, audience building."
  },
  {
    id: "thiel",
    name: "Peter Thiel",
    title: "Zero to One",
    agentFile: join(AGENT_BASE, "polymathic-thiel.md"),
    color: "#00FF88",
    description: "Finding secrets, monopoly theory. Contrarian analysis, monopoly strategy, category creation."
  },
  {
    id: "disney",
    name: "Walt Disney",
    title: "Dreamer / Realist / Critic",
    agentFile: join(AGENT_BASE, "polymathic-disney.md"),
    color: "#FF1493",
    description: "Storyboarding, Plussing, Blue Sky ideation. Experience design, creative strategy."
  },
  {
    id: "munger",
    name: "Charlie Munger",
    title: "Mental Model Lattice",
    agentFile: join(AGENT_BASE, "polymathic-munger.md"),
    color: "#B8860B",
    description: "Inversion thinking, Lollapalooza effects. Decision frameworks, risk analysis, bias detection."
  },
  {
    id: "suntzu",
    name: "Sun Tzu",
    title: "Strategic Intelligence",
    agentFile: join(AGENT_BASE, "polymathic-suntzu.md"),
    color: "#8B0000",
    description: "Winning before fighting, terrain analysis. Competitive strategy, positioning, resource allocation."
  },
  {
    id: "socrates",
    name: "Socrates",
    title: "Elenctic Examination",
    agentFile: join(AGENT_BASE, "polymathic-socrates.md"),
    color: "#E0E0E0",
    description: "Maieutics, aporia as productive confusion. Assumption testing, dialectic questioning."
  },
  {
    id: "musk",
    name: "Elon Musk",
    title: "Physics-Constrained Reasoning",
    agentFile: join(AGENT_BASE, "polymathic-musk.md"),
    color: "#E04230",
    description: "Questioning every requirement, aggressive deletion before optimization. Moonshot feasibility."
  },
  {
    id: "mrbeast",
    name: "MrBeast",
    title: "Attention Engineering",
    agentFile: join(AGENT_BASE, "polymathic-mrbeast.md"),
    color: "#00CFFF",
    description: "Retention curve analysis, 50+ variation testing. Content strategy, viral mechanics."
  },
  {
    id: "rams",
    name: "Dieter Rams",
    title: "Less But Better",
    agentFile: join(AGENT_BASE, "polymathic-rams.md"),
    color: "#666666",
    description: "Functionalism, material honesty, 10 Principles of Good Design. Product design, UI simplification."
  }
];
const cache = /* @__PURE__ */ new Map();
function parseAgentFile(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  const fm = fmMatch?.[1] ?? "";
  const name = fm.match(/name:\s*(.+)/)?.[1]?.trim() ?? "";
  const description = fm.match(/description:\s*(.+)/)?.[1]?.trim() ?? "";
  const color = fm.match(/color:\s*(.+)/)?.[1]?.trim() ?? "";
  const body = raw.slice(fmMatch?.[0]?.length ?? 0);
  const kernelMatch = body.match(/## The Kernel\n\n([\s\S]*?)(?=\n## )/);
  const kernel = kernelMatch?.[1]?.trim()?.replace(/\*\*/g, "") ?? "";
  const identityMatch = body.match(/## Identity\n\n([\s\S]*?)(?=\n## )/);
  const identityTraits = (identityMatch?.[1] ?? "").split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2).replace(/\*\*/g, "").trim()).map((t) => t.split(". ")[0] + ".");
  const workflowMatch = body.match(/## Mandatory Workflow\n\n([\s\S]*?)(?=\n## )/);
  const workflowText = workflowMatch?.[1] ?? "";
  const phaseRegex = /### Phase \d+:\s*(\w[\w\s]*?)(?:\s*[—\-–]\s*.*)?\n\n([\s\S]*?)(?=\n### Phase|\n\*\*Gate|$)/g;
  const phases = [];
  let phaseMatch;
  while ((phaseMatch = phaseRegex.exec(workflowText)) !== null) {
    phases.push({
      name: phaseMatch[1].trim(),
      description: phaseMatch[2].trim().split("\n")[0]
    });
  }
  const outputMatch = body.match(/## Output Format\n\n([\s\S]*?)(?=\n## )/);
  const outputFormat = outputMatch?.[1]?.trim() ?? "";
  const gatesMatch = body.match(/## Decision Gates[\s\S]*?\n\n([\s\S]*?)(?=\n## )/);
  const gatesText = gatesMatch?.[1] ?? "";
  const decisionGates = gatesText.split("\n").filter((l) => l.includes("**") && !l.startsWith("|--") && !l.startsWith("| Gate")).map((l) => {
    const cells = l.split("|").filter((c) => c.trim());
    if (cells.length >= 2) {
      return `${cells[0].replace(/\*\*/g, "").trim()}: ${cells[cells.length - 1].trim()}`;
    }
    return l.replace(/\*\*/g, "").trim();
  });
  const keyQuotes = (body.match(/> \*?"?(.+?)"?\*?$/gm) ?? []).map((q) => q.replace(/^>\s*\*?"?/, "").replace(/"?\*?$/, "").trim()).filter((q) => q.length > 10 && q.length < 200);
  return {
    name,
    description,
    color,
    kernel,
    identityTraits,
    phases,
    outputFormat,
    decisionGates,
    keyQuotes
  };
}
function initCorridorContent() {
  for (const entry of POLYMATH_REGISTRY) {
    try {
      const content = parseAgentFile(entry.agentFile);
      cache.set(entry.id, content);
    } catch (err) {
      console.error(`Failed to parse agent file for ${entry.id}:`, err);
    }
  }
  console.log(`Parsed corridor content for ${cache.size} polymaths`);
}
function getCorridorContent(polymathId) {
  return cache.get(polymathId) ?? null;
}
function getAllCorridorContent() {
  return Object.fromEntries(cache);
}
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=1024");
let mainWindow = null;
let ptyBridge = null;
let sessionSpawner = null;
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#000508",
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.webContents.on("before-input-event", (_e, input) => {
    if (input.key === "F12" && input.type === "keyDown") {
      mainWindow?.webContents.toggleDevTools();
    }
  });
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 5e3);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  ipcMain.on("window:minimize", () => mainWindow?.minimize());
  ipcMain.on("window:maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on("window:close", () => {
    cleanup();
    app.quit();
  });
  ipcMain.handle("window:is-maximized", () => mainWindow?.isMaximized() ?? false);
  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window:maximize-change", true);
  });
  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window:maximize-change", false);
  });
  const settingsDir = join(homedir(), ".polymathica");
  const settingsFile = join(settingsDir, "settings.json");
  ipcMain.handle("settings:load", async () => {
    try {
      const content = await readFile(settingsFile, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  });
  ipcMain.handle("settings:save", async (_e, data) => {
    try {
      await mkdir(settingsDir, { recursive: true });
      await writeFile(settingsFile, data, "utf-8");
    } catch {
    }
  });
  ipcMain.handle("session:spawn", (_e, polymathId) => {
    if (!sessionSpawner) throw new Error("Session spawner not initialized");
    const polymath = POLYMATH_REGISTRY.find((p) => p.id === polymathId);
    if (!polymath) throw new Error(`Unknown polymath: ${polymathId}`);
    return sessionSpawner.spawn(polymathId, polymath.agentFile);
  });
  ipcMain.handle("session:get-agent-path", (_e, polymathId) => {
    const polymath = POLYMATH_REGISTRY.find((p) => p.id === polymathId);
    if (!polymath) throw new Error(`Unknown polymath: ${polymathId}`);
    return polymath.agentFile;
  });
  ipcMain.handle("corridor:get-content", (_event, polymathId) => getCorridorContent(polymathId));
  ipcMain.handle("corridor:get-all-content", () => getAllCorridorContent());
  try {
    registerPtyHandlers();
  } catch (e) {
    console.error("Failed to register pty handlers:", e);
  }
  try {
    registerDbHandlers();
  } catch (e) {
    console.error("Failed to register db handlers:", e);
  }
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
function seedPolymaths() {
  try {
    getDb();
    for (const p of POLYMATH_REGISTRY) {
      upsertPolymath({
        id: p.id,
        name: p.name,
        title: p.title,
        agent_file: p.agentFile,
        color: p.color
      });
    }
    console.log(`Seeded ${POLYMATH_REGISTRY.length} polymaths into database`);
  } catch (err) {
    console.error("Failed to seed polymaths:", err);
  }
}
function cleanup() {
  ptyBridge?.stop();
  ptyManager.killAll();
  closeDb();
}
app.whenReady().then(async () => {
  ptyBridge = new PtyBridge(ptyManager, () => mainWindow);
  sessionSpawner = new SessionSpawner(ptyManager, () => mainWindow);
  try {
    await ptyBridge.start();
  } catch (err) {
    console.error("Failed to start PTY Bridge:", err);
  }
  seedPolymaths();
  initCorridorContent();
  createWindow();
});
app.on("window-all-closed", () => {
  cleanup();
  app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
