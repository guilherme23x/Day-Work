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

  const openModal = (modalElement) => {
    modalElement.classList.add("show");
    anime({
      targets: modalElement.querySelector(".modal-content"),
      scale: [0.9, 1],
      opacity: [0, 1],
      translateY: ["15px", "0px"],
      duration: 400,
      easing: "easeOutCubic",
    });
  };

  const closeModal = (modalElement) => {
    anime({
      targets: modalElement.querySelector(".modal-content"),
      scale: [1, 0.9],
      opacity: [1, 0],
      translateY: ["0px", "15px"],
      duration: 300,
      easing: "easeInCubic",
      complete: () => {
        modalElement.classList.remove("show");
        if (modalElement === cardModal) {
          cardModal.innerHTML = "";
        }
      },
    });
  };

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
        openModal(addPageModal);
        document.getElementById("page-name-input").focus();
      });

    document
      .getElementById("edit-pages-btn")
      .addEventListener("click", openEditPagesModal);
  };

  const updateCategoryTitle = () => {
    const category = categories.find((c) => c.id === currentCategory);
    if (category) {
      const oldTitle = categoryTitle.textContent;
      if (oldTitle !== category.name) {
        anime({
          targets: categoryTitle,
          opacity: [1, 0],
          duration: 200,
          easing: "easeInQuad",
          complete: () => {
            categoryTitle.textContent = category.name;
            anime({
              targets: categoryTitle,
              opacity: [0, 1],
              duration: 200,
              easing: "easeOutQuad",
            });
          },
        });
      }
    }
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
        filter: ".enter-btn",
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
    anime({
      targets: ".card",
      opacity: 0,
      scale: 0.9,
      duration: 300,
      easing: "easeInQuad",
      complete: () => {
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
          cardElement
            .querySelector(".edit-btn")
            .addEventListener("click", (e) => {
              e.stopPropagation();
              openCardModal("edit", card.id);
            });
          cardGrid.appendChild(cardElement);
        });

        anime({
          targets: ".card",
          opacity: [0, 1],
          scale: [0.95, 1],
          translateY: [20, 0],
          delay: anime.stagger(75, {
            grid: [Math.ceil(filteredCards.length / 4), filteredCards.length],
            from: "first",
          }),
          duration: 500,
          easing: "easeOutQuint",
        });

        initSortable();
      },
    });
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
    openModal(cardModal);

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
      .addEventListener("click", () => closeModal(cardModal));
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
    closeModal(cardModal);
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

    openModal(alertModal);

    return new Promise((resolve) => {
      const okBtn = document.getElementById("alert-ok-btn");
      const closeHandler = () => {
        closeModal(alertModal);
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

    openModal(alertModal);

    return new Promise((resolve) => {
      const okBtn = document.getElementById("confirm-ok-btn");
      const cancelBtn = document.getElementById("confirm-cancel-btn");

      const close = (result) => {
        closeModal(alertModal);
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

  const showImportConfirm = () => {
    const alertTitle = alertModal.querySelector("#alert-title");
    const alertMessage = alertModal.querySelector("#alert-message");
    const alertButtons = alertModal.querySelector("#alert-buttons");

    alertTitle.textContent = "Importar Dados";
    alertMessage.textContent =
      "Já existem dados salvos. Como você deseja importar o novo arquivo?";

    alertButtons.innerHTML = `
        <button class="alert-btn secondary" id="import-cancel-btn">Cancelar</button>
        <button class="alert-btn secondary" id="import-merge-btn">Mesclar</button>
        <button class="alert-btn primary" id="import-replace-btn">Substituir</button>
    `;

    openModal(alertModal);

    return new Promise((resolve) => {
      const replaceBtn = document.getElementById("import-replace-btn");
      const mergeBtn = document.getElementById("import-merge-btn");
      const cancelBtn = document.getElementById("import-cancel-btn");

      const close = (result) => {
        closeModal(alertModal);
        replaceBtn.removeEventListener("click", replaceHandler);
        mergeBtn.removeEventListener("click", mergeHandler);
        cancelBtn.removeEventListener("click", cancelHandler);
        resolve(result);
      };

      const replaceHandler = () => close("replace");
      const mergeHandler = () => close("merge");
      const cancelHandler = () => close("cancel");

      replaceBtn.addEventListener("click", replaceHandler);
      mergeBtn.addEventListener("click", mergeHandler);
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

    openModal(editPagesModal);
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
      closeModal(editPagesModal);
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
      showCustomAlert("Ocorreu um erro ao exportar os dados.", "Erro");
    }
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        if (
          settings &&
          settings.dashboardCards &&
          settings.dashboardProfile &&
          settings.dashboardCategories
        ) {
          const existingCards = JSON.parse(
            localStorage.getItem("dashboardCards") || "[]"
          );

          let importAction = "replace";
          if (existingCards.length > 0) {
            importAction = await showImportConfirm();
          }

          if (importAction === "cancel") {
            importInput.value = "";
            return;
          }

          if (importAction === "merge") {
            const existingCategories = JSON.parse(
              localStorage.getItem("dashboardCategories") || "[]"
            );
            const mergedCategories = [...existingCategories];
            const existingCategoryNames = new Set(
              existingCategories.map((c) => c.name)
            );
            settings.dashboardCategories.forEach((newCat) => {
              if (!existingCategoryNames.has(newCat.name)) {
                mergedCategories.push(newCat);
              }
            });

            let currentCards = [...existingCards];
            settings.dashboardCards.forEach((newCard) => {
              const existingCardMatch = currentCards.find(
                (oldCard) =>
                  oldCard.title === newCard.title &&
                  oldCard.url === newCard.url &&
                  oldCard.category === newCard.category
              );

              if (existingCardMatch) {
                existingCardMatch.imageUrl = newCard.imageUrl;
              } else {
                currentCards.push({
                  ...newCard,
                  id: Date.now() + Math.random(),
                });
              }
            });

            localStorage.setItem(
              "dashboardCards",
              JSON.stringify(currentCards)
            );
            localStorage.setItem(
              "dashboardCategories",
              JSON.stringify(mergedCategories)
            );
          } else {
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
          }

          loadData();
          closeModal(settingsModal);
        } else {
          await showCustomAlert("Arquivo de configuração inválido.", "Erro");
        }
      } catch (error) {
        console.error("Erro ao importar configurações:", error);
        await showCustomAlert("Ocorreu um erro ao ler o arquivo.", "Erro");
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

  settingsBtn.addEventListener("click", () => openModal(settingsModal));
  closeSettingsBtn.addEventListener("click", () => closeModal(settingsModal));
  closeEditPagesBtn.addEventListener("click", () => closeModal(editPagesModal));
  closeAddPageBtn.addEventListener("click", () => closeModal(addPageModal));
  addCardHeaderBtn.addEventListener("click", () => openCardModal("add"));
  exportBtn.addEventListener("click", exportSettings);
  importInput.addEventListener("change", importSettings);

  themeBtns.forEach((btn) =>
    btn.addEventListener("click", () => setTheme(btn.dataset.theme))
  );

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveData();
    closeModal(settingsModal);
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
      closeModal(addPageModal);
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
    if (e.target === cardModal) closeModal(cardModal);
    if (e.target === settingsModal) closeModal(settingsModal);
    if (e.target === editPagesModal) closeModal(editPagesModal);
    if (e.target === alertModal) {
      // Don't close alert on bg click, only via buttons
    }
    if (e.target === addPageModal) closeModal(addPageModal);
  });

  const initPageAnimation = () => {
    const tl = anime.timeline({
      easing: "easeOutQuint",
    });
    tl.add({
      targets: ".sidebar",
      translateX: ["-100%", "0%"],
      duration: 800,
    })
      .add(
        {
          targets: [".main-header", "#category-title"],
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 600,
        },
        "-=400"
      )
      .add(
        {
          targets: ".social-links a",
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 500,
          delay: anime.stagger(100),
        },
        "-=500"
      );
  };

  loadData();
  initPageAnimation();
});
