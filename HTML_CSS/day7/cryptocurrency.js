const API_URL = "https://api4.binance.com/api/v3/ticker/24hr";
const UPDATE_INTERVAL = 1000;

const cryptoList = document.querySelector("#cryptoList");
const cryptoTable = document.querySelector("#cryptoTable");
const statusMessage = document.querySelector("#statusMessage");
const searchInput = document.querySelector("#searchInput");
const allTab = document.querySelector("#allTab");
const favoriteTab = document.querySelector("#favoriteTab");
const coinCount = document.querySelector("#coinCount");
const updatedAt = document.querySelector("#updatedAt");
const favoriteCount = document.querySelector("#favoriteCount");

let cryptoData = [];
let selectedTab = "all";
let favorites = loadFavorites();

function loadFavorites() {
    try {
        const savedData = JSON.parse(localStorage.getItem("cryptoFavorites"));
        return Array.isArray(savedData) ? savedData : [];
    } catch (error) {
        console.error("관심항목을 불러오지 못했습니다.", error);
        return [];
    }
}

function saveFavorites() {
    localStorage.setItem("cryptoFavorites", JSON.stringify(favorites));
}

async function fetchCryptoData() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP 상태 코드: ${response.status}`);
        }

        const responseData = await response.json();

        if (!Array.isArray(responseData)) {
            throw new Error("예상하지 못한 API 응답 형식입니다.");
        }

        cryptoData = responseData
            .filter((coin) => {
                const isUsdtMarket = coin.symbol.endsWith("USDT");
                const hasValidPrice = Number(coin.lastPrice) > 0;

                return isUsdtMarket && hasValidPrice;
            })
            .sort((a, b) => {
                return Number(b.quoteVolume) - Number(a.quoteVolume);
            });

        renderCryptoList();
        updateSummary();

        statusMessage.hidden = true;
        cryptoTable.hidden = false;
    } catch (error) {
        console.error("가격 정보 요청 실패:", error);

        statusMessage.hidden = false;
        statusMessage.classList.add("error");
        statusMessage.textContent =
            "가격 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }
}

function getFilteredData() {
    const searchKeyword = searchInput.value.trim().toUpperCase();

    return cryptoData.filter((coin) => {
        const matchesSearch = coin.symbol.includes(searchKeyword);
        const matchesTab =
            selectedTab === "all" || favorites.includes(coin.symbol);

        return matchesSearch && matchesTab;
    });
}

function renderCryptoList() {
    const filteredData = getFilteredData();

    cryptoList.innerHTML = "";

    if (filteredData.length === 0) {
        cryptoList.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">조건에 맞는 암호화폐가 없습니다.</td>
            </tr>
        `;

        coinCount.textContent = "0개";
        return;
    }

    filteredData.forEach((coin) => {
        const row = document.createElement("tr");
        const changeRate = Number(coin.priceChangePercent);
        const changeClass = changeRate >= 0 ? "up" : "down";
        const changeSign = changeRate >= 0 ? "+" : "";
        const isFavorite = favorites.includes(coin.symbol);

        row.innerHTML = `
            <td>
                <button
                    type="button"
                    class="favorite-button ${isFavorite ? "active" : ""}"
                    data-symbol="${coin.symbol}"
                    aria-label="${coin.symbol} 관심항목 ${isFavorite ? "삭제" : "추가"}"
                >
                    ${isFavorite ? "★" : "☆"}
                </button>
            </td>
            <td class="symbol">${coin.symbol}</td>
            <td>${formatPrice(coin.lastPrice)}</td>
            <td class="change-rate ${changeClass}">
                ${changeSign}${changeRate.toFixed(2)}%
            </td>
            <td>${formatPrice(coin.highPrice)}</td>
            <td>${formatPrice(coin.lowPrice)}</td>
        `;

        cryptoList.appendChild(row);
    });

    coinCount.textContent = `${filteredData.length}개`;
}

function formatPrice(price) {
    return Number(price).toLocaleString("ko-KR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
    });
}

function toggleFavorite(symbol) {
    const favoriteIndex = favorites.indexOf(symbol);

    if (favoriteIndex === -1) {
        favorites.push(symbol);
    } else {
        favorites.splice(favoriteIndex, 1);
    }

    saveFavorites();
    renderCryptoList();
    updateSummary();
}

function changeTab(tabName) {
    selectedTab = tabName;

    const isAllTab = tabName === "all";

    allTab.classList.toggle("active", isAllTab);
    favoriteTab.classList.toggle("active", !isAllTab);

    allTab.setAttribute("aria-selected", String(isAllTab));
    favoriteTab.setAttribute("aria-selected", String(!isAllTab));

    renderCryptoList();
}

function updateSummary() {
    favoriteCount.textContent = `${favorites.length}개`;

    updatedAt.textContent = new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

cryptoList.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".favorite-button");

    if (!favoriteButton) {
        return;
    }

    toggleFavorite(favoriteButton.dataset.symbol);
});

searchInput.addEventListener("input", renderCryptoList);
allTab.addEventListener("click", () => changeTab("all"));
favoriteTab.addEventListener("click", () => changeTab("favorite"));

updateSummary();
fetchCryptoData();
setInterval(fetchCryptoData, UPDATE_INTERVAL);