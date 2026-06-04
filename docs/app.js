const data = window.MANUAL_DATA;
let activeCategory = "すべて";
let activeChapter = data.chapters[0]?.id;

const list = document.getElementById("chapterList");
const content = document.getElementById("content");
const tabs = document.getElementById("categoryTabs");
const search = document.getElementById("searchInput");
const menu = document.getElementById("menuButton");
const topButton = document.getElementById("topButton");

function saveRoute(id){ location.hash = id ? `#${id}` : ""; }
function getQuery(){ return search.value.trim().toLowerCase(); }
function matches(chapter, q){ if(!q) return true; return `${chapter.title} ${chapter.summary} ${chapter.important} ${chapter.html}`.toLowerCase().includes(q); }
function filtered(){ const q=getQuery(); return data.chapters.filter(c => (activeCategory==="すべて" || c.category===activeCategory) && matches(c,q)); }
function highlight(html){ const q=getQuery(); if(!q || q.length<2) return html; const safe=q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); return html.replace(new RegExp(`(${safe})`,"gi"),"<mark>$1</mark>"); }

function renderTabs(){
  const categories = ["すべて", ...data.categories];
  tabs.innerHTML = categories.map(c => `<button class="${c===activeCategory ? "active" : ""}" data-category="${c}">${c}</button>`).join("");
  tabs.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
    activeCategory = btn.dataset.category;
    const first = filtered()[0];
    if(first) activeChapter = first.id;
    render();
  }));
}

function renderList(){
  const chapters = filtered();
  list.innerHTML = chapters.map(c => `
    <button class="chapter-card ${c.id===activeChapter ? "active" : ""}" data-id="${c.id}">
      <div class="chapter-meta"><span>${c.category}</span><span>${c.id}</span></div>
      <h2>${c.title}</h2>
      <p>${c.summary}</p>
    </button>`).join("");
  list.querySelectorAll(".chapter-card").forEach(card => card.addEventListener("click", () => {
    activeChapter = card.dataset.id;
    saveRoute(activeChapter);
    renderContent();
    if (window.innerWidth < 900) {
      list.classList.add("collapsed");
      list.classList.remove("open");
      content.classList.remove("hidden");
      window.scrollTo({top:0, behavior:"smooth"});
    }
    renderList();
  }));
}

function restoreChecks(){
  content.querySelectorAll("input[type=checkbox][data-check]").forEach(input => {
    const key = `check:${input.dataset.check}`;
    input.checked = localStorage.getItem(key) === "1";
    input.closest(".check-item")?.classList.toggle("done", input.checked);
    input.addEventListener("change", () => {
      localStorage.setItem(key, input.checked ? "1" : "0");
      input.closest(".check-item")?.classList.toggle("done", input.checked);
    });
  });
}

function renderContent(){
  const chapter = data.chapters.find(c => c.id === activeChapter) || filtered()[0] || data.chapters[0];
  if(!chapter) return;
  activeChapter = chapter.id;
  content.innerHTML = `
    <div class="content-shell">
      <header class="content-header">
        <span class="category">${chapter.category}</span>
        <h1>${chapter.title}</h1>
        ${chapter.important ? `<div class="important">一番大事：${chapter.important}</div>` : ""}
        ${chapter.heroImage ? `<figure class="chapter-hero"><img src="${chapter.heroImage}" alt="${chapter.title}の参考画像" loading="lazy"></figure>` : ""}
      </header>
      <div class="content-body">${highlight(chapter.html)}</div>
    </div>`;
  restoreChecks();
}

function render(){
  renderTabs();
  renderList();
  renderContent();
}

search.addEventListener("input", () => {
  const first = filtered()[0];
  if(first) activeChapter = first.id;
  renderList();
  renderContent();
});

menu.addEventListener("click", () => {
  list.classList.toggle("open");
  list.classList.toggle("collapsed");
  content.classList.toggle("hidden");
});

topButton.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

if(location.hash) {
  const id = location.hash.slice(1);
  if(data.chapters.some(c => c.id === id)) activeChapter = id;
}
if(window.innerWidth < 900) list.classList.add("collapsed");
render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
