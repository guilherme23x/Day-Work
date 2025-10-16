document.addEventListener("DOMContentLoaded", () => {
  const cardGrid = document.getElementById("card-grid");
  const cardModal = document.getElementById("card-modal");
  const settingsModal = document.getElementById("settings-modal");
  const categoryTitle = document.getElementById("category-title");
  const navItems = document.querySelectorAll(".nav-item");
  const searchInput = document.getElementById("search-input");
  const profilePic = document.getElementById("profile-pic");
  const profilePicInput = document.getElementById("profile-pic-input");
  const bgUploadInput = document.getElementById("bg-upload-input");
  const addCardHeaderBtn = document.getElementById("add-card-header-btn");
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const settingsBtn = document.getElementById("settings-btn");
  const closeSettingsBtn = document.getElementById("close-settings-btn");
  const settingsForm = document.getElementById("settings-form");
  const themeBtns = document.querySelectorAll(".theme-btn");
  const exportBtn = document.getElementById("export-btn");
  const importInput = document.getElementById("import-input");

  let allCards = [];
  let currentCategory = "work";
  let newCardImageData = null;

  const categoryNames = {
    work: "Trabalho",
    leisure: "Lazer",
    tools: "Ferramentas",
  };

  const saveData = () => {
    const profileData = {
      pic: profilePic.src,
      name: document.getElementById("user-name-input").value,
      role: document.getElementById("user-role-input").value,
      company: document.getElementById("company-input").value,
      startTime: document.getElementById("start-time-input").value,
      endTime: document.getElementById("end-time-input").value,
    };
    localStorage.setItem("dashboardCards", JSON.stringify(allCards));
    localStorage.setItem("dashboardProfile", JSON.stringify(profileData));
    const bgImage = document.body.style.backgroundImage;
    if (bgImage) localStorage.setItem("dashboardBg", bgImage);
    const theme = document.body.dataset.theme;
    if (theme) localStorage.setItem("dashboardTheme", theme);
  };

  const loadData = () => {
    const savedCards = localStorage.getItem("dashboardCards");
    const savedProfile = localStorage.getItem("dashboardProfile");
    const savedBg = localStorage.getItem("dashboardBg");
    const savedTheme = localStorage.getItem("dashboardTheme");

    if (savedCards) allCards = JSON.parse(savedCards);
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      if (p.pic) profilePic.src = p.pic;

      document.getElementById("user-name-display").textContent =
        p.name || "Seu Nome";
      document.getElementById("user-role-display").textContent =
        p.role || "Seu Cargo";
      document.getElementById("company-display").textContent =
        p.company || "Sua Empresa";
      document.getElementById("workload-display").textContent =
        p.startTime && p.endTime
          ? `${p.startTime} - ${p.endTime}`
          : "09:00 - 18:00";

      document.getElementById("user-name-input").value = p.name || "Seu Nome";
      document.getElementById("user-role-input").value = p.role || "Seu Cargo";
      document.getElementById("company-input").value = p.company || "";
      document.getElementById("start-time-input").value =
        p.startTime || "09:00";
      document.getElementById("end-time-input").value = p.endTime || "18:00";
    }
    if (savedBg) document.body.style.backgroundImage = savedBg;

    setTheme(savedTheme || "light");
    renderCards();
  };

  const renderCards = () => {
    const searchQuery = searchInput.value.toLowerCase();
    const filteredCards = allCards.filter(
      (c) =>
        c.category === currentCategory &&
        c.title.toLowerCase().includes(searchQuery)
    );
    cardGrid.innerHTML = "";
    filteredCards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card";
      cardElement.dataset.id = card.id;
      if (card.imageUrl) {
        cardElement.style.backgroundImage = `url('${card.imageUrl}')`;
      }

      cardElement.innerHTML = `
                <div class="card-content">
                    <h3 class="card-title">${card.title}</h3>
                </div>
                 <div class="card-hover-details">
                    <p class="card-description">${card.description || ""}</p>
                    <a href="${
                      card.url
                    }" class="enter-btn" target="_blank" rel="noopener noreferrer">Acessar</a>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit-btn" title="Editar"><img src="icons/editar.svg" alt="Editar"></button>
                    <button class="action-btn delete-btn" title="Excluir"><img src="icons/deletar.svg" alt="Excluir"></button>
                </div>
            `;
      cardElement
        .querySelector(".delete-btn")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          deleteCard(card.id);
        });
      cardElement.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openCardModal("edit", card.id);
      });
      cardGrid.appendChild(cardElement);
    });
  };

  const openCardModal = (mode = "add", cardId = null) => {
    const modalContent = `
            <div class="modal-content">
                <span class="close-btn" id="close-card-btn">&times;</span>
                <h2 id="modal-title">Adicionar Novo Link</h2>
                <form id="card-form">
                    <input type="hidden" id="card-id">
                    <div class="form-group"><label for="title-input">Título</label><input type="text" id="title-input" required></div>
                    <div class="form-group"><label for="description-input">Descrição</label><textarea id="description-input" rows="3"></textarea></div>
                    <div class="form-group"><label for="url-input">URL do Link</label><input type="url" id="url-input" required placeholder="https://exemplo.com"></div>
                    <div class="form-group">
                        <label>Imagem do Card</label>
                        <div class="image-upload-options">
                            <input type="text" id="image-url-input" placeholder="Cole a URL da imagem aqui"><span>OU</span>
                            <label for="image-file-input" class="file-upload-label">Selecione um arquivo</label>
                            <input type="file" id="image-file-input" accept="image/*">
                        </div>
                        <div class="image-preview-container"><img id="image-preview" src="" alt="Pré-visualização" style="display:none;"></div>
                    </div>
                    <button type="submit" id="save-card-btn">Salvar</button>
                </form>
            </div>
        `;
    cardModal.innerHTML = modalContent;
    cardModal.classList.add("show");

    const cardForm = document.getElementById("card-form");
    const hiddenCardId = document.getElementById("card-id");
    const modalTitle = document.getElementById("modal-title");

    newCardImageData = null;

    if (mode === "edit" && cardId !== null) {
      const card = allCards.find((c) => c.id === cardId);
      if (card) {
        modalTitle.textContent = "Editar Link";
        hiddenCardId.value = card.id;
        cardForm.querySelector("#title-input").value = card.title;
        cardForm.querySelector("#description-input").value =
          card.description || "";
        cardForm.querySelector("#url-input").value = card.url;
        if (card.imageUrl) {
          newCardImageData = card.imageUrl;
          const preview = cardForm.querySelector("#image-preview");
          preview.src = card.imageUrl;
          preview.style.display = "block";
          if (!card.imageUrl.startsWith("data:"))
            cardForm.querySelector("#image-url-input").value = card.imageUrl;
        }
      }
    } else {
      modalTitle.textContent = `Adicionar em ${categoryNames[currentCategory]}`;
    }

    document
      .getElementById("close-card-btn")
      .addEventListener("click", () => cardModal.classList.remove("show"));
    cardForm
      .querySelector("#image-file-input")
      .addEventListener("change", (e) =>
        handleImageSelection(
          e.target.files[0],
          cardForm.querySelector("#image-preview"),
          cardForm.querySelector("#image-url-input")
        )
      );
    cardForm
      .querySelector("#image-url-input")
      .addEventListener("input", () =>
        handleImageUrlInput(
          cardForm.querySelector("#image-preview"),
          cardForm.querySelector("#image-url-input")
        )
      );
    cardForm.addEventListener("submit", handleCardFormSubmit);
  };

  const handleCardFormSubmit = (e) => {
    e.preventDefault();
    const id = e.target.querySelector("#card-id").value;
    const title = e.target.querySelector("#title-input").value.trim();
    const description = e.target
      .querySelector("#description-input")
      .value.trim();
    let url = e.target.querySelector("#url-input").value.trim();
    const imageUrl = e.target.querySelector("#image-url-input").value.trim();

    if (title === "" || url === "") return;
    if (!url.startsWith("http")) url = "https://" + url;

    const cardData = {
      title,
      description,
      url,
      imageUrl: newCardImageData || imageUrl,
    };
    if (id) {
      const cardIndex = allCards.findIndex((c) => c.id == id);
      if (cardIndex > -1)
        allCards[cardIndex] = { ...allCards[cardIndex], ...cardData };
    } else {
      allCards.push({ id: Date.now(), category: currentCategory, ...cardData });
    }
    saveData();
    renderCards();
    cardModal.classList.remove("show");
  };

  const handleImageSelection = (file, previewEl, urlInputEl) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newCardImageData = e.target.result;
        previewEl.src = newCardImageData;
        previewEl.style.display = "block";
        if (urlInputEl) urlInputEl.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlInput = (previewEl, urlInputEl) => {
    const url = urlInputEl.value.trim();
    if (url) {
      newCardImageData = null;
      previewEl.src = url;
      previewEl.style.display = "block";
    } else {
      previewEl.style.display = "none";
    }
  };

  const deleteCard = (cardId) => {
    allCards = allCards.filter((card) => card.id !== cardId);
    saveData();
    renderCards();
  };

  const setTheme = (theme) => {
    document.body.dataset.theme = theme;
    themeBtns.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.theme === theme)
    );
    localStorage.setItem("dashboardTheme", theme);
  };

  const exportSettings = () => {
    try {
      const settings = {
        dashboardCards: JSON.parse(
          localStorage.getItem("dashboardCards") || "[]"
        ),
        dashboardProfile: JSON.parse(
          localStorage.getItem("dashboardProfile") || "{}"
        ),
        dashboardBg: localStorage.getItem("dashboardBg") || "",
        dashboardTheme: localStorage.getItem("dashboardTheme") || "light",
      };

      const jsonString = JSON.stringify(settings, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "dashboard-settings.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar configurações:", error);
    }
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);

        if (settings && settings.dashboardCards && settings.dashboardProfile) {
          localStorage.setItem(
            "dashboardCards",
            JSON.stringify(settings.dashboardCards)
          );
          localStorage.setItem(
            "dashboardProfile",
            JSON.stringify(settings.dashboardProfile)
          );
          localStorage.setItem("dashboardBg", settings.dashboardBg || "");
          localStorage.setItem(
            "dashboardTheme",
            settings.dashboardTheme || "light"
          );

          loadData();
          settingsModal.classList.remove("show");
        } else {
          console.error("Arquivo de configuração inválido.");
        }
      } catch (error) {
        console.error("Erro ao importar configurações:", error);
      } finally {
        importInput.value = "";
      }
    };
    reader.readAsText(file);
  };

  sidebarToggle.addEventListener("click", () =>
    sidebar.classList.toggle("collapsed")
  );
  settingsBtn.addEventListener("click", () =>
    settingsModal.classList.add("show")
  );
  closeSettingsBtn.addEventListener("click", () =>
    settingsModal.classList.remove("show")
  );
  addCardHeaderBtn.addEventListener("click", () => openCardModal("add"));
  exportBtn.addEventListener("click", exportSettings);
  importInput.addEventListener("change", importSettings);

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      currentCategory = item.dataset.category;
      categoryTitle.textContent = categoryNames[currentCategory];
      renderCards();
    });
  });

  themeBtns.forEach((btn) =>
    btn.addEventListener("click", () => setTheme(btn.dataset.theme))
  );

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("user-name-input").value;
    const role = document.getElementById("user-role-input").value;
    const company = document.getElementById("company-input").value;
    const startTime = document.getElementById("start-time-input").value;
    const endTime = document.getElementById("end-time-input").value;

    document.getElementById("user-name-display").textContent = name;
    document.getElementById("user-role-display").textContent = role;
    document.getElementById("company-display").textContent = company;
    document.getElementById(
      "workload-display"
    ).textContent = `${startTime} - ${endTime}`;

    saveData();
    settingsModal.classList.remove("show");
  });

  profilePicInput.addEventListener("change", (e) => {
    handleImageSelection(e.target.files[0], profilePic);
    setTimeout(saveData, 100);
  });

  bgUploadInput.addEventListener("change", (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.body.style.backgroundImage = `url('${evt.target.result}')`;
        saveData();
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  searchInput.addEventListener("input", renderCards);
  window.addEventListener("click", (e) => {
    if (e.target === cardModal) cardModal.classList.remove("show");
    if (e.target === settingsModal) settingsModal.classList.remove("show");
  });

  loadData();
});
