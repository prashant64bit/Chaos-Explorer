const dataUrl = "https://chaos-data.projectdiscovery.io/index.json";

let allPrograms = [];
let filteredPrograms = [];

const searchInput = document.getElementById("searchInput");
const platformFilter = document.getElementById("platformFilter");
const bountyFilter = document.getElementById("bountyFilter");
const swagFilter = document.getElementById("swagFilter");
const subdomainOrder = document.getElementById("subdomainOrder");
const resetButton = document.getElementById("resetButton");

const tableBody = document.getElementById("tableBody");
const totalPrograms = document.getElementById("totalPrograms");
const totalSubdomains = document.getElementById("totalSubdomains");

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

async function loadData() {

    try {

        const cachedData =
            localStorage.getItem("chaosExplorerData");

        const cachedTime =
            localStorage.getItem("chaosExplorerUpdated");

        if (
            cachedData &&
            cachedTime &&
            Date.now() - Number(cachedTime) < 3600000
        ) {

            allPrograms =
                JSON.parse(cachedData);

        } else {

            const response =
                await fetch(dataUrl);

            const rawData =
                await response.json();

            allPrograms =
                rawData.map(item => ({

                    name:
                        item.name || "",

                    platform:
                        item.platform || "",

                    bounty:
                        item.bounty === true,

                    swag:
                        item.swag === true,

                    subdomains:
                        Number(item.count || 0),

                    updated:
                        item.last_updated || "",

                    programUrl:
                        item.program_url || "",

                    zipUrl:
                        item.URL || ""

                }));

            localStorage.setItem(
                "chaosExplorerData",
                JSON.stringify(allPrograms)
            );

            localStorage.setItem(
                "chaosExplorerUpdated",
                Date.now().toString()
            );

        }

        populatePlatforms();

        applyFilters();

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load data
                </td>
            </tr>
        `;

    }

}

function populatePlatforms() {

    const platforms =
        [
            ...new Set(
                allPrograms
                    .map(item => item.platform)
                    .filter(Boolean)
            )
        ]
        .sort();

    platformFilter.innerHTML = `
        <option value="">
            All Platforms
        </option>

        <option value="__none__">
            No Platform
        </option>
    `;

    platforms.forEach(platform => {

        const option =
            document.createElement("option");

        option.value =
            platform;

        option.textContent =
            platform;

        platformFilter.appendChild(option);

    });

}

function applyFilters() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();

    filteredPrograms =
        allPrograms.filter(item => {

            const searchMatch =
                item.name
                    .toLowerCase()
                    .includes(searchValue);

            const platformMatch =
                platformFilter.value === ""
                    ? true
                    : platformFilter.value === "__none__"
                        ? !item.platform
                        : item.platform === platformFilter.value;

            const bountyMatch =
                bountyFilter.value === "" ||
                String(item.bounty) ===
                bountyFilter.value;

            const swagMatch =
                swagFilter.value === "" ||
                String(item.swag) ===
                swagFilter.value;

            return (
                searchMatch &&
                platformMatch &&
                bountyMatch &&
                swagMatch
            );

        });

    if (
        subdomainOrder.value === "desc"
    ) {

        filteredPrograms.sort(
            (a, b) =>
                b.subdomains -
                a.subdomains
        );

    }

    if (
        subdomainOrder.value === "asc"
    ) {

        filteredPrograms.sort(
            (a, b) =>
                a.subdomains -
                b.subdomains
        );

    }

    updateStats();

    renderTable();

}

function updateStats() {

    totalPrograms.textContent =
        filteredPrograms.length
            .toLocaleString();

    const total =
        filteredPrograms.reduce(
            (sum, item) =>
                sum + item.subdomains,
            0
        );

    totalSubdomains.textContent =
        total.toLocaleString();

}

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }

    const date =
        new Date(dateString);

    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}

function renderTable() {

    if (
        !filteredPrograms.length
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No results found
                </td>
            </tr>
        `;

        return;

    }

    tableBody.innerHTML =
        filteredPrograms
            .map(item => `

                <tr>

                    <td>

                        ${
                            item.programUrl
                                ? `
                                <a
                                    href="${item.programUrl}"
                                    target="_blank"
                                    rel="noopener"
                                    class="programLink"
                                    title="Open Program"
                                >
                                    ${escapeHtml(item.name)}
                                    <span class="linkIcon">
                                        ↗
                                    </span>
                                </a>
                            `
                                : escapeHtml(item.name)
                        }

                    </td>

                    <td>
                        ${item.platform || "-"}
                    </td>

                    <td>
                        ${item.subdomains.toLocaleString()}
                    </td>

                    <td>
                        ${item.bounty ? "Yes" : "No"}
                    </td>

                    <td>
                        ${item.swag ? "Yes" : "No"}
                    </td>

                    <td>
                        ${formatDate(item.updated)}
                    </td>

                    <td>

                        ${
                            item.zipUrl
                                ? `
                                <a
                                    href="${item.zipUrl}"
                                    target="_blank"
                                    rel="noopener"
                                    class="zipButton"
                                    title="Download ZIP"
                                >
                                    Zip
                                </a>
                            `
                                : "-"
                        }

                    </td>

                </tr>

            `)
            .join("");

}

searchInput.addEventListener(
    "input",
    applyFilters
);

platformFilter.addEventListener(
    "change",
    applyFilters
);

bountyFilter.addEventListener(
    "change",
    applyFilters
);

swagFilter.addEventListener(
    "change",
    applyFilters
);

subdomainOrder.addEventListener(
    "change",
    applyFilters
);

resetButton.addEventListener(
    "click",
    () => {

        searchInput.value = "";
        platformFilter.value = "";
        bountyFilter.value = "";
        swagFilter.value = "";
        subdomainOrder.value = "";

        applyFilters();

    }
);

loadData();