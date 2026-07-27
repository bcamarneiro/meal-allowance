(async () => {
  // Storage helpers
  const getPending = async () => (await browser.storage.local.get("pendingExpense")).pendingExpense;
  const setPending = async (val) => browser.storage.local.set({ pendingExpense: val });

  const root = document.getElementById("root");
  const empty = document.getElementById("empty");

  const render = async () => {
    const pending = await getPending();
    if (!pending) {
      empty.style.display = "block";
      root.querySelectorAll(".expense-form").forEach(el => el.remove());
      return;
    }
    empty.style.display = "none";
    root.querySelectorAll(".expense-form").forEach(el => el.remove());

    const form = document.createElement("div");
    form.className = "expense-form";

    form.innerHTML = `
      <label class="label">Type</label>
      <select class="select" id="categorySelect">
        <option value="business">Business</option>
        <option value="personal">Personal</option>
      </select>
      <label class="label">Tags</label>
      <input class="input" id="tagInput" placeholder="Add tag (press Enter)" />
      <div class="tags" id="tagList"></div>
      <div class="actions">
        <button class="btn btn-primary" id="saveBtn">Save</button>
        <button class="btn btn-secondary" id="dismissBtn">Dismiss</button>
      </div>
    `;
    root.appendChild(form);

    // Restore saved selection if any
    const saved = (await browser.storage.local.get("savedConfigs")).savedConfigs || {};
    const lastCategory = saved.lastCategory || "business";
    const lastTags = saved.lastTags || [];
    const categorySelect = document.getElementById("categorySelect");
    const tagInput = document.getElementById("tagInput");
    const tagList = document.getElementById("tagList");
    const saveBtn = document.getElementById("saveBtn");
    const dismissBtn = document.getElementById("dismissBtn");

    categorySelect.value = pending.category || lastCategory;
    let tags = new Set(pending.tags || lastTags);

    // Persist draft state to pendingExpense so it survives popup closes
    const saveDraft = async () => {
      const current = await getPending();
      if (current) {
        await setPending({ ...current, category: categorySelect.value, tags: Array.from(tags) });
      }
    };

    const renderTags = () => {
      tagList.innerHTML = "";
      tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        const close = document.createElement("span");
        close.className = "tag-close";
        close.textContent = "×";
        close.addEventListener("click", async () => {
          tags.delete(tag);
          renderTags();
          await saveDraft();
        });
        span.appendChild(close);
        tagList.appendChild(span);
      });
    };
    renderTags();

    tagInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const raw = tagInput.value.trim();
        if (raw) {
          raw.split(",").map(t => t.trim()).filter(Boolean).forEach(t => tags.add(t));
          tagInput.value = "";
          renderTags();
          await saveDraft();
        }
      }
    });

    categorySelect.addEventListener("change", async () => {
      await saveDraft();
    });

    saveBtn.addEventListener("click", async () => {
      const category = categorySelect.value;
      const tagArr = Array.from(tags);
      await setPending(null);
      await browser.storage.local.set({ savedConfigs: { lastCategory: category, lastTags: tagArr } });
      alert("Saved as " + category + (tagArr.length ? " with tags: " + tagArr.join(", ") : ""));
      render();
    });

    dismissBtn.addEventListener("click", async () => {
      await setPending(null);
      render();
    });
  };

  render();
})();
