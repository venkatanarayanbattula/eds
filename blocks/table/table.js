import { fetchPlaceholders, getMetadata } from '../../scripts/aem.js';

const placeholders = await fetchPlaceholders(getMetadata('locale'));

const {
  allCountries,
  abbreviation,
  africa,
  america,
  asia,
  australia,
  capital,
  continent,
  countries,
  europe,
  sNo,
} = placeholders;

async function createTableHeader(table) {
  const tr = document.createElement('tr');

  const sno = document.createElement('th');
  sno.textContent = sNo;

  const country = document.createElement('th');
  country.textContent = countries;

  const continentHeader = document.createElement('th');
  continentHeader.textContent = continent;

  const capitalHeader = document.createElement('th');
  capitalHeader.textContent = capital;

  const abbr = document.createElement('th');
  abbr.textContent = abbreviation;

  tr.append(sno, country, continentHeader, capitalHeader, abbr);
  table.appendChild(tr);
}

async function createTableRow(table, row, index) {
  const tr = document.createElement('tr');

  const sno = document.createElement('td');
  sno.textContent = index;

  const country = document.createElement('td');
  country.textContent = row.Country;

  const continent = document.createElement('td');
  continent.textContent = row.Continent;

  const capital = document.createElement('td');
  capital.textContent = row.Capital;

  const abbr = document.createElement('td');
  abbr.textContent = row.Abbreviation;

  tr.append(sno, country, continent, capital, abbr);
  table.appendChild(tr);
}

async function createSelectMap(jsonURL) {
  const optionsMap = new Map([
    ['all', allCountries],
    ['asia', asia],
    ['europe', europe],
    ['africa', africa],
    ['america', america],
    ['australia', australia],
  ]);

  const select = document.createElement('select');
  select.id = 'region';
  select.name = 'region';

  optionsMap.forEach((val, key) => {
    const option = document.createElement('option');
    option.textContent = val;
    option.value = key;
    select.appendChild(option);
  });

  const div = document.createElement('div');
  div.classList.add('region-select');
  div.appendChild(select);

  return div;
}

async function createTable(jsonURL, val) {
  const pathname = val ? jsonURL : new URL(jsonURL);
  const resp = await fetch(pathname);

  if (!resp.ok) {
    console.error('Failed to fetch data from:', pathname);
    return document.createElement('div');
  }

  const json = await resp.json();
  console.log('===== JSON Data =====>', json);

  const table = document.createElement('table');
  createTableHeader(table);

  if (json.data && Array.isArray(json.data)) {
    json.data.forEach((row, i) => {
      createTableRow(table, row, i + 1);
    });
  }

  return table;
}

export default async function decorate(block) {
  const countriesLink = block.querySelector('a[href$=".json"]');

  if (!countriesLink) {
    return;
  }

  const parentDiv = document.createElement('div');
  parentDiv.classList.add('countries-block');

  const regionDropdown = await createSelectMap(countriesLink.href);
  const table = await createTable(countriesLink.href, null);

  parentDiv.append(regionDropdown, table);
  countriesLink.replaceWith(parentDiv);

  const dropdown = document.getElementById('region');
  dropdown.addEventListener('change', async () => {
    let url = countriesLink.href;
    if (dropdown.value !== 'all') {
      url = `${countriesLink.href}?sheet=${dropdown.value}`;
    }

    const newTable = await createTable(url, dropdown.value);
    const oldTable = parentDiv.querySelector('table');
    oldTable.replaceWith(newTable);
  });
}
