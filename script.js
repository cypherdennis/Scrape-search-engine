const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-logo");
const infoBtn = document.querySelector(".info");
const exitInfoBtn = document.getElementById("exit-info");
const info = document.querySelector(".guide-info");
const contentDisplay = document.getElementById("content-display");

infoBtn.addEventListener("click", () => {
  info.style.display = "block";
});

exitInfoBtn.addEventListener("click", () => {
  info.style.display = "none";
});

let searchTimer = null;
const cache = new Map();

const debounce = (fn, delay) => {
  return (...args) => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => fn(...args), delay);
  };
};

const fetchWiki = async (query) => {
    
  if (!query) {
    contentDisplay.style.display = 'none';
    contentDisplay.innerHTML = "";
    return;
  }

  if (cache.has(query)) {
    renderResults(cache.get(query));
    return;
  }

  const encoded = encodeURIComponent(query);
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&origin=*`;

  try {
    contentDisplay.style.display = 'block';
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    const results = data.query?.search || [];
    cache.set(query, results);
    renderResults(results);
  } catch (err) {
    contentDisplay.innerHTML = `<div class="returned-results">Error: ${err.message}</div>`;
  }
};

const renderResults = (items) => {
  if (!items.length) {
    contentDisplay.innerHTML = `<div class="returned-results">No result found.</div>`;
    return;
  }

  contentDisplay.innerHTML = items
    .map((r) => {
      const title = sanitize(r.title);
      const rawSnippet = r.snippet.replace(/<\/?span[^>]*>/g, "");
      const snippet = sanitize(rawSnippet);

      const url = `https://en.wikipedia.org/?curid=${r.pageid}`;
      return `
        <hr/>
        <div class="returned-results" style="margin-bottom: 20px;">
          <a href="${url}" target="_blank" rel="noopener">Click for more ${title}</a>
          <div class="snippet">${snippet}...</div>
        </div>`;
    })
    .join("");
};

const sanitize = (str) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

searchInput.addEventListener(
  "input",
  debounce((e) => {
    fetchWiki(e.target.value.trim());
  }, 400)
);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchWiki(e.target.value.trim());
  }
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchWiki(query);
  }
});

