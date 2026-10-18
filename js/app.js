/**
 * Aplicação Principal de Controle de Paletes & Impressão de Etiquetas
 */

(function () {
  'use strict';

  // Estado Atual da Aplicação
  const state = {
    currentTab: 'new-expedition',
    currentShipment: null,
    generatedPallets: [],
    settings: PalletStorage.getSettings(),
    filterStore: 'all',
    filterSearch: '',
    dashboardViewMode: 'units', // 'units' ou 'currency'
    dashboardPeriod: '7'
  };

  // Instâncias dos Gráficos Chart.js
  const chartInstances = {
    flowTimeline: null,
    modelsDoughnut: null,
    vehiclesBar: null,
    storesBar: null,
    auditGauge: null
  };

  // Elementos do DOM
  const elements = {
    // Abas
    navBtns: document.querySelectorAll('.nav-tab-btn'),
    tabPanels: document.querySelectorAll('.tab-content-panel'),

    // Formulário
    form: document.getElementById('form-expedition'),
    selectStore: document.getElementById('input-store'),
    inputPalletModel: document.getElementById('input-pallet-model'),
    inputPalletsCount: document.getElementById('input-pallets-count'),
    formPalletsCostPreview: document.getElementById('form-pallets-cost-preview'),
    btnMinusPallet: document.getElementById('btn-minus-pallet'),
    btnPlusPallet: document.getElementById('btn-plus-pallet'),
    quickPills: document.querySelectorAll('.quick-pill'),
    selectChecker: document.getElementById('input-checker'),
    inputDate: document.getElementById('input-date'),
    inputPlate: document.getElementById('input-plate'),
    inputDock: document.getElementById('input-dock'),
    inputBatchId: document.getElementById('input-batch-id'),
    inputNotes: document.getElementById('input-notes'),
    btnGeneratePreview: document.getElementById('btn-generate-preview'),
    btnPrintAll: document.getElementById('btn-print-all'),
    btnPrintManifest: document.getElementById('btn-print-manifest'),
    btnNewStoreQuick: document.getElementById('btn-new-store-quick'),
    btnNewCheckerQuick: document.getElementById('btn-new-checker-quick'),

    // Dashboard & Saldo
    dashBannerTotalVal: document.getElementById('dash-banner-total-val'),
    dashBannerPalletsCount: document.getElementById('dash-banner-pallets-count'),
    bannerPbrVal: document.getElementById('banner-pbr-val'),
    bannerPbrMoney: document.getElementById('banner-pbr-money'),
    bannerDescVal: document.getElementById('banner-desc-val'),
    bannerDescMoney: document.getElementById('banner-desc-money'),
    bannerChepVal: document.getElementById('banner-chep-val'),
    bannerChepMoney: document.getElementById('banner-chep-money'),
    dashBalanceMiniBreakdown: document.getElementById('dash-balance-mini-breakdown'),
    dashReturnRateBadge: document.getElementById('dash-return-rate-badge'),
    btnToggleViewUnits: document.getElementById('btn-toggle-view-units'),
    btnToggleViewReais: document.getElementById('btn-toggle-view-reais'),
    btnRefreshDashboard: document.getElementById('btn-refresh-dashboard'),
    doughnutTotalPallets: document.getElementById('doughnut-total-pallets'),
    doughnutLegendContainer: document.getElementById('doughnut-legend-container'),
    auditTotalVal: document.getElementById('audit-total-val'),

    dashBalanceTotal: document.getElementById('dash-balance-total'),
    dashBalanceValue: document.getElementById('dash-balance-value'),
    dashExitsTotal: document.getElementById('dash-exits-total'),
    dashExitsValue: document.getElementById('dash-exits-value'),
    dashEntriesTotal: document.getElementById('dash-entries-total'),
    dashEntriesValue: document.getElementById('dash-entries-value'),

    modelPbrStock: document.getElementById('model-pbr-stock'),
    modelPbrVal: document.getElementById('model-pbr-val'),
    modelPbrIn: document.getElementById('model-pbr-in'),
    modelPbrOut: document.getElementById('model-pbr-out'),

    modelDescStock: document.getElementById('model-desc-stock'),
    modelDescVal: document.getElementById('model-desc-val'),
    modelDescIn: document.getElementById('model-desc-in'),
    modelDescOut: document.getElementById('model-desc-out'),

    modelChepStock: document.getElementById('model-chep-stock'),
    modelChepVal: document.getElementById('model-chep-val'),
    modelChepIn: document.getElementById('model-chep-in'),
    modelChepOut: document.getElementById('model-chep-out'),

    barSegPbr: document.getElementById('bar-seg-pbr'),
    barSegDesc: document.getElementById('bar-seg-desc'),
    barSegChep: document.getElementById('bar-seg-chep'),
    stockDistLabels: document.getElementById('stock-dist-labels'),

    vehicleDeliveriesTbody: document.getElementById('vehicle-deliveries-tbody'),

    auditRateDisplay: document.getElementById('audit-rate-display'),
    auditTotalPallets: document.getElementById('audit-total-pallets'),
    auditConferredCount: document.getElementById('audit-conferred-count'),
    auditTransitCount: document.getElementById('audit-transit-count'),
    auditShippedCount: document.getElementById('audit-shipped-count'),

    entriesTableTbody: document.getElementById('entries-table-tbody'),
    btnOpenModalEntry: document.getElementById('btn-open-modal-entry'),
    modalAddEntry: document.getElementById('modal-add-entry'),
    formAddEntry: document.getElementById('form-add-entry'),
    btnCloseModalEntry: document.getElementById('btn-close-modal-entry'),
    btnCancelEntry: document.getElementById('btn-cancel-entry'),
    entryOrigin: document.getElementById('entry-origin'),
    entryModel: document.getElementById('entry-model'),
    entryCount: document.getElementById('entry-count'),
    entryPlate: document.getElementById('entry-plate'),
    entryChecker: document.getElementById('entry-checker'),
    entryNotes: document.getElementById('entry-notes'),
    entryValuePreview: document.getElementById('entry-value-preview'),

    // Formato de Impressão
    selectPrintFormat: document.getElementById('select-print-format'),

    // Canvas de Etiquetas
    labelsCanvas: document.getElementById('labels-canvas'),
    emptyPreview: document.getElementById('empty-preview-card'),
    previewMetaSummary: document.getElementById('preview-meta-summary'),

    // KPIs
    kpiTodayPallets: document.getElementById('kpi-today-pallets'),
    kpiTodayShipments: document.getElementById('kpi-today-shipments'),
    kpiActiveStores: document.getElementById('kpi-active-stores'),
    kpiInTransit: document.getElementById('kpi-in-transit'),
    historyCountBadge: document.getElementById('history-count-badge'),

    // Histórico
    historyTableBody: document.getElementById('history-table-body'),
    historySearchInput: document.getElementById('history-search-input'),
    historyFilterStore: document.getElementById('history-filter-store'),

    // Gerenciador de Lojas & Conferentes
    storesTableBody: document.getElementById('stores-table-body'),
    checkersList: document.getElementById('checkers-list'),
    formAddStore: document.getElementById('form-add-store'),
    formAddChecker: document.getElementById('form-add-checker'),

    // Gestão de Fotos dos Volumes
    modalPhotos: document.getElementById('modal-photos'),
    modalPhotosTitle: document.getElementById('modal-photos-title'),
    btnCloseModalPhotos: document.getElementById('btn-close-modal-photos'),
    btnModalPhotosClose: document.getElementById('btn-modal-photos-close'),
    photoUploadDropzone: document.getElementById('photo-upload-dropzone'),
    inputCargoPhoto: document.getElementById('input-cargo-photo'),
    photosGalleryContainer: document.getElementById('photos-gallery-container'),
    photosEmptyState: document.getElementById('photos-empty-state'),

    // Lightbox Modal
    modalLightbox: document.getElementById('modal-lightbox'),
    lightboxFullImg: document.getElementById('lightbox-full-img'),
    btnCloseLightbox: document.getElementById('btn-close-lightbox'),

    // Sandbox de Impressão
    printSandbox: document.getElementById('print-sandbox'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // Inicialização
  function init() {
    setupTodayDate();
    setupBatchId();
    loadStoresDropdown();
    loadCheckersDropdown();
    setupEventListeners();
    refreshKPIs();
    renderHistoryTable();
    renderStoresManager();
    renderCheckersManager();
    renderDashboard();
    updateCostPreview();

    // Gera um preview inicial com dados padrão para visualização imediata
    generateCurrentLabels(false);
  }

  // Preenche a data de hoje por padrão
  function setupTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    elements.inputDate.value = `${yyyy}-${mm}-${dd}`;
  }

  // Preenche o código da expedição sequencial
  function setupBatchId() {
    elements.inputBatchId.value = PalletStorage.getNextBatchNumber();
  }

  // Atualiza preview de custo da carga no formulário
  function updateCostPreview() {
    const count = parseInt(elements.inputPalletsCount.value, 10) || 1;
    const model = (elements.inputPalletModel && elements.inputPalletModel.value) || 'PBR';
    const unitCost = PalletStorage.getUnitCost(model);
    const total = count * unitCost;
    if (elements.formPalletsCostPreview) {
      elements.formPalletsCostPreview.textContent = `Valor Carga: ${formatCurrency(total)}`;
    }
    const badge = document.getElementById('form-model-cost-badge');
    if (badge) {
      badge.textContent = `Custo: ${formatCurrency(unitCost)} / un`;
    }
  }

  function formatCurrency(val) {
    return 'R$ ' + Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Carrega opções de lojas no Select
  function loadStoresDropdown() {
    const stores = PalletStorage.getStores();
    elements.selectStore.innerHTML = '<option value="">-- Selecione a Loja de Destino --</option>';
    elements.historyFilterStore.innerHTML = '<option value="all">Todas as Lojas</option>';

    if (elements.entryOrigin) {
      elements.entryOrigin.innerHTML = '<option value="">-- Selecione a Origem do Retorno --</option>';
    }

    stores.forEach(store => {
      const opt = document.createElement('option');
      opt.value = store.id;
      opt.textContent = `${store.name} (${store.city || ''})`;
      opt.dataset.name = store.name;
      opt.dataset.city = store.city;
      opt.dataset.dock = store.doca || '';
      elements.selectStore.appendChild(opt);

      const filterOpt = document.createElement('option');
      filterOpt.value = store.name;
      filterOpt.textContent = store.name;
      elements.historyFilterStore.appendChild(filterOpt);

      if (elements.entryOrigin) {
        const entryOpt = document.createElement('option');
        entryOpt.value = store.name;
        entryOpt.textContent = store.name;
        elements.entryOrigin.appendChild(entryOpt);
      }
    });

    if (elements.entryOrigin) {
      const fornOpt = document.createElement('option');
      fornOpt.value = 'Fornecedor / Compra Nova';
      fornOpt.textContent = '📦 Fornecedor / Compra Nova de Paletes';
      elements.entryOrigin.appendChild(fornOpt);
    }

    // Seleciona a primeira por padrão se existir
    if (stores.length > 0) {
      elements.selectStore.selectedIndex = 1;
      updateDockFromStore();
    }
  }

  // Carrega opções de conferentes no Select
  function loadCheckersDropdown() {
    const checkers = PalletStorage.getCheckers();
    elements.selectChecker.innerHTML = '<option value="">-- Selecione o Conferente --</option>';
    if (elements.entryChecker) {
      elements.entryChecker.innerHTML = '<option value="">-- Selecione o Conferente --</option>';
    }

    checkers.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      elements.selectChecker.appendChild(opt);

      if (elements.entryChecker) {
        const eOpt = document.createElement('option');
        eOpt.value = name;
        eOpt.textContent = name;
        elements.entryChecker.appendChild(eOpt);
      }
    });

    if (checkers.length > 0) {
      elements.selectChecker.selectedIndex = 1;
      if (elements.entryChecker) elements.entryChecker.selectedIndex = 1;
    }
  }

  // Atualiza doca sugerida quando seleciona uma loja
  function updateDockFromStore() {
    const selected = elements.selectStore.selectedOptions[0];
    if (selected && selected.dataset.dock && !elements.inputDock.value) {
      elements.inputDock.value = selected.dataset.dock;
    }
  }

  // Máscara e Validação de Placa (Mercosul ou Antiga)
  function formatPlate(value) {
    let clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 7) clean = clean.substring(0, 7);

    // Formato Mercosul (ex: BRA2E19) ou Padrão (ex: ABC-1234)
    if (clean.length >= 4) {
      const fourthChar = clean[3];
      const isDigit = /\d/.test(fourthChar);
      const fifthChar = clean[4];
      const isFifthLetter = /[A-Z]/.test(fifthChar);

      if (isDigit && isFifthLetter) {
        return clean;
      } else if (clean.length > 3) {
        return `${clean.substring(0, 3)}-${clean.substring(3)}`;
      }
    }
    return clean;
  }

  // Event Listeners
  function setupEventListeners() {
    // Troca de abas
    elements.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    // Seletor de Loja
    elements.selectStore.addEventListener('change', () => {
      updateDockFromStore();
      generateCurrentLabels(false);
    });

    // Modelo de Palete
    if (elements.inputPalletModel) {
      elements.inputPalletModel.addEventListener('change', () => {
        generateCurrentLabels(false);
        updateCostPreview();
      });
    }

    // Contador de Paletes
    elements.btnMinusPallet.addEventListener('click', () => {
      let count = parseInt(elements.inputPalletsCount.value, 10) || 1;
      if (count > 1) {
        elements.inputPalletsCount.value = count - 1;
        generateCurrentLabels(false);
        updateCostPreview();
      }
    });

    elements.btnPlusPallet.addEventListener('click', () => {
      let count = parseInt(elements.inputPalletsCount.value, 10) || 1;
      if (count < 99) {
        elements.inputPalletsCount.value = count + 1;
        generateCurrentLabels(false);
        updateCostPreview();
      }
    });

    elements.inputPalletsCount.addEventListener('input', () => {
      let count = parseInt(elements.inputPalletsCount.value, 10);
      if (isNaN(count) || count < 1) count = 1;
      if (count > 99) count = 99;
      elements.inputPalletsCount.value = count;
      generateCurrentLabels(false);
      updateCostPreview();
    });

    // Pílulas de quantidade rápida (+1, +5, +10)
    elements.quickPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const val = parseInt(pill.dataset.value, 10);
        elements.inputPalletsCount.value = val;
        generateCurrentLabels(false);
        updateCostPreview();
      });
    });

    // Placa
    elements.inputPlate.addEventListener('input', (e) => {
      e.target.value = formatPlate(e.target.value);
      generateCurrentLabels(false);
    });

    // Conferente e Data
    elements.selectChecker.addEventListener('change', () => generateCurrentLabels(false));
    elements.inputDate.addEventListener('change', () => generateCurrentLabels(false));
    elements.inputDock.addEventListener('input', () => generateCurrentLabels(false));
    elements.inputNotes.addEventListener('input', () => generateCurrentLabels(false));
    elements.selectPrintFormat.addEventListener('change', () => {
      state.settings.labelFormat = elements.selectPrintFormat.value;
      PalletStorage.saveSettings(state.settings);
      showToast(`Formato de impressão alterado para ${elements.selectPrintFormat.selectedOptions[0].text}`, 'info');
    });

    // Modal de Entrada de Paletes (Retorno)
    if (elements.btnOpenModalEntry && elements.modalAddEntry) {
      elements.btnOpenModalEntry.addEventListener('click', () => {
        elements.modalAddEntry.classList.add('active');
        if (elements.entryCount && elements.entryValuePreview) {
          const c = parseInt(elements.entryCount.value, 10) || 1;
          elements.entryValuePreview.textContent = formatCurrency(c * 89.90);
        }
      });
    }

    if (elements.btnCloseModalEntry && elements.modalAddEntry) {
      elements.btnCloseModalEntry.addEventListener('click', () => {
        elements.modalAddEntry.classList.remove('active');
      });
    }

    if (elements.btnCancelEntry && elements.modalAddEntry) {
      elements.btnCancelEntry.addEventListener('click', () => {
        elements.modalAddEntry.classList.remove('active');
      });
    }

    if (elements.entryCount && elements.entryValuePreview) {
      elements.entryCount.addEventListener('input', () => {
        const c = parseInt(elements.entryCount.value, 10) || 0;
        elements.entryValuePreview.textContent = formatCurrency(c * 89.90);
      });
    }

    if (elements.entryPlate) {
      elements.entryPlate.addEventListener('input', (e) => {
        e.target.value = formatPlate(e.target.value);
      });
    }

    if (elements.formAddEntry) {
      elements.formAddEntry.addEventListener('submit', (e) => {
        e.preventDefault();
        const origin = elements.entryOrigin.value;
        const count = parseInt(elements.entryCount.value, 10) || 1;
        const model = elements.entryModel.value;
        const plate = elements.entryPlate.value.trim().toUpperCase();
        const checker = elements.entryChecker.value;
        const notes = elements.entryNotes.value.trim();

        if (!origin) {
          showToast('Selecione a origem do retorno.', 'warning');
          return;
        }

        const newEntry = {
          id: PalletStorage.getNextEntryNumber(),
          date: new Date().toISOString().split('T')[0],
          dateFormatted: new Date().toLocaleDateString('pt-BR'),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          storeOrigin: origin,
          count: count,
          model: model,
          plate: plate || 'SEM PLACA',
          checker: checker || 'Conferente CD',
          type: 'Retorno de Loja',
          notes: notes
        };

        PalletStorage.addEntry(newEntry);
        elements.modalAddEntry.classList.remove('active');
        elements.formAddEntry.reset();
        renderDashboard();
        refreshKPIs();
        showToast(`Entrada de ${count} palete(s) ${model} registrada com sucesso (+${formatCurrency(count * PalletStorage.getUnitCost(model))})!`, 'success');
      });
    }

    // Toolbar do Dashboard: Alternador de Visualização (Unidades vs R$)
    if (elements.btnToggleViewUnits && elements.btnToggleViewReais) {
      elements.btnToggleViewUnits.addEventListener('click', () => {
        state.dashboardViewMode = 'units';
        elements.btnToggleViewUnits.classList.add('active');
        elements.btnToggleViewReais.classList.remove('active');
        renderDashboard();
      });

      elements.btnToggleViewReais.addEventListener('click', () => {
        state.dashboardViewMode = 'currency';
        elements.btnToggleViewReais.classList.add('active');
        elements.btnToggleViewUnits.classList.remove('active');
        renderDashboard();
      });
    }

    // Toolbar do Dashboard: Botão Atualizar
    if (elements.btnRefreshDashboard) {
      elements.btnRefreshDashboard.addEventListener('click', () => {
        renderDashboard();
        showToast('Gráficos e indicadores atualizados!', 'success');
      });
    }

    // Toolbar do Dashboard: Filtros de Período
    document.querySelectorAll('.time-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.time-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.dashboardPeriod = e.currentTarget.dataset.period;
        renderDashboard();
        showToast(`Período atualizado: ${e.currentTarget.textContent}`, 'info');
      });
    });

    // Botão de Gerar/Atualizar Preview
    elements.btnGeneratePreview.addEventListener('click', () => {
      generateCurrentLabels(true);
      showToast('Etiquetas geradas com sucesso!', 'success');
    });

    // Botão Imprimir Todas
    elements.btnPrintAll.addEventListener('click', () => {
      handlePrintAll();
    });

    // Botão Imprimir Romaneio / Manifesto
    elements.btnPrintManifest.addEventListener('click', () => {
      handlePrintManifest();
    });

    // Cadastros Rápidos (Modais ou Prompt)
    elements.btnNewStoreQuick.addEventListener('click', promptNewStore);
    elements.btnNewCheckerQuick.addEventListener('click', promptNewChecker);

    // Filtros de Histórico
    elements.historySearchInput.addEventListener('input', (e) => {
      state.filterSearch = e.target.value.toLowerCase();
      renderHistoryTable();
    });

    elements.historyFilterStore.addEventListener('change', (e) => {
      state.filterStore = e.target.value;
      renderHistoryTable();
    });

    // Formulário de Cadastro de Loja Completo
    elements.formAddStore.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('new-store-code').value.trim();
      const name = document.getElementById('new-store-name').value.trim();
      const city = document.getElementById('new-store-city').value.trim();
      const doca = document.getElementById('new-store-dock').value.trim();

      if (!name) {
        showToast('Informe o nome da loja.', 'warning');
        return;
      }

      PalletStorage.addStore({
        id: code || `LJ-${Date.now().toString().slice(-4)}`,
        name: name,
        city: city || 'Unidade Local',
        doca: doca || 'Doca 01'
      });

      elements.formAddStore.reset();
      loadStoresDropdown();
      renderStoresManager();
      showToast(`Loja "${name}" cadastrada com sucesso!`, 'success');
    });

    // Formulário de Cadastro de Conferente
    elements.formAddChecker.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-checker-name').value.trim();
      if (!name) return;
      PalletStorage.addChecker(name);
      elements.formAddChecker.reset();
      loadCheckersDropdown();
      renderCheckersManager();
      showToast(`Conferente "${name}" cadastrado com sucesso!`, 'success');
    });

    // Eventos de Fotos dos Volumes Carregados
    if (elements.photoUploadDropzone && elements.inputCargoPhoto) {
      elements.photoUploadDropzone.addEventListener('click', () => {
        elements.inputCargoPhoto.click();
      });

      elements.inputCargoPhoto.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length || !currentPhotoShipmentId) return;

        showToast(`Processando ${files.length} foto(s)...`, 'info');
        for (const file of files) {
          try {
            const compressed = await compressImageFile(file);
            PalletStorage.addShipmentPhoto(currentPhotoShipmentId, compressed);
          } catch (err) {
            console.error('Erro ao processar imagem:', err);
          }
        }
        elements.inputCargoPhoto.value = '';
        renderPhotosGallery(currentPhotoShipmentId);
        renderHistoryTable();
        showToast('Foto(s) dos volumes adicionada(s) com sucesso!', 'success');
      });
    }

    if (elements.btnCloseModalPhotos) {
      elements.btnCloseModalPhotos.addEventListener('click', closePhotosModal);
    }
    if (elements.btnModalPhotosClose) {
      elements.btnModalPhotosClose.addEventListener('click', closePhotosModal);
    }
    if (elements.btnCloseLightbox) {
      elements.btnCloseLightbox.addEventListener('click', () => {
        elements.modalLightbox.style.display = 'none';
      });
    }
    if (elements.modalLightbox) {
      elements.modalLightbox.addEventListener('click', (e) => {
        if (e.target !== elements.lightboxFullImg) {
          elements.modalLightbox.style.display = 'none';
        }
      });
    }
  }

  // === FUNÇÕES DE MANIPULAÇÃO DE FOTOS DOS VOLUMES ===
  let currentPhotoShipmentId = null;

  function compressImageFile(file, maxWidth = 1000, quality = 0.75) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve({
            name: file.name,
            dataUrl: canvas.toDataURL('image/jpeg', quality)
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function openPhotosModal(shipmentId) {
    currentPhotoShipmentId = shipmentId;
    const shipment = PalletStorage.getShipmentById(shipmentId);
    if (!shipment) return;

    elements.modalPhotosTitle.textContent = `📷 Fotos dos Volumes — ${shipment.id} (${shipment.store})`;
    renderPhotosGallery(shipmentId);
    elements.modalPhotos.classList.add('active');
  }

  function closePhotosModal() {
    currentPhotoShipmentId = null;
    elements.modalPhotos.classList.remove('active');
    renderHistoryTable();
  }

  function renderPhotosGallery(shipmentId) {
    const photos = PalletStorage.getShipmentPhotos(shipmentId);
    elements.photosGalleryContainer.innerHTML = '';

    if (!photos || photos.length === 0) {
      elements.photosEmptyState.style.display = 'block';
      return;
    }

    elements.photosEmptyState.style.display = 'none';
    photos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'photo-item-card';
      card.innerHTML = `
        <div class="photo-thumbnail-wrap" title="Clique para ampliar">
          <img src="${photo.dataUrl}" alt="${photo.name}">
        </div>
        <div class="photo-item-info">
          <span class="photo-timestamp">${photo.timeFormatted || ''}</span>
          <button type="button" class="photo-delete-btn" title="Excluir Foto">🗑️ Excluir</button>
        </div>
      `;

      card.querySelector('.photo-thumbnail-wrap').addEventListener('click', () => {
        elements.lightboxFullImg.src = photo.dataUrl;
        elements.modalLightbox.style.display = 'flex';
      });

      card.querySelector('.photo-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Deseja realmente remover esta foto da transferência?')) {
          PalletStorage.deleteShipmentPhoto(shipmentId, photo.id);
          renderPhotosGallery(shipmentId);
          renderHistoryTable();
          showToast('Foto removida.', 'info');
        }
      });

      elements.photosGalleryContainer.appendChild(card);
    });
  }

  // Troca de Aba
  function switchTab(tabId) {
    state.currentTab = tabId;
    elements.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    elements.tabPanels.forEach(panel => {
      const isActive = panel.id === `tab-${tabId}`;
      panel.classList.toggle('active', isActive);
      panel.style.display = isActive ? 'block' : 'none';
    });

    if (tabId === 'history') {
      renderHistoryTable();
      refreshKPIs();
    } else if (tabId === 'dashboard') {
      setTimeout(() => {
        renderDashboard();
      }, 50);
    }
  }

  // Gera dados da remessa a partir dos campos
  function getFormData() {
    const selectedStoreOpt = elements.selectStore.selectedOptions[0];
    const storeName = selectedStoreOpt && selectedStoreOpt.value ? selectedStoreOpt.dataset.name : (elements.selectStore.value || 'NÃO INFORMADA');
    const storeCity = selectedStoreOpt && selectedStoreOpt.dataset.city ? selectedStoreOpt.dataset.city : '';

    const count = parseInt(elements.inputPalletsCount.value, 10) || 1;
    const model = (elements.inputPalletModel && elements.inputPalletModel.value) || 'PBR';
    const unitCost = PalletStorage.getUnitCost(model);
    const totalValue = count * unitCost;

    const checker = elements.selectChecker.value || 'NÃO INFORMADO';
    const rawDate = elements.inputDate.value;
    const plate = elements.inputPlate.value.trim().toUpperCase() || 'SEM PLACA';
    const dock = elements.inputDock.value.trim() || 'DOCA GERAL';
    const batchId = elements.inputBatchId.value.trim() || PalletStorage.getNextBatchNumber();
    const notes = elements.inputNotes.value.trim();

    // Formata a data para padrão brasileiro DD/MM/AAAA
    let formattedDate = rawDate;
    if (rawDate && rawDate.includes('-')) {
      const parts = rawDate.split('-');
      formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return {
      id: batchId,
      date: rawDate,
      dateFormatted: formattedDate,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      store: storeName,
      storeCity: storeCity,
      palletModel: model,
      palletsCount: count,
      unitCost: unitCost,
      totalValue: totalValue,
      checker: checker,
      plate: plate,
      dock: dock,
      notes: notes,
      status: 'Expedido'
    };
  }

  // Gera as etiquetas e exibe o preview
  function generateCurrentLabels(saveToStorage = false) {
    const shipmentData = getFormData();
    state.currentShipment = shipmentData;

    const pallets = [];
    const count = shipmentData.palletsCount;

    for (let i = 1; i <= count; i++) {
      const palletSeq = String(i).padStart(2, '0');
      const totalSeq = String(count).padStart(2, '0');
      // Código de barras limpo e rastreável: ex: EXP261017001P01
      const cleanBatch = shipmentData.id.replace(/[^A-Z0-9]/gi, '');
      const palletBarcode = `${cleanBatch}P${palletSeq}`;

      pallets.push({
        palletNumber: i,
        palletNumberPad: palletSeq,
        totalPallets: count,
        totalPalletsPad: totalSeq,
        palletBarcode: palletBarcode,
        palletModel: shipmentData.palletModel,
        qrData: JSON.stringify({
          lote: shipmentData.id,
          palete: `${i}/${count}`,
          modelo: shipmentData.palletModel,
          loja: shipmentData.store,
          placa: shipmentData.plate,
          conferente: shipmentData.checker,
          data: shipmentData.dateFormatted,
          valor: `${formatCurrency(shipmentData.unitCost)}/un`
        })
      });
    }

    state.generatedPallets = pallets;
    shipmentData.pallets = pallets;

    if (saveToStorage) {
      PalletStorage.saveShipment(shipmentData);
      refreshKPIs();
      renderDashboard();
      setupBatchId(); // Prepara próximo código
    }

    renderLabelsPreview(shipmentData, pallets);
  }

  // Renderiza HTML das etiquetas no Canvas de Preview
  function renderLabelsPreview(shipment, pallets) {
    elements.labelsCanvas.innerHTML = '';

    if (!pallets || pallets.length === 0) {
      elements.emptyPreview.style.display = 'block';
      elements.previewMetaSummary.textContent = 'Nenhuma etiqueta gerada ainda.';
      return;
    }

    elements.emptyPreview.style.display = 'none';
    elements.previewMetaSummary.textContent = `${pallets.length} etiqueta(s) [${shipment.palletModel || 'PBR'}] para ${shipment.store} • Placa: ${shipment.plate} • Total: ${formatCurrency(shipment.totalValue)}`;

    pallets.forEach((pallet, idx) => {
      const card = document.createElement('div');
      card.className = 'pallet-label-card';
      card.innerHTML = buildPalletLabelHtml(shipment, pallet, idx, false);

      // Adiciona listener para impressão avulsa
      const btnSingle = card.querySelector('.print-single-btn');
      if (btnSingle) {
        btnSingle.addEventListener('click', () => {
          handlePrintSingle(pallet.palletNumber);
        });
      }

      elements.labelsCanvas.appendChild(card);
    });
  }

  // Construtor do HTML da Etiqueta de Palete (Usado na Tela e na Impressão)
  function buildPalletLabelHtml(shipment, pallet, index, isPrintVersion = false) {
    const barcodeSvg = Barcode128.renderSvg(pallet.palletBarcode, { height: 48, barWidth: 1.8 });
    const qrSvg = QRCodeGenerator.renderSvg(pallet.qrData, { size: 76, margin: 1 });

    const headerActions = !isPrintVersion ? `
      <div class="label-card-actions">
        <span class="label-number-badge">Volume ${pallet.palletNumberPad} de ${pallet.totalPalletsPad} • [${shipment.palletModel || 'PBR'}]</span>
        <button type="button" class="print-single-btn" title="Imprimir apenas este palete">
          🖨️ Imprimir Avulso
        </button>
      </div>
    ` : '';

    return `
      ${headerActions}
      <div class="printable-pallet-sheet">
        <!-- Cabeçalho Institucional Beira Rio -->
        <div class="lbl-header">
          <div class="lbl-company-wrap">
            <img src="img/logo-light.png" alt="Beira Rio - Construção e Acabamento" class="lbl-logo-img">
            <div class="lbl-company-info">
              <span class="lbl-company-name">BEIRA RIO</span>
              <span class="lbl-company-tag">CONSTRUÇÃO E ACABAMENTO</span>
            </div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="lbl-model-badge">${shipment.palletModel || 'PBR'}</span>
            <div class="lbl-operation">TRANSFERÊNCIA</div>
          </div>
        </div>

        <!-- Destaque Gigante da Loja de Destino -->
        <div class="lbl-destination-block">
          <div class="lbl-destination-label">DESTINO (LOJA DE TRANSFERÊNCIA)</div>
          <div class="lbl-destination-title">${shipment.store}</div>
          ${shipment.storeCity ? `<div class="lbl-destination-sub">${shipment.storeCity}</div>` : ''}
        </div>

        <!-- Bloco de Numeração de Volume e Placa -->
        <div class="lbl-volume-row">
          <div class="lbl-volume-box">
            <div class="lbl-volume-small">VOLUME / PALETE</div>
            <div class="lbl-volume-big">${pallet.palletNumberPad} / ${pallet.totalPalletsPad}</div>
          </div>
          <div class="lbl-plate-box">
            <div class="lbl-plate-title">PLACA VEÍCULO</div>
            <div class="lbl-plate-val">${shipment.plate}</div>
          </div>
        </div>

        <!-- Grade de Metadados Logísticos -->
        <div class="lbl-meta-grid">
          <div class="lbl-meta-cell">
            <span class="lbl-meta-lbl">DATA EXPEDIÇÃO</span>
            <span class="lbl-meta-val">${shipment.dateFormatted}</span>
          </div>
          <div class="lbl-meta-cell">
            <span class="lbl-meta-lbl">DOCA DE SAÍDA</span>
            <span class="lbl-meta-val">${shipment.dock}</span>
          </div>
          <div class="lbl-meta-cell">
            <span class="lbl-meta-lbl">MODELO DO PALETE</span>
            <span class="lbl-meta-val" style="font-weight: 900; color: #000;">${shipment.palletModel || 'PBR'}</span>
          </div>
          <div class="lbl-meta-cell">
            <span class="lbl-meta-lbl">VALOR CONTÁBIL</span>
            <span class="lbl-meta-val" style="font-weight: 900; color: #000;">${formatCurrency(shipment.unitCost || PalletStorage.getUnitCost(shipment.palletModel))}/un</span>
          </div>
          <div class="lbl-meta-cell full-width">
            <span class="lbl-meta-lbl">CONFERENTE RESPONSÁVEL</span>
            <span class="lbl-meta-val">${shipment.checker}</span>
          </div>
          <div class="lbl-meta-cell full-width">
            <span class="lbl-meta-lbl">LOTE / CONTROLE DE CARGA</span>
            <span class="lbl-meta-val">${shipment.id}</span>
          </div>
          ${shipment.notes ? `
          <div class="lbl-meta-cell full-width">
            <span class="lbl-meta-lbl">OBSERVAÇÕES</span>
            <span class="lbl-meta-val">${shipment.notes}</span>
          </div>` : ''}
        </div>

        <!-- Códigos de Identificação (Barcode 128 e QR Code) -->
        <div class="lbl-codes-section">
          <div class="lbl-barcode-wrapper">
            ${barcodeSvg}
          </div>
          <div class="lbl-qr-wrapper">
            ${qrSvg}
          </div>
        </div>

        <!-- Rodapé e Assinatura -->
        <div class="lbl-footer">
          <div class="lbl-signature-box">
            ASSINATURA / VISTO DO CONFERENTE
          </div>
          <div class="lbl-warning-text">
            ⚠️ CONFERIR MODELO E LACRE NO RECEBIMENTO
          </div>
        </div>
      </div>
    `;
  }

  // Disparo da Impressão de Todas as Etiquetas
  function handlePrintAll() {
    const shipment = getFormData();
    if (!elements.selectStore.value) {
      showToast('Por favor, selecione a loja de destino antes de imprimir.', 'warning');
      return;
    }

    // Garante que o lote foi salvo no histórico
    generateCurrentLabels(true);

    const format = elements.selectPrintFormat.value;
    document.body.className = `print-mode-${format}`;

    let printHtml = '';

    if (format === 'a4_double') {
      // MODO: 2 ETIQUETAS POR FOLHA A4
      const pallets = state.generatedPallets;
      for (let i = 0; i < pallets.length; i += 2) {
        const p1 = pallets[i];
        const p2 = pallets[i + 1];

        printHtml += `<div class="a4-sheet-container">`;
        printHtml += buildPalletLabelHtml(state.currentShipment, p1, i, true);

        if (p2) {
          printHtml += `<div class="a4-cut-line">✂️ CORTE AQUI — LINHA DIVISÓRIA DE ETIQUETAS A4 (2 POR FOLHA)</div>`;
          printHtml += buildPalletLabelHtml(state.currentShipment, p2, i + 1, true);
        } else {
          // Última folha com 1 palete ímpar
          printHtml += `<div class="a4-cut-line" style="opacity: 0.3;">✂️ ESPAÇO RESERVADO PARA CORTE</div>`;
          printHtml += `<div style="height: 135mm; border: 1.5px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #777; font-size: 11pt; font-weight: bold; text-transform: uppercase;">[ Espaço Livre — Folha A4 com 1 Palete ]</div>`;
        }
        printHtml += `</div>`;
      }
    } else {
      // Formato Térmico (100x150mm) ou A4 Cheia (1 por folha)
      state.generatedPallets.forEach((pallet, idx) => {
        printHtml += buildPalletLabelHtml(state.currentShipment, pallet, idx, true);
      });
    }

    elements.printSandbox.innerHTML = printHtml;

    setTimeout(() => {
      window.print();
      const formatLabel = format === 'a4_double' ? '2 por folha A4' : (format === 'thermal' ? 'Térmica 100x150' : 'A4 Cheia');
      showToast(`Enviadas ${state.generatedPallets.length} etiquetas para a impressora (${formatLabel})!`, 'success');
    }, 150);
  }

  // Disparo da Impressão de um Palete Específico (Avulso)
  function handlePrintSingle(palletNumber) {
    const shipment = state.currentShipment || getFormData();
    const targetPallet = state.generatedPallets.find(p => p.palletNumber === palletNumber);
    if (!targetPallet) return;

    const format = elements.selectPrintFormat.value;
    document.body.className = `print-mode-${format}`;

    elements.printSandbox.innerHTML = buildPalletLabelHtml(shipment, targetPallet, 0, true);

    setTimeout(() => {
      window.print();
      showToast(`Imprimindo Palete ${targetPallet.palletNumberPad} de ${targetPallet.totalPalletsPad}`, 'info');
    }, 150);
  }

  // Disparo de Impressão do Romaneio / Manifesto A4 da Carga
  function handlePrintManifest(shipmentOverride = null) {
    const shipment = shipmentOverride || state.currentShipment || getFormData();
    if (!shipment.store || shipment.store === 'NÃO INFORMADA') {
      showToast('Selecione uma loja de destino válida para o romaneio.', 'warning');
      return;
    }

    document.body.className = 'print-mode-a4_single';

    let palletRows = '';
    const pallets = shipment.pallets || state.generatedPallets;
    pallets.forEach(p => {
      palletRows += `
        <tr>
          <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">Palete ${p.palletNumberPad} / ${p.totalPalletsPad}</td>
          <td style="border: 1px solid #000; padding: 6px; font-family: monospace; font-size: 11px;">${p.palletBarcode}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: center;">${shipment.palletModel || 'PBR'} (${formatCurrency(shipment.unitCost || PalletStorage.getUnitCost(shipment.palletModel))})</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: center;">[ &nbsp; ] Conferido</td>
        </tr>
      `;
    });

    // Seção de fotos anexas no romaneio impresso
    const shipmentPhotos = PalletStorage.getShipmentPhotos(shipment.id);
    let photosSectionHtml = '';
    if (shipmentPhotos && shipmentPhotos.length > 0) {
      photosSectionHtml = `
        <div style="margin-top: 20px; border-top: 2px solid #000; padding-top: 10px;">
          <h3 style="font-size: 12px; text-transform: uppercase; margin-bottom: 6px;">
            📸 Registros Fotográficos dos Volumes Carregados no Caminhão (${shipmentPhotos.length} foto(s))
          </h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            ${shipmentPhotos.map(p => `
              <div style="border: 1px solid #000; padding: 2px; text-align: center; background: #fff;">
                <img src="${p.dataUrl}" style="width: 100%; height: 75px; object-fit: cover; display: block;" alt="Foto volume">
                <span style="font-size: 8px; font-family: monospace;">${p.timeFormatted || ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const manifestHtml = `
      <div class="printable-manifest-sheet" style="font-family: Arial, sans-serif; color: #000; padding: 15px;">
        <div style="border-bottom: 3.5px solid #eb1c25; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="img/logo-light.png" alt="Beira Rio" style="height: 48px; max-width: 170px; object-fit: contain;">
            <div>
              <h1 style="font-size: 18px; font-weight: 900; margin: 0; color: #00427a; line-height: 1.1;">BEIRA RIO</h1>
              <div style="font-size: 11px; font-weight: 800; color: #eb1c25; letter-spacing: 0.05em; text-transform: uppercase;">CONSTRUÇÃO E ACABAMENTO</div>
              <p style="font-size: 11px; font-weight: 700; color: #334155; margin: 3px 0 0 0; text-transform: uppercase;">ROMANEIO DE TRANSFERÊNCIA DE PALETES</p>
            </div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <div style="background: #00427a; color: #fff; padding: 3px 8px; border-radius: 3px; font-weight: bold; margin-bottom: 4px; display: inline-block;">
              LOTE: ${shipment.id}
            </div><br>
            <strong>EMISSÃO:</strong> ${shipment.dateFormatted} às ${shipment.time || ''}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px;">
          <tr>
            <td style="border: 1px solid #000; padding: 6px; width: 45%; background: #f2f2f2;"><strong>LOJA DE DESTINO:</strong></td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 15px; font-weight: 900;">${shipment.store}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; background: #f2f2f2;"><strong>PLACA DO VEÍCULO:</strong></td>
            <td style="border: 1px solid #000; padding: 6px; font-family: monospace; font-size: 14px; font-weight: bold;">${shipment.plate}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; background: #f2f2f2;"><strong>MODELO DO PALETE:</strong></td>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${shipment.palletModel || 'PBR'} — ${formatCurrency(shipment.unitCost || PalletStorage.getUnitCost(shipment.palletModel))} / unidade</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; background: #f2f2f2;"><strong>VALOR TOTAL DOS PALETES:</strong></td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 14px; font-weight: 900; color: #108a00;">${formatCurrency(shipment.totalValue || (shipment.palletsCount || 1) * (shipment.unitCost || PalletStorage.getUnitCost(shipment.palletModel)))}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; background: #f2f2f2;"><strong>CONFERENTE DA EXPEDIÇÃO:</strong></td>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${shipment.checker}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; background: #f2f2f2;"><strong>QUANTIDADE TOTAL DE PALETES:</strong></td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 14px; font-weight: 900;">${shipment.palletsCount} VOLUME(S)</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; background: #f2f2f2;"><strong>DOCA / LOCAL DE SAÍDA:</strong></td>
            <td style="border: 1px solid #000; padding: 6px;">${shipment.dock}</td>
          </tr>
          ${shipment.notes ? `
          <tr>
            <td style="border: 1px solid #000; padding: 6px; background: #f2f2f2;"><strong>OBSERVAÇÕES:</strong></td>
            <td style="border: 1px solid #000; padding: 6px;">${shipment.notes}</td>
          </tr>` : ''}
        </table>

        <h3 style="font-size: 13px; text-transform: uppercase; margin-bottom: 6px;">Checklist de Volumes (Paletes Embarcados)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <thead>
            <tr style="background: #00427a; color: #fff;">
              <th style="border: 1px solid #00427a; padding: 6px; color: #fff;">Volume</th>
              <th style="border: 1px solid #00427a; padding: 6px; color: #fff;">Código Rastreável</th>
              <th style="border: 1px solid #00427a; padding: 6px; color: #fff;">Tipo</th>
              <th style="border: 1px solid #00427a; padding: 6px; color: #fff;">Conferência no Destino</th>
            </tr>
          </thead>
          <tbody>
            ${palletRows}
          </tbody>
        </table>

        ${photosSectionHtml}

        <div style="display: flex; justify-content: space-between; margin-top: 35px; gap: 20px;">
          <div style="flex: 1; border-top: 1px solid #000; text-align: center; padding-top: 4px; font-size: 11px;">
            <strong>${shipment.checker}</strong><br>
            Conferente da Expedição (CD)
          </div>
          <div style="flex: 1; border-top: 1px solid #000; text-align: center; padding-top: 4px; font-size: 11px;">
            <strong>Motorista / Transportador</strong><br>
            Placa: ${shipment.plate}
          </div>
          <div style="flex: 1; border-top: 1px solid #000; text-align: center; padding-top: 4px; font-size: 11px;">
            <strong>Recebedor na Loja Destino</strong><br>
            Nome / Matrícula
          </div>
        </div>
      </div>
    `;

    elements.printSandbox.innerHTML = manifestHtml;

    setTimeout(() => {
      window.print();
      showToast('Romaneio de Carga enviado para impressão!', 'success');
    }, 150);
  }

  // Tabela de Histórico
  function renderHistoryTable() {
    let shipments = PalletStorage.getShipments();

    // Filtros
    if (state.filterStore !== 'all') {
      shipments = shipments.filter(s => s.store === state.filterStore);
    }
    if (state.filterSearch) {
      shipments = shipments.filter(s => {
        return (s.id && s.id.toLowerCase().includes(state.filterSearch)) ||
               (s.store && s.store.toLowerCase().includes(state.filterSearch)) ||
               (s.checker && s.checker.toLowerCase().includes(state.filterSearch)) ||
               (s.plate && s.plate.toLowerCase().includes(state.filterSearch));
      });
    }

    elements.historyCountBadge.textContent = `${shipments.length} registro(s)`;

    if (shipments.length === 0) {
      elements.historyTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
            Nenhuma expedição encontrada no histórico.
          </td>
        </tr>
      `;
      return;
    }

    elements.historyTableBody.innerHTML = '';
    shipments.forEach(s => {
      const tr = document.createElement('tr');
      const statusClass = s.status === 'Entregue' ? 'status-entregue' : (s.status === 'Em Trânsito' ? 'status-transito' : 'status-expedido');
      const photoCount = (s.photos && s.photos.length) || 0;

      tr.innerHTML = `
        <td style="font-family: monospace; font-weight: 700;">${s.id}</td>
        <td>${s.dateFormatted || s.date}</td>
        <td style="font-weight: 700; color: #fff;">${s.store}</td>
        <td>
          <span style="background: rgba(37,99,235,0.2); color: #60a5fa; font-weight: 800; padding: 2px 8px; border-radius: 4px;">
            ${s.palletsCount} [${s.palletModel || 'PBR'}]
          </span>
          <div style="font-size: 0.75rem; color: #34d399; font-weight: 700; margin-top: 2px;">
            ${formatCurrency(s.totalValue || (s.palletsCount * PalletStorage.getUnitCost(s.palletModel)))}
          </div>
        </td>
        <td style="font-family: monospace; font-weight: 700;">${s.plate}</td>
        <td>${s.checker}</td>
        <td>
          <button type="button" class="btn btn-secondary btn-photos" style="padding: 0.3rem 0.65rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.4rem;" title="Ver e anexar fotos dos volumes">
            <span>📷</span>
            <span>Fotos</span>
            <span style="background: ${photoCount > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)'}; color: ${photoCount > 0 ? '#34d399' : '#94a3b8'}; padding: 1px 6px; border-radius: 10px; font-weight: 800; font-size: 0.75rem;">
              ${photoCount}
            </span>
          </button>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${s.status || 'Expedido'}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button type="button" class="btn btn-secondary btn-reprint" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" title="Reimprimir Etiquetas">
              🖨️ Etiquetas
            </button>
            <button type="button" class="btn btn-secondary btn-manifest" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" title="Imprimir Romaneio">
              📄 Romaneio
            </button>
            <button type="button" class="btn btn-danger btn-delete" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" title="Excluir">
              🗑️
            </button>
          </div>
        </td>
      `;

      // Ação de fotos
      tr.querySelector('.btn-photos').addEventListener('click', () => {
        openPhotosModal(s.id);
      });

      // Ações
      tr.querySelector('.btn-reprint').addEventListener('click', () => {
        reprintShipment(s);
      });

      tr.querySelector('.btn-manifest').addEventListener('click', () => {
        handlePrintManifest(s);
      });

      tr.querySelector('.btn-delete').addEventListener('click', () => {
        if (confirm(`Deseja realmente excluir o registro da expedição ${s.id}?`)) {
          PalletStorage.deleteShipment(s.id);
          renderHistoryTable();
          refreshKPIs();
          renderDashboard();
          showToast(`Expedição ${s.id} removida.`, 'info');
        }
      });

      elements.historyTableBody.appendChild(tr);
    });
  }

  // Reimprime uma remessa salva
  function reprintShipment(shipment) {
    state.currentShipment = shipment;
    state.generatedPallets = shipment.pallets;

    const format = elements.selectPrintFormat.value;
    document.body.className = `print-mode-${format}`;

    let printHtml = '';

    if (format === 'a4_double') {
      const pallets = shipment.pallets;
      for (let i = 0; i < pallets.length; i += 2) {
        const p1 = pallets[i];
        const p2 = pallets[i + 1];

        printHtml += `<div class="a4-sheet-container">`;
        printHtml += buildPalletLabelHtml(shipment, p1, i, true);

        if (p2) {
          printHtml += `<div class="a4-cut-line">✂️ CORTE AQUI — LINHA DIVISÓRIA DE ETIQUETAS A4 (2 POR FOLHA)</div>`;
          printHtml += buildPalletLabelHtml(shipment, p2, i + 1, true);
        } else {
          printHtml += `<div class="a4-cut-line" style="opacity: 0.3;">✂️ ESPAÇO RESERVADO PARA CORTE</div>`;
          printHtml += `<div style="height: 135mm; border: 1.5px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #777; font-size: 11pt; font-weight: bold; text-transform: uppercase;">[ Espaço Livre — Folha A4 com 1 Palete ]</div>`;
        }
        printHtml += `</div>`;
      }
    } else {
      shipment.pallets.forEach((pallet, idx) => {
        printHtml += buildPalletLabelHtml(shipment, pallet, idx, true);
      });
    }

    elements.printSandbox.innerHTML = printHtml;

    setTimeout(() => {
      window.print();
      const formatLabel = format === 'a4_double' ? '2 por folha A4' : (format === 'thermal' ? 'Térmica 100x150' : 'A4 Cheia');
      showToast(`Reimprimindo lote ${shipment.id} (${formatLabel})`, 'info');
    }, 150);
  }

  // Atualização dos KPIs
  function refreshKPIs() {
    const shipments = PalletStorage.getShipments();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    const todayShipments = shipments.filter(s => s.date === todayStr);

    let todayPallets = 0;
    todayShipments.forEach(s => {
      todayPallets += parseInt(s.palletsCount, 10) || 0;
    });

    const activeStoresSet = new Set(shipments.map(s => s.store));
    const inTransit = shipments.filter(s => s.status === 'Em Trânsito' || s.status === 'Expedido').length;

    elements.kpiTodayPallets.textContent = todayPallets;
    elements.kpiTodayShipments.textContent = todayShipments.length;
    elements.kpiActiveStores.textContent = activeStoresSet.size;
    elements.kpiInTransit.textContent = inTransit;
  }

  // Cadastro Rápido de Loja via Prompt
  function promptNewStore() {
    const name = prompt('Digite o nome da nova loja (ex: Loja 07 - Zona Leste):');
    if (!name || !name.trim()) return;
    const city = prompt('Cidade/Estado (opcional):') || 'São Paulo - SP';
    const dock = prompt('Doca padrão (opcional):') || 'Doca 01';

    PalletStorage.addStore({
      id: `LJ-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      city: city.trim(),
      doca: dock.trim()
    });

    loadStoresDropdown();
    renderStoresManager();
    // Seleciona a nova loja
    elements.selectStore.value = elements.selectStore.lastElementChild.value;
    updateDockFromStore();
    generateCurrentLabels(false);
    showToast(`Loja "${name}" cadastrada!`, 'success');
  }

  // Cadastro Rápido de Conferente via Prompt
  function promptNewChecker() {
    const name = prompt('Digite o nome completo do conferente:');
    if (!name || !name.trim()) return;

    PalletStorage.addChecker(name.trim());
    loadCheckersDropdown();
    renderCheckersManager();
    elements.selectChecker.value = name.trim();
    generateCurrentLabels(false);
    showToast(`Conferente "${name}" cadastrado!`, 'success');
  }

  // Gerenciador de Lojas (Tabela na Aba 3)
  function renderStoresManager() {
    const stores = PalletStorage.getStores();
    elements.storesTableBody.innerHTML = '';

    stores.forEach(st => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: monospace; font-weight: 700;">${st.id}</td>
        <td style="font-weight: 700; color: #fff;">${st.name}</td>
        <td>${st.city || '-'}</td>
        <td>${st.doca || '-'}</td>
        <td>
          <button type="button" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
            Remover
          </button>
        </td>
      `;

      tr.querySelector('button').addEventListener('click', () => {
        if (confirm(`Remover "${st.name}"?`)) {
          PalletStorage.deleteStore(st.id);
          loadStoresDropdown();
          renderStoresManager();
          showToast(`Loja removida.`, 'info');
        }
      });

      elements.storesTableBody.appendChild(tr);
    });
  }

  // Gerenciador de Conferentes (Lista na Aba 3)
  function renderCheckersManager() {
    const checkers = PalletStorage.getCheckers();
    elements.checkersList.innerHTML = '';

    checkers.forEach(name => {
      const item = document.createElement('div');
      item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);';
      item.innerHTML = `
        <span style="font-weight: 600;">${name}</span>
        <button type="button" class="btn btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Excluir</button>
      `;

      item.querySelector('button').addEventListener('click', () => {
        if (confirm(`Remover conferente "${name}"?`)) {
          PalletStorage.deleteChecker(name);
          loadCheckersDropdown();
          renderCheckersManager();
          showToast('Conferente removido.', 'info');
        }
      });

      elements.checkersList.appendChild(item);
    });
  }

  // === RENDERIZAÇÃO DO DASHBOARD EXECUTIVO & GRÁFICOS ===
  function renderDashboard() {
    const analytics = PalletStorage.getDashboardAnalytics();

    // 1. Banner de Patrimônio Total & Ticker Financeiro
    if (elements.dashBannerTotalVal) {
      elements.dashBannerTotalVal.textContent = analytics.balanceTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    const modelPrices = analytics.modelPrices || (PalletStorage.getModelPrices ? PalletStorage.getModelPrices() : { PBR: 89.90, Descartável: 59.90, CHEP: 100.90 });

    if (elements.dashBannerPalletsCount) {
      elements.dashBannerPalletsCount.textContent = `${analytics.currentBalanceTotal.toLocaleString('pt-BR')} unidades`;
    }
    if (elements.bannerPbrVal) {
      elements.bannerPbrVal.textContent = `${analytics.balanceByModel.PBR.toLocaleString('pt-BR')} un`;
    }
    if (elements.bannerPbrMoney) {
      elements.bannerPbrMoney.textContent = formatCurrency(analytics.balanceByModel.PBR * (modelPrices.PBR || 89.90));
    }
    if (elements.bannerDescVal) {
      elements.bannerDescVal.textContent = `${analytics.balanceByModel.Descartável.toLocaleString('pt-BR')} un`;
    }
    if (elements.bannerDescMoney) {
      elements.bannerDescMoney.textContent = formatCurrency(analytics.balanceByModel.Descartável * (modelPrices.Descartável || 59.90));
    }
    if (elements.bannerChepVal) {
      elements.bannerChepVal.textContent = `${analytics.balanceByModel.CHEP.toLocaleString('pt-BR')} un`;
    }
    if (elements.bannerChepMoney) {
      elements.bannerChepMoney.textContent = formatCurrency(analytics.balanceByModel.CHEP * (modelPrices.CHEP || 100.90));
    }

    // 2. Métricas Principais de Topo
    if (elements.dashBalanceTotal) {
      elements.dashBalanceTotal.textContent = analytics.currentBalanceTotal.toLocaleString('pt-BR');
    }
    if (elements.dashBalanceValue) {
      elements.dashBalanceValue.textContent = formatCurrency(analytics.balanceTotalValue);
    }
    if (elements.dashBalanceMiniBreakdown) {
      elements.dashBalanceMiniBreakdown.innerHTML = `
        <span>PBR: <strong style="color:#fbbf24;">${analytics.balanceByModel.PBR}</strong></span> • 
        <span>Desc: <strong style="color:#cbd5e1;">${analytics.balanceByModel.Descartável}</strong></span> • 
        <span>CHEP: <strong style="color:#60a5fa;">${analytics.balanceByModel.CHEP}</strong></span>
      `;
    }

    if (elements.dashExitsTotal) {
      elements.dashExitsTotal.textContent = analytics.totalExits.toLocaleString('pt-BR');
    }
    if (elements.dashExitsValue) {
      elements.dashExitsValue.textContent = formatCurrency(analytics.exitsTotalValue);
    }

    if (elements.dashEntriesTotal) {
      elements.dashEntriesTotal.textContent = analytics.totalEntries.toLocaleString('pt-BR');
    }
    if (elements.dashEntriesValue) {
      elements.dashEntriesValue.textContent = formatCurrency(analytics.entriesTotalValue);
    }
    if (elements.dashReturnRateBadge) {
      const returnRate = analytics.totalExits > 0
        ? Math.round((analytics.totalEntries / analytics.totalExits) * 100)
        : 100;
      elements.dashReturnRateBadge.innerHTML = `● Taxa de Retorno das Lojas: <strong>${returnRate}%</strong>`;
    }

    // 3. Renderização dos 5 Gráficos Modernos Chart.js
    renderFlowTimelineChart(analytics);
    renderModelsDoughnutChart(analytics);
    renderVehiclesBarChart(analytics);
    renderStoresBarChart(analytics);
    renderAuditGaugeChart(analytics);

    // 4. Modelos de Palete (PBR, Descartável, CHEP)
    // PBR
    if (elements.modelPbrStock) {
      elements.modelPbrStock.textContent = `${analytics.balanceByModel.PBR.toLocaleString('pt-BR')} un`;
    }
    if (elements.modelPbrVal) {
      elements.modelPbrVal.textContent = formatCurrency(analytics.balanceByModel.PBR * (modelPrices.PBR || 89.90));
    }
    if (elements.modelPbrIn) {
      elements.modelPbrIn.textContent = `+${analytics.entriesByModel.PBR} un`;
    }
    if (elements.modelPbrOut) {
      elements.modelPbrOut.textContent = `-${analytics.exitsByModel.PBR} un`;
    }

    // Descartável
    if (elements.modelDescStock) {
      elements.modelDescStock.textContent = `${analytics.balanceByModel.Descartável.toLocaleString('pt-BR')} un`;
    }
    if (elements.modelDescVal) {
      elements.modelDescVal.textContent = formatCurrency(analytics.balanceByModel.Descartável * (modelPrices.Descartável || 59.90));
    }
    if (elements.modelDescIn) {
      elements.modelDescIn.textContent = `+${analytics.entriesByModel.Descartável} un`;
    }
    if (elements.modelDescOut) {
      elements.modelDescOut.textContent = `-${analytics.exitsByModel.Descartável} un`;
    }

    // CHEP
    if (elements.modelChepStock) {
      elements.modelChepStock.textContent = `${analytics.balanceByModel.CHEP.toLocaleString('pt-BR')} un`;
    }
    if (elements.modelChepVal) {
      elements.modelChepVal.textContent = formatCurrency(analytics.balanceByModel.CHEP * (modelPrices.CHEP || 100.90));
    }
    if (elements.modelChepIn) {
      elements.modelChepIn.textContent = `+${analytics.entriesByModel.CHEP} un`;
    }
    if (elements.modelChepOut) {
      elements.modelChepOut.textContent = `-${analytics.exitsByModel.CHEP} un`;
    }

    // 5. Barra de Distribuição de Estoque
    const totalBal = analytics.currentBalanceTotal || 1;
    const pctPbr = Math.round((analytics.balanceByModel.PBR / totalBal) * 100);
    const pctDesc = Math.round((analytics.balanceByModel.Descartável / totalBal) * 100);
    const pctChep = Math.max(0, 100 - pctPbr - pctDesc);

    if (elements.barSegPbr) elements.barSegPbr.style.width = `${pctPbr}%`;
    if (elements.barSegDesc) elements.barSegDesc.style.width = `${pctDesc}%`;
    if (elements.barSegChep) elements.barSegChep.style.width = `${pctChep}%`;

    if (elements.stockDistLabels) {
      elements.stockDistLabels.innerHTML = `
        <span><span style="color: #f59e0b;">●</span> PBR: ${pctPbr}% (${analytics.balanceByModel.PBR} un)</span>
        <span><span style="color: #94a3b8;">●</span> Descartável: ${pctDesc}% (${analytics.balanceByModel.Descartável} un)</span>
        <span><span style="color: #3b82f6;">●</span> CHEP: ${pctChep}% (${analytics.balanceByModel.CHEP} un)</span>
      `;
    }

    // 6. Indicadores de Auditoria / Conferência
    if (elements.auditRateDisplay) {
      elements.auditRateDisplay.textContent = `${analytics.auditIndicators.rate}%`;
    }
    if (elements.auditTotalPallets) {
      elements.auditTotalPallets.textContent = `${analytics.auditIndicators.totalPallets.toLocaleString('pt-BR')} un`;
    }
    if (elements.auditTotalVal) {
      elements.auditTotalVal.textContent = formatCurrency(analytics.auditIndicators.totalValue || analytics.auditIndicators.totalPallets * (modelPrices.PBR || 89.90));
    }
    if (elements.auditConferredCount) {
      elements.auditConferredCount.textContent = `${analytics.auditIndicators.conferred.toLocaleString('pt-BR')} un`;
    }
    if (elements.auditTransitCount) {
      elements.auditTransitCount.textContent = `${analytics.auditIndicators.inTransit.toLocaleString('pt-BR')} un`;
    }
    if (elements.auditShippedCount) {
      elements.auditShippedCount.textContent = `${analytics.auditIndicators.shipped.toLocaleString('pt-BR')} un`;
    }

    // 7. Entregas por Veículo (Tabela Detalhada)
    if (elements.vehicleDeliveriesTbody) {
      elements.vehicleDeliveriesTbody.innerHTML = '';
      if (!analytics.vehicleDeliveries || analytics.vehicleDeliveries.length === 0) {
        elements.vehicleDeliveriesTbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
              Nenhuma entrega realizada por veículo até o momento.
            </td>
          </tr>
        `;
      } else {
        analytics.vehicleDeliveries.forEach(v => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-family: monospace; font-weight: 700; color: #60a5fa;">${v.plate}</td>
            <td style="text-align: center; font-weight: 600;">${v.trips}</td>
            <td style="text-align: right; font-weight: 700; color: #fff;">${v.pallets.toLocaleString('pt-BR')} un</td>
            <td style="text-align: right; font-weight: 700; color: #34d399;">${formatCurrency(v.value)}</td>
            <td style="text-align: center;">
              <span class="status-badge status-entregue">Ativo</span>
            </td>
          `;
          elements.vehicleDeliveriesTbody.appendChild(tr);
        });
      }
    }

    // 8. Tabela de Entradas Recentes
    if (elements.entriesTableTbody) {
      const entries = PalletStorage.getEntries();
      elements.entriesTableTbody.innerHTML = '';
      if (!entries || entries.length === 0) {
        elements.entriesTableTbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
              Nenhum retorno ou entrada registrada.
            </td>
          </tr>
        `;
      } else {
        entries.forEach(e => {
          const tr = document.createElement('tr');
          const modelClass = (e.model || 'PBR').toLowerCase() === 'descartável' ? 'desc' : (e.model || 'PBR').toLowerCase();
          const eCount = parseInt(e.count, 10) || 0;
          const eVal = eCount * (modelPrices[e.model] || modelPrices.PBR);

          tr.innerHTML = `
            <td style="font-family: monospace; font-weight: 700; color: #3b82f6;">${e.id}</td>
            <td>${e.dateFormatted || e.date}</td>
            <td style="font-weight: 600; color: #fff;">${e.storeOrigin || e.origin || '-'}</td>
            <td><span class="lbl-model-badge model-${modelClass}">${e.model || 'PBR'}</span></td>
            <td style="text-align: right; font-weight: 700;">${eCount} un</td>
            <td style="text-align: right; color: #34d399; font-weight: 700;">${formatCurrency(eVal)}</td>
            <td style="font-family: monospace;">${e.plate || '-'}</td>
            <td>
              <button type="button" class="btn btn-danger btn-sm" data-id="${e.id}" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                Excluir
              </button>
            </td>
          `;

          tr.querySelector('button').addEventListener('click', () => {
            if (confirm(`Remover entrada ${e.id}?`)) {
              PalletStorage.deleteEntry(e.id);
              renderDashboard();
              refreshKPIs();
              showToast('Entrada removida com sucesso.', 'info');
            }
          });

          elements.entriesTableTbody.appendChild(tr);
        });
      }
    }
  }

  // === FUNÇÕES DOS GRÁFICOS CHART.JS ===

  // 1. Gráfico de Linha/Área Temporal (Fluxo Diário)
  function renderFlowTimelineChart(analytics) {
    const canvas = document.getElementById('chart-flow-timeline');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const isCurrency = state.dashboardViewMode === 'currency';
    const unitCost = analytics.unitCost;

    const labels = analytics.timeline.map(t => t.label);
    const exitsData = analytics.timeline.map(t => isCurrency ? (t.exits * unitCost) : t.exits);
    const entriesData = analytics.timeline.map(t => isCurrency ? (t.entries * unitCost) : t.entries);

    // Gradientes luminosos Beira Rio (Vermelho Saídas, Verde/Esmeralda Entradas)
    const gradRed = ctx.createLinearGradient(0, 0, 0, 260);
    gradRed.addColorStop(0, 'rgba(235, 28, 37, 0.45)');
    gradRed.addColorStop(1, 'rgba(235, 28, 37, 0.0)');

    const gradGreen = ctx.createLinearGradient(0, 0, 0, 260);
    gradGreen.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradGreen.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    if (chartInstances.flowTimeline) {
      chartInstances.flowTimeline.destroy();
    }

    chartInstances.flowTimeline = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: isCurrency ? 'Saídas (R$)' : 'Saídas / Expedições (un)',
            data: exitsData,
            borderColor: '#eb1c25',
            backgroundColor: gradRed,
            borderWidth: 3,
            tension: 0.38,
            fill: true,
            pointBackgroundColor: '#eb1c25',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          },
          {
            label: isCurrency ? 'Entradas (R$)' : 'Entradas / Retornos (un)',
            data: entriesData,
            borderColor: '#10b981',
            backgroundColor: gradGreen,
            borderWidth: 3,
            tension: 0.38,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#cbd5e1',
              font: { weight: 'bold', size: 12 },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(235, 28, 37, 0.4)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            callbacks: {
              label: function (ctx) {
                const raw = ctx.raw || 0;
                if (isCurrency) {
                  return ` ${ctx.dataset.label}: ${formatCurrency(raw)}`;
                } else {
                  return ` ${ctx.dataset.label}: ${raw} un (${formatCurrency(raw * unitCost)})`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: { weight: '600' }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: { weight: '600' },
              callback: function (val) {
                return isCurrency ? 'R$ ' + val.toLocaleString('pt-BR') : val + ' un';
              }
            }
          }
        }
      }
    });
  }

  // 2. Gráfico de Rosca (Composição por Modelo)
  function renderModelsDoughnutChart(analytics) {
    const canvas = document.getElementById('chart-models-doughnut');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const pbr = analytics.balanceByModel.PBR || 0;
    const desc = analytics.balanceByModel.Descartável || 0;
    const chep = analytics.balanceByModel.CHEP || 0;
    const total = pbr + desc + chep || 1;

    if (elements.doughnutTotalPallets) {
      elements.doughnutTotalPallets.textContent = total.toLocaleString('pt-BR');
    }

    const modelPrices = analytics.modelPrices || (PalletStorage.getModelPrices ? PalletStorage.getModelPrices() : { PBR: 89.90, Descartável: 59.90, CHEP: 100.90 });

    // Renderiza Legenda Customizada
    if (elements.doughnutLegendContainer) {
      const pbrPct = Math.round((pbr / total) * 100);
      const descPct = Math.round((desc / total) * 100);
      const chepPct = Math.max(0, 100 - pbrPct - descPct);

      elements.doughnutLegendContainer.innerHTML = `
        <div class="doughnut-legend-row">
          <div class="doughnut-legend-label">
            <span style="color:#f59e0b; font-size:1.1rem;">●</span>
            <span>Palete PBR</span>
          </div>
          <div class="doughnut-legend-val">
            ${pbrPct}% <span style="color:var(--text-secondary); font-weight:normal;">(${pbr} un • ${formatCurrency(pbr * (modelPrices.PBR || 89.90))})</span>
          </div>
        </div>
        <div class="doughnut-legend-row">
          <div class="doughnut-legend-label">
            <span style="color:#94a3b8; font-size:1.1rem;">●</span>
            <span>Descartável</span>
          </div>
          <div class="doughnut-legend-val">
            ${descPct}% <span style="color:var(--text-secondary); font-weight:normal;">(${desc} un • ${formatCurrency(desc * (modelPrices.Descartável || 59.90))})</span>
          </div>
        </div>
        <div class="doughnut-legend-row">
          <div class="doughnut-legend-label">
            <span style="color:#2563eb; font-size:1.1rem;">●</span>
            <span>Palete CHEP</span>
          </div>
          <div class="doughnut-legend-val">
            ${chepPct}% <span style="color:var(--text-secondary); font-weight:normal;">(${chep} un • ${formatCurrency(chep * (modelPrices.CHEP || 100.90))})</span>
          </div>
        </div>
      `;
    }

    if (chartInstances.modelsDoughnut) {
      chartInstances.modelsDoughnut.destroy();
    }

    chartInstances.modelsDoughnut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Palete PBR', 'Descartável', 'Palete CHEP'],
        datasets: [{
          data: [pbr, desc, chep],
          backgroundColor: ['#f59e0b', '#94a3b8', '#2563eb'],
          borderColor: '#0f172a',
          borderWidth: 4,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: '70%',
        animation: {
          duration: 400
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            callbacks: {
              label: function (ctx) {
                const val = ctx.raw || 0;
                const pct = Math.round((val / total) * 100);
                const label = ctx.label || '';
                const mCost = label.includes('CHEP') ? (modelPrices.CHEP || 100.90) : (label.includes('Descartável') ? (modelPrices.Descartável || 59.90) : (modelPrices.PBR || 89.90));
                return ` ${val} un (${pct}%) • ${formatCurrency(val * mCost)}`;
              }
            }
          }
        }
      }
    });
  }

  // 3. Gráfico de Barras Horizontais (Ranking de Veículos)
  function renderVehiclesBarChart(analytics) {
    const canvas = document.getElementById('chart-vehicles-bar');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const topVehicles = (analytics.vehicleDeliveries || []).slice(0, 6);

    const labels = topVehicles.map(v => v.plate);
    const data = topVehicles.map(v => v.pallets);

    if (chartInstances.vehiclesBar) {
      chartInstances.vehiclesBar.destroy();
    }

    chartInstances.vehiclesBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Paletes Transportados',
          data: data,
          backgroundColor: '#00427a',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            callbacks: {
              label: function (ctx) {
                const item = topVehicles[ctx.dataIndex];
                if (!item) return '';
                return ` ${item.pallets} paletes (${item.trips} viagens) • ${formatCurrency(item.value)}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: '#fff',
              font: { weight: 'bold', family: 'Consolas, monospace' }
            }
          }
        }
      }
    });
  }

  // 4. Gráfico de Barras Verticais (Distribuição por Loja)
  function renderStoresBarChart(analytics) {
    const canvas = document.getElementById('chart-stores-bar');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const topStores = (analytics.storesDistribution || []).slice(0, 5);

    const labels = topStores.map(s => s.store);
    const data = topStores.map(s => s.pallets);

    if (chartInstances.storesBar) {
      chartInstances.storesBar.destroy();
    }

    chartInstances.storesBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Paletes Recebidos',
          data: data,
          backgroundColor: '#8b5cf6',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            callbacks: {
              title: function (items) {
                const idx = items[0].dataIndex;
                return topStores[idx]?.fullName || items[0].label;
              },
              label: function (ctx) {
                const s = topStores[ctx.dataIndex];
                if (!s) return '';
                return ` ${s.pallets} paletes transferidos • ${formatCurrency(s.value)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { weight: '600' } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  // 5. Gráfico Semi-Doughnut / Gauge (Auditoria de Conferência)
  function renderAuditGaugeChart(analytics) {
    const canvas = document.getElementById('chart-audit-gauge');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const conferred = analytics.auditIndicators.conferred || 0;
    const inTransit = analytics.auditIndicators.inTransit || 0;
    const shipped = analytics.auditIndicators.shipped || 0;

    if (chartInstances.auditGauge) {
      chartInstances.auditGauge.destroy();
    }

    chartInstances.auditGauge = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Conferidos', 'Em Trânsito', 'Expedidos Doca'],
        datasets: [{
          data: [conferred, inTransit, shipped],
          backgroundColor: ['#10b981', '#fbbf24', '#3b82f6'],
          borderColor: '#0f172a',
          borderWidth: 3,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: '74%',
        animation: {
          duration: 400
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            callbacks: {
              label: function (ctx) {
                const val = ctx.raw || 0;
                return ` ${val} paletes (${formatCurrency(val * analytics.unitCost)})`;
              }
            }
          }
        }
      }
    });
  }

  // Sistema de Notificações Toast
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : (type === 'error' ? '❌' : 'ℹ️'));
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Executar ao carregar DOM
  document.addEventListener('DOMContentLoaded', init);
})();
