const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const DB_FILE = path.join(dataDir, "adrs.json");

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch { return []; }
}
function writeDB(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/adrs", (req, res) => res.json(readDB()));

app.get("/api/adrs/:id", (req, res) => {
  const r = readDB().find(a => a.id === req.params.id);
  r ? res.json(r) : res.status(404).json({ error: "Not found" });
});

app.get("/api/next-id", (req, res) => {
  const adrs = readDB();
  let n = 1;
  if (adrs.length) {
    const nums = adrs.map(a => parseInt(a.id.replace("ADR-",""),10)).filter(x=>!isNaN(x));
    if (nums.length) n = Math.max(...nums) + 1;
  }
  res.json({ id: `ADR-${String(n).padStart(4,"0")}` });
});

app.post("/api/adrs", (req, res) => {
  const b = req.body;
  if (!b.id || !b.title) return res.status(400).json({ error: "id and title required" });
  const adrs = readDB();
  if (adrs.find(a => a.id === b.id)) return res.status(409).json({ error: "ID exists" });
  b.created_at = new Date().toISOString();
  b.updated_at = b.created_at;
  adrs.unshift(b);
  writeDB(adrs);
  res.status(201).json({ ok: true });
});

app.put("/api/adrs/:id", (req, res) => {
  const adrs = readDB();
  const idx = adrs.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  adrs[idx] = { ...adrs[idx], ...req.body, id: req.params.id, updated_at: new Date().toISOString() };
  writeDB(adrs);
  res.json({ ok: true });
});

app.delete("/api/adrs/:id", (req, res) => {
  let adrs = readDB();
  const len = adrs.length;
  adrs = adrs.filter(a => a.id !== req.params.id);
  if (adrs.length === len) return res.status(404).json({ error: "Not found" });
  writeDB(adrs);
  res.json({ ok: true });
});

app.get("/api/adrs/:id/export", (req, res) => {
  const a = readDB().find(x => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: "Not found" });
  let md = "";
  if (a.template === "nygard") {
    md = `# ${a.id} — ${a.title}\n\n**Estado:** ${a.status}  \n**Fecha:** ${a.date}  \n**Autor:** ${a.author}\n\n## Contexto\n\n${a.context||''}\n\n## Decisión\n\n${a.decision_outcome||''}\n\n## Consecuencias\n\n${a.consequences_positive||''}\n`;
  } else if (a.template === "tyree") {
    md = `# ${a.id} — ${a.title}\n\n| Campo | Valor |\n|---|---|\n| Estado | ${a.status} |\n| Fecha | ${a.date} |\n| Autor | ${a.author} |\n| Grupo | ${a.deciders||''} |\n\n## Issue\n\n${a.issue||''}\n\n## Contexto\n\n${a.context||''}\n\n## Decisión\n\n${a.decision_outcome||''}\n\n## Supuestos\n\n${a.assumptions||''}\n\n## Restricciones\n\n${a.constraints_field||''}\n\n## Posiciones Evaluadas\n\n${a.positions||''}\n\n## Implicaciones\n\n${a.implications||''}\n\n## Decisiones Relacionadas\n\n${a.related_decisions||''}\n\n## Requisitos Relacionados\n\n${a.related_requirements||''}\n\n## Notas\n\n${a.notes||''}\n`;
  } else {
    md = `# ${a.id} — ${a.title}\n\n* **Estado:** ${a.status}\n* **Decisores:** ${a.deciders||''}\n* **Fecha:** ${a.date}\n* **Autor:** ${a.author}\n\n`;
    if (a.issue) md += `Technical Story: ${a.issue}\n\n`;
    md += `## Contexto y Problema\n\n${a.context||''}\n\n`;
    if (a.decision_drivers) md += `## Drivers de Decisión\n\n${a.decision_drivers}\n\n`;
    if (a.considered_options) md += `## Opciones Consideradas\n\n${a.considered_options}\n\n`;
    md += `## Resultado de la Decisión\n\n${a.decision_outcome||''}\n\n`;
    if (a.pros_cons) md += `## Pros y Contras\n\n${a.pros_cons}\n\n`;
    if (a.consequences_positive) md += `### Consecuencias Positivas\n\n${a.consequences_positive}\n\n`;
    if (a.consequences_negative) md += `### Consecuencias Negativas\n\n${a.consequences_negative}\n\n`;
    if (a.links) md += `## Links\n\n${a.links}\n`;
  }
  res.setHeader("Content-Type","text/markdown; charset=utf-8");
  res.setHeader("Content-Disposition",`attachment; filename="${a.id}.md"`);
  res.send(md);
});

app.get("*", (req,res) => res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT, () => console.log(`ADR Manager → http://localhost:${PORT}`));
