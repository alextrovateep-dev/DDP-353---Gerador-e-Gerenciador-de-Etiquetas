(function () {
  const VIEWS = ["import", "print", "library", "machines", "ddp"];

  const PLACEHOLDER_CATALOG = [
    { key: "OP", desc: "Ordem de Produção" },
    { key: "Produto", desc: "Código do Produto" },
    { key: "Descricao", desc: "Descrição do Produto" },
    { key: "QtdProduzida", desc: "Quantidade Produzida" },
    { key: "Maquina", desc: "Nome da Máquina" },
    { key: "Lote", desc: "Lote de Produção" },
    { key: "Data", desc: "Data Atual" },
    { key: "Operador", desc: "Nome do Operador" },
    { key: "Turno", desc: "Turno" },
  ];

  const EXAMPLE_ZPL = `^XA\n^CF0,40\n^FO50,50^FDOP: {OP}^FS\n^FO50,100^FDProduto: {Produto}^FS\n^FO50,150^FDQuantidade: {QtdProduzida}^FS\n^XZ`;
  const EXAMPLE_ZPL_2 = `^XA\n^CF0,40\n^FO30,30^FDMaquina: {Maquina}^FS\n^FO30,80^FDOperador: {Operador}^FS\n^FO30,130^FDTurno: {Turno}^FS\n^XZ`;
  const EXAMPLE_ZPL_FACCHINI = `^XA\n^CF0,50\n^FO30,30^FDEtiqueta Padrão Facchini^FS\n^CF0,40\n^FO30,90^FDOP: {OP}^FS\n^FO30,140^FDQuantidade: {Quantidade}^FS\n^FO30,190^FDMáquina: {Maquina}^FS\n^FO30,240^FDOperador: {Operador}^FS\n^FO30,290^FDTurno: {Turno}^FS\n^XZ`;

  const DEFAULT_EXAMPLE_VALUES = {
    OP: 'OP123456',
    Quantidade: '10',
    QtdProduzida: '10',
    Produto: 'ABC-123',
    Maquina: 'Prensa 01',
    Operador: 'João Silva',
    Turno: '1º',
  };

  const els = {
    nav: document.querySelector(".nav"), views: document.getElementById("views"),
    zplInput: document.getElementById("zpl-input"), detectBtn: document.getElementById("btn-detect"), clearBtn: document.getElementById("btn-clear"), detectOut: document.getElementById("detect-output"),
    importFromLibBtn: document.getElementById("btn-import-from-lib"), layoutName: document.getElementById("layout-name"), saveLayoutBtn: document.getElementById("btn-save-layout"), previewBtn: document.getElementById("btn-preview"),
    pvWidth: document.getElementById("pv-width"), pvHeight: document.getElementById("pv-height"), pvDpmm: document.getElementById("pv-dpmm"), pvRefresh: document.getElementById("pv-refresh"), pvContainer: document.getElementById("pv-container"),

    // print view
    prSelectLayout: document.getElementById("pr-select-layout"), prLoad: document.getElementById("pr-load"), prForm: document.getElementById("pr-form"), prCopies: document.getElementById("pr-copies"), prPreview: document.getElementById("pr-preview"), prPrint: document.getElementById("pr-print"), prPreviewContainer: document.getElementById("pr-preview-container"), prLog: document.getElementById("pr-log"),

    // library/machines
    search: document.getElementById("search"), newVersionBtn: document.getElementById("btn-new-version"), layoutList: document.getElementById("layout-list"),
    machineList: document.getElementById("machine-list"), machineName: document.getElementById("machine-name"), machineGroup: document.getElementById("machine-group"), addMachineBtn: document.getElementById("btn-add-machine"), selectLayout: document.getElementById("select-layout"), selectMachine: document.getElementById("select-machine"), associateBtn: document.getElementById("btn-associate"), printBtn: document.getElementById("btn-print"), printLog: document.getElementById("print-log"),
    mlSelectLayout: document.getElementById("ml-select-layout"), mlOpenLibrary: document.getElementById("ml-open-library"), mlPreview: document.getElementById("ml-preview"), mlSearch: document.getElementById("ml-search"), mlGroup: document.getElementById("ml-group"), mlFetch: document.getElementById("ml-fetch"), mlResults: document.getElementById("ml-results"), mlSelectAll: document.getElementById("ml-select-all"), mlAssociate: document.getElementById("ml-associate"), mlAssociatedCount: document.getElementById("ml-associated-count"),
  };

  const STORAGE_KEYS = { draftZpl: "teep.demo.draftZpl", layouts: "teep.demo.layouts", machines: "teep.demo.machines", machineGroups: "teep.demo.machineGroups", associations: "teep.demo.assoc", activeLayoutId: "teep.demo.activeLayoutId" };

  function loadJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  let state = {
    draftZpl: localStorage.getItem(STORAGE_KEYS.draftZpl) || "",
    layouts: loadJson(STORAGE_KEYS.layouts, []),
    machines: loadJson(STORAGE_KEYS.machines, ["Prensa 01", "Solda 02", "Pintura 03"]),
    machineGroups: loadJson(STORAGE_KEYS.machineGroups, { "Linha A": ["Prensa 01"], "Linha B": ["Solda 02"], "Pintura": ["Pintura 03"] }),
    associations: loadJson(STORAGE_KEYS.associations, {}),
  };

  // Seed 2 example layouts if library is empty
  if (!state.layouts || state.layouts.length === 0) {
    const l1 = { id: `lay-${Date.now()}-a`, name: "Etiqueta Padrão (Facchini)", zpl: EXAMPLE_ZPL_FACCHINI, fields: ["OP","Quantidade","Maquina","Operador","Turno"], version: 1, createdAt: new Date().toISOString(), history: [], preview: { widthIn: 6, heightIn: 4, dpmm: 8 } };
    const l2 = { id: `lay-${Date.now()}-b`, name: "Exemplo OP/Produto", zpl: EXAMPLE_ZPL, fields: ["OP","Produto","QtdProduzida"], version: 1, createdAt: new Date().toISOString(), history: [], preview: { widthIn: 6, heightIn: 4, dpmm: 8 } };
    const l3 = { id: `lay-${Date.now()}-c`, name: "Etiqueta 3", zpl: EXAMPLE_ZPL_2, fields: ["Maquina","Operador","Turno"], version: 1, createdAt: new Date().toISOString(), history: [], preview: { widthIn: 6, heightIn: 4, dpmm: 8 } };
    state.layouts = [l1, l2, l3];
    saveJson(STORAGE_KEYS.layouts, state.layouts);
    saveJson(STORAGE_KEYS.activeLayoutId, l1.id);
  }
  // Persist seeded machines/groups (in case first load)
  saveJson(STORAGE_KEYS.machines, state.machines);
  saveJson(STORAGE_KEYS.machineGroups, state.machineGroups);

  els.zplInput && (els.zplInput.value = state.draftZpl);

  // Navigation
  els.nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-view]"); if (!btn) return;
    const target = btn.dataset.view;
    document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("is-active", b === btn));
    VIEWS.forEach(v => document.getElementById(`view-${v}`).classList.toggle("is-active", v === target));
    if (target === "library") renderLibrary();
    if (target === "machines") { renderMachines(); renderSelects(); renderMachineFilters(); }
    if (target === "print") { renderPrintLayouts(); }
    if (target === "ddp") { loadDdpDoc(); }
  });

  async function loadDdpDoc() {
    const el = document.getElementById('ddp-content');
    if (!el) return;
    const DDP_DOC_TEXT = `# DDP 353 – Geração e Gerenciamento de Etiquetas para Facchini\n\nEste documento descreve a visão funcional do produto TeepEtiquetas, seu escopo, fluxos principais, regras de negócio e integrações. Ele não trata da implementação técnica/código.\n\n## Objetivo\nViabilizar a criação, gerenciamento, distribuição e impressão de etiquetas Zebra no ambiente Facchini, integradas ao ecossistema Teep (terminais/TeepOEE), atendendo tanto casos automáticos (por máquina/processo) quanto casos manuais (dashboard/servidor).\n\n## Personas\n- Operador de máquina\n- Líder/Supervisor\n- Analista/Engenharia de processos\n- TI/MES\n\n## Escopo Funcional\n1) Biblioteca de Etiquetas (versionamento, preview)\n2) Geração/Gerenciamento (colar ZPL, detectar placeholders, salvar)\n3) Associação a Máquinas (buscar por grupo/nome, envio, confirmação)\n4) Impressão Manual (formulário dinâmico pelos placeholders, cópias)\n\n## Regras de Negócio (resumo)\n- ID único e nome amigável por etiqueta; versões incrementais\n- Placeholders {Campo} preenchidos via Teep ou manualmente\n- Substituição em máquina exige confirmação\n- Sincronização para diretórios/terminais; políticas de atualização\n- Auditoria recomendada\n\n## Integrações\n- TeepOEE (máquinas/grupos, eventos)\n- Impressoras Zebra (ZPL)\n\n## Fluxos\n1) Criar/validar layout\n2) Distribuir para máquinas\n3) Imprimir manualmente\n\n## Dados (conceitual)\n- Etiqueta { id, nome, versao, zpl, preview, history, criadoEm }\n- Associação { maquina -> etiquetaId }\n- Máquina (TeepOEE)\n- Log de impressão/ação\n\n## Requisitos Não-Funcionais\nUsabilidade, confiabilidade, segurança, performance e observabilidade.\n\n## Roadmap\nMVP: biblioteca, criação/preview, associação simples, impressão manual.\nFase 2: integrações TeepOEE e envio para terminais, auditoria.\nFase 3: impressão automática por eventos, rollback, dashboards.\n\n## Critérios de Aceite (exemplos)\n- Criar/salvar layout com placeholders\n- Visualizar preview\n- Associar layout a conjunto de máquinas com confirmação\n- Imprimir manual com preenchimento\n`;
    try {
      if (location && location.protocol === 'file:') {
        el.textContent = DDP_DOC_TEXT;
        return;
      }
      const res = await fetch('DDP_353.md');
      if (!res.ok) throw new Error('not found');
      const text = await res.text();
      el.textContent = text;
    } catch {
      el.textContent = DDP_DOC_TEXT;
    }
  }

  function renderCatalog(list) {
    if (!list.length) { els.detectOut.textContent = "Nenhum campo disponível."; return; }
    const html = list.map(i => `<div class=\"row\" style=\"justify-content:space-between;align-items:center;\"><div><strong>{${i.key}}</strong> <span class=\"meta\">— ${i.desc}</span></div><button class=\"secondary\" data-copy=\"{${i.key}}\">Copiar</button></div>`).join("\n");
    els.detectOut.innerHTML = html;
    els.detectOut.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', () => { const text = btn.getAttribute('data-copy'); if (navigator.clipboard) navigator.clipboard.writeText(text); btn.textContent = 'Copiado!'; setTimeout(() => btn.textContent = 'Copiar', 1200); }));
  }

  // Import existing layout into editor (legacy) — removed in favor of modal
  // if (els.importFromLibBtn) els.importFromLibBtn.addEventListener('click', () => {
  //   const active = getActiveLayout(); if (!active) { alert('Selecione ou crie um layout na Biblioteca primeiro.'); return; }
  //   els.zplInput.value = active.zpl || ''; state.draftZpl = active.zpl || ''; saveJson(STORAGE_KEYS.draftZpl, state.draftZpl);
  //   els.layoutName.value = active.name || '';
  //   if (active.preview) { els.pvWidth.value = active.preview.widthIn ?? els.pvWidth.value; els.pvHeight.value = active.preview.heightIn ?? els.pvHeight.value; els.pvDpmm.value = String(active.preview.dpmm ?? els.pvDpmm.value); }
  //   alert('Etiqueta carregada da Biblioteca para edição.');
  // });

  // Detect fields
  if (els.detectBtn) els.detectBtn.addEventListener("click", () => {
    let zpl = (els.zplInput.value || "").trim(); if (!zpl) { els.zplInput.value = EXAMPLE_ZPL; zpl = EXAMPLE_ZPL; }
    state.draftZpl = zpl; localStorage.setItem(STORAGE_KEYS.draftZpl, zpl);
    renderCatalog(PLACEHOLDER_CATALOG);
  });
  if (els.clearBtn) els.clearBtn.addEventListener("click", () => { els.zplInput.value = ""; els.detectOut.textContent = ""; state.draftZpl = ""; localStorage.removeItem(STORAGE_KEYS.draftZpl); });

  // Save layout
  if (els.saveLayoutBtn) els.saveLayoutBtn.addEventListener("click", () => {
    const zpl = (els.zplInput.value || "").trim(); if (!zpl) { alert("Cole o ZPL antes de salvar."); return; }
    const name = (els.layoutName.value || "Sem nome").trim();
    const preview = { widthIn: parseFloat(els.pvWidth.value || "6"), heightIn: parseFloat(els.pvHeight.value || "4"), dpmm: parseInt(els.pvDpmm.value || "8", 10) };
    const detected = Array.from(zpl.matchAll(/\{([A-Za-z0-9_\.\-]+)\}/g)).map(m => m[1]);
    const newLayout = { id: `lay-${Date.now()}`, name, zpl, fields: Array.from(new Set(detected)), version: 1, createdAt: new Date().toISOString(), history: [], preview };
    state.layouts.push(newLayout); saveJson(STORAGE_KEYS.layouts, state.layouts); saveJson(STORAGE_KEYS.activeLayoutId, newLayout.id);
    alert("Arquivo salvo. Pode consultar na aba Biblioteca.");
  });

  function getActiveLayout() { const activeId = loadJson(STORAGE_KEYS.activeLayoutId, null) || localStorage.getItem(STORAGE_KEYS.activeLayoutId); return state.layouts.find(l => l.id === activeId) || state.layouts[0] || null; }

  // Preview image (Labelary) for design view
  if (els.previewBtn) els.previewBtn.addEventListener('click', () => renderImagePreviewDesign());
  if (els.pvRefresh) els.pvRefresh.addEventListener('click', (e) => { e.preventDefault(); renderImagePreviewDesign(); });
  ;[els.pvWidth, els.pvHeight, els.pvDpmm].forEach(el => el?.addEventListener('change', () => { const layout = getActiveLayout(); if (!layout) { renderImagePreviewDesign(); return; } layout.preview = layout.preview || {}; layout.preview.widthIn = parseFloat(els.pvWidth.value || "6"); layout.preview.heightIn = parseFloat(els.pvHeight.value || "4"); layout.preview.dpmm = parseInt(els.pvDpmm.value || "8", 10); const idx = state.layouts.findIndex(l => l.id === layout.id); if (idx !== -1) { state.layouts[idx] = layout; saveJson(STORAGE_KEYS.layouts, state.layouts); } renderImagePreviewDesign(); }));

  async function renderImagePreviewDesign() {
    const layout = getActiveLayout(); const zpl = (els.zplInput?.value || state.draftZpl || '').trim(); if (!zpl) { els.pvContainer.innerHTML = `<span class=\"hint\">Cole o ZPL para visualizar.</span>`; return; }
    const widthIn = layout?.preview?.widthIn ?? parseFloat(els.pvWidth.value || "6"); const heightIn = layout?.preview?.heightIn ?? parseFloat(els.pvHeight.value || "4"); const dpmm = layout?.preview?.dpmm ?? parseInt(els.pvDpmm.value || "8", 10);
    els.pvWidth.value = widthIn; els.pvHeight.value = heightIn; els.pvDpmm.value = String(dpmm);
    const url = `https://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${widthIn}x${heightIn}/0/`;
    els.pvContainer.innerHTML = `<span class=\"hint\">Renderizando preview...</span>`;
    try { const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: zpl }); if (!resp.ok) throw new Error(`HTTP ${resp.status}`); const blob = await resp.blob(); const imgUrl = URL.createObjectURL(blob); els.pvContainer.innerHTML = ''; const img = new Image(); img.src = imgUrl; img.alt = 'Preview da etiqueta'; img.style.maxWidth = '100%'; img.onload = () => { URL.revokeObjectURL(imgUrl); }; els.pvContainer.appendChild(img); } catch (_) { els.pvContainer.innerHTML = `<span class=\"hint\">Não foi possível renderizar o preview (offline? CORS?).</span>`; }
  }

  // PRINT VIEW
  function renderPrintLayouts() {
    els.prSelectLayout.innerHTML = state.layouts.map(l => `<option value="${l.id}">${l.name} (v${l.version})</option>`).join("");
    // Auto-generate form on layout change
    els.prSelectLayout.onchange = () => buildPrintForm();
  }

  function buildPrintForm() {
    const id = els.prSelectLayout.value; const ly = state.layouts.find(l => l.id === id); if (!ly) { els.prForm.innerHTML = ''; return; }
    const fields = Array.from(new Set((ly.zpl.match(/\{([A-Za-z0-9_\.\-]+)\}/g) || []).map(x => x.replace(/[{}]/g, ''))));
    if (!fields.length) {
      els.prForm.innerHTML = `<div class=\"hint\">Nenhum placeholder {Campo} encontrado no ZPL. Edite o layout na Biblioteca para incluir campos como {OP}, {Quantidade}, {Maquina}.</div>`;
      return;
    }
    els.prForm.innerHTML = fields.map(k => `<div class=\"form-row\"><label for=\"pr-${k}\">${k}</label><input id=\"pr-${k}\" name=\"${k}\" placeholder=\"${k}\" value=\"${(DEFAULT_EXAMPLE_VALUES[k]||'').replace(/\\/g,'\\\\').replace(/"/g,'&quot;')}\" /></div>`).join('');
  }

  els.prLoad?.addEventListener('click', () => { buildPrintForm(); els.prPreviewContainer.innerHTML = `<span class=\"hint\">Campos carregados. Preencha e clique em Preview.</span>`; });

  els.prPreview?.addEventListener('click', async () => {
    const id = els.prSelectLayout.value; const ly = state.layouts.find(l => l.id === id); if (!ly) return;
    const values = {}; els.prForm.querySelectorAll('input').forEach(i => values[i.name] = i.value);
    const zpl = substituteZpl(ly.zpl, values);
    await renderLabelaryTo(ly, zpl, els.prPreviewContainer);
  });

  els.prPrint?.addEventListener('click', () => {
    const id = els.prSelectLayout.value; const ly = state.layouts.find(l => l.id === id); if (!ly) { alert('Selecione um layout.'); return; }
    const values = {}; els.prForm.querySelectorAll('input').forEach(i => values[i.name] = i.value);
    const copies = Math.max(1, parseInt(els.prCopies.value || '1', 10));
    const zpl = substituteZpl(ly.zpl, values);
    const logLines = Array.from({ length: copies }).map((_, idx) => `[${new Date().toLocaleTimeString()}] Impressão manual ${idx+1}/${copies} com layout ${ly.name}.`);
    els.prLog.textContent = logLines.join('\n') + '\n' + els.prLog.textContent;
  });

  function substituteZpl(zpl, values) {
    let out = zpl; for (const [k, v] of Object.entries(values)) { const re = new RegExp(`\\{${escapeRegExp(k)}\\}`, 'g'); out = out.replace(re, v || ''); } return out;
  }
  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  async function renderLabelaryTo(layout, zpl, container) {
    const widthIn = layout?.preview?.widthIn ?? 6; const heightIn = layout?.preview?.heightIn ?? 4; const dpmm = layout?.preview?.dpmm ?? 8;
    const url = `https://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${widthIn}x${heightIn}/0/`;
    container.innerHTML = `<span class=\"hint\">Renderizando preview...</span>`;
    try { const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: zpl }); if (!resp.ok) throw new Error(`HTTP ${resp.status}`); const blob = await resp.blob(); const imgUrl = URL.createObjectURL(blob); container.innerHTML = ''; const img = new Image(); img.src = imgUrl; img.alt = 'Preview da etiqueta'; img.style.maxWidth = '100%'; img.onload = () => { URL.revokeObjectURL(imgUrl); }; container.appendChild(img); } catch (_) { container.innerHTML = `<span class=\"hint\">Não foi possível renderizar o preview (offline? CORS?).</span>`; }
  }

  // Library/Machines code omitted for brevity (kept from previous section)
  function renderLibrary() {
    const query = (els.search?.value || "").toLowerCase();
    const items = state.layouts.filter(l => !query || l.name.toLowerCase().includes(query)).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    els.layoutList.innerHTML = items.map(l => `<li><div><div><strong>${l.name}</strong> <span class=\"meta\">v${l.version}</span></div><div class=\"meta\">${new Date(l.createdAt).toLocaleString()}</div></div><div class=\"row\"><button data-act=\"select\" data-id=\"${l.id}\" class=\"secondary\">Selecionar</button><button data-act=\"preview\" data-id=\"${l.id}\">Preview</button><button data-act=\"delete\" data-id=\"${l.id}\" class=\"secondary\">Excluir</button></div></li>`).join("");
    els.layoutList.querySelectorAll("button").forEach(btn => btn.addEventListener("click", (e) => { const id = e.target.getAttribute("data-id"); const act = e.target.getAttribute("data-act"); const idx = state.layouts.findIndex(x => x.id === id); if (idx === -1) return; if (act === "delete") { if (confirm("Excluir este layout?")) { state.layouts.splice(idx, 1); saveJson(STORAGE_KEYS.layouts, state.layouts); renderLibrary(); renderSelects(); } } else if (act === "select") { saveJson(STORAGE_KEYS.activeLayoutId, id); renderSelects(); updateAssociatedCount(); document.querySelector('[data-view="machines"]').click(); const ly = state.layouts.find(l => l.id === id); if (ly?.preview) { els.pvWidth.value = ly.preview.widthIn; els.pvHeight.value = ly.preview.heightIn; els.pvDpmm.value = String(ly.preview.dpmm); } } else if (act === "preview") { saveJson(STORAGE_KEYS.activeLayoutId, id); document.querySelector('[data-view="import"]').click(); const ly = state.layouts.find(l => l.id === id); if (ly) { els.zplInput.value = ly.zpl; state.draftZpl = ly.zpl; saveJson(STORAGE_KEYS.draftZpl, state.draftZpl); els.layoutName.value = ly.name; if (ly.preview) { els.pvWidth.value = ly.preview.widthIn; els.pvHeight.value = ly.preview.heightIn; els.pvDpmm.value = String(ly.preview.dpmm); } } renderImagePreviewDesign(); window.scrollTo({ top: document.getElementById('pv-container').offsetTop - 80, behavior: 'smooth' }); } }));
  }

  function renderMachines() {
    if (!els.machineList) return; // section removed in simplified UI
    els.machineList.innerHTML = state.machines.map(m => `<li><div><div><strong>${m}</strong></div><div class="meta">Layout: ${getLayoutName(state.associations[m]) || "(não associado)"}</div><div class="meta">Grupo: ${findGroupOf(m) || '-'}</div></div><div class="row"><button class="secondary" data-remove="${m}">Remover</button></div></li>`).join("");
    els.machineList.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => { const name = btn.getAttribute("data-remove"); state.machines = state.machines.filter(x => x !== name); delete state.associations[name]; Object.keys(state.machineGroups).forEach(g => state.machineGroups[g] = state.machineGroups[g].filter(x => x !== name)); saveJson(STORAGE_KEYS.machines, state.machines); saveJson(STORAGE_KEYS.associations, state.associations); saveJson(STORAGE_KEYS.machineGroups, state.machineGroups); renderMachines(); renderSelects(); renderMachineFilters(); }));
  }
  function findGroupOf(machine) { for (const [g, arr] of Object.entries(state.machineGroups)) { if (arr.includes(machine)) return g; } return null; }

  function renderMachineFilters() {
    if (!els.mlGroup) return;
    // populate group select
    const groups = Object.keys(state.machineGroups);
    if (!groups.length) {
      state.machineGroups = { "Linha A": ["Prensa 01"], "Linha B": ["Solda 02"], "Pintura": ["Pintura 03"] };
      saveJson(STORAGE_KEYS.machineGroups, state.machineGroups);
    }
    const groupNames = Object.keys(state.machineGroups);
    els.mlGroup.innerHTML = `<option value="">Todos os grupos</option>` + groupNames.map(g => `<option value="${g}">${g}</option>`).join("");
    if (els.mlSelectLayout) {
      els.mlSelectLayout.innerHTML = state.layouts.map(l => `<option value="${l.id}">${l.name} (v${l.version})</option>`).join("");
      updateAssociatedCount();
    }
  }

  function updateAssociatedCount() {
    if (!els.mlAssociatedCount || !els.mlSelectLayout) return;
    const id = els.mlSelectLayout.value;
    const count = Object.values(state.associations).filter(v => v === id).length;
    els.mlAssociatedCount.textContent = count ? `${count} máquina(s) já associada(s) a este layout` : `0 máquinas associadas a este layout`;
  }

  els.mlSelectLayout?.addEventListener('change', updateAssociatedCount);
  els.mlOpenLibrary?.addEventListener('click', () => { document.querySelector('[data-view="library"]').click(); });

  // Add machine with optional group
  if (els.addMachineBtn) els.addMachineBtn.addEventListener("click", () => {
    const name = (els.machineName?.value || "").trim(); const group = (els.machineGroup?.value || "").trim(); if (!name) return;
    if (state.machines.includes(name)) { alert("Já existe uma máquina com este nome."); return; }
    state.machines.push(name); saveJson(STORAGE_KEYS.machines, state.machines);
    if (group) { state.machineGroups[group] = state.machineGroups[group] || []; if (!state.machineGroups[group].includes(name)) state.machineGroups[group].push(name); saveJson(STORAGE_KEYS.machineGroups, state.machineGroups); }
    if (els.machineName) els.machineName.value = ""; if (els.machineGroup) els.machineGroup.value = ""; renderMachines(); renderMachineFilters();
  });

  // Fetch machines with filters
  if (els.mlFetch) els.mlFetch.addEventListener('click', () => {
    const query = (els.mlSearch?.value || '').toLowerCase(); const group = els.mlGroup?.value;
    let list = [...state.machines];
    if (group) list = list.filter(m => (state.machineGroups[group] || []).includes(m));
    if (query) list = list.filter(m => m.toLowerCase().includes(query));
    if (!els.mlResults) return;
    // Ensure at least three examples are shown for demo
    if (!list.length) {
      const examples = ["Prensa 01", "Solda 02", "Pintura 03"]; // will be filtered by availability
      list = examples.filter(m => state.machines.includes(m)).slice(0, 3);
    }
    els.mlResults.innerHTML = list.map(m => `<li><label style=\"display:flex;align-items:center;gap:8px;\"><input type=\"checkbox\" data-machine=\"${m}\" /> ${m} <span class=\"meta\">(${getLayoutName(state.associations[m]) || 'sem layout'})</span></label></li>`).join("");
  });

  // Select all toggle
  if (els.mlSelectAll) els.mlSelectAll.addEventListener('change', () => {
    if (!els.mlResults) return;
    els.mlResults.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = els.mlSelectAll.checked);
  });

  // Associate selected machines with confirmation and conflict check
  if (els.mlAssociate) els.mlAssociate.addEventListener('click', () => {
    const layoutId = els.mlSelectLayout?.value; if (!layoutId) { alert('Selecione um layout.'); return; }
    const selected = Array.from(els.mlResults?.querySelectorAll('input[type="checkbox"]:checked') || []).map(cb => cb.getAttribute('data-machine'));
    if (!selected.length) { alert('Selecione ao menos uma máquina.'); return; }

    const conflicts = selected.filter(m => state.associations[m] && state.associations[m] !== layoutId);
    let msg = `Você enviará a etiqueta para ${selected.length} máquina(s):\n- ` + selected.join('\n- ');
    if (conflicts.length) {
      msg += `\n\nAtenção: as máquinas abaixo já possuem outra etiqueta associada e serão substituídas:\n- ` + conflicts.join('\n- ');
    }
    const ok = confirm(msg + "\n\nConfirmar envio?");
    if (!ok) return;

    selected.forEach(m => state.associations[m] = layoutId);
    saveJson(STORAGE_KEYS.associations, state.associations);
    updateAssociatedCount();
    alert(`Etiqueta enviada para ${selected.length} máquina(s).`);
    renderMachines();
  });

  // Preview from machines view
  if (els.mlPreview) els.mlPreview.addEventListener('click', () => {
    const layoutId = els.mlSelectLayout?.value; const ly = state.layouts.find(l => l.id === layoutId) || getActiveLayout();
    if (!ly) { alert('Nenhum layout selecionado.'); return; }
    saveJson(STORAGE_KEYS.activeLayoutId, ly.id);
    document.querySelector('[data-view="import"]').click();
    if (els.zplInput) { els.zplInput.value = ly.zpl; state.draftZpl = ly.zpl; saveJson(STORAGE_KEYS.draftZpl, state.draftZpl); }
    if (els.layoutName) els.layoutName.value = ly.name;
    if (ly.preview) { if (els.pvWidth) els.pvWidth.value = ly.preview.widthIn; if (els.pvHeight) els.pvHeight.value = ly.preview.heightIn; if (els.pvDpmm) els.pvDpmm.value = String(ly.preview.dpmm); }
    // Render preview
    (async () => { await new Promise(r => setTimeout(r, 50)); if (els.previewBtn) { const evt = new Event('click'); els.previewBtn.dispatchEvent(evt); } })();
  });

  function getLayoutName(id) { const l = state.layouts.find(x => x.id === id); return l ? `${l.name} (v${l.version})` : null; }

  function renderSelects() {
    if (els.selectLayout) els.selectLayout.innerHTML = state.layouts.map(l => `<option value="${l.id}">${l.name} (v${l.version})</option>`).join("");
    if (els.selectMachine) els.selectMachine.innerHTML = state.machines.map(m => `<option value="${m}">${m}</option>`).join("");
  }

  if (els.associateBtn) els.associateBtn.addEventListener("click", () => { const layoutId = els.selectLayout.value; const machine = els.selectMachine.value; if (!layoutId || !machine) return; state.associations[machine] = layoutId; saveJson(STORAGE_KEYS.associations, state.associations); renderMachines(); alert("Associado!"); });
  if (els.printBtn) els.printBtn.addEventListener("click", () => { const machine = els.selectMachine.value; const layoutId = state.associations[machine]; const layout = state.layouts.find(l => l.id === layoutId); if (!layout) { alert("Máquina sem layout associado."); return; } const logEntry = `[${new Date().toLocaleTimeString()}] Impressão simulada em ${machine} com layout ${layout.name} v${layout.version}.`; els.printLog.textContent = logEntry + "\n" + els.printLog.textContent; });

  // Quick Library modal for Importar
  const libModal = document.getElementById('lib-modal');
  const libList = document.getElementById('lib-list');
  const libClose = document.getElementById('lib-close');
  const libSearchInput = document.getElementById('lib-search-input');
  const libPreview = document.getElementById('lib-preview');

  function openLibModal() {
    if (!libModal) return;
    let items = (state.layouts && state.layouts.length)
      ? state.layouts.map(l => ({ id: l.id, name: l.name, zpl: l.zpl, version: l.version, createdAt: l.createdAt }))
      : [
          { id: 'demo-1', name: 'Etiqueta Padrão (Facchini)', zpl: EXAMPLE_ZPL_FACCHINI, version: 1, createdAt: new Date().toISOString() },
          { id: 'demo-2', name: 'Etiqueta 2', zpl: EXAMPLE_ZPL_2, version: 1, createdAt: new Date().toISOString() },
          { id: 'demo-3', name: 'Etiqueta 3', zpl: EXAMPLE_ZPL, version: 1, createdAt: new Date().toISOString() },
        ];

    async function renderPreview(item) {
      if (!libPreview) return;
      libPreview.innerHTML = `<span class=\"hint\">Carregando preview...</span>`;
      try {
        const widthIn = 6, heightIn = 4, dpmm = 8;
        const url = `https://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${widthIn}x${heightIn}/0/`;
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: item.zpl });
        if (!resp.ok) throw new Error('Preview indisponível');
        const blob = await resp.blob(); const imgUrl = URL.createObjectURL(blob);
        libPreview.innerHTML = '';
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `${item.name} · v${item.version} · ${new Date(item.createdAt).toLocaleString()}`;
        const img = new Image(); img.src = imgUrl; img.alt = 'Preview'; img.style.maxWidth = '100%';
        img.onload = () => { URL.revokeObjectURL(imgUrl); };
        libPreview.appendChild(meta);
        libPreview.appendChild(img);
      } catch {
        libPreview.innerHTML = `<span class=\"hint\">Preview indisponível no momento.</span>`;
      }
    }

    function renderList(query = '') {
      const q = query.toLowerCase();
      const filtered = items.filter(i => !q || i.name.toLowerCase().includes(q));
      libList.innerHTML = filtered.map(l => `<li data-id="${l.id}" class="row" style="justify-content:space-between;align-items:center;">
        <div><strong>${l.name}</strong> <span class=\"meta\">v${l.version} · ${new Date(l.createdAt).toLocaleDateString()}</span></div>
        <div>
          <button class="secondary" data-preview="${l.id}">Preview</button>
          <button class="secondary" data-choose="${l.id}">Selecionar</button>
        </div>
      </li>`).join('');
      libList.querySelectorAll('[data-choose]').forEach(b => b.addEventListener('click', () => {
        const id = b.getAttribute('data-choose');
        const ly = (state.layouts || []).find(x => x.id === id) || items.find(x => x.id === id);
        if (ly) {
          selectLayoutIntoEditor(ly);
        }
        closeLibModal();
      }));
      libList.querySelectorAll('[data-preview]').forEach(b => b.addEventListener('click', () => {
        const id = b.getAttribute('data-preview');
        const item = filtered.find(x => x.id === id) || items.find(x => x.id === id);
        if (item) renderPreview(item);
      }));
    }

    libModal.style.display = 'flex';
    renderList('');
    libSearchInput.value = '';
    libSearchInput.oninput = (e) => renderList(e.target.value);
    libPreview.innerHTML = `<span class=\"hint\">Use o campo de busca e clique em Preview para visualizar.</span>`;
  }
  // Fallback: delegate click at document level to open modal
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && (t.id === 'btn-import-from-lib' || t.id === 'pr-import-from-lib')) {
      e.preventDefault();
      openLibModal();
    }
  });

  // When selecting in modal, also sync to Print view selector if present
  function selectLayoutIntoEditor(ly) {
    if (els.zplInput) { els.zplInput.value = ly.zpl; state.draftZpl = ly.zpl; saveJson(STORAGE_KEYS.draftZpl, state.draftZpl); }
    if (els.layoutName) els.layoutName.value = ly.name;
    if (els.pvWidth) els.pvWidth.value = 6; if (els.pvHeight) els.pvHeight.value = 4; if (els.pvDpmm) els.pvDpmm.value = '8';
    // Also set active layout and update print selector
    saveJson(STORAGE_KEYS.activeLayoutId, ly.id || '');
    if (els.prSelectLayout) {
      // If it's a demo layout without id, leave selection as is; otherwise select it
      if (ly.id) {
        renderPrintLayouts();
        els.prSelectLayout.value = ly.id;
      }
    }
  }
  function closeLibModal() { if (!libModal) return; libModal.style.display = 'none'; }
  // Safely bind modal close
  if (libClose) { libClose.addEventListener('click', closeLibModal); }
  // Safely bind main import button
  (function(){ var btn = document.getElementById('btn-import-from-lib'); if (btn) btn.addEventListener('click', openLibModal); })();

  // Initial renders (safe)
  renderLibrary(); renderMachineFilters();
})();
