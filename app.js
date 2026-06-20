const sourceUrl =
    "https://chaos-data.projectdiscovery.io/index.json";

let allData = [];

const searchInput =
    document.getElementById("searchInput");

const platformFilter =
    document.getElementById("platformFilter");

const bountyFilter =
    document.getElementById("bountyFilter");

const subdomainOrder =
    document.getElementById("subdomainOrder");

const tableBody =
    document.getElementById("tableBody");

const totalPrograms =
    document.getElementById("totalPrograms");

const totalSubdomains =
    document.getElementById("totalSubdomains");

const currentYear =
    document.getElementById("currentYear");

currentYear.textContent =
    new Date().getFullYear();

async function loadData() {

    const cachedData =
        localStorage.getItem(
            "chaosExplorerCache"
        );

    if (cachedData) {

        allData =
            JSON.parse(cachedData);

        populatePlatforms();

        renderTable();

    }

    try {

        const response =
            await fetch(sourceUrl);

        const rawData =
            await response.json();

        allData =
            rawData.map(item => ({

                name:
                    item.name || "-",

                platform:
                    item.platform || "-",

                subdomains:
                    item.count || 0,

                bounty:
                    Boolean(item.bounty),

                lastUpdated:
                    item.last_updated || "",

                programUrl:
                    item.program_url || "",

                zipUrl:
                    item.URL || ""

            }));

        localStorage.setItem(
            "chaosExplorerCache",
            JSON.stringify(allData)
        );

        populatePlatforms();

        renderTable();

    } catch (error) {

        console.error(
            "Failed to load data:",
            error
        );

    }

}

function populatePlatforms() {

    while (
        platformFilter.options.length > 1
    ) {

        platformFilter.remove(1);

    }

    const platforms =
        [
            ...new Set(
                allData
                    .map(
                        item =>
                            item.platform
                    )
                    .filter(
                        platform =>
                            platform &&
                            platform !== "-"
                    )
            )
        ]
        .sort();

    for (
        const platform
        of platforms
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            platform;

        option.textContent =
            platform;

        platformFilter.appendChild(
            option
        );

    }

}

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }

    try {

        return new Date(
            dateString
        ).toLocaleString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch {

        return "-";

    }

}

function renderTable() {

    let data =
        [...allData];

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();

    if (searchValue) {

        data =
            data.filter(
                item =>
                    item.name
                        .toLowerCase()
                        .includes(
                            searchValue
                        )
            );

    }

    if (
        platformFilter.value
    ) {

        data =
            data.filter(
                item =>
                    item.platform ===
                    platformFilter.value
            );

    }

    if (
        bountyFilter.value
    ) {

        data =
            data.filter(
                item =>
                    String(
                        item.bounty
                    ) ===
                    bountyFilter.value
            );

    }

    if (
        subdomainOrder.value ===
        "asc"
    ) {

        data.sort(
            (
                a,
                b
            ) =>
                a.subdomains -
                b.subdomains
        );

    }

    if (
        subdomainOrder.value ===
        "desc"
    ) {

        data.sort(
            (
                a,
                b
            ) =>
                b.subdomains -
                a.subdomains
        );

    }

    totalPrograms.textContent =
        data.length.toLocaleString();

    totalSubdomains.textContent =
        data
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.subdomains,
                0
            )
            .toLocaleString();

    tableBody.innerHTML =
        data
            .map(
                item => `
<tr>

<td>
${
    item.programUrl
        ? `
<a
    href="${item.programUrl}"
    target="_blank"
    class="programLink"
    title="Open Program"
>
${item.name}
<span class="linkIcon">↗</span>
</a>
`
        : item.name
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
${formatDate(
    item.lastUpdated
)}
</td>

<td>
${
    item.zipUrl
        ? `
<a
    href="${item.zipUrl}"
    target="_blank"
    class="zipButton"
>
Zip
</a>
`
        : "-"
}
</td>

</tr>
`
            )
            .join("");

}

searchInput.addEventListener(
    "input",
    renderTable
);

platformFilter.addEventListener(
    "change",
    renderTable
);

bountyFilter.addEventListener(
    "change",
    renderTable
);

subdomainOrder.addEventListener(
    "change",
    renderTable
);

document
    .getElementById(
        "resetButton"
    )
    .addEventListener(
        "click",
        () => {

            searchInput.value =
                "";

            platformFilter.value =
                "";

            bountyFilter.value =
                "";

            subdomainOrder.value =
                "";

            renderTable();

        }
    );

loadData();