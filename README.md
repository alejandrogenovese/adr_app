# ADR Manager

Aplicación web para gestionar Architecture Decision Records, basada en las plantillas de [joelparkerhenderson/architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record).

## Plantillas incluidas

- **MADR** (Markdown ADR) — La más completa: drivers, opciones, pros/contras, consecuencias
- **Nygard** — Minimalista: contexto, decisión, consecuencias
- **Tyree & Akerman** — Empresarial: supuestos, restricciones, posiciones, implicaciones

## Deploy en Render

### Opción 1: Blueprint (recomendada)

1. Subí este repo a GitHub
2. En Render Dashboard, click en **New > Blueprint**
3. Conectá el repo — Render lee el `render.yaml` y configura todo
4. El disco persistente guarda la DB SQLite

### Opción 2: Manual

1. **New > Web Service** en Render
2. Conectá el repo
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Variable: `DATA_DIR` = `/opt/render/project/data`
6. Disk: mount `/opt/render/project/data`, 1 GB

### Local

```bash
npm install
node server.js
# → http://localhost:3000
```

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/adrs | Listar todos |
| POST | /api/adrs | Crear |
| PUT | /api/adrs/:id | Actualizar |
| DELETE | /api/adrs/:id | Eliminar |
| GET | /api/adrs/:id/export | Exportar Markdown |
| GET | /api/next-id | Siguiente ID |
