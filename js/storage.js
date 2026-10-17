/**
 * Camada de Armazenamento Local e Gestão de Dados
 * Gerencia Lojas, Conferentes, Expedições e Configurações de Impressão.
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    STORES: 'pallet_control_stores_v1',
    CHECKERS: 'pallet_control_checkers_v1',
    SHIPMENTS: 'pallet_control_shipments_v1',
    SETTINGS: 'pallet_control_settings_v1',
    ENTRIES: 'pallet_control_entries_v1',
    INITIAL_STOCK: 'pallet_control_initial_stock_v1'
  };

  // Tabela oficial de preços homologados por modelo de palete
  const PALLET_PRICES = {
    PBR: 89.90,          // R$ 89,90 (Padrão Brasil)
    Descartável: 59.90,  // R$ 59,90 (One-Way)
    CHEP: 100.90         // R$ 100,90 (Palete Azul Pooler)
  };

  const PALLET_UNIT_COST = PALLET_PRICES.PBR; // Referencial padrão (R$ 89,90)

  const DEFAULT_INITIAL_STOCK = {
    PBR: 450,
    Descartável: 180,
    CHEP: 220
  };

  const DEFAULT_ENTRIES = [
    {
      id: 'ENT-20261017-001',
      date: '2026-10-17',
      dateFormatted: '17/10/2026',
      time: '10:15',
      storeOrigin: 'Loja 02 - Shopping Iguatemi',
      count: 20,
      model: 'PBR',
      plate: 'MER2026',
      checker: 'Carlos Eduardo Silva',
      type: 'Retorno de Loja',
      notes: 'Retorno matinal de paletes PBR vazios'
    },
    {
      id: 'ENT-20261016-001',
      date: '2026-10-16',
      dateFormatted: '16/10/2026',
      time: '10:30',
      storeOrigin: 'Loja 01 - Matriz Centro',
      count: 24,
      model: 'PBR',
      plate: 'BRA2E19',
      checker: 'Carlos Eduardo Silva',
      type: 'Retorno de Loja',
      notes: 'Paletes vazios devolvidos após descarregamento'
    },
    {
      id: 'ENT-20261016-002',
      date: '2026-10-16',
      dateFormatted: '16/10/2026',
      time: '15:45',
      storeOrigin: 'Loja 02 - Shopping Iguatemi',
      count: 12,
      model: 'CHEP',
      plate: 'ABC-1234',
      checker: 'Marcos Vinícius Santos',
      type: 'Retorno de Loja',
      notes: 'Paletes azuis CHEP conferidos na doca'
    },
    {
      id: 'ENT-20261015-001',
      date: '2026-10-15',
      dateFormatted: '15/10/2026',
      time: '11:00',
      storeOrigin: 'Loja 05 - Filial Ribeirão',
      count: 22,
      model: 'PBR',
      plate: 'SPX-4411',
      checker: 'Roberto Lima',
      type: 'Retorno de Loja',
      notes: 'Devolução de carreta'
    },
    {
      id: 'ENT-20261014-001',
      date: '2026-10-14',
      dateFormatted: '14/10/2026',
      time: '16:20',
      storeOrigin: 'Loja 03 - Hipermercado Sul',
      count: 16,
      model: 'Descartável',
      plate: 'ABC-1234',
      checker: 'Marcos Vinícius Santos',
      type: 'Retorno de Loja',
      notes: 'Paletes leves inspecionados'
    },
    {
      id: 'ENT-20261013-001',
      date: '2026-10-13',
      dateFormatted: '13/10/2026',
      time: '14:30',
      storeOrigin: 'Loja 01 - Matriz Centro',
      count: 18,
      model: 'CHEP',
      plate: 'BRA2E19',
      checker: 'Fernanda Alcantara',
      type: 'Retorno de Loja',
      notes: 'Devolução regular de pooler CHEP'
    }
  ];

  const DEFAULT_SHIPMENTS = [
    {
      id: 'EXP-20261017-001',
      date: '2026-10-17',
      dateFormatted: '17/10/2026',
      time: '08:30',
      store: 'Loja 01 - Matriz Centro',
      storeCity: 'São Paulo - SP',
      palletModel: 'PBR',
      palletsCount: 16,
      unitCost: 89.90,
      totalValue: 1438.40,
      checker: 'Carlos Eduardo Silva',
      plate: 'BRA2E19',
      dock: 'Doca 01',
      status: 'Expedido',
      notes: 'Transferência de reposição matinal'
    },
    {
      id: 'EXP-20261017-002',
      date: '2026-10-17',
      dateFormatted: '17/10/2026',
      time: '11:15',
      store: 'Loja 03 - Hipermercado Sul',
      storeCity: 'Santos - SP',
      palletModel: 'CHEP',
      palletsCount: 10,
      unitCost: 100.90,
      totalValue: 1009.00,
      checker: 'Ana Paula Ferreira',
      plate: 'MER2026',
      dock: 'Doca 02',
      status: 'Em Trânsito',
      notes: 'Paletes azuis CHEP com lacre de segurança'
    },
    {
      id: 'EXP-20261016-001',
      date: '2026-10-16',
      dateFormatted: '16/10/2026',
      time: '09:00',
      store: 'Loja 02 - Shopping Iguatemi',
      storeCity: 'Campinas - SP',
      palletModel: 'PBR',
      palletsCount: 22,
      unitCost: 89.90,
      totalValue: 1977.80,
      checker: 'Marcos Vinícius Santos',
      plate: 'ABC-1234',
      dock: 'Doca 03',
      status: 'Conferido',
      notes: 'Entrega conferida e recebida sem avarias'
    },
    {
      id: 'EXP-20261016-002',
      date: '2026-10-16',
      dateFormatted: '16/10/2026',
      time: '14:20',
      store: 'Loja 04 - Centro de Distribuição',
      storeCity: 'Jundiaí - SP',
      palletModel: 'Descartável',
      palletsCount: 14,
      unitCost: 59.90,
      totalValue: 838.60,
      checker: 'Carlos Eduardo Silva',
      plate: 'LOG-9870',
      dock: 'Doca 05',
      status: 'Conferido',
      notes: 'Paletes descartáveis one-way'
    },
    {
      id: 'EXP-20261015-001',
      date: '2026-10-15',
      dateFormatted: '15/10/2026',
      time: '10:00',
      store: 'Loja 05 - Filial Ribeirão',
      storeCity: 'Ribeirão Preto - SP',
      palletModel: 'PBR',
      palletsCount: 26,
      unitCost: 89.90,
      totalValue: 2337.40,
      checker: 'Roberto Lima',
      plate: 'SPX-4411',
      dock: 'Doca 04',
      status: 'Conferido',
      notes: 'Carreta cheia'
    },
    {
      id: 'EXP-20261015-002',
      date: '2026-10-15',
      dateFormatted: '15/10/2026',
      time: '16:45',
      store: 'Loja 01 - Matriz Centro',
      storeCity: 'São Paulo - SP',
      palletModel: 'CHEP',
      palletsCount: 18,
      unitCost: 100.90,
      totalValue: 1816.20,
      checker: 'Fernanda Alcantara',
      plate: 'BRA2E19',
      dock: 'Doca 01',
      status: 'Conferido',
      notes: 'Auditoria 100% OK'
    },
    {
      id: 'EXP-20261014-001',
      date: '2026-10-14',
      dateFormatted: '14/10/2026',
      time: '08:40',
      store: 'Loja 03 - Hipermercado Sul',
      storeCity: 'Santos - SP',
      palletModel: 'Descartável',
      palletsCount: 20,
      unitCost: 59.90,
      totalValue: 1198.00,
      checker: 'Marcos Vinícius Santos',
      plate: 'ABC-1234',
      dock: 'Doca 02',
      status: 'Conferido',
      notes: 'Expedição com filme stretch duplo'
    },
    {
      id: 'EXP-20261013-001',
      date: '2026-10-13',
      dateFormatted: '13/10/2026',
      time: '13:10',
      store: 'Loja 02 - Shopping Iguatemi',
      storeCity: 'Campinas - SP',
      palletModel: 'PBR',
      palletsCount: 24,
      unitCost: 89.90,
      totalValue: 2157.60,
      checker: 'Carlos Eduardo Silva',
      plate: 'MER2026',
      dock: 'Doca 03',
      status: 'Conferido',
      notes: 'Transferência finalizada'
    }
  ];

  const DEFAULT_STORES = [
    { id: 'LJ-01', name: 'Loja 01 - Matriz Centro', city: 'São Paulo - SP', doca: 'Doca 01' },
    { id: 'LJ-02', name: 'Loja 02 - Shopping Iguatemi', city: 'Campinas - SP', doca: 'Doca 03' },
    { id: 'LJ-03', name: 'Loja 03 - Hipermercado Sul', city: 'Santos - SP', doca: 'Doca 02' },
    { id: 'LJ-04', name: 'Loja 04 - Centro de Distribuição', city: 'Jundiaí - SP', doca: 'Doca 05' },
    { id: 'LJ-05', name: 'Loja 05 - Filial Ribeirão', city: 'Ribeirão Preto - SP', doca: 'Doca 04' }
  ];

  const DEFAULT_CHECKERS = [
    'Carlos Eduardo Silva',
    'Marcos Vinícius Santos',
    'Ana Paula Ferreira',
    'Roberto Lima',
    'Fernanda Alcantara'
  ];

  const DEFAULT_SETTINGS = {
    labelFormat: 'a4_double', // 'a4_double', 'thermal', 'a4_single'
    companyName: 'CENTRO DE DISTRIBUIÇÃO & LOGÍSTICA',
    palletUnitCost: 89.90,
    palletPrices: { ...PALLET_PRICES },
    showBarcode: true,
    showQrCode: true,
    showSignatures: true,
    autoIncrementBatch: true
  };

  const Storage = {
    // === LOJAS ===
    getStores: function () {
      const data = localStorage.getItem(STORAGE_KEYS.STORES);
      if (!data) {
        this.saveStores(DEFAULT_STORES);
        return [...DEFAULT_STORES];
      }
      try {
        return JSON.parse(data);
      } catch (e) {
        return [...DEFAULT_STORES];
      }
    },

    saveStores: function (stores) {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    },

    addStore: function (store) {
      const stores = this.getStores();
      stores.push(store);
      this.saveStores(stores);
      return stores;
    },

    deleteStore: function (id) {
      let stores = this.getStores();
      stores = stores.filter(s => s.id !== id);
      this.saveStores(stores);
      return stores;
    },

    // === CONFERENTES ===
    getCheckers: function () {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKERS);
      if (!data) {
        this.saveCheckers(DEFAULT_CHECKERS);
        return [...DEFAULT_CHECKERS];
      }
      try {
        return JSON.parse(data);
      } catch (e) {
        return [...DEFAULT_CHECKERS];
      }
    },

    saveCheckers: function (checkers) {
      localStorage.setItem(STORAGE_KEYS.CHECKERS, JSON.stringify(checkers));
    },

    addChecker: function (name) {
      const trimmed = name.trim();
      if (!trimmed) return this.getCheckers();
      const checkers = this.getCheckers();
      if (!checkers.includes(trimmed)) {
        checkers.push(trimmed);
        this.saveCheckers(checkers);
      }
      return checkers;
    },

    deleteChecker: function (name) {
      let checkers = this.getCheckers();
      checkers = checkers.filter(c => c !== name);
      this.saveCheckers(checkers);
      return checkers;
    },

    // === EXPEDIÇÕES (SHIPMENTS) ===
    getShipments: function () {
      const data = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
      if (!data) {
        this.saveShipments(DEFAULT_SHIPMENTS);
        return [...DEFAULT_SHIPMENTS];
      }

      try {
        const parsed = JSON.parse(data);
        if (!parsed || parsed.length === 0) {
          this.saveShipments(DEFAULT_SHIPMENTS);
          return [...DEFAULT_SHIPMENTS];
        }

        // Auto-migra remessas salvas em versões anteriores para a nova tabela de preços
        let updated = false;
        const normalized = parsed.map(s => {
          const model = s.palletModel || 'PBR';
          const expectedPrice = PALLET_PRICES[model] || PALLET_PRICES.PBR;
          if (model !== 'PBR' && s.unitCost === 89.90) {
            s.unitCost = expectedPrice;
            s.totalValue = (parseInt(s.palletsCount, 10) || 1) * expectedPrice;
            updated = true;
          }
          return s;
        });
        if (updated) {
          this.saveShipments(normalized);
        }
        return normalized;
      } catch (e) {
        return [...DEFAULT_SHIPMENTS];
      }
    },

    saveShipments: function (shipments) {
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
    },

    saveShipment: function (shipment) {
      const shipments = this.getShipments();
      const existingIndex = shipments.findIndex(s => s.id === shipment.id);
      if (existingIndex >= 0) {
        shipments[existingIndex] = shipment;
      } else {
        shipments.unshift(shipment); // Mais recente no topo
      }
      this.saveShipments(shipments);
      return shipment;
    },

    getShipmentById: function (id) {
      const shipments = this.getShipments();
      return shipments.find(s => s.id === id) || null;
    },

    updateShipmentStatus: function (id, status) {
      const shipments = this.getShipments();
      const target = shipments.find(s => s.id === id);
      if (target) {
        target.status = status;
        this.saveShipments(shipments);
        return target;
      }
      return null;
    },

    deleteShipment: function (id) {
      let shipments = this.getShipments();
      shipments = shipments.filter(s => s.id !== id);
      this.saveShipments(shipments);
      return shipments;
    },

    // === FOTOS DOS VOLUMES CARREGADOS ===
    getShipmentPhotos: function (shipmentId) {
      const shipment = this.getShipmentById(shipmentId);
      return (shipment && shipment.photos) ? shipment.photos : [];
    },

    addShipmentPhoto: function (shipmentId, photoData) {
      const shipments = this.getShipments();
      const target = shipments.find(s => s.id === shipmentId);
      if (target) {
        if (!target.photos) target.photos = [];
        const newPhoto = {
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          dataUrl: photoData.dataUrl,
          name: photoData.name || 'Volume Carregado',
          createdAt: new Date().toISOString(),
          timeFormatted: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        target.photos.push(newPhoto);
        this.saveShipments(shipments);
        return newPhoto;
      }
      return null;
    },

    deleteShipmentPhoto: function (shipmentId, photoId) {
      const shipments = this.getShipments();
      const target = shipments.find(s => s.id === shipmentId);
      if (target && target.photos) {
        target.photos = target.photos.filter(p => p.id !== photoId);
        this.saveShipments(shipments);
        return true;
      }
      return false;
    },

    // === CONFIGURAÇÕES ===
    getSettings: function () {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return { ...DEFAULT_SETTINGS };
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      } catch (e) {
        return { ...DEFAULT_SETTINGS };
      }
    },

    saveSettings: function (settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    // === GERADOR DE CÓDIGO SEQUENCIAL DE EXPEDIÇÃO ===
    getNextBatchNumber: function () {
      const shipments = this.getShipments();
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const datePrefix = `${y}${m}${d}`;

      const todayShipments = shipments.filter(s => s.id && s.id.startsWith(`EXP-${datePrefix}`));
      const nextSeq = String(todayShipments.length + 1).padStart(3, '0');
      return `EXP-${datePrefix}-${nextSeq}`;
    },

    // === ENTRADAS E SALDO DE PALETES ===
    getUnitCost: function (model) {
      if (model && PALLET_PRICES[model] !== undefined) {
        return PALLET_PRICES[model];
      }
      return PALLET_UNIT_COST; // R$ 89,90 padrão
    },

    getModelPrices: function () {
      return { ...PALLET_PRICES };
    },

    getInitialStock: function () {
      const data = localStorage.getItem(STORAGE_KEYS.INITIAL_STOCK);
      if (!data) return { ...DEFAULT_INITIAL_STOCK };
      try {
        return { ...DEFAULT_INITIAL_STOCK, ...JSON.parse(data) };
      } catch (e) {
        return { ...DEFAULT_INITIAL_STOCK };
      }
    },

    saveInitialStock: function (stock) {
      localStorage.setItem(STORAGE_KEYS.INITIAL_STOCK, JSON.stringify(stock));
    },

    getEntries: function () {
      const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (!data) {
        this.saveEntries(DEFAULT_ENTRIES);
        return [...DEFAULT_ENTRIES];
      }
      try {
        return JSON.parse(data);
      } catch (e) {
        return [...DEFAULT_ENTRIES];
      }
    },

    saveEntries: function (entries) {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    },

    addEntry: function (entry) {
      const entries = this.getEntries();
      entries.unshift(entry);
      this.saveEntries(entries);
      return entry;
    },

    deleteEntry: function (id) {
      let entries = this.getEntries();
      entries = entries.filter(e => e.id !== id);
      this.saveEntries(entries);
      return entries;
    },

    getNextEntryNumber: function () {
      const entries = this.getEntries();
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const datePrefix = `${y}${m}${d}`;
      const todayEntries = entries.filter(e => e.id && e.id.startsWith(`ENT-${datePrefix}`));
      const nextSeq = String(todayEntries.length + 1).padStart(3, '0');
      return `ENT-${datePrefix}-${nextSeq}`;
    },

    // === ANALÍTICA DO DASHBOARD ===
    getDashboardAnalytics: function () {
      const initialStock = this.getInitialStock();
      const shipments = this.getShipments();
      const entries = this.getEntries();
      const unitCost = this.getUnitCost(); // R$ 89,90 referencial

      // Saídas por modelo e valor financeiro total
      const exitsByModel = { PBR: 0, Descartável: 0, CHEP: 0 };
      let totalExits = 0;
      let exitsTotalValue = 0;

      shipments.forEach(s => {
        const count = parseInt(s.palletsCount, 10) || 0;
        const model = s.palletModel || 'PBR';
        const cost = s.unitCost || this.getUnitCost(model);
        if (exitsByModel[model] !== undefined) {
          exitsByModel[model] += count;
        } else {
          exitsByModel['PBR'] += count;
        }
        totalExits += count;
        exitsTotalValue += count * cost;
      });

      // Entradas por modelo e valor financeiro total
      const entriesByModel = { PBR: 0, Descartável: 0, CHEP: 0 };
      let totalEntries = 0;
      let entriesTotalValue = 0;

      entries.forEach(e => {
        const count = parseInt(e.count, 10) || 0;
        const model = e.model || 'PBR';
        const cost = this.getUnitCost(model);
        if (entriesByModel[model] !== undefined) {
          entriesByModel[model] += count;
        } else {
          entriesByModel['PBR'] += count;
        }
        totalEntries += count;
        entriesTotalValue += count * cost;
      });

      // Saldo Atual por modelo: Inicial + Entradas - Saídas
      const balanceByModel = {
        PBR: Math.max(0, (initialStock.PBR || 0) + entriesByModel.PBR - exitsByModel.PBR),
        Descartável: Math.max(0, (initialStock.Descartável || 0) + entriesByModel.Descartável - exitsByModel.Descartável),
        CHEP: Math.max(0, (initialStock.CHEP || 0) + entriesByModel.CHEP - exitsByModel.CHEP)
      };

      const currentBalanceTotal = balanceByModel.PBR + balanceByModel.Descartável + balanceByModel.CHEP;
      const balanceTotalValue =
        (balanceByModel.PBR * (PALLET_PRICES.PBR || 89.90)) +
        (balanceByModel.Descartável * (PALLET_PRICES.Descartável || 59.90)) +
        (balanceByModel.CHEP * (PALLET_PRICES.CHEP || 100.90));

      // Entregas por Veículo (Placa) com valor da carga
      const vehicleStats = {};
      shipments.forEach(s => {
        const plate = (s.plate || 'NÃO INFORMADA').toUpperCase();
        const count = parseInt(s.palletsCount, 10) || 0;
        const model = s.palletModel || 'PBR';
        const cost = s.unitCost || this.getUnitCost(model);
        if (!vehicleStats[plate]) {
          vehicleStats[plate] = {
            plate: plate,
            trips: 0,
            pallets: 0,
            value: 0
          };
        }
        vehicleStats[plate].trips += 1;
        vehicleStats[plate].pallets += count;
        vehicleStats[plate].value += count * cost;
      });

      const vehicleDeliveries = Object.values(vehicleStats).sort((a, b) => b.pallets - a.pallets);

      // Indicadores de Conferência por Palete
      let totalPalletsAudited = 0;
      let palletsConferred = 0;
      let palletsInTransit = 0;
      let palletsShipped = 0;
      let auditTotalValue = 0;

      shipments.forEach(s => {
        const count = parseInt(s.palletsCount, 10) || 0;
        const model = s.palletModel || 'PBR';
        const cost = s.unitCost || this.getUnitCost(model);
        totalPalletsAudited += count;
        auditTotalValue += count * cost;
        if (s.status === 'Entregue' || s.status === 'Conferido') {
          palletsConferred += count;
        } else if (s.status === 'Em Trânsito') {
          palletsInTransit += count;
        } else {
          palletsShipped += count;
        }
      });

      const conferralRate = totalPalletsAudited > 0
        ? Math.round((palletsConferred / totalPalletsAudited) * 100)
        : 100;

      // Agrupamento Cronológico dos Últimos 7 Dias
      const last7Days = [];
      const baseDate = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${day}`;
        const label = `${day}/${m}`;
        last7Days.push({ iso, label, exits: 0, exitsValue: 0, entries: 0, entriesValue: 0 });
      }

      shipments.forEach(s => {
        const sDate = s.date;
        const count = parseInt(s.palletsCount, 10) || 0;
        const model = s.palletModel || 'PBR';
        const cost = s.unitCost || this.getUnitCost(model);
        const found = last7Days.find(item => item.iso === sDate);
        if (found) {
          found.exits += count;
          found.exitsValue += count * cost;
        }
      });

      entries.forEach(e => {
        const eDate = e.date;
        const count = parseInt(e.count, 10) || 0;
        const model = e.model || 'PBR';
        const cost = this.getUnitCost(model);
        const found = last7Days.find(item => item.iso === eDate);
        if (found) {
          found.entries += count;
          found.entriesValue += count * cost;
        }
      });

      // Distribuição de Paletes por Loja de Destino
      const storeMap = {};
      shipments.forEach(s => {
        const rawStore = s.store || 'Outros';
        const storeShort = rawStore.split(' - ')[0] || rawStore;
        const count = parseInt(s.palletsCount, 10) || 0;
        const model = s.palletModel || 'PBR';
        const cost = s.unitCost || this.getUnitCost(model);
        if (!storeMap[storeShort]) {
          storeMap[storeShort] = { store: storeShort, fullName: rawStore, pallets: 0, value: 0 };
        }
        storeMap[storeShort].pallets += count;
        storeMap[storeShort].value += count * cost;
      });
      const storesDistribution = Object.values(storeMap).sort((a, b) => b.pallets - a.pallets);

      return {
        unitCost: unitCost,
        modelPrices: { ...PALLET_PRICES },
        currentBalanceTotal: currentBalanceTotal,
        balanceTotalValue: balanceTotalValue,
        totalExits: totalExits,
        exitsTotalValue: exitsTotalValue,
        totalEntries: totalEntries,
        entriesTotalValue: entriesTotalValue,
        balanceByModel: balanceByModel,
        entriesByModel: entriesByModel,
        exitsByModel: exitsByModel,
        initialStock: initialStock,
        vehicleDeliveries: vehicleDeliveries,
        storesDistribution: storesDistribution,
        timeline: last7Days,
        auditIndicators: {
          totalPallets: totalPalletsAudited,
          totalValue: auditTotalValue,
          conferred: palletsConferred,
          inTransit: palletsInTransit,
          shipped: palletsShipped,
          rate: conferralRate
        }
      };
    },

    // === EXPORTAR / IMPORTAR BACKUP ===
    exportBackup: function () {
      return JSON.stringify({
        stores: this.getStores(),
        checkers: this.getCheckers(),
        shipments: this.getShipments(),
        entries: this.getEntries(),
        initialStock: this.getInitialStock(),
        settings: this.getSettings(),
        exportedAt: new Date().toISOString()
      }, null, 2);
    },

    importBackup: function (jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data.stores) this.saveStores(data.stores);
        if (data.checkers) this.saveCheckers(data.checkers);
        if (data.shipments) this.saveShipments(data.shipments);
        if (data.entries) this.saveEntries(data.entries);
        if (data.initialStock) this.saveInitialStock(data.initialStock);
        if (data.settings) this.saveSettings(data.settings);
        return true;
      } catch (e) {
        console.error('Falha ao importar backup:', e);
        return false;
      }
    }
  };

  window.PalletStorage = Storage;
})(window);
