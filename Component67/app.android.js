const self = {
    $obj: document.querySelector(".component67"),
    rootPath: '',
    params: {
        ServerIp: '',
        RootPath: '',
        PlayerID: '',
        InstanceID: ''
    },
    componentData: function () {
        return "componentData_" + (self.params.InstanceID || "67");
    },
    url: window.location.href,
    baseUrl: 'http://',
    getRealInstanceID: function () {
        const arr = self.params.InstanceID.split("-");
        return arr[arr.length - 1];
    },
    restGetPlayerInfoUrl: function () {
        return (
            self.baseUrl +
            self.params.ServerIp +
            "/rest/getPlayerInfo/" +
            self.params.PlayerID +
            "/" +
            self.getRealInstanceID()
        );
    }
};
const config = {
    ui: {
        language: "tr",
        theme: "neo",
        refreshInterval: 1800000,
        currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "CNY", "INR", "TRY"]
    }
};

const static = {
    company: {
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/768px-LEGO_logo.svg.png"
    },
    api: {
        apiKey: "fca_live_rSBUiuZi7TYXtmrlpcCDU1gnhFDLERXJcuAmk58G",
        baseUrl: "https://api.freecurrencyapi.com/v1/latest",
        symbolUrl: "https://api.freecurrencyapi.com/v1/currencies",
        baseCurrency: "TRY",
        spread: 0.02
    },
    translations: {
        tr: {
            title: "Döviz Kurları",
            currency: "Para Birimi",
            buy: "Alış",
            sell: "Satış"
        },
        en: {
            title: "Exchange Rates",
            currency: "Currency",
            buy: "Buy",
            sell: "Sell"
        }
    },
    styles: {
        classic: "./css/classic.android.css",
        plain: "./css/plain.android.css",
        dark: "./css/dark.android.css",
        neo: "./css/neo.android.css",
        darkv2: "./css/darkv2.android.css",
        flat: "./css/flat.android.css",
        neatboard: "./css/neatboard.android.css",
        hologram: "./css/hologram.android.css",
        glasslite: "./css/glasslite.android.css",
        digital: "./css/digital.android.css",
        basic: "./css/basic.android.css",
        basic2: "./css/basic2.android.css",
        darkv3: "./css/darkv3.android.css",
        elegant: "./css/elegant.android.css",
        skyboard: "./css/skyboard.android.css",
        forex: "./css/forex.android.css",
        lumin: "./css/lumin.android.css"
    }
};

let lang = config.ui.language;
let currentStyle = config.ui.theme;

function getParams(url) {
    const params = {};
    const parser = document.createElement('a');
    parser.href = url;
    const query = parser.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1] || '');
    }
    return params;
}

window.onload = function () {
    self.params = getParams(window.location.href);

    self.rootPath = self.params.RootPath;

    const themeStylesheet = document.getElementById("themeStylesheet");
    if (themeStylesheet) themeStylesheet.href = static.styles[currentStyle];

    fetchPlayerInfo();
    fetchExchangeRates();
    setInterval(fetchExchangeRates, config.ui.refreshInterval);
    setInterval(fetchPlayerInfo,60*1000);
};

let previousAppParams = {}; 

function arraysEqual(a, b) {
    return Array.isArray(a) && Array.isArray(b) &&
           a.length === b.length &&
           a.every((val, i) => val === b[i]);
}

async function fetchPlayerInfo() {
    try {
        const url = self.restGetPlayerInfoUrl();
        const res = await fetch(url);
        const data = await res.json();
        const params = data?.data?.appParameters;

        console.log("Yeni Parametreler:", params);

        if (params) {
            // Dil kontrolü
            if (params.language && params.language !== lang) {
                lang = params.language;
                console.log("Dil güncellendi:", lang);
                updateExchangeTable();
            }

            // Tema kontrolü
            if (params.theme && params.theme !== currentStyle) {
                currentStyle = params.theme;
                console.log("Tema değişti:", currentStyle);
                switchStyle(currentStyle);
            }
            // BASE CURRENCY kontrolü
            if ( params.base_currency && params.base_currency !== static.api.baseCurrency)
                {
                    console.log("Base currency değişti:", params.base_currency);
                    static.api.baseCurrency = params.base_currency;
                    fetchExchangeRates(); 
                    }
            // Kur listesi kontrolü
            if (!arraysEqual(params.currencies, config.ui.currencies)) {
                console.log("Kur listesi değişti:", params.currencies);
                config.ui.currencies = params.currencies;
                fetchExchangeRates();
            }

            previousAppParams = params;
        }
    } catch (error) {
        console.warn("Kullanıcı bilgisi alınamadı:", error);
    }
}


async function fetchExchangeRates() {
    try {
        const res = await Promise.all([
            fetch(`${static.api.baseUrl}?apikey=${static.api.apiKey}&currencies=${config.ui.currencies.join(',')}&base_currency=${static.api.baseCurrency}`),
            fetch(`${static.api.symbolUrl}?apikey=${static.api.apiKey}`)
        ]);

        const [exchangeData, symbolData] = await Promise.all(res.map(r => r.json()));

        if (!exchangeData.data || !symbolData.data) throw new Error("Geçersiz veri.");

        window.latestRates = exchangeData.data;
        window.symbols = symbolData.data;

        updateExchangeTable();
    } catch (error) {
        const container = document.getElementById("exchangeRatesContainer");
        if (container) container.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

function updateExchangeTable() {
    switch (currentStyle) {
        case "classic": updateExchangeTableOne(); break;
        case "plain": updateExchangeTableTwo(); break;
        case "dark": updateExchangeTableThree(); break;
        case "glasslite":  updateExchangeTableFour(); break;
        case "flat": updateExchangeTableFive(); break;
        case "neatboard":updateExchangeTableSix(); break;
        case "digital": updateExchangeTableSeven(); break;
        case "darkv3" : updateExchangeTableEight();break;
        case "basic2" : updateExchangeTableNine();break;
        case "neo": updateExchangeTableTen(); break;
        case "basic" :updateExchangeTableEleven();break;
        case "elegant" :updateExchangeTableTwelve();break;
        case "darkv2": updateExchangeTableDarkV2(); break;
        case "hologram": updateExchangeTableHologram(); break;
        case "skyboard": updateExchangeTableSkyBoard();break;
        case "forex" :updateExchangeTableForex();break;
        case "lumin" :updateExchangeTableLuminex();break;
    }
}




function updateExchangeTableOne() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;

    container.innerHTML = `
        <div class="exchange-header">
            <div class="company-image"><img src="${logo}" alt="Logo"></div>
            <h2>${translations.title}</h2>
            <div class="time"></div>
        </div>
        <table class="exchange-table-horizontal">
            <thead>
                <tr><th>${translations.currency}</th><th>${translations.buy}</th><th>${translations.sell}</th></tr>
            </thead>
            <tbody id="exchangeTableBody"></tbody>
        </table>
    `;

    startClock();
    const tbody = document.getElementById("exchangeTableBody");
    if (!tbody) return;

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;

        const rate = parseFloat(window.latestRates[currency]);
        if (!rate) return;

        const buy = rate.toFixed(3);
        const sell = (rate * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        tbody.innerHTML += `
            <tr>
                <td class="currency-cell"><img src="${flag}" alt="${currency}" class="currency-flag">${currency}</td>
                <td class="text-success">${buy}</td>
                <td class="text-danger">${sell}</td>
            </tr>
        `;
    });
}

function updateExchangeTableTwo() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";

    container.innerHTML = `
        <div class="header">
            <div class="company-image"><img src="${logo}" alt="Logo"></div>
            <h1>${translations.title}</h1>
            <div class="time"></div>
        </div>
    `;

    startClock();
    const wrap = document.createElement("div");
    wrap.classList.add("plain-board-vertical");

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;
        if (!window.latestRates[currency]) return;

        const buy = parseFloat(window.latestRates[currency]).toFixed(3);
        const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        wrap.innerHTML += `
            <div class="plain-board-item-vertical">
                <div class="currency-info">
                    <img src="${flag}" alt="${currency}" width="50">
                    <span>${currency}</span>
                </div>
                <div class="currency-rates">
                    <div class="rate-item"><span class="rate-label">${translations.buy}:</span><span class="rate-value">${buy} ${symbol}</span></div>
                    <div class="rate-item"><span class="rate-label">${translations.sell}:</span><span class="rate-value">${sell} ${symbol}</span></div>
                </div>
            </div>
        `;
    });

    container.appendChild(wrap);
}

function updateExchangeTableThree() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";

    document.body.classList.add("dark-mode");
    container.innerHTML = `
        <div class="dark-header">
            <div class="company-image"><img src="${logo}" alt="Logo"></div>
            <h1>${translations.title}</h1>
            <div class="time"></div>
        </div>
    `;

    startClock();
    const table = document.createElement("table");
    table.classList.add("dark-mode-table");
    table.innerHTML = `<thead><tr><th>${translations.currency}</th><th>${translations.buy}</th><th>${translations.sell}</th></tr></thead><tbody></tbody>`;

    const tbody = table.querySelector("tbody");

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;

        const rate = window.latestRates[currency];
        if (!rate) return;

        const buy = parseFloat(rate).toFixed(3);
        const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${flag}" alt="${currency}"><span>${currency}</span></td>
            <td>${buy} ${symbol}</td>
            <td>${sell} ${symbol}</td>
        `;
        tbody.appendChild(row);
    });

    container.appendChild(table);
}
function updateExchangeTableFour() {
  document.body.classList.add("glasslite-mode");

  const container = document.getElementById("exchangeRatesContainer");
  if (!container) return;

  const translations = static.translations[lang];
  const spread = static.api.spread;
  const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";
  const logo = static.company.logoUrl;
  const companyName = static.company.name || "Currency Monitor";

  container.innerHTML = `
    <div class="glasslite-card">
      <div class="glasslite-header">
        <img src="${logo}" alt="Logo" />
        <div>
          <h1 class="glasslite-title">${translations.title}</h1>
          <div class="glasslite-time time"></div>
        </div>
      </div>
      <div class="glasslite-body" id="glassliteBody"></div>
    </div>
  `;

  const body = document.getElementById("glassliteBody");

  config.ui.currencies.forEach(currency => {
    if (currency === static.api.baseCurrency) return;
    const rate = window.latestRates[currency];
    if (!rate) return;

    const buy = parseFloat(rate).toFixed(3);
    const sell = (parseFloat(rate) * (1 + spread)).toFixed(3);
    const flag = `asset/flags/${currency.toLowerCase()}.png`;
    const name = window.symbols[currency]?.name || "";

    const item = document.createElement("div");
    item.className = "glasslite-item";
    item.innerHTML = `
      <div class="glasslite-left">
        <img src="${flag}" alt="${currency}" />
        <div class="label">
          <span class="code">${currency}</span>
          <span class="name">${name}</span>
        </div>
      </div>
      <div class="glasslite-right">
        <div class="glasslite-buy">${translations.buy}: ${buy} ${symbol}</div>
        <div class="glasslite-sell">${translations.sell}: ${sell} ${symbol}</div>
      </div>
    `;
    body.appendChild(item);
  });

  startClock();
}



function updateExchangeTableFive() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";

    document.body.classList.add("flat-mode");

    container.innerHTML = `
        <div class="flat-header">
            <img src="${logo}" alt="Logo">
            <h1>${translations.title}</h1>
             <div class="time"></div>
        </div>
        <div class="flat-list" id="flatList"></div>
    `;


    const list = document.getElementById("flatList");

    config.ui.currencies.forEach((currency, index) => {
        if (currency === static.api.baseCurrency) return;

        const rate = window.latestRates[currency];
        if (!rate) return;

        const buy = parseFloat(rate).toFixed(3);
        const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        const card = document.createElement("div");
        card.className = "flat-item";
        card.style.opacity = "0";
        card.style.transform = "translateY(10px)";
        card.style.transitionDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <div class="flat-left">
                <img src="${flag}" alt="${currency}" onerror="this.src='asset/flags/default.png'">
                <span>${currency}</span>
            </div>
            <div class="flat-right">
                <div>
                    <span class="flat-label">${translations.buy}:</span>
                    <span class="flat-buy">${buy} ${symbol}</span>
                </div>
                <div>
                    <span class="flat-label">${translations.sell}:</span>
                    <span class="flat-sell">${sell} ${symbol}</span>
                </div>
            </div>
        `;
        list.appendChild(card);
        
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, 100);
    });
    startClock();

}
function updateExchangeTableSix() {
    document.body.classList.add("modern-mode");

    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";
    const logo = static.company.logoUrl;

    container.innerHTML = `
        <div class="table-header">
            <img src="${logo}" alt="Logo" class="logo">
            <h2>${translations.title}</h2>
             <div class="time"></div>
        </div>
        <table class="exchange-table">
            <thead>
                <tr>
                    <th>${translations.currency}</th>
                    <th>${translations.buy}</th>
                    <th>${translations.sell}</th>
                </tr>
            </thead>
            <tbody id="exchangeTableBody"></tbody>
        </table>
    `;

    const tbody = document.getElementById("exchangeTableBody");

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;

        const rate = window.latestRates[currency];
        if (!rate) return;

        const buy = parseFloat(rate).toFixed(3);
        const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div class="currency-cell">
                    <img src="${flag}" alt="${currency}">
                    <span>${currency}</span>
                </div>
            </td>
            <td class="buy-cell">${buy} ${symbol}</td>
            <td class="sell-cell">${sell} ${symbol}</td>
        `;
        tbody.appendChild(row);
    });

    startClock();
}
function updateExchangeTableSeven() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";
    const baseCurrency = static.api.baseCurrency;

    document.body.classList.add("dark-mode");
    
    container.innerHTML = `
        <div class="dashboard-header">
            <img src="${logo}" alt="Logo">
            <h1>${translations.title}</h1>
            <div class="time"></div>
        </div>
    `;


    const table = document.createElement("table");
    table.className = "holographic-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>${translations.currency}</th>
                <th>${translations.buy}</th>
                <th>${translations.sell}</th>
            </tr>
        </thead>
        <tbody>
            ${config.ui.currencies
                .filter(currency => currency !== baseCurrency)
                .map(currency => {
                    const rate = window.latestRates[currency];
                    if (!rate) return '';

                    const buy = parseFloat(rate).toFixed(3);
                    const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
                    const flag = `asset/flags/${currency.toLowerCase()}.png`;

                    return `
                        <tr>
                            <td>
                                <div class="currency-cell">
                                    <img src="${flag}" alt="${currency}" onerror="this.src='asset/flags/default.png'">
                                    <span>${currency}</span>
                                </div>
                            </td>
                           <td class="buy-cell"><span class="label"></span> <span class="price green">${buy} ${symbol}</span></td>
                           <td class="sell-cell"><span class="label"></span> <span class="price red">${sell} ${symbol}</span></td>

                        </tr>
                    `;
                }).join('')}
        </tbody>
    `;

    container.appendChild(table);
    startClock();
}


function updateExchangeTableEight() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";

    document.body.classList.add("darkv3-mode");

    container.innerHTML = `
        <div class="darkv3-header">
            <img src="${logo}" alt="Logo">
            <h1>${translations.title}</h1>
            <div class="time"></div>
        </div>
        <div class="darkv3-list" id="darkv3List"></div>
    `;

    startClock();

    const list = document.getElementById("darkv3List");

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;

        const rate = window.latestRates[currency];
        if (!rate) return;

        const buy = parseFloat(rate).toFixed(3);
        const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        const card = document.createElement("div");
        card.className = "darkv3-item";
        card.innerHTML = `
            <div class="darkv3-left">
                <img src="${flag}" alt="${currency}">
                <span>${currency}</span>
            </div>
            <div class="darkv3-right">
                <div>
                    <span class="darkv3-label">${translations.buy}:</span>
                    <span class="darkv3-buy">${buy} ${symbol}</span>
                </div>
                <div>
                    <span class="darkv3-label">${translations.sell}:</span>
                    <span class="darkv3-sell">${sell} ${symbol}</span>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function updateExchangeTableNine() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";
    const baseCurrency = static.api.baseCurrency;

    container.innerHTML = `
        <div class="edge-container">
            <div class="edge-header">
                <img src="${logo}" alt="Logo" class="edge-logo">
                <h1 class="edge-title">${translations.title}</h1>
                <div class="time"></div>
            </div>
            <table class="edge-table">
                <thead>
                    <tr>
                        <th>${translations.currency}</th>
                        <th>${translations.buy}</th>
                        <th>${translations.sell}</th>
                    </tr>
                </thead>
                <tbody>
                    ${config.ui.currencies
                        .filter(c => c !== baseCurrency)
                        .map((c, i) => {
                            const rate = window.latestRates[c];
                            if (!rate) return '';
                            const buy = parseFloat(rate).toFixed(3);
                            const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
                            const flag = `asset/flags/${c.toLowerCase()}.png`;

                            return `
                                <tr style="animation-delay:${i * 0.1}s">
                                    <td>
                                        <div class="currency-cell">
                                            <img src="${flag}" class="currency-flag" onerror="this.src='asset/flags/default.png'">
                                            <div class="currency-code">${c}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="buy-price">${buy} ${symbol}</div>
                                    </td>
                                    <td>
                                        <div class="sell-price">${sell} ${symbol}</div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                </tbody>
            </table>
        </div>
    `;

    startClock();
}

function updateExchangeTableTen() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";

    container.innerHTML = `
        <div class="neo-header">
            <div class="company-image"><img src="${logo}" alt="Logo"></div>
            <h1>${translations.title}</h1>
            <div class="time"></div>
        </div>
        <div class="neo-grid" id="neoCards"></div>
    `;

    const grid = document.getElementById("neoCards");
    if (!grid) return;

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;

        const rate = window.latestRates[currency];
        if (!rate) return;

        const buy = parseFloat(rate).toFixed(3);
        const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        const card = document.createElement("div");
        card.className = "neo-card";
       card.innerHTML = `
    <div class="currency-title">
        <img src="${flag}" alt="${currency}">
        <span>${currency}</span>
    </div>
    <div class="currency-details-inline">
        <span class="detail-label">${translations.buy}:</span>
        <span class="detail-value detail-buy">${buy} ${symbol}</span>
        <span class="detail-label">${translations.sell}:</span>
        <span class="detail-value detail-sell">${sell} ${symbol}</span>
    </div>
`;

        grid.appendChild(card);
    });
    startClock();
}

function updateExchangeTableDarkV2() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";
    const baseCurrency = static.api.baseCurrency;

    document.body.classList.add("dark-mode");

    container.innerHTML = `
        <div class="dark-header">
            <img src="${logo}" alt="Logo">
            <h1>${translations.title}</h1>
            <div class="time"></div>
        </div>
    `;


    
    startClock();

  const table = document.createElement("table");
    table.className = "dark-mode-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>${translations.currency}</th>
                <th>${translations.buy}</th>
                <th>${translations.sell}</th>
            </tr>
        </thead>
        <tbody>
            ${config.ui.currencies
                .filter(currency => currency !== baseCurrency)
                .map(currency => {
                    const rate = window.latestRates[currency];
                    if (!rate) return '';
                    
                    const buy = parseFloat(rate).toFixed(3);
                    const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
                    const flag = `asset/flags/${currency.toLowerCase()}.png`;
                    
                    return `
                        <tr>
                            <td>
                                <div class="currency-cell">
                                    <img src="${flag}" alt="${currency}" onerror="this.src='asset/flags/default.png'">
                                    <span>${currency}</span>
                                </div>
                            </td>
                            <td class="buy-cell">${buy} ${symbol}</td>
                            <td class="sell-cell">${sell} ${symbol}</td>
                        </tr>
                    `;
                }).join('')}
        </tbody>
    `;
    container.appendChild(table);
    
    setTimeout(() => {
        table.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        table.style.opacity = '1';
        table.style.transform = 'translateY(0)';
    }, 100);

    // Hover efektleri
     const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'scale(1.01)';
            row.style.transition = 'transform 0.2s ease';
            row.style.zIndex = '1';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'scale(1)';
        });
    });
}

function updateExchangeTableHologram() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";

    document.body.classList.add("hologram-mode");

    container.innerHTML = `
        <div class="hologram-header">
            <img src="${logo}" alt="Logo">
            <h1>${translations.title}</h1>
            <div class="time"></div>
        </div>
        <div class="hologram-list" id="hologramList"></div>
    `;

    startClock();

    const list = document.getElementById("hologramList");

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;

        const rate = window.latestRates[currency];
        if (!rate) return;

        const buy = parseFloat(rate).toFixed(3);
        const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        const card = document.createElement("div");
        card.className = "hologram-card";
        card.innerHTML = `
            <div class="hologram-top">
                <img src="${flag}" alt="${currency}">
                <span>${currency}</span>
            </div>
            <div class="hologram-bottom">
                <div><span class="label">${translations.buy}:</span><span class="buy">${buy} ${symbol}</span></div>
                <div><span class="label">${translations.sell}:</span><span class="sell">${sell} ${symbol}</span></div>
            </div>
        `;
        list.appendChild(card);
    });
    startClock();
}

function updateExchangeTableEleven() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";
    const baseCurrency = static.api.baseCurrency;

    container.innerHTML = `
        <div class="exchange-container">
            <div class="exchange-header">
                <img src="${logo}" alt="Logo" class="exchange-logo">
                <h1 class="exchange-title">${translations.title}</h1>
                <div class="time"></div>
            </div>
            <table class="currency-table">
                <thead>
                    <tr>
                        <th>${translations.currency}</th>
                        <th>${translations.buy}</th>
                        <th>${translations.sell}</th>
                    </tr>
                </thead>
                <tbody>
                    ${config.ui.currencies
                        .filter(c => c !== baseCurrency)
                        .map((c, i) => {
                            const rate = window.latestRates[c];
                            if (!rate) return '';
                            const buy = parseFloat(rate).toFixed(3);
                            const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
                            const flag = `asset/flags/${c.toLowerCase()}.png`;
                            return `
                                <tr style="animation-delay:${i * 0.1}s">
                                    <td>
                                        <div class="currency-cell">
                                            <img src="${flag}" class="currency-flag" onerror="this.src='asset/flags/default.png'">
                                            <div class="currency-code">${c}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="buy-price">${buy} ${symbol}</div>
                                    </td>
                                    <td>
                                        <div class="sell-price">${sell} ${symbol}</div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                </tbody>
            </table>
        </div>
    `;

    startClock();
}
function updateExchangeTableTwelve() {
    document.body.classList.add("elegant-mode");

    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const symbol = window.symbols[static.api.baseCurrency]?.symbol || "";
    const logo = static.company.logoUrl;
    const companyName = static.company.name || "Döviz Kurları";

    container.innerHTML = `
        <div class="elegant-card">
            <div class="elegant-header">
                <div class="header-content">
                    <img src="${logo}" alt="Logo" class="elegant-logo">
                    <div class="header-text">
                        <h1 class="table-title">${translations.title}</h1>
                    </div>
                </div>
                <div class="header-meta">
                    <div class="time">
                        <span class="date"></span>
                        <span class="time"></span>
                    </div>
                    <div class="live-badge">
                        <span class="live-dot"></span> <span>CANLI</span>
                    </div>
                </div>
            </div>
            <div class="elegant-body">
                <table class="elegant-table">
                    <thead>
                        <tr>
                            <th>${translations.currency}</th>
                            <th>${translations.buy}</th>
                            <th>${translations.sell}</th>
                        </tr>
                    </thead>
                    <tbody id="elegantTableBody"></tbody>
                </table>

    `;

    const tbody = document.getElementById("elegantTableBody");


  config.ui.currencies.forEach(currency => {
    if (
        currency === static.api.baseCurrency || 
        !window.latestRates[currency]           
    ) return;

    const buy = parseFloat(window.latestRates[currency]).toFixed(3);
    const sell = (parseFloat(buy) * (1 + spread)).toFixed(3);
    const flag = `asset/flags/${currency.toLowerCase()}.png`;
    const currencyName = window.symbols[currency]?.name || "";

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
            <div class="currency-info">
                <img src="${flag}" class="currency-flag" alt="${currency}" onerror="this.src='asset/flags/default.png'">
                <div>
                    <div class="currency-code">${currency}</div>
                    <div class="currency-name">${currencyName}</div>
                </div>
            </div>
        </td>
        <td class="buy-cell">${buy} <span class="currency-symbol">${symbol}</span></td>
        <td class="sell-cell">${sell} <span class="currency-symbol">${symbol}</span></td>
    `;
    tbody.appendChild(row);
});


    startClock();
}

function updateExchangeTableForex() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;
    const baseCurrency = static.api.baseCurrency;

    // Container HTML
 container.innerHTML = `
        <div class="exchange-glass-card">
            <div class="exchange-header">
                <div class="company-image">
                    <img src="${logo}" alt="Logo" class="logo-glow">
                    <div class="header-gradient"></div>
                </div>
                <div class="header-content">
                    <h2 class="title-animate">${translations.title}</h2>
                    <div class="time" id="liveClock"></div>                </div>
                <div class="currency-wave"></div>
            </div>
            
            <div class="exchange-table-container">
                <table class="exchange-table-horizontal">
                    <thead>
                        <tr>
                            <th class="th-currency">${translations.currency}</th>
                            <th class="th-buy">${translations.buy}</th>
                            <th class="th-sell">${translations.sell}</th>
                        </tr>
                    </thead>
                    <tbody id="exchangeTableBody"></tbody>
                </table>
            </div>
            
            </div>
        </div>
    `;
    // Saat güncelleme
    startClock();

    // Tablo verilerini doldurma
    const tbody = document.getElementById("exchangeTableBody");
    if (!tbody) return;

  config.ui.currencies.forEach(currency => {
        if (currency === baseCurrency) return;

        const rate = parseFloat(window.latestRates[currency]);
        if (!rate) return;

        const buy = rate.toFixed(3);
        const sell = (rate * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        const row = document.createElement('tr');
        row.className = 'currency-row';
    row.innerHTML = `
    <td class="currency-cell">
        <div class="currency-flag-container">
            <img src="${flag}" alt="${currency}" class="currency-flag">
            <span class="currency-code">${currency}</span>
        </div>
    </td>
    <td class="buy-cell">
        <span class="rate-value text-success">${buy}</span>
        <span class="currency-symbol buy-symbol">TL</span>
        <div class="rate-dots"></div>
    </td>
    <td class="sell-cell">
        <span class="rate-value text-danger">${sell}</span>
        <span class="currency-symbol sell-symbol">TL</span>
        <div class="rate-dots"></div>
    </td>
`;
        
        tbody.appendChild(row);
        
        // Satıra hover efekti ekleme
        row.addEventListener('mouseenter', () => {
            row.classList.add('row-hover');
        });
        row.addEventListener('mouseleave', () => {
            row.classList.remove('row-hover');
        });
    });

}
function updateExchangeTableLuminex() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;

    container.innerHTML = `
        <div class="luminex-header">
            <img src="${logo}" class="luminex-logo" alt="Logo" />
            <h2 class="luminex-title">${translations.title}</h2>
            <div class="luminex-time time"></div>
        </div>
        <div class="luminex-grid" id="exchangeGrid"></div>
    `;

    startClock();
    const grid = document.getElementById("exchangeGrid");

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;

        const rate = parseFloat(window.latestRates[currency]);
        if (!rate) return;

        const buy = rate.toFixed(3);
        const sell = (rate * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        grid.innerHTML += `
            <div class="luminex-card">
                <img src="${flag}" class="luminex-flag" alt="${currency}" />
                <div class="luminex-code">${currency}</div>
                <div class="luminex-buy">${translations.buy}: ${buy} TL</div>
                <div class="luminex-sell">${translations.sell}: ${sell} TL</div>
            </div>
        `;
    });
}


function updateExchangeTableSkyBoard() {
    const container = document.getElementById("exchangeRatesContainer");
    if (!container) return;

    const translations = static.translations[lang];
    const spread = static.api.spread;
    const logo = static.company.logoUrl;

    container.innerHTML = `
        <div class="skyboard-header">
            <img src="${logo}" class="skyboard-logo" alt="Logo" />
            <h2 class="skyboard-title">${translations.title}</h2>
            <div class="skyboard-time time"></div>
        </div>
        <div class="skyboard-grid" id="exchangeGrid"></div>
    `;

    startClock();

    const grid = document.getElementById("exchangeGrid");
    if (!grid) return;

    config.ui.currencies.forEach(currency => {
        if (currency === static.api.baseCurrency) return;

        const rate = parseFloat(window.latestRates[currency]);
        if (!rate) return;

        const buy = rate.toFixed(3);
        const sell = (rate * (1 + spread)).toFixed(3);
        const flag = `asset/flags/${currency.toLowerCase()}.png`;

        grid.innerHTML += `
            <div class="skyboard-card">
                <div class="skyboard-card-header">
                    <img src="${flag}" alt="${currency}" class="skyboard-flag" />
                    <span class="skyboard-code">${currency}</span>
                </div>
                <div class="skyboard-card-body">
                    <div class="skyboard-line">
                        <span class="skyboard-label">${translations.buy}:</span>
                        <span class="skyboard-buy">${buy} TL</span>
                    </div>
                    <div class="skyboard-line">
                        <span class="skyboard-label">${translations.sell}:</span>
                        <span class="skyboard-sell">${sell} TL</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function startClock() {
    const updateTime = () => {
        const now = new Date();
        const date = now.toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR");
        const time = now.toLocaleTimeString(lang === "en" ? "en-GB" : "tr-TR", {
            hour: '2-digit', minute: '2-digit', hour12: false
        });
        const timeElement = document.querySelector(".time");
        if (timeElement) timeElement.textContent = `${date} | ${time}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function switchStyle(style) {
    currentStyle = style;
    const themeStylesheet = document.getElementById("themeStylesheet");
    if (themeStylesheet) themeStylesheet.href = static.styles[style];
    updateExchangeTable();
}

function switchLanguage(lang) {
    lang = lang;
    updateExchangeTable();
}
