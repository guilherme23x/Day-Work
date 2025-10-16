document.addEventListener("DOMContentLoaded", () => {
  const cardGrid = document.getElementById("card-grid");
  const cardModal = document.getElementById("card-modal");
  const settingsModal = document.getElementById("settings-modal");
  const editPagesModal = document.getElementById("edit-pages-modal");
  const alertModal = document.getElementById("alert-modal");
  const addPageModal = document.getElementById("add-page-modal");
  const categoryTitle = document.getElementById("category-title");
  const searchInput = document.getElementById("search-input");
  const profilePic = document.getElementById("profile-pic");
  const profilePicInput = document.getElementById("profile-pic-input");
  const bgUploadInput = document.getElementById("bg-upload-input");
  const addCardHeaderBtn = document.getElementById("add-card-header-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const closeSettingsBtn = document.getElementById("close-settings-btn");
  const closeEditPagesBtn = document.getElementById("close-edit-pages-btn");
  const closeAddPageBtn = document.getElementById("close-add-page-btn");
  const settingsForm = document.getElementById("settings-form");
  const addPageForm = document.getElementById("add-page-form");
  const themeBtns = document.querySelectorAll(".theme-btn");
  const exportBtn = document.getElementById("export-btn");
  const importInput = document.getElementById("import-input");
  const sidebarNav = document.getElementById("sidebar-nav");
  const sidebarFooter = document.getElementById("sidebar-footer");

  let allCards = [];
  let categories = [];
  let currentCategory = null;
  let newCardImageData = null;
  let sortable = null;

  const defaultCategories = [
    { id: "work", name: "Trabalho", icon: "icons/work.svg" },
    { id: "leisure", name: "Lazer", icon: "icons/lazer.svg" },
    { id: "tools", name: "Ferramentas", icon: "icons/tools.svg" },
    { id: "study", name: "Estudos", icon: "icons/book.svg" },
  ];

  const saveData = () => {
    localStorage.setItem("dashboardCards", JSON.stringify(allCards));
    localStorage.setItem("dashboardCategories", JSON.stringify(categories));
    const profileData = { pic: profilePic.src };
    localStorage.setItem("dashboardProfile", JSON.stringify(profileData));
    const bgImage = document.body.style.backgroundImage;
    if (bgImage) localStorage.setItem("dashboardBg", bgImage);
    const theme = document.body.dataset.theme;
    if (theme) localStorage.setItem("dashboardTheme", theme);
  };

  const loadData = () => {
    const savedCards = localStorage.getItem("dashboardCards");
    const savedCategories = localStorage.getItem("dashboardCategories");
    const savedProfile = localStorage.getItem("dashboardProfile");
    const savedBg = localStorage.getItem("dashboardBg");
    const savedTheme = localStorage.getItem("dashboardTheme");

    allCards = savedCards ? JSON.parse(savedCards) : [];
    allCards.forEach((card, index) => {
      if (card.order === undefined) card.order = index;
    });

    categories = savedCategories
      ? JSON.parse(savedCategories)
      : defaultCategories;

    if (categories.length === 0) categories = defaultCategories;

    currentCategory = categories[0].id;

    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      if (p.pic) profilePic.src = p.pic;
    }
    if (savedBg) document.body.style.backgroundImage = savedBg;

    renderSidebar();
    setTheme(savedTheme || "light");
    renderCards();
    updateCategoryTitle();
  };

  const renderSidebar = () => {
    sidebarNav.innerHTML = "";
    categories.forEach((cat) => {
      const navItem = document.createElement("li");
      navItem.className = "nav-item";
      navItem.dataset.category = cat.id;
      navItem.innerHTML = `<a href="#" class="nav-link" title="${cat.name}"><img src="${cat.icon}" alt="${cat.name}"></a>`;
      sidebarNav.appendChild(navItem);
    });

    const addNavItem = document.createElement("li");
    addNavItem.className = "nav-item";
    addNavItem.id = "add-category-btn";
    addNavItem.innerHTML = `<a href="#" class="nav-link" title="Adicionar Página"><img src="icons/adicionar.svg" alt="Adicionar Página"></a>`;
    sidebarNav.appendChild(addNavItem);

    sidebarFooter.innerHTML = `<button class="sidebar-action-btn" id="edit-pages-btn" title="Editar Páginas"><img src="icons/editar.svg" alt="Editar Páginas"></button>`;

    attachSidebarEventListeners();
    updateActiveCategory();
  };

  const attachSidebarEventListeners = () => {
    document.querySelectorAll(".nav-item[data-category]").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        currentCategory = item.dataset.category;
        updateActiveCategory();
        updateCategoryTitle();
        renderCards();
      });
    });

    document
      .getElementById("add-category-btn")
      .addEventListener("click", () => {
        addPageForm.reset();
        addPageModal.classList.add("show");
        document.getElementById("page-name-input").focus();
      });

    document
      .getElementById("edit-pages-btn")
      .addEventListener("click", openEditPagesModal);
  };

  const updateCategoryTitle = () => {
    const category = categories.find((c) => c.id === currentCategory);
    if (category) categoryTitle.textContent = category.name;
  };

  const updateActiveCategory = () => {
    document.querySelectorAll(".nav-item[data-category]").forEach((i) => {
      i.classList.toggle("active", i.dataset.category === currentCategory);
    });
  };

  const initSortable = () => {
    const isMobile = window.innerWidth <= 768;

    if (sortable) {
      sortable.destroy();
      sortable = null;
    }

    if (!isMobile) {
      sortable = new Sortable(cardGrid, {
        animation: 150,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        onEnd: () => {
          const orderedIds = Array.from(cardGrid.children).map(
            (el) => el.dataset.id
          );
          const otherCards = allCards.filter(
            (c) => c.category !== currentCategory
          );

          const currentCategoryCards = orderedIds.map((id) =>
            allCards.find((c) => c.id == id)
          );

          currentCategoryCards.forEach((card, index) => {
            if (card) card.order = index;
          });

          allCards = [...currentCategoryCards, ...otherCards];
          saveData();
        },
      });
    }
  };

  const renderCards = () => {
    const searchQuery = searchInput.value.toLowerCase();
    let filteredCards = allCards.filter(
      (c) =>
        c.category === currentCategory &&
        c.title.toLowerCase().includes(searchQuery)
    );

    filteredCards.sort((a, b) => a.order - b.order);

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
        </div>`;
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

    initSortable();
  };

  const openCardModal = (mode = "add", cardId = null) => {
    const category = categories.find((c) => c.id === currentCategory);
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
        </div>`;
    cardModal.innerHTML = modalContent;
    cardModal.classList.add("show");

    const cardForm = document.getElementById("card-form");
    const hiddenCardId = document.getElementById("card-id");
    const modalTitle = document.getElementById("modal-title");

    newCardImageData = null;

    if (mode === "edit" && cardId !== null) {
      const card = allCards.find((c) => c.id == cardId);
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
      modalTitle.textContent = `Adicionar em ${category ? category.name : ""}`;
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
      const newOrder = allCards.filter(
        (c) => c.category === currentCategory
      ).length;
      allCards.push({
        id: Date.now(),
        category: currentCategory,
        order: newOrder,
        ...cardData,
      });
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
    allCards = allCards.filter((card) => card.id != cardId);
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

  const showCustomAlert = (message, title = "Aviso") => {
    const alertTitle = alertModal.querySelector("#alert-title");
    const alertMessage = alertModal.querySelector("#alert-message");
    const alertButtons = alertModal.querySelector("#alert-buttons");

    alertTitle.textContent = title;
    alertMessage.textContent = message;

    alertButtons.innerHTML = `<button class="alert-btn primary" id="alert-ok-btn">OK</button>`;

    alertModal.classList.add("show");

    return new Promise((resolve) => {
      const okBtn = document.getElementById("alert-ok-btn");
      const closeHandler = () => {
        alertModal.classList.remove("show");
        okBtn.removeEventListener("click", closeHandler);
        resolve(true);
      };
      okBtn.addEventListener("click", closeHandler);
    });
  };

  const showCustomConfirm = (message, title = "Confirmação") => {
    const alertTitle = alertModal.querySelector("#alert-title");
    const alertMessage = alertModal.querySelector("#alert-message");
    const alertButtons = alertModal.querySelector("#alert-buttons");

    alertTitle.textContent = title;
    alertMessage.textContent = message;

    alertButtons.innerHTML = `
            <button class="alert-btn secondary" id="confirm-cancel-btn">Cancelar</button>
            <button class="alert-btn primary" id="confirm-ok-btn">Confirmar</button>
        `;

    alertModal.classList.add("show");

    return new Promise((resolve) => {
      const okBtn = document.getElementById("confirm-ok-btn");
      const cancelBtn = document.getElementById("confirm-cancel-btn");

      const close = (result) => {
        alertModal.classList.remove("show");
        okBtn.removeEventListener("click", okHandler);
        cancelBtn.removeEventListener("click", cancelHandler);
        resolve(result);
      };

      const okHandler = () => close(true);
      const cancelHandler = () => close(false);

      okBtn.addEventListener("click", okHandler);
      cancelBtn.addEventListener("click", cancelHandler);
    });
  };

  const openEditPagesModal = () => {
    const listEl = document.getElementById("edit-pages-list");
    listEl.innerHTML = "";

    categories.forEach((cat) => {
      const itemEl = document.createElement("div");
      itemEl.className = "edit-page-item";
      itemEl.innerHTML = `
            <div class="form-group">
                <label for="title-${cat.id}">Título</label>
                <input type="text" id="title-${cat.id}" value="${cat.name}">
            </div>
            <div class="form-group">
                <label for="icon-upload-${cat.id}" class="file-action-btn">Importar Ícone SVG</label>
                <input type="file" id="icon-upload-${cat.id}" accept=".svg,image/svg+xml" style="display: none;">
            </div>
            <button class="delete-page-btn" data-id="${cat.id}">Excluir Página</button>
        `;
      listEl.appendChild(itemEl);

      itemEl
        .querySelector(`#title-${cat.id}`)
        .addEventListener("change", (e) => {
          const category = categories.find((c) => c.id === cat.id);
          category.name = e.target.value;
          saveData();
          renderSidebar();
          updateCategoryTitle();
        });

      itemEl
        .querySelector(`#icon-upload-${cat.id}`)
        .addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file && file.type === "image/svg+xml") {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const category = categories.find((c) => c.id === cat.id);
              category.icon = evt.target.result;
              saveData();
              renderSidebar();
            };
            reader.readAsDataURL(file);
          } else {
            showCustomAlert("Por favor, selecione um arquivo SVG válido.");
          }
        });

      itemEl
        .querySelector(".delete-page-btn")
        .addEventListener("click", async (e) => {
          await deleteCategory(e.target.dataset.id);
        });
    });

    editPagesModal.classList.add("show");
  };

  const deleteCategory = async (categoryId) => {
    if (categories.length <= 1) {
      await showCustomAlert("Não é possível excluir a última página.");
      return;
    }
    const confirmed = await showCustomConfirm(
      "Tem certeza que deseja excluir esta página e todos os seus cards?"
    );
    if (confirmed) {
      categories = categories.filter((c) => c.id !== categoryId);
      allCards = allCards.filter((card) => card.category !== categoryId);

      if (currentCategory === categoryId) {
        currentCategory = categories[0].id;
      }

      saveData();
      renderSidebar();
      renderCards();
      updateCategoryTitle();
      editPagesModal.classList.remove("show");
    }
  };

  const exportSettings = () => {
    try {
      const settings = {
        dashboardCards: JSON.parse(
          localStorage.getItem("dashboardCards") || "[]"
        ),
        dashboardCategories: JSON.parse(
          localStorage.getItem("dashboardCategories") || "[]"
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        if (
          settings &&
          settings.dashboardCards &&
          settings.dashboardProfile &&
          settings.dashboardCategories
        ) {
          localStorage.setItem(
            "dashboardCards",
            JSON.stringify(settings.dashboardCards)
          );
          localStorage.setItem(
            "dashboardCategories",
            JSON.stringify(settings.dashboardCategories)
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

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  settingsBtn.addEventListener("click", () =>
    settingsModal.classList.add("show")
  );
  closeSettingsBtn.addEventListener("click", () =>
    settingsModal.classList.remove("show")
  );
  closeEditPagesBtn.addEventListener("click", () =>
    editPagesModal.classList.remove("show")
  );
  closeAddPageBtn.addEventListener("click", () =>
    addPageModal.classList.remove("show")
  );
  addCardHeaderBtn.addEventListener("click", () => openCardModal("add"));
  exportBtn.addEventListener("click", exportSettings);
  importInput.addEventListener("change", importSettings);

  themeBtns.forEach((btn) =>
    btn.addEventListener("click", () => setTheme(btn.dataset.theme))
  );

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveData();
    settingsModal.classList.remove("show");
  });

  addPageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("page-name-input");
    const iconInput = document.getElementById("page-icon-input");
    const name = nameInput.value.trim();
    const file = iconInput.files[0];

    if (!name) return;

    const createAndAddCategory = (icon) => {
      const newCategory = {
        id: `cat_${Date.now()}`,
        name: name,
        icon: icon,
      };
      categories.push(newCategory);
      saveData();
      renderSidebar();
      addPageModal.classList.remove("show");
    };

    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        createAndAddCategory(evt.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      createAndAddCategory("icons/folder.svg");
    }
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

  window.addEventListener("resize", debounce(initSortable, 250));

  window.addEventListener("click", (e) => {
    if (e.target === cardModal) cardModal.classList.remove("show");
    if (e.target === settingsModal) settingsModal.classList.remove("show");
    if (e.target === editPagesModal) editPagesModal.classList.remove("show");
    if (e.target === alertModal) alertModal.classList.remove("show");
    if (e.target === addPageModal) addPageModal.classList.remove("show");
  });

  loadData();
});
