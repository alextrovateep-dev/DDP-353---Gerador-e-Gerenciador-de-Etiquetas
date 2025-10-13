(function () {
  const VIEWS = ["import", "print", "library", "machines", "ddp", "approval"];

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
    QtdEtq: '1',
    Produto: 'ABC-123',
    Maquina: 'Prensa 01',
    Operador: 'João Silva',
    Turno: '1º',
  };

  // Exemplo de OPs do TeepOEE - 3 OPs por máquina
  const EXAMPLE_OPS = [
    // Grupo 1 - Injeção (apenas operações de injeção)
    { id: 'OP001', numero: 'OP001', produto: 'ABC-123', descricaoProduto: 'Peça A - Injeção', maquina: 'Injetora 01', codigoMaquina: 'INJ-01', grupo: 'grupo1', qtdPlanejada: 100, dataInicio: '2025-10-06', status: 'Em produção', operacao: '10 - Injeção' },
    { id: 'OP002', numero: 'OP002', produto: 'ABC-124', descricaoProduto: 'Peça B - Injeção', maquina: 'Injetora 01', codigoMaquina: 'INJ-01', grupo: 'grupo1', qtdPlanejada: 50, dataInicio: '2025-10-07', status: 'Em produção', operacao: '20 - Moldagem' },
    { id: 'OP003', numero: 'OP003', produto: 'ABC-125', descricaoProduto: 'Peça C - Injeção', maquina: 'Injetora 01', codigoMaquina: 'INJ-01', grupo: 'grupo1', qtdPlanejada: 75, dataInicio: '2025-10-08', status: 'Em produção', operacao: '30 - Resfriamento' },
    
    { id: 'OP004', numero: 'OP004', produto: 'ABC-126', descricaoProduto: 'Peça D - Injeção', maquina: 'Injetora 02', codigoMaquina: 'INJ-02', grupo: 'grupo1', qtdPlanejada: 120, dataInicio: '2025-10-09', status: 'Em produção', operacao: '10 - Injeção' },
    { id: 'OP005', numero: 'OP005', produto: 'ABC-127', descricaoProduto: 'Peça E - Injeção', maquina: 'Injetora 02', codigoMaquina: 'INJ-02', grupo: 'grupo1', qtdPlanejada: 80, dataInicio: '2025-10-10', status: 'Em produção', operacao: '20 - Moldagem' },
    { id: 'OP006', numero: 'OP006', produto: 'ABC-128', descricaoProduto: 'Peça F - Injeção', maquina: 'Injetora 02', codigoMaquina: 'INJ-02', grupo: 'grupo1', qtdPlanejada: 90, dataInicio: '2025-10-11', status: 'Em produção', operacao: '30 - Resfriamento' },

    // Grupo 2 - Usinagem (apenas operações de usinagem)
    { id: 'OP007', numero: 'OP007', produto: 'XYZ-001', descricaoProduto: 'Componente X - Torno', maquina: 'Torno 01', codigoMaquina: 'TOR-01', grupo: 'grupo2', qtdPlanejada: 200, dataInicio: '2025-10-06', status: 'Em produção', operacao: '10 - Torneamento' },
    { id: 'OP008', numero: 'OP008', produto: 'XYZ-002', descricaoProduto: 'Componente Y - Torno', maquina: 'Torno 01', codigoMaquina: 'TOR-01', grupo: 'grupo2', qtdPlanejada: 150, dataInicio: '2025-10-07', status: 'Em produção', operacao: '20 - Furação' },
    { id: 'OP009', numero: 'OP009', produto: 'XYZ-003', descricaoProduto: 'Componente Z - Torno', maquina: 'Torno 01', codigoMaquina: 'TOR-01', grupo: 'grupo2', qtdPlanejada: 180, dataInicio: '2025-10-08', status: 'Em produção', operacao: '30 - Rosqueamento' },

    { id: 'OP010', numero: 'OP010', produto: 'XYZ-004', descricaoProduto: 'Eixo A - Torno', maquina: 'Torno 02', codigoMaquina: 'TOR-02', grupo: 'grupo2', qtdPlanejada: 120, dataInicio: '2025-10-09', status: 'Em produção', operacao: '10 - Torneamento' },
    { id: 'OP011', numero: 'OP011', produto: 'XYZ-005', descricaoProduto: 'Eixo B - Torno', maquina: 'Torno 02', codigoMaquina: 'TOR-02', grupo: 'grupo2', qtdPlanejada: 100, dataInicio: '2025-10-10', status: 'Em produção', operacao: '20 - Furação' },
    { id: 'OP012', numero: 'OP012', produto: 'XYZ-006', descricaoProduto: 'Eixo C - Torno', maquina: 'Torno 02', codigoMaquina: 'TOR-02', grupo: 'grupo2', qtdPlanejada: 110, dataInicio: '2025-10-11', status: 'Em produção', operacao: '30 - Rosqueamento' },

    { id: 'OP013', numero: 'OP013', produto: 'XYZ-007', descricaoProduto: 'Peça Fresa A', maquina: 'Fresa 01', codigoMaquina: 'FRE-01', grupo: 'grupo2', qtdPlanejada: 80, dataInicio: '2025-10-06', status: 'Em produção', operacao: '10 - Fresagem' },
    { id: 'OP014', numero: 'OP014', produto: 'XYZ-008', descricaoProduto: 'Peça Fresa B', maquina: 'Fresa 01', codigoMaquina: 'FRE-01', grupo: 'grupo2', qtdPlanejada: 60, dataInicio: '2025-10-07', status: 'Em produção', operacao: '20 - Ranhuramento' },
    { id: 'OP015', numero: 'OP015', produto: 'XYZ-009', descricaoProduto: 'Peça Fresa C', maquina: 'Fresa 01', codigoMaquina: 'FRE-01', grupo: 'grupo2', qtdPlanejada: 70, dataInicio: '2025-10-08', status: 'Em produção', operacao: '30 - Desbaste' },

    // Grupo 3 - Montagem (apenas operações de montagem)
    { id: 'OP016', numero: 'OP016', produto: 'MNT-001', descricaoProduto: 'Montagem Final A', maquina: 'Estação 01', codigoMaquina: 'EST-01', grupo: 'grupo3', qtdPlanejada: 25, dataInicio: '2025-10-09', status: 'Em produção', operacao: '10 - Montagem' },
    { id: 'OP017', numero: 'OP017', produto: 'MNT-002', descricaoProduto: 'Montagem Final B', maquina: 'Estação 01', codigoMaquina: 'EST-01', grupo: 'grupo3', qtdPlanejada: 30, dataInicio: '2025-10-10', status: 'Em produção', operacao: '20 - Fixação' },
    { id: 'OP018', numero: 'OP018', produto: 'MNT-003', descricaoProduto: 'Montagem Final C', maquina: 'Estação 01', codigoMaquina: 'EST-01', grupo: 'grupo3', qtdPlanejada: 35, dataInicio: '2025-10-11', status: 'Em produção', operacao: '30 - Inspeção' },

    { id: 'OP019', numero: 'OP019', produto: 'MNT-004', descricaoProduto: 'Montagem Secundária A', maquina: 'Estação 02', codigoMaquina: 'EST-02', grupo: 'grupo3', qtdPlanejada: 40, dataInicio: '2025-10-09', status: 'Em produção', operacao: '10 - Submontagem' },
    { id: 'OP020', numero: 'OP020', produto: 'MNT-005', descricaoProduto: 'Montagem Secundária B', maquina: 'Estação 02', codigoMaquina: 'EST-02', grupo: 'grupo3', qtdPlanejada: 45, dataInicio: '2025-10-10', status: 'Em produção', operacao: '20 - Fixação' },
    { id: 'OP021', numero: 'OP021', produto: 'MNT-006', descricaoProduto: 'Montagem Secundária C', maquina: 'Estação 02', codigoMaquina: 'EST-02', grupo: 'grupo3', qtdPlanejada: 50, dataInicio: '2025-10-11', status: 'Em produção', operacao: '30 - Lacração' },

    // Exemplos de agrupamento CNC (conforme documentação Facchini)
    // Agrupamento CNC 2222
    { id: 'OP022', numero: 'OP1001', produto: 'PECA-001', descricaoProduto: 'Peça Principal', maquina: 'Máquina de Corte', codigoMaquina: 'CORT-01', grupo: 'grupo4', qtdPlanejada: 15, dataInicio: '2025-10-06', status: 'Em produção', operacao: '10 - Corte', codigoCNC: '2222', qtdPorChapa: 5, chapasReservadas: 3 },
    { id: 'OP023', numero: 'OP1002', produto: 'PECA-002', descricaoProduto: 'Componente A', maquina: 'Máquina de Corte', codigoMaquina: 'CORT-01', grupo: 'grupo4', qtdPlanejada: 30, dataInicio: '2025-10-06', status: 'Em produção', operacao: '10 - Corte', codigoCNC: '2222', qtdPorChapa: 10, chapasReservadas: 3 },
    { id: 'OP024', numero: 'OP1003', produto: 'PECA-003', descricaoProduto: 'Componente B', maquina: 'Máquina de Corte', codigoMaquina: 'CORT-01', grupo: 'grupo4', qtdPlanejada: 60, dataInicio: '2025-10-06', status: 'Em produção', operacao: '10 - Corte', codigoCNC: '2222', qtdPorChapa: 20, chapasReservadas: 3 },

    // Agrupamento CNC 3333
    { id: 'OP025', numero: 'OP1001', produto: 'PECA-001', descricaoProduto: 'Peça Principal', maquina: 'Máquina de Corte', codigoMaquina: 'CORT-02', grupo: 'grupo4', qtdPlanejada: 85, dataInicio: '2025-10-07', status: 'Em produção', operacao: '10 - Corte', codigoCNC: '3333', qtdPorChapa: 17, chapasReservadas: 5 },
    { id: 'OP026', numero: 'OP1002', produto: 'PECA-002', descricaoProduto: 'Componente A', maquina: 'Máquina de Corte', codigoMaquina: 'CORT-02', grupo: 'grupo4', qtdPlanejada: 120, dataInicio: '2025-10-07', status: 'Em produção', operacao: '10 - Corte', codigoCNC: '3333', qtdPorChapa: 24, chapasReservadas: 5 },
    { id: 'OP027', numero: 'OP1003', produto: 'PECA-003', descricaoProduto: 'Componente B', maquina: 'Máquina de Corte', codigoMaquina: 'CORT-02', grupo: 'grupo4', qtdPlanejada: 140, dataInicio: '2025-10-07', status: 'Em produção', operacao: '10 - Corte', codigoCNC: '3333', qtdPorChapa: 28, chapasReservadas: 5 },

    // Agrupamento CNC 4444
    { id: 'OP028', numero: 'OP2001', produto: 'PECA-004', descricaoProduto: 'Chapa Especial', maquina: 'Máquina de Corte', codigoMaquina: 'CORT-03', grupo: 'grupo4', qtdPlanejada: 45, dataInicio: '2025-10-08', status: 'Em produção', operacao: '10 - Corte', codigoCNC: '4444', qtdPorChapa: 15, chapasReservadas: 3 },
    { id: 'OP029', numero: 'OP2002', produto: 'PECA-005', descricaoProduto: 'Suporte Lateral', maquina: 'Máquina de Corte', codigoMaquina: 'CORT-03', grupo: 'grupo4', qtdPlanejada: 75, dataInicio: '2025-10-08', status: 'Em produção', operacao: '10 - Corte', codigoCNC: '4444', qtdPorChapa: 25, chapasReservadas: 3 },
  ];

  const els = {
    nav: document.querySelector(".nav"), views: document.getElementById("views"),
    zplInput: document.getElementById("zpl-input"), detectBtn: document.getElementById("btn-detect"), clearBtn: document.getElementById("btn-clear"), detectOut: document.getElementById("detect-output"),
    importFromLibBtn: document.getElementById("btn-import-from-lib"), layoutName: document.getElementById("layout-name"), saveLayoutBtn: document.getElementById("btn-save-layout"), previewBtn: document.getElementById("btn-preview"),
    pvWidth: document.getElementById("pv-width"), pvHeight: document.getElementById("pv-height"), pvDpmm: document.getElementById("pv-dpmm"), pvRefresh: document.getElementById("pv-refresh"), pvContainer: document.getElementById("pv-container"),

    // print view
    prSelectLayout: document.getElementById("pr-select-layout"), prLoad: document.getElementById("pr-load"), prForm: document.getElementById("pr-form"), prCopies: document.getElementById("pr-copies"), prPreview: document.getElementById("pr-preview"), prPrint: document.getElementById("pr-print"), prPreviewContainer: document.getElementById("pr-preview-container"), prLog: document.getElementById("pr-log"),
    // print batch functionality
    prMachineGroup: document.getElementById("pr-machine-group"), prSelectMachines: document.getElementById("pr-select-machines"), prDateStart: document.getElementById("pr-date-start"), prDateEnd: document.getElementById("pr-date-end"), prSearchOps: document.getElementById("pr-search-ops"), prImportFromLib: document.getElementById("pr-import-from-lib"), prQtyEtq: document.getElementById("pr-qty-etq"), prOpsResults: document.getElementById("ops-results"),
    // machine selector modal
    machineSelectorModal: document.getElementById("machine-selector-modal"), machineSelectorClose: document.getElementById("machine-selector-close"), machineSelectorList: document.getElementById("machine-selector-list"), machineSelectAll: document.getElementById("machine-select-all"), machineDeselectAll: document.getElementById("machine-deselect-all"), machineCount: document.getElementById("machine-count"), machineSelectorCancel: document.getElementById("machine-selector-cancel"), machineSelectorConfirm: document.getElementById("machine-selector-confirm"),

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
    machines: loadJson(STORAGE_KEYS.machines, ["Injetora 01", "Injetora 02", "Torno 01", "Torno 02", "Fresa 01", "Estação 01", "Estação 02", "Máquina de Corte", "Máquina de Dobra", "Máquina de Usinagem", "Máquina de Pintura", "Máquina de Solda"]),
    machineGroups: loadJson(STORAGE_KEYS.machineGroups, { 
      "Grupo 1 - Injeção": ["Injetora 01", "Injetora 02"], 
      "Grupo 2 - Usinagem": ["Torno 01", "Torno 02", "Fresa 01"], 
      "Grupo 3 - Montagem": ["Estação 01", "Estação 02"],
      "Grupo 4 - Processo Sequencial": ["Máquina de Corte", "Máquina de Dobra", "Máquina de Usinagem", "Máquina de Pintura", "Máquina de Solda"]
    }),
    associations: loadJson(STORAGE_KEYS.associations, {}),
    selectedMachines: [], // Máquinas selecionadas para busca de OPs
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
  if (els.nav) {
    els.nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-view]"); if (!btn) return;
    const target = btn.dataset.view;
    document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("is-active", b === btn));
    VIEWS.forEach(v => document.getElementById(`view-${v}`).classList.toggle("is-active", v === target));
    if (target === "library") renderLibrary();
    if (target === "machines") { renderMachines(); renderSelects(); renderMachineFilters(); }
    if (target === "print") { renderPrintLayouts(); }
    if (target === "ddp") { loadDdpDoc(); }
    if (target === "approval") { 
      // Sistema de aprovação na página
    }
    });
  }

  // Navigation para nav-buttons (botões especiais)
  const navButtons = document.querySelector('.nav-buttons');
  if (navButtons) {
    navButtons.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-view]"); if (!btn) return;
      const target = btn.dataset.view;
      document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("is-active", b === btn));
      VIEWS.forEach(v => document.getElementById(`view-${v}`).classList.toggle("is-active", v === target));
      if (target === "approval") { 
        // Página de aprovação DDP 353
      }
    });
  }

  async function loadDdpDoc() {
    const el = document.getElementById('ddp-content');
    if (!el) return;
    const DDP_DOC_TEXT = `DDP 353 - SISTEMA DE ETIQUETAS INTEGRADO TEEPMES/FACCHINI

═══════════════════════════════════════════════════════════════════════════════

PROPOSTA DO SISTEMA

O Sistema de Etiquetas TeepMES é uma solução completa desenvolvida especificamente
para a Facchini, integrada ao sistema TeepOEE, que permite criar, gerenciar e
imprimir etiquetas de forma automatizada e rastreável na linha de produção.

═══════════════════════════════════════════════════════════════════════════════

COMO O SISTEMA FUNCIONA

1. CRIAÇÃO DE ETIQUETAS
   O operador acessa a aba "Criar Etiquetas" onde pode:
   - Colar código ZPL diretamente do Zebra Designer
   - Usar placeholders dinâmicos como {OP}, {Produto}, {Maquina}
   - Visualizar preview em tempo real da etiqueta
   - Salvar o layout na biblioteca para reutilização

2. GESTÃO DE LAYOUTS
   Na aba "Biblioteca", o usuário pode:
   - Visualizar todos os layouts criados
   - Buscar por nome específico
   - Editar layouts existentes
   - Duplicar e modificar templates
   - Gerenciar versões de etiquetas

3. IMPRESSÃO OPERACIONAL
   Na aba "Imprimir", o sistema permite:
   - Selecionar máquinas por grupo ou individualmente
   - Filtrar OPs por período de produção
   - Visualizar lista de OPs com dados do TeepOEE
   - Configurar quantidade de etiquetas por OP
   - Imprimir individualmente ou em lote

4. ASSOCIAÇÃO COM MÁQUINAS
   Na aba "Enviar P/ Máquinas", o operador pode:
   - Selecionar layout da biblioteca
   - Escolher máquinas de destino
   - Visualizar preview antes do envio
   - Confirmar substituição de etiquetas existentes
   - Enviar para múltiplas máquinas simultaneamente

═══════════════════════════════════════════════════════════════════════════════

INTEGRAÇÃO COM TEEPOEE

O sistema se conecta automaticamente ao TeepOEE para:
- Buscar OPs ativas por máquina e data
- Obter dados de produtos e quantidades
- Sincronizar informações de produção
- Manter rastreabilidade completa OP ↔ Etiqueta ↔ Máquina

═══════════════════════════════════════════════════════════════════════════════

FLUXO OPERACIONAL TÍPICO

1. PREPARAÇÃO
   - Técnico cria layout de etiqueta no Zebra Designer
   - Exporta código ZPL e cola no sistema
   - Salva na biblioteca com nome descritivo

2. CONFIGURAÇÃO
   - Supervisor seleciona máquinas para receber etiqueta
   - Sistema associa layout às máquinas escolhidas
   - Confirma envio e substitui etiquetas antigas

3. OPERAÇÃO DIÁRIA
   - Operador acessa aba "Imprimir"
   - Seleciona grupo de máquinas e período
   - Visualiza lista de OPs do TeepOEE
   - Configura quantidades e imprime etiquetas

4. RASTREABILIDADE
   - Sistema registra todas as impressões
   - Mantém log de atividades com timestamp
   - Permite auditoria completa do processo

═══════════════════════════════════════════════════════════════════════════════

BENEFÍCIOS PARA A FACCHINI

AUTOMAÇÃO COMPLETA
- Elimina entrada manual de dados de OP
- Reduz erros humanos na impressão
- Padroniza formato de todas as etiquetas

RASTREABILIDADE TOTAL
- Vincula etiqueta à OP específica
- Registra máquina de impressão
- Mantém histórico completo de atividades

FLEXIBILIDADE OPERACIONAL
- Permite criação rápida de novos layouts
- Facilita modificações em tempo real
- Reutiliza templates existentes

INTEGRAÇÃO NATIVA
- Interface familiar ao TeepOEE
- Dados sempre atualizados
- Workflow operacional otimizado

═══════════════════════════════════════════════════════════════════════════════

TECNOLOGIAS E COMPATIBILIDADE

- ZPL (Zebra Programming Language) para compatibilidade total
- Integração REST com banco TeepOEE
- Suporte a impressoras Zebra padrão industrial
- Interface web responsiva e intuitiva
- Sistema de backup automático de layouts

═══════════════════════════════════════════════════════════════════════════════

RESULTADO ESPERADO

Com a implementação deste sistema, a Facchini terá:
- Rastreabilidade completa de etiquetas
- Redução de 90% no tempo de impressão
- Eliminação de erros de digitação
- Padronização visual das etiquetas
- Integração perfeita com TeepOEE
- Controle total sobre o processo de etiquetagem

O sistema está pronto para uso imediato e pode ser implementado sem
interrupção das operações atuais da fábrica.`;
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

  function normalizeZplForPreview(zpl) {
    if (!zpl) return zpl;
    // Garantir codificação UTF-8 no preview para acentos: adiciona ^CI28 se não houver ^CI definido
    if (!/\^CI(27|28)/.test(zpl)) {
      zpl = zpl.replace("^XA", "^XA\n^CI28");
    }
    return zpl;
  }

  async function renderImagePreviewDesign() {
    const layout = getActiveLayout(); const zpl = (els.zplInput?.value || state.draftZpl || '').trim(); if (!zpl) { els.pvContainer.innerHTML = `<span class=\"hint\">Cole o ZPL para visualizar.</span>`; return; }
    const widthIn = layout?.preview?.widthIn ?? parseFloat(els.pvWidth.value || "6"); const heightIn = layout?.preview?.heightIn ?? parseFloat(els.pvHeight.value || "4"); const dpmm = layout?.preview?.dpmm ?? parseInt(els.pvDpmm.value || "8", 10);
    els.pvWidth.value = widthIn; els.pvHeight.value = heightIn; els.pvDpmm.value = String(dpmm);
    const url = `https://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${widthIn}x${heightIn}/0/`;
    els.pvContainer.innerHTML = `<span class=\"hint\">Renderizando preview...</span>`;
    try { const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body: normalizeZplForPreview(zpl) }); if (!resp.ok) throw new Error(`HTTP ${resp.status}`); const blob = await resp.blob(); const imgUrl = URL.createObjectURL(blob); els.pvContainer.innerHTML = ''; const img = new Image(); img.src = imgUrl; img.alt = 'Preview da etiqueta'; img.style.maxWidth = '100%'; img.onload = () => { URL.revokeObjectURL(imgUrl); }; els.pvContainer.appendChild(img); } catch (_) { els.pvContainer.innerHTML = `<span class=\"hint\">Não foi possível renderizar o preview (offline? CORS?).</span>`; }
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

  // Event listeners para funcionalidade de impressão em lote
  els.prSearchOps?.addEventListener("click", searchOps);
  els.prSelectMachines?.addEventListener("click", openMachineSelectorModal);
  
  // Event listeners do modal de seleção de máquinas
  els.machineSelectorClose?.addEventListener("click", closeMachineSelectorModal);
  els.machineSelectorCancel?.addEventListener("click", closeMachineSelectorModal);
  els.machineSelectorConfirm?.addEventListener("click", confirmMachineSelection);
  els.machineSelectAll?.addEventListener("click", selectAllMachines);
  els.machineDeselectAll?.addEventListener("click", deselectAllMachines);

  // Event delegation para checkboxes de máquinas
  els.machineSelectorList?.addEventListener("change", (e) => {
    if (e.target.classList.contains('machine-checkbox')) {
      updateMachineCount();
    }
  });

  // Event delegation para resultados de OPs
  els.prOpsResults?.addEventListener("click", (e) => {
    if (e.target.classList.contains('op-print-btn')) {
      const opId = e.target.dataset.opId;
      handlePrintSingle(opId);
    } else if (e.target.id === 'btn-print-all') {
      handlePrintAll();
    }
  });

  // Filtro de grupo de máquinas
  els.prMachineGroup?.addEventListener("change", (e) => {
    const grupo = e.target.value;
    const filterType = document.querySelector('input[name="filter-type"]:checked')?.value;
    
    if (filterType === 'group' && grupo) {
      // Mapear grupo para máquinas (simulação)
      const grupoMapping = {
        'Grupo 1 - Injeção': ['Injetora 01', 'Injetora 02'],
        'Grupo 2 - Usinagem': ['Torno 01', 'Torno 02', 'Fresa 01'],
        'Grupo 3 - Montagem': ['Estação 01', 'Estação 02'],
        'Grupo 4 - Processo Sequencial': ['Máquina de Corte', 'Máquina de Dobra', 'Máquina de Usinagem', 'Máquina de Pintura', 'Máquina de Solda']
      };
      
      const maquinasDoGrupo = grupoMapping[grupo] || [];
      state.selectedMachines = maquinasDoGrupo;
      
      addLogEntry(`Grupo "${grupo}" selecionado. Máquinas: ${maquinasDoGrupo.join(', ')}`);
    } else if (filterType === 'group') {
      state.selectedMachines = [];
      addLogEntry('Filtro de grupo removido');
    }
  });

  // Controle dos radio buttons
  document.querySelectorAll('input[name="filter-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const filterType = e.target.value;
      
      if (filterType === 'group') {
        // Ativar filtro por grupo
        els.prMachineGroup.disabled = false;
        document.getElementById('pr-cnc-grouping').disabled = true;
        addLogEntry('Modo: Filtro por Grupo de Máquinas');
        
        // Se há um grupo selecionado, aplicar
        if (els.prMachineGroup.value) {
          els.prMachineGroup.dispatchEvent(new Event('change'));
        }
      } else if (filterType === 'machines') {
        // Ativar filtro por máquinas específicas
        els.prMachineGroup.disabled = true;
        els.prMachineGroup.value = '';
        document.getElementById('pr-cnc-grouping').disabled = true;
        addLogEntry('Modo: Filtro por Máquinas Específicas');
        addLogEntry('Use "Selecionar Máquinas Individuais" para escolher');
      } else if (filterType === 'grouping') {
        // Ativar filtro por agrupamento CNC
        els.prMachineGroup.disabled = true;
        els.prMachineGroup.value = '';
        document.getElementById('pr-cnc-grouping').disabled = false;
        addLogEntry('Modo: Filtro por Agrupamento CNC');
        addLogEntry('Digite o código CNC para buscar OPs do mesmo plano de corte');
      }
    });
  });

  // Filtro por código CNC
  document.getElementById('pr-cnc-grouping')?.addEventListener('input', (e) => {
    const codigoCNC = e.target.value.trim();
    const selectedDisplay = document.getElementById('selected-cnc-display');
    const codeDisplay = document.getElementById('cnc-code-display');
    
    if (codigoCNC) {
      // Buscar OPs com o mesmo código CNC
      const opsComCNC = EXAMPLE_OPS.filter(op => op.codigoCNC === codigoCNC);
      const maquinasCNC = [...new Set(opsComCNC.map(op => op.maquina))];
      
      state.selectedMachines = maquinasCNC;
      
      // Mostrar badge do plano selecionado
      if (selectedDisplay && codeDisplay) {
        codeDisplay.textContent = codigoCNC;
        selectedDisplay.style.display = 'inline-block';
      }
      
      addLogEntry(`🔍 Agrupamento CNC "${codigoCNC}" selecionado.`);
      addLogEntry(`📊 OPs encontradas: ${opsComCNC.length}`);
      addLogEntry(`🏭 Máquinas envolvidas: ${maquinasCNC.join(', ')}`);
      
      // Mostrar detalhes do agrupamento
      if (opsComCNC.length > 0) {
        addLogEntry(`📋 Plano de Corte CNC "${codigoCNC}" - Detalhes:`);
        addLogEntry(`🏭 Máquina: ${maquinasCNC.join(', ')}`);
        addLogEntry(`📊 OPs que serão cortadas neste plano:`);
        opsComCNC.forEach(op => {
          addLogEntry(`  - ${op.numero} (${op.produto}): ${op.qtdPorChapa} peças/chapa, ${op.chapasReservadas} chapas reservadas`);
        });
        const totalChapas = Math.max(...opsComCNC.map(op => op.chapasReservadas));
        addLogEntry(`📦 Total de chapas no plano: ${totalChapas}`);
      } else {
        addLogEntry(`⚠️ Nenhuma OP encontrada para o código CNC "${codigoCNC}"`);
        addLogEntry(`💡 Códigos disponíveis: 2222, 3333, 4444`);
      }
    } else {
      state.selectedMachines = [];
      
      // Esconder badge do plano selecionado
      if (selectedDisplay) {
        selectedDisplay.style.display = 'none';
      }
      
      addLogEntry('🗑️ Filtro de agrupamento CNC removido');
    }
  });

  // Definir datas padrão para facilitar teste
  function initializePrintPage() {
    if (els.prDateStart && els.prDateEnd) {
      // Definir datas que correspondam às OPs mockadas (06/10/2025 a 13/10/2025)
      els.prDateStart.value = '06/10/2025';
      els.prDateEnd.value = '13/10/2025';
      
      // Datas padrão definidas silenciosamente
    }
  }

  // Limpar dados antigos do localStorage se necessário
  function clearOldData() {
    const oldMachines = ["Prensa 01", "Solda 02", "Pintura 03"];
    const currentMachines = state.machines;
    
    // Se as máquinas atuais são as antigas, limpar e recarregar
    if (JSON.stringify(currentMachines.sort()) === JSON.stringify(oldMachines.sort())) {
      localStorage.removeItem(STORAGE_KEYS.machines);
      localStorage.removeItem(STORAGE_KEYS.machineGroups);
      state.machines = ["Injetora 01", "Injetora 02", "Torno 01", "Torno 02", "Fresa 01", "Estação 01", "Estação 02"];
      state.machineGroups = { "Grupo 1": ["Injetora 01", "Injetora 02"], "Grupo 2": ["Torno 01", "Torno 02", "Fresa 01"], "Grupo 3": ["Estação 01", "Estação 02"] };
      // Dados antigos limpos silenciosamente
    }
  }

  // Inicializar página de impressão quando carregada
  clearOldData();
  initializePrintPage();

  // Sistema de Aprovação Técnica
  function initializeApprovalSystem() {
    // Função removida - agora usa o sistema unificado
  }

  // Função para abrir modal de confirmação
  function openConfirm(title, message, onOk, type = 'default') {
    const dlg = document.getElementById('dialog-confirm');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const btnOk = document.getElementById('confirm-ok');
    const btnCancel = document.getElementById('confirm-cancel');
    const iconEl = titleEl.querySelector('.icon');
    
    // Definir ícone baseado no tipo
    let icon = '?';
    if (type === 'total') {
      icon = '✓';
    } else if (type === 'parcial') {
      icon = '!';
    } else {
      icon = '?';
    }
    
    // Atualizar conteúdo
    iconEl.textContent = icon;
    titleEl.innerHTML = `<span class="icon">${icon}</span> ${title}`;
    messageEl.textContent = message;
    
    // Remover classes anteriores
    dlg.classList.remove('dialog-confirm-total', 'dialog-confirm-parcial');
    
    // Aplicar classe baseada no tipo
    if (type === 'total') {
      dlg.classList.add('dialog-confirm-total');
    } else if (type === 'parcial') {
      dlg.classList.add('dialog-confirm-parcial');
    }
    
    const cleanup = () => {
      btnOk.removeEventListener('click', handleOk);
      btnCancel.removeEventListener('click', handleCancel);
      // Remover classes ao fechar
      dlg.classList.remove('dialog-confirm-total', 'dialog-confirm-parcial');
    };
    
    const handleOk = () => { dlg.close(); cleanup(); onOk?.(); };
    const handleCancel = () => { dlg.close(); cleanup(); };
    
    btnOk.addEventListener('click', handleOk);
    btnCancel.addEventListener('click', handleCancel);
    dlg.showModal();
  }

  // Sistema de Reset
  function initializeResetSystem() {
    const resetBtn = document.getElementById('btn-reset');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', () => {
      openConfirm(
        '🔄 Resetar Demonstração',
        'Tem certeza que deseja resetar toda a demonstração? Todos os dados salvos serão perdidos.',
        () => {
          // Limpar localStorage
          localStorage.clear();
          
          // Recarregar página
          window.location.reload();
          
          console.log('🔄 Demonstração resetada');
        }
      );
    });
  }

  // Inicializar sistemas
  initializeApprovalSystem();
  initializeResetSystem();

  // Sistema de aprovação agora funciona diretamente na página (não modal)
  // O botão .btn-approval já está configurado para mostrar a view-approval

  // Envio do formulário de aprovação
  const approvalForm = document.getElementById('ddp-approval-form');
  if (approvalForm) {
    approvalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const errorDiv = document.getElementById('ddp-approval-error');
    const successDiv = document.getElementById('ddp-approval-success');
    const submitBtn = document.getElementById('ddp-approval-submit');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline';
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    try {
      const formData = new FormData(form);
      
      // Organizar dados para melhor formatação no email
      const nome = formData.get('nome');
      const sobrenome = formData.get('sobrenome');
      const setor = formData.get('setor');
      const cargo = formData.get('cargo');
      const telefone = formData.get('telefone');
      const email = formData.get('email');
      
      // Criar uma mensagem simples combinando todos os dados
      const mensagemCompleta = `
DDP 353 - Sistema de Etiquetas
APROVACAO TECNICA CONCEDIDA

APROVADOR: ${nome} ${sobrenome}
CARGO: ${cargo}
SETOR: ${setor}
TELEFONE: ${telefone}
EMAIL: ${email}

PROXIMO PASSO: GERAR ORCAMENTO - Departamento Comercial
      `.trim();
      
      // IMPORTANTE: Não sobrescrever o campo email, usar 'message' para o conteúdo
      formData.set('message', mensagemCompleta);
      
      // Configurar reply-to
      formData.append('_replyto', email);
      
      // Debug: mostrar dados que serão enviados
      console.log('Dados do formulário:', [...formData.entries()]);
      console.log('URL do formulário:', form.action);
      
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', [...response.headers.entries()]);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('Resposta do servidor:', responseText);
        successDiv.style.display = 'block';
        form.reset();
        
        // Formulário enviado com sucesso - não precisa fechar modal pois está na página
      } else {
        const errorText = await response.text();
        console.error('Erro detalhado:', response.status, errorText);
        throw new Error(`Erro no envio: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      errorDiv.style.display = 'block';
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitText.style.display = 'inline';
      submitLoading.style.display = 'none';
    }
  });
  }
  
  // Instruções removidas para limpar a demonstração

  function substituteZpl(zpl, values) {
    let out = zpl; for (const [k, v] of Object.entries(values)) { const re = new RegExp(`\\{${escapeRegExp(k)}\\}`, 'g'); out = out.replace(re, v || ''); } return out;
  }
  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Função para converter DD/MM/YYYY para YYYY-MM-DD
  function convertDateToISO(dateString) {
    if (!dateString) return null;
    // Se já está no formato YYYY-MM-DD, retorna como está
    if (dateString.includes('-') && dateString.length === 10) {
      return dateString;
    }
    // Converte DD/MM/YYYY para YYYY-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateString;
  }

  // Funções para busca de OPs
  function searchOps() {
    const dataInicio = els.prDateStart?.value;
    const dataFim = els.prDateEnd?.value;
    const selectedMachines = state.selectedMachines;
    const filterType = document.querySelector('input[name="filter-type"]:checked')?.value;

    addLogEntry(`\n=== INICIANDO BUSCA DE OPs ===`);
    addLogEntry(`Tipo de filtro: ${filterType === 'group' ? 'Grupo de Máquinas' : 'Máquinas Específicas'}`);
    addLogEntry(`Máquinas selecionadas: ${selectedMachines.length > 0 ? selectedMachines.join(', ') : 'Nenhuma'}`);
    addLogEntry(`Período: ${dataInicio || 'Sem início'} até ${dataFim || 'Sem fim'}`);

    if (selectedMachines.length === 0) {
      if (filterType === 'group') {
        addLogEntry('❌ Erro: Selecione um grupo de máquinas antes de buscar OPs');
      } else if (filterType === 'machines') {
        addLogEntry('❌ Erro: Selecione pelo menos uma máquina específica antes de buscar OPs');
        addLogEntry('Dica: Use "Selecionar Máquinas Individuais"');
      } else if (filterType === 'grouping') {
        addLogEntry('❌ Erro: Digite um código CNC antes de buscar OPs');
        addLogEntry('Dica: Exemplos: 2222, 3333, 4444');
      }
      return;
    }

    // Debug: mostrar todas as OPs disponíveis
    addLogEntry(`\nOPs disponiveis no sistema: ${EXAMPLE_OPS.length}`);
    EXAMPLE_OPS.forEach(op => {
      addLogEntry(`  - ${op.numero} | ${op.maquina} | ${op.dataInicio} | Grupo: ${op.grupo}`);
    });

    // Filtrar OPs por máquinas selecionadas e período
    let opsFiltradas = EXAMPLE_OPS.filter(op => {
      let match = true;
      
      // Filtrar por máquinas selecionadas
      if (!selectedMachines.includes(op.maquina)) {
        match = false;
        addLogEntry(`  ❌ ${op.numero} descartada - máquina "${op.maquina}" não está selecionada`);
      }
      
      // Filtrar por período (converter DD/MM/YYYY para YYYY-MM-DD para comparação)
      if (dataInicio) {
        const dataInicioISO = convertDateToISO(dataInicio);
        if (op.dataInicio < dataInicioISO) {
          match = false;
          addLogEntry(`  ❌ ${op.numero} descartada - data ${op.dataInicio} anterior ao período (${dataInicio})`);
        }
      }
      if (dataFim) {
        const dataFimISO = convertDateToISO(dataFim);
        if (op.dataInicio > dataFimISO) {
          match = false;
          addLogEntry(`  ❌ ${op.numero} descartada - data ${op.dataInicio} posterior ao período (${dataFim})`);
        }
      }
      
      if (match) {
        addLogEntry(`  - ${op.numero} incluida - ${op.maquina} | ${op.dataInicio}`);
      }
      
      return match;
    });

    addLogEntry(`\n📊 Resultado: ${opsFiltradas.length} OPs encontradas`);

    // Agrupar por máquina
    const opsAgrupadas = groupOpsByMachine(opsFiltradas);
    
    renderGroupedOps(opsAgrupadas);
    addLogEntry(`Busca concluida: ${opsFiltradas.length} OPs em ${opsAgrupadas.length} maquinas`);
  }

  function groupOpsByMachine(ops) {
    const grouped = {};
    ops.forEach(op => {
      if (!grouped[op.maquina]) {
        grouped[op.maquina] = {
          maquina: op.maquina,
          codigoMaquina: op.codigoMaquina,
          ops: []
        };
      }
      grouped[op.maquina].ops.push(op);
    });
    return Object.values(grouped);
  }

  function renderGroupedOps(data) {
    if (!els.prOpsResults) return;

    if (data.length === 0) {
      els.prOpsResults.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 4px; border: 1px solid #e5e7eb;">
          <h3 style="color: #6b7280; margin: 0 0 4px 0; font-size: 16px;">🔍 Nenhuma OP encontrada</h3>
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">Verifique os filtros de máquinas e período selecionados.</p>
        </div>
      `;
      els.prOpsResults.style.display = 'block';
      return;
    }

    const totalOps = data.reduce((sum, group) => sum + group.ops.length, 0);

    // Verificar se há agrupamento CNC ativo
    const cncInput = document.getElementById('pr-cnc-grouping');
    const activeCNC = cncInput ? cncInput.value.trim() : '';
    const isCNCFilter = document.querySelector('input[name="filter-type"]:checked')?.value === 'grouping';

    const html = `
      <div style="background: #f0f8ff; border: 1px solid #3b82f6; border-radius: 4px; padding: 8px 12px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; color: #1e40af; font-size: 16px;">OPs Encontradas</h3>
            ${isCNCFilter && activeCNC ? `
              <div style="margin-top: 4px; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-weight: 600; display: inline-block; border: 1px solid #bbf7d0;">
                📋 Plano de Corte CNC: ${activeCNC} - ${data.filter(group => group.ops.some(op => op.codigoCNC === activeCNC)).map(group => group.maquina).join(', ')}
              </div>
            ` : ''}
          </div>
          <span style="color: #1e40af; font-weight: 600; font-size: 14px;">
            ${totalOps} OPs em ${data.length} máquina${data.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      ${data.map(machineGroup => {
        // Verificar se há agrupamento CNC
        const hasCNC = machineGroup.ops.some(op => op.codigoCNC);
        const cncCodes = hasCNC ? [...new Set(machineGroup.ops.filter(op => op.codigoCNC).map(op => op.codigoCNC))] : [];
        
        return `
        <div class="machine-block" style="${hasCNC && activeCNC && cncCodes.includes(activeCNC) ? 'border-left: 4px solid #16a34a; background: #f0fdf4;' : ''}">
          <div style="display: flex; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb;">
            <div style="flex: 1;">
              <h4 style="margin: 0; color: #374151; font-size: 14px;">${machineGroup.maquina}</h4>
              ${hasCNC && activeCNC && cncCodes.includes(activeCNC) ? `
                <div style="margin-top: 2px;">
                  <span style="font-size: 11px; color: #6b7280;">Plano de Corte CNC:</span>
                  <span style="font-size: 11px; padding: 1px 4px; border-radius: 2px; margin-left: 4px; font-weight: 600; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;">
                    ${activeCNC}
                  </span>
                </div>
              ` : ''}
            </div>
            <span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: 600;">
              ${machineGroup.codigoMaquina}
            </span>
          </div>
          
          <div style="display: flex; align-items: center; padding: 6px 8px; background: #f8fafc; border-radius: 3px; margin-bottom: 3px; font-size: 11px; color: #6b7280; font-weight: 600; border: 1px solid #e5e7eb;">
            <div style="width: 30px; text-align: center;">✓</div>
            <div style="width: 60px; text-align: center;">OP</div>
            <div style="width: 80px; text-align: center;">Produto</div>
            <div style="width: 100px; text-align: left; padding-left: 4px;">Descrição</div>
            <div style="width: 100px; text-align: center;">Operação</div>
            <div style="width: 70px; text-align: center;">Qtd. Prev.</div>
            <div style="width: 70px; text-align: center;">qtd.etq</div>
            <div style="width: 80px; text-align: center;">Ação</div>
          </div>
          
          ${machineGroup.ops.map(op => `
            <div class="op-row" style="display: flex; align-items: center; padding: 6px 8px; border-bottom: 1px solid #f3f4f6;">
              <input type="checkbox" class="op-checkbox" data-op-id="${op.id}" style="width: 30px; margin-right: 0;" />
              <span class="op-code" style="width: 60px; text-align: center; font-weight: 600; color: #1f2937; font-size: 13px;">${op.numero}</span>
              <span class="op-produto" style="width: 80px; text-align: center; color: #374151; font-size: 13px;">${op.produto}</span>
              <span class="op-descricao" style="width: 100px; text-align: left; color: #6b7280; font-size: 13px; padding-left: 4px;">${op.descricaoProduto}</span>
              <span class="op-operacao" style="width: 100px; text-align: center; color: #059669; font-size: 13px; font-weight: 500;">${op.operacao}</span>
              <span class="op-qtd-prevista" style="width: 70px; text-align: center; color: #374151; font-size: 13px; font-weight: 500;">${op.qtdPlanejada || '-'}</span>
              <input type="number" class="op-qty" data-op-id="${op.id}" placeholder="qtd.etq" min="1" value="1" style="width: 70px; text-align: center; font-size: 13px;" />
              <button class="op-print-btn" data-op-id="${op.id}" style="width: 80px; font-size: 12px; padding: 4px 8px;">Imprimir</button>
            </div>
          `).join('')}
        </div>
      `;
    }).join('')}
      
      <div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 12px; margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0 0 2px 0; color: #374151; font-size: 14px;">Impressao em Lote</h4>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Imprima todas as OPs selecionadas de uma vez</p>
          </div>
          <div class="btn-with-caption">
            <button id="btn-print-all" class="primary" style="padding: 8px 16px; font-size: 14px; font-weight: 600;">
              Imprimir Todas
            </button>
            <span class="btn-caption">Selecionadas</span>
          </div>
        </div>
      </div>
    `;

    els.prOpsResults.innerHTML = html;
    els.prOpsResults.style.display = 'block';
  }


  function addLogEntry(message) {
    // Log removido para limpar a demonstração
    // Apenas mensagens críticas de erro são mantidas
    if (message.includes('Erro:') || message.includes('❌')) {
      console.log(message);
    }
  }

  // Funções do modal de seleção de máquinas
  function openMachineSelectorModal() {
    if (!els.machineSelectorModal) return;
    
    // Renderizar lista de máquinas
    const machinesHtml = state.machines.map(machine => `
      <div style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
        <input type="checkbox" class="machine-checkbox" data-machine="${machine}" ${state.selectedMachines.includes(machine) ? 'checked' : ''} style="margin-right: 12px;" />
        <span>${machine}</span>
      </div>
    `).join('');
    
    els.machineSelectorList.innerHTML = machinesHtml;
    els.machineSelectorModal.style.display = 'block';
    updateMachineCount();
  }

  function closeMachineSelectorModal() {
    if (els.machineSelectorModal) {
      els.machineSelectorModal.style.display = 'none';
    }
  }

  function updateMachineCount() {
    if (!els.machineCount) return;
    
    const checkboxes = els.machineSelectorList?.querySelectorAll('.machine-checkbox:checked');
    const count = checkboxes?.length || 0;
    els.machineCount.textContent = `${count} máquinas selecionadas`;
  }

  function selectAllMachines() {
    const checkboxes = els.machineSelectorList?.querySelectorAll('.machine-checkbox');
    checkboxes?.forEach(cb => cb.checked = true);
    updateMachineCount();
  }

  function deselectAllMachines() {
    const checkboxes = els.machineSelectorList?.querySelectorAll('.machine-checkbox');
    checkboxes?.forEach(cb => cb.checked = false);
    updateMachineCount();
  }

  function confirmMachineSelection() {
    const checkboxes = els.machineSelectorList?.querySelectorAll('.machine-checkbox:checked');
    state.selectedMachines = Array.from(checkboxes || []).map(cb => cb.dataset.machine);
    
    // Atualizar display das máquinas selecionadas
    const display = document.getElementById('selected-machines-display');
    if (display) {
      if (state.selectedMachines.length > 0) {
        display.textContent = `${state.selectedMachines.length} máquina(s) selecionada(s): ${state.selectedMachines.join(', ')}`;
      } else {
        display.textContent = 'Nenhuma máquina selecionada';
      }
    }
    
    addLogEntry(`${state.selectedMachines.length} máquinas selecionadas: ${state.selectedMachines.join(', ')}`);
    closeMachineSelectorModal();
  }

  function handlePrintSingle(opId) {
    const op = EXAMPLE_OPS.find(o => o.id === opId);
    if (!op) return;

    const layoutId = els.prSelectLayout?.value;
    if (!layoutId) {
      addLogEntry('Erro: Selecione uma etiqueta primeiro');
      return;
    }

    const layout = state.layouts.find(l => l.id === layoutId);
    if (!layout) {
      addLogEntry('Erro: Layout não encontrado');
      return;
    }

    const qtyInput = els.prOpsResults?.querySelector(`.op-qty[data-op-id="${opId}"]`);
    const quantidade = parseInt(qtyInput?.value || 1);
    const qtdEtq = parseInt(els.prQtyEtq?.value || 1);

    const values = {
      OP: op.numero,
      Produto: op.produto,
      Descricao: op.descricaoProduto,
      Quantidade: quantidade,
      QuantidadeProduzida: quantidade,
      QtdEtq: qtdEtq,
      Maquina: op.maquina,
      CodigoMaquina: op.codigoMaquina,
      Operacao: op.operacao,
      CodigoCNC: op.codigoCNC || '',
      QtdPorChapa: op.qtdPorChapa || '',
      ChapasReservadas: op.chapasReservadas || '',
      Operador: 'Sistema',
      Turno: '1º',
      Data: new Date().toLocaleDateString('pt-BR')
    };

    const zpl = substituteZpl(layout.zpl, values);
    
    addLogEntry(`\n=== IMPRESSÃO INDIVIDUAL ===`);
    addLogEntry(`OP: ${op.numero} (${op.produto})`);
    addLogEntry(`Máquina: ${op.maquina} (${op.codigoMaquina})`);
    addLogEntry(`Quantidade OP: ${quantidade} | qtd.etq: ${qtdEtq}`);
    addLogEntry(`ZPL gerado: ${zpl.substring(0, 100)}...`);
    addLogEntry(`✓ Enviado para impressora Zebra`);
  }

  function handlePrintAll() {
    const checkboxes = els.prOpsResults?.querySelectorAll('.op-checkbox:checked');
    if (!checkboxes || checkboxes.length === 0) {
      addLogEntry('Erro: Nenhuma OP selecionada');
      return;
    }

    const selectedOps = Array.from(checkboxes).map(cb => {
      const opId = cb.dataset.opId;
      const qtyInput = els.prOpsResults?.querySelector(`.op-qty[data-op-id="${opId}"]`);
      const op = EXAMPLE_OPS.find(o => o.id === opId);
      
      return {
        ...op,
        quantidade: parseInt(qtyInput?.value || 1)
      };
    });

    const layoutId = els.prSelectLayout?.value;
    if (!layoutId) {
      addLogEntry('Erro: Selecione uma etiqueta primeiro');
      return;
    }

    const layout = state.layouts.find(l => l.id === layoutId);
    if (!layout) {
      addLogEntry('Erro: Layout não encontrado');
      return;
    }

    const qtdEtq = parseInt(els.prQtyEtq?.value || 1);

    addLogEntry(`\n=== IMPRESSÃO EM LOTE ===`);
    addLogEntry(`Layout: ${layout.name}`);
    addLogEntry(`qtd.etq global: ${qtdEtq}`);
    addLogEntry(`Total de OPs: ${selectedOps.length}`);

    selectedOps.forEach(op => {
      const values = {
        OP: op.numero,
        Produto: op.produto,
        Descricao: op.descricaoProduto,
        Quantidade: op.quantidade,
        QuantidadeProduzida: op.quantidade,
        QtdEtq: qtdEtq,
        Maquina: op.maquina,
        CodigoMaquina: op.codigoMaquina,
        Operacao: op.operacao,
        CodigoCNC: op.codigoCNC || '',
        QtdPorChapa: op.qtdPorChapa || '',
        ChapasReservadas: op.chapasReservadas || '',
        Operador: 'Sistema',
        Turno: '1º',
        Data: new Date().toLocaleDateString('pt-BR')
      };

      const zpl = substituteZpl(layout.zpl, values);
      
      addLogEntry(`\nOP: ${op.numero} (${op.produto})`);
      addLogEntry(`Quantidade OP: ${op.quantidade} | qtd.etq: ${qtdEtq}`);
      addLogEntry(`Máquina: ${op.maquina} (${op.codigoMaquina})`);
      addLogEntry(`ZPL gerado: ${zpl.substring(0, 100)}...`);
      addLogEntry(`✓ Enviado para impressora Zebra`);
    });

    addLogEntry(`\n=== IMPRESSÃO CONCLUÍDA ===`);
    addLogEntry(`Total de OPs processadas: ${selectedOps.length}`);
    addLogEntry(`qtd.etq aplicada: ${qtdEtq} por OP`);
  }

  async function renderLabelaryTo(layout, zpl, container) {
    const widthIn = layout?.preview?.widthIn ?? 6; const heightIn = layout?.preview?.heightIn ?? 4; const dpmm = layout?.preview?.dpmm ?? 8;
    const url = `https://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${widthIn}x${heightIn}/0/`;
    container.innerHTML = `<span class=\"hint\">Renderizando preview...</span>`;
    try { const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body: normalizeZplForPreview(zpl) }); if (!resp.ok) throw new Error(`HTTP ${resp.status}`); const blob = await resp.blob(); const imgUrl = URL.createObjectURL(blob); container.innerHTML = ''; const img = new Image(); img.src = imgUrl; img.alt = 'Preview da etiqueta'; img.style.maxWidth = '100%'; img.onload = () => { URL.revokeObjectURL(imgUrl); }; container.appendChild(img); } catch (_) { container.innerHTML = `<span class=\"hint\">Não foi possível renderizar o preview (offline? CORS?).</span>`; }
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
