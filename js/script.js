// ==========================================================
// CONFIGURAÇÕES PRINCIPAIS DA CLÍNICA ODONTO METAL
// ==========================================================
// Número oficial do WhatsApp (DDI 55 + DDD 11 + Número)
const CLINIC_WHATSAPP_NUMBER = "5511961300374";

// Senha de acesso ao Painel Administrativo (altere como desejar)
const ADMIN_PASSWORD = "odontometal2026";

// Menu Mobile
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ==========================================================
// 0. PERFIL ADMINISTRADOR (LOGIN / LOGOUT / PERMISSÕES)
// ==========================================================
let isAdmin = sessionStorage.getItem("odontoMetalAdmin") === "true";

const openAdminModalBtn = document.getElementById("openAdminModalBtn");
const adminNavText = document.getElementById("adminNavText");
const adminBanner = document.getElementById("adminBanner");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");
const adminLoginModal = document.getElementById("adminLoginModal");
const closeAdminModalBtn = document.getElementById("closeAdminModalBtn");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPasswordInput = document.getElementById("adminPassword");
const loginErrorMsg = document.getElementById("loginErrorMsg");

const adminCalendarEditor = document.getElementById("adminCalendarEditor");
const toggleAdminNewsBtn = document.getElementById("toggleAdminNewsBtn");
const adminNewsPanel = document.getElementById("adminNewsPanel");

function updateAdminUI() {
  if (isAdmin) {
    openAdminModalBtn.classList.add("logged-in");
    adminNavText.textContent = "ADM Ativo";
    adminBanner.classList.remove("hidden");
    adminCalendarEditor.classList.remove("hidden");
    toggleAdminNewsBtn.classList.remove("hidden");
  } else {
    openAdminModalBtn.classList.remove("logged-in");
    adminNavText.textContent = "Área ADM";
    adminBanner.classList.add("hidden");
    adminCalendarEditor.classList.add("hidden");
    toggleAdminNewsBtn.classList.add("hidden");
    adminNewsPanel.classList.add("hidden");
  }
  renderNews();
}

openAdminModalBtn.addEventListener("click", () => {
  if (isAdmin) {
    document.getElementById("calendario").scrollIntoView({ behavior: "smooth" });
  } else {
    loginErrorMsg.classList.add("hidden");
    adminPasswordInput.value = "";
    adminLoginModal.classList.remove("hidden");
    adminPasswordInput.focus();
  }
});

closeAdminModalBtn.addEventListener("click", () => {
  adminLoginModal.classList.add("hidden");
});

adminLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (adminPasswordInput.value === ADMIN_PASSWORD) {
    isAdmin = true;
    sessionStorage.setItem("odontoMetalAdmin", "true");
    adminLoginModal.classList.add("hidden");
    updateAdminUI();
  } else {
    loginErrorMsg.classList.remove("hidden");
  }
});

logoutAdminBtn.addEventListener("click", () => {
  isAdmin = false;
  sessionStorage.removeItem("odontoMetalAdmin");
  updateAdminUI();
});

// ==========================================================
// 1. CALENDÁRIO INTERATIVO DE ATENDIMENTOS + EDIÇÃO ADM
// ==========================================================
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Regras iniciais padrão (feriados e emendas)
const defaultCalendarRules = {
  "2026-11-02": { status: "closed", label: "Finados", desc: "Feriado Nacional — Não haverá atendimento na clínica." },
  "2026-11-15": { status: "closed", label: "Proclamação", desc: "Feriado Nacional — Clínica fechada." },
  "2026-11-20": { status: "closed", label: "Consciência Negra", desc: "Feriado — Sem expediente odontológico." },
  "2026-12-24": { status: "special", label: "Véspera Natal", desc: "Expediente reduzido das 08h às 12h." },
  "2026-12-25": { status: "closed", label: "Natal", desc: "Feriado de Natal — Sem atendimento." },
  "2026-12-26": { status: "closed", label: "Emenda Natal", desc: "Emenda de feriado — Sem expediente." },
  "2026-12-31": { status: "closed", label: "Recesso", desc: "Recesso de Ano Novo — Sem atendimento." }
};

function getCustomCalendarRules() {
  const saved = localStorage.getItem("odontoMetalCalendarRules");
  if (saved) {
    return JSON.parse(saved);
  }
  return { ...defaultCalendarRules };
}

function saveCustomCalendarRules(rules) {
  localStorage.setItem("odontoMetalCalendarRules", JSON.stringify(rules));
}

let currentDate = new Date(2026, 10, 1); // Inicia em Novembro de 2026
let selectedDateKey = null;

const calendarGrid = document.getElementById("calendarGrid");
const currentMonthLabel = document.getElementById("currentMonthLabel");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const selectedDateDesc = document.getElementById("selectedDateDesc");

// Campos do editor ADM
const editorDateHeading = document.getElementById("editorDateHeading");
const editDateKeyInput = document.getElementById("editDateKey");
const editDayStatusSelect = document.getElementById("editDayStatus");
const editDayLabelSelect = document.getElementById("editDayLabelSelect");
const editDayLabelCustom = document.getElementById("editDayLabelCustom");
const editDayDescInput = document.getElementById("editDayDesc");
const calendarRuleForm = document.getElementById("calendarRuleForm");
const resetDayRuleBtn = document.getElementById("resetDayRuleBtn");

// Ao trocar a Situação do Dia, já sugere automaticamente a etiqueta e a mensagem ao paciente
editDayStatusSelect.addEventListener("change", () => {
  const status = editDayStatusSelect.value;
  if (status === "closed") {
    editDayLabelSelect.value = "Fechado";
    editDayLabelCustom.classList.add("hidden");
    editDayLabelCustom.required = false;
    editDayDescInput.value = "Sem atendimento odontológico nesta data.";
  } else if (status === "open") {
    editDayLabelSelect.value = "Atende";
    editDayLabelCustom.classList.add("hidden");
    editDayLabelCustom.required = false;
    editDayDescInput.value = "Atendimento odontológico normal na Sede dos Metalúrgicos das 08h00 às 17h50.";
  } else if (status === "special") {
    editDayLabelSelect.value = "Personalizado";
    editDayLabelCustom.classList.remove("hidden");
    editDayLabelCustom.required = true;
    if (!editDayLabelCustom.value) editDayLabelCustom.value = "Até 12h";
    editDayDescInput.value = "Atendimento em horário especial das 08h00 às 12h00.";
  }
});

// Mostra ou esconde o campo de texto personalizado conforme a escolha da etiqueta
editDayLabelSelect.addEventListener("change", () => {
  if (editDayLabelSelect.value === "Personalizado") {
    editDayLabelCustom.classList.remove("hidden");
    editDayLabelCustom.required = true;
    editDayLabelCustom.focus();
  } else {
    editDayLabelCustom.classList.add("hidden");
    editDayLabelCustom.required = false;
  }
});

function formatDateKey(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function getDefaultDayStatus(year, month, day) {
  const weekDay = new Date(year, month, day).getDay();
  if (weekDay === 0) {
    return {
      status: "closed",
      label: "Fechado",
      desc: "Domingo — Não há atendimento odontológico."
    };
  }
  if (weekDay === 6) {
    return {
      status: "special",
      label: "Sáb até 12h",
      desc: "Atendimento aos sábados das 08h00 às 12h00 na Sede dos Metalúrgicos."
    };
  }
  return {
    status: "open",
    label: "Atende",
    desc: "Atendimento odontológico normal na Sede dos Metalúrgicos das 08h00 às 17h50."
  };
}

function getDayStatus(year, month, day) {
  const key = formatDateKey(year, month, day);
  const rules = getCustomCalendarRules();
  if (rules[key]) {
    return rules[key];
  }
  return getDefaultDayStatus(year, month, day);
}

function selectDayOnCalendar(year, month, day, dayCell) {
  document.querySelectorAll(".cal-day").forEach((el) => el.classList.remove("selected"));
  if (dayCell) dayCell.classList.add("selected");

  const key = formatDateKey(year, month, day);
  selectedDateKey = key;
  const info = getDayStatus(year, month, day);
  const formatted = `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;

  selectedDateTitle.textContent = `Data selecionada: ${formatted} — ${info.label}`;
  selectedDateDesc.textContent = info.desc;

  // Preenche o painel ADM caso esteja logado
  editorDateHeading.textContent = `Editando expediente de ${formatted}`;
  editDateKeyInput.value = key;
  editDayStatusSelect.value = info.status;

  if (info.label === "Atende" || info.label === "Fechado") {
    editDayLabelSelect.value = info.label;
    editDayLabelCustom.value = "";
    editDayLabelCustom.classList.add("hidden");
    editDayLabelCustom.required = false;
  } else {
    editDayLabelSelect.value = "Personalizado";
    editDayLabelCustom.value = info.label;
    editDayLabelCustom.classList.remove("hidden");
    editDayLabelCustom.required = true;
  }

  editDayDescInput.value = info.desc;
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  currentMonthLabel.textContent = `${monthNames[month]} ${year}`;
  calendarGrid.innerHTML = "";

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "cal-day cal-empty";
    calendarGrid.appendChild(emptyDiv);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = formatDateKey(year, month, day);
    const info = getDayStatus(year, month, day);
    const dayCell = document.createElement("div");
    dayCell.className = `cal-day day-${info.status}`;
    if (selectedDateKey === key) {
      dayCell.classList.add("selected");
    }
    dayCell.innerHTML = `
      <span class="cal-day-num">${day}</span>
      <span class="cal-day-badge">${info.label}</span>
    `;

    dayCell.addEventListener("click", () => {
      selectDayOnCalendar(year, month, day, dayCell);
    });

    calendarGrid.appendChild(dayCell);
  }
}

calendarRuleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isAdmin) return;

  const key = editDateKeyInput.value;
  if (!key) {
    alert("Clique primeiro em uma data no calendário para editar.");
    return;
  }

  const chosenLabel =
    editDayLabelSelect.value === "Personalizado"
      ? editDayLabelCustom.value.trim()
      : editDayLabelSelect.value;

  const rules = getCustomCalendarRules();
  rules[key] = {
    status: editDayStatusSelect.value,
    label: chosenLabel || "Atende",
    desc: editDayDescInput.value.trim()
  };

  saveCustomCalendarRules(rules);
  renderCalendar();

  const [y, m, d] = key.split("-").map(Number);
  selectDayOnCalendar(y, m - 1, d, null);
});

resetDayRuleBtn.addEventListener("click", () => {
  if (!isAdmin) return;
  const key = editDateKeyInput.value;
  if (!key) return;

  const rules = getCustomCalendarRules();
  delete rules[key];
  saveCustomCalendarRules(rules);
  renderCalendar();

  const [y, m, d] = key.split("-").map(Number);
  selectDayOnCalendar(y, m - 1, d, null);
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();

// ==========================================================
// 2. MURAL DE NOVIDADES E COMUNICADOS (CONTROLE ADM)
// ==========================================================
const defaultNews = [
  {
    title: "Atendimento na Sede dos Metalúrgicos de Guarulhos",
    category: "Comunicado",
    date: "14/11/2026",
    body: "Nossa clínica segue com agenda aberta para avaliações, limpeza, restaurações, canal e ortodontia na Rua Harry Simonsen, 202. Sócios têm condições diferenciadas!"
  },
  {
    title: "Atendimento aos Sábados até as 12h",
    category: "Campanha",
    date: "10/11/2026",
    body: "Para facilitar o cuidado bucal de quem trabalha durante a semana, atendemos todos os sábados das 08h00 às 12h00 (exceto feriados)."
  },
  {
    title: "Atendimento Particular Aberto à Comunidade",
    category: "Novo Serviço",
    date: "04/11/2026",
    body: "Além dos sócios metalúrgicos e dependentes, familiares e moradores de Guarulhos podem agendar consultas particulares com valores acessíveis."
  }
];

function getStoredNews() {
  const saved = localStorage.getItem("odontoMetalNews");
  return saved ? JSON.parse(saved) : defaultNews;
}

function renderNews() {
  const newsList = getStoredNews();
  const newsGrid = document.getElementById("newsGrid");
  newsGrid.innerHTML = "";

  newsList.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `
      <div>
        <div class="news-meta">
          <span class="news-tag">${item.category}</span>
          <span class="news-date">${item.date}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      </div>
      ${isAdmin ? `<button type="button" class="btn-delete-news" data-index="${index}">Excluir publicação</button>` : ""}
    `;
    newsGrid.appendChild(card);
  });

  if (isAdmin) {
    document.querySelectorAll(".btn-delete-news").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.target.getAttribute("data-index"));
        const updated = getStoredNews();
        updated.splice(idx, 1);
        localStorage.setItem("odontoMetalNews", JSON.stringify(updated));
        renderNews();
      });
    });
  }
}

const cancelNewsBtn = document.getElementById("cancelNewsBtn");
const newsForm = document.getElementById("newsForm");

toggleAdminNewsBtn.addEventListener("click", () => {
  if (!isAdmin) return;
  adminNewsPanel.classList.toggle("hidden");
});

cancelNewsBtn.addEventListener("click", () => {
  adminNewsPanel.classList.add("hidden");
});

newsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isAdmin) return;

  const title = document.getElementById("newsTitle").value.trim();
  const category = document.getElementById("newsCategory").value;
  const body = document.getElementById("newsBody").value.trim();

  if (!title || !body) return;

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  const currentNews = getStoredNews();
  currentNews.unshift({ title, category, date: dateStr, body });
  localStorage.setItem("odontoMetalNews", JSON.stringify(currentNews));

  newsForm.reset();
  adminNewsPanel.classList.add("hidden");
  renderNews();
});

// Inicializa estado ADM
updateAdminUI();

// ==========================================================
// 3. FORMULÁRIO INTELIGENTE WHATSAPP (SÓCIO COM CPF vs PARTICULAR)
// ==========================================================
let patientType = "socio";

const btnTypeSocio = document.getElementById("btnTypeSocio");
const btnTypeParticular = document.getElementById("btnTypeParticular");
const socioFields = document.getElementById("socioFields");
const cardNumberInput = document.getElementById("cardNumber");
const patientCpfInput = document.getElementById("patientCpf");
const patientNameInput = document.getElementById("patientName");
const whatsappForm = document.getElementById("whatsappForm");

// Máscara automática de CPF (000.000.000-00)
patientCpfInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "").slice(0, 11);
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  e.target.value = value;
});

function setPatientType(type) {
  patientType = type;

  if (type === "socio") {
    btnTypeSocio.classList.add("active");
    btnTypeParticular.classList.remove("active");
    socioFields.classList.remove("hidden");
    cardNumberInput.required = true;
    patientCpfInput.required = true;
  } else {
    btnTypeParticular.classList.add("active");
    btnTypeSocio.classList.remove("active");
    socioFields.classList.add("hidden");
    cardNumberInput.required = false;
    patientCpfInput.required = false;
  }
}

btnTypeSocio.addEventListener("click", () => setPatientType("socio"));
btnTypeParticular.addEventListener("click", () => setPatientType("particular"));

whatsappForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = patientNameInput.value.trim();
  let message = "";

  if (patientType === "socio") {
    const cardNumber = cardNumberInput.value.trim();
    const cpf = patientCpfInput.value.trim();

    message =
      `Olá, Odonto Metal! Gostaria de agendar um atendimento na Sede dos Metalúrgicos de Guarulhos.\n\n` +
      `*Tipo de Atendimento:* Sócio do Sindicato\n` +
      `*Nome:* ${name}\n` +
      `*Nº da Carteirinha:* ${cardNumber}\n` +
      `*CPF:* ${cpf}`;
  } else {
    message =
      `Olá, Odonto Metal! Gostaria de agendar um atendimento na Sede dos Metalúrgicos de Guarulhos.\n\n` +
      `*Tipo de Atendimento:* Particular\n` +
      `*Nome:* ${name}`;
  }

  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
});
