# Contexto do Projeto — PalletFlow Pro

## 1. Visão Geral e Objetivo

O **PalletFlow Pro** é uma solução para **controle logístico de paletes, identificação de volumes e expedição para transferência entre lojas**.

O objetivo principal é eliminar falhas na conferência de carga, evitar extravios entre centros de distribuição (CD) e filiais, e fornecer identificação visual e digital padronizada (código de barras e QR Code) para cada palete expedido, pronta para impressão e fixação imediata no filme stretch dos volumes.

---

## 2. Cenário Operacional e Dores Atendidas

Na rotina de expedição e transferência entre filiais, os principais desafios enfrentados são:
- **Dificuldade de identificação a distância:** Paletes identificados apenas com caneta ou papéis improvisados causam erros de rota e envio para a loja errada.
- **Falta de controle de volumes:** Dificuldade em saber se todos os paletes daquela remessa foram embarcados (ex: palete 03 de 05 deixado para trás na doca).
- **Rastreabilidade frágil:** Ausência de registro de qual conferente liberou a carga, qual veículo transportou e em qual data/hora exata ocorreu o despacho.
- **Dependência de internet:** Ambientes de galpão e docas muitas vezes possuem sinal oscilante de rede, exigindo uma solução que funcione **100% offline**.

---

## 3. Requisitos Atendidos

| Campo / Requisito | Descrição Operacional | Implementação no Sistema |
| :--- | :--- | :--- |
| **Loja para Transferência** | Seleção da unidade de destino da carga | Dropdown dinâmico com busca rápida e opção de cadastrar novas lojas na hora (com código, nome, cidade e doca padrão). |
| **Quantidade de Paletes** | Total de volumes daquela remessa | Seletor numérico inteligente (`1` a `99`) com botões rápidos (`+1`, `+5`, `12`, `24`), gerando etiquetas sequenciais automáticas (**01 / 05**, **02 / 05**, etc.). |
| **Modelos de Palete** | Classificação física do palete | Suporte aos 3 principais modelos da logística: **PBR** (Padrão Brasil), **Descartável** (One-way) e **CHEP** (Azul retornável), com badges visuais nas etiquetas e romaneio. |
| **Custo Unitário por Modelo** | Valorização patrimonial do ativo de transporte | Tabela de custos homologada por modelo: **PBR (R$ 89,90)**, **Descartável (R$ 59,90)** e **CHEP (R$ 100,90)**, calculando em tempo real o valor da carga expedida, devoluções e estoque total em armazém. |
| **Nome do Conferente** | Responsável pela auditoria e liberação da carga | Lista de conferentes cadastrados com opção de adicionar novos profissionais no ato da expedição. |
| **Data da Expedição** | Registro cronológico da saída | Campo com autopreenchimento da data corrente (`DD/MM/AAAA`). |
| **Placa do Veículo** | Identificação do caminhão/carreta transportador | Campo com formatação e máscara automática para padrão Mercosul (`BRA2E19`) e convencional (`ABC-1234`). |
| **Formato de Impressão (2 por Folha A4)** | 2 etiquetas de volume por página sulfite A4 | Modo calibrado para imprimir exatamente 2 etiquetas por folha A4 com linha de corte tracejada central (`✂️ LINHA DE CORTE`), além do suporte a rolo térmico 100x150mm. |
| **Fotos dos Volumes Carregados** | Registro fotográfico da carga no caminhão | Seção no histórico de romaneios para tirar foto com a câmera do celular/tablet ou anexar arquivos, com compressão automática, lightbox e impressão no romaneio. |
| **Romaneio / Manifesto** | Documento físico de transporte para a cabine | Checklist de todos os paletes com indicação do modelo, valor patrimonial total da carga, fotos anexas dos volumes e linhas de assinatura para conferente, motorista e recebedor. |
| **Dashboard de Saldo & Movimentações** | Painel analítico de gestão de estoque de paletes | Controle de **Saldo Atual** (`Estoque Inicial + Entradas - Saídas`), métricas de Saídas/Expedições e Entradas/Retornos, valor financeiro totalizado, distribuição visual de modelos, ranking de entregas por veículo (placas) e indicador de conferência por palete. |
| **Registro de Entradas & Retornos** | Entrada de paletes devolvidos pelas lojas | Modal ágil para lançar devoluções com loja de origem, quantidade, modelo, placa do caminhão e cálculo financeiro automático. |

---

## 4. Arquitetura do Dashboard & Regras de Negócio de Paletes

### 4.1. Cálculo de Saldo e Valorização Financeira
- **Tabela de Custos Homologados:**
  - **Palete PBR:** **R$ 89,90** / unidade
  - **Palete Descartável:** **R$ 59,90** / unidade
  - **Palete CHEP:** **R$ 100,90** / unidade
- **Fórmula de Saldo por Modelo:**
  $$\text{Saldo Atual} = \text{Estoque Inicial} + \text{Entradas (Retornos das Lojas)} - \text{Saídas (Expedições / Transferências)}$$
- **Valor Patrimonial por Modelo e Total:**
  $$\text{Valor do Saldo} = (\text{PBR} \times \text{R\$ 89,90}) + (\text{Descartável} \times \text{R\$ 59,90}) + (\text{CHEP} \times \text{R\$ 100,90})$$
  $$\text{Valor da Remessa} = \text{Quantidade de Paletes} \times \text{Preço do Modelo Escolhido}$$

### 4.2. Modelos de Paletes Atendidos
1. **PBR (Padrão Brasil 1000x1200mm):** Palete de madeira padronizado e intercambiável, base principal da operação.
2. **Descartável (One-way):** Palete leve utilizado para transferências pontuais sem exigência de retorno imediato.
3. **CHEP (Azul / Pooler):** Palete de locação e alto controle patrimonial com rastreio rigoroso de devoluções.

### 4.3. Gráficos Interativos e Inteligência Visual (Chart.js)
O dashboard conta com 5 gráficos operacionais e executivos de alta fidelidade:
1. **Fluxo Temporal Diário (Linha/Área Spline com Gradiente Neon):** Comparativo diário de Saídas (Transferências) vs. Entradas (Devoluções), com alternador dinâmico de visão em unidades ou em Reais (R$).
2. **Rosca de Composição por Modelo (Doughnut):** Distribuição percentual do saldo entre PBR, Descartável e CHEP com totalizador central e legenda analítica com valores patrimoniais.
3. **Ranking de Veículos (Barras Horizontais):** Volume de paletes e valor financeiro sob custódia de cada veículo/placa.
4. **Distribuição por Loja de Destino (Barras Verticais):** Volume de paletes transferidos para cada filial da rede.
5. **Auditoria & Acurácia de Conferência (Gauge Circular):** Taxa de assertividade percentual (Conferidos no Destino vs. Em Trânsito na Rodovia vs. Despachados na Doca).

---

## 4. Arquitetura Técnica e Estrutura de Arquivos

A aplicação foi projetada sem dependências pesadas, garantindo inicialização instantânea, alta performance e funcionamento garantido mesmo sem conexão com a internet.

```
e:\Projeto Novo\
├── index.html          # Interface do usuário (Dashboard, formulário, pré-visualização e abas)
├── server.js           # Servidor HTTP local leve em Node.js (zero dependências npm)
├── package.json        # Definição do projeto e scripts de execução
├── README.md           # Instruções rápidas de uso
├── contexto.md         # Documento de contexto do negócio e especificações técnicas
├── css/
│   └── style.css       # Design System industrial e regras avançadas de impressão (@media print)
└── js/
    ├── app.js          # Orquestração do formulário, validações, numeração e eventos de tela
    ├── chart.umd.min.js # Motor gráfico Chart.js local (offline) para dashboards e analytics
    ├── barcode.js      # Gerador nativo de Código de Barras Code-128 em vetor SVG puro
    ├── qrcode.js       # Gerador nativo de QR Code offline em SVG
    └── storage.js      # Camada de persistência local (LocalStorage) para lojas, conferentes e histórico
```

### Detalhes dos Módulos:

1. **[index.html](file:///e:/Projeto%20Novo/index.html)**:
   - Estrutura semântica dividida em 3 abas:
     - **Nova Expedição & Etiquetas**: Formulário operacional e painel de etiquetas em tempo real.
     - **Histórico & Romaneios**: Tabela com todas as expedições salvas, filtros por loja e status, e botão de reimpressão com 1 clique.
     - **Lojas & Conferentes**: Gestão rápida do cadastro de unidades e equipe de expedição.
   - Cards de indicadores KPI no topo (Paletes Expedidos Hoje, Veículos Despachados, Lojas Atendidas e Cargas em Trânsito).

2. **[css/style.css](file:///e:/Projeto%20Novo/css/style.css)**:
   - Tema escuro moderno e funcional para estações de trabalho de expedição.
   - Regras específicas para `@media print` isolando a área `#print-sandbox`, ocultando a interface gráfica e configurando os tamanhos físicos de etiqueta térmica (100mm × 150mm) ou folha A4.

3. **[js/barcode.js](file:///e:/Projeto%20Novo/js/barcode.js)**:
   - Implementação do algoritmo **Code-128 (Subset B)**, padrão da indústria logística para códigos alfanuméricos. Gera elementos `<svg>` vetoriais com nitidez absoluta em qualquer resolução de impressão térmica.

4. **[js/qrcode.js](file:///e:/Projeto%20Novo/js/qrcode.js)**:
   - Gerador de QR Code vetorial contendo os dados essenciais da remessa (lote, loja, palete, placa e conferente) para conferência rápida com smartphones ou coletores Android.

5. **[js/storage.js](file:///e:/Projeto%20Novo/js/storage.js)**:
   - Camada de repositório que armazena os dados localmente no navegador, gerando números sequenciais automáticos de lote (`EXP-AAAAMMDD-001`) e mantendo histórico completo para auditoria.

6. **[js/app.js](file:///e:/Projeto%20Novo/js/app.js)**:
   - Controlador principal da interface: trata a digitação da placa, recalcula os paletes gerados a cada alteração, comanda a impressão geral ou avulsa e atualiza as métricas da operação.

---

## 5. Fluxo Operacional Recomendado (Passo a Passo)

1. **Abertura do Sistema:** O operador acessa `http://localhost:3000` no terminal da expedição.
2. **Preenchimento da Carga:**
   - Seleciona a **Loja de Destino**.
   - Informa ou clica na **Quantidade de Paletes** (ex: 4 paletes).
   - Digita a **Placa do Veículo** (ex: `BRA2E19`).
   - Seleciona seu **Nome de Conferente** (a data já vem preenchida com o dia atual).
3. **Validação Visual:** No painel lateral, as 4 etiquetas surgem instantaneamente para conferência com numeração sequencial (`01/04`, `02/04`, `03/04`, `04/04`).
4. **Impressão das Etiquetas:** Clica em **"Imprimir Todas as Etiquetas"**. A impressora térmica emite as etiquetas calibradas.
5. **Aplicação no Volume:** As etiquetas são coladas nas laterais dos paletes sobre o filme stretch.
6. **Emissão do Romaneio:** O conferente clica em **"Imprimir Romaneio da Carga"**, recolhe a assinatura do motorista e entrega a via de transporte.
7. **Reimpressão Avulsa (Se necessário):** Caso uma etiqueta seja danificada no manuseio da empilhadeira, o botão **"Imprimir Avulso"** no card daquele palete específico permite reimprimir somente a unidade avariada, sem gastar papel das demais.

---

## 6. Como Executar

No prompt de comando ou terminal:
```bash
# Iniciar o servidor local
npm start
```
Ou diretamente via Node:
```bash
node server.js
```
O sistema estará disponível em: **`http://localhost:3000`**.
