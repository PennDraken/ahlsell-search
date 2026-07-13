const SHELF_INDEX = 4
const ARTICLE_INDEX = 0
const DESCRIPTION1_INDEX = 1
const DESCRIPTION2_INDEX = 2

var articleTable = document.getElementById('articleTable')
var resetButton = document.getElementById('resetButton')
resetButton.addEventListener('click', clearInputs)
var copyButton = document.getElementById('copyButton')
copyButton.addEventListener('click', exportData)

var universalSearchInput = document.getElementById('universalSearchInput')
universalSearchInput.addEventListener('input', updateArticlesView)
var shelfInput = document.getElementById('shelfInput')
shelfInput.addEventListener('input', updateArticlesView)
var articleInput = document.getElementById('articleInput')
articleInput.addEventListener('input', updateArticlesView)
var descriptionInput = document.getElementById('descriptionInput')
descriptionInput.addEventListener('input', updateArticlesView)

var rawRows = almedalData
populateTable(rawRows)

/* Reads files as text, can be extended to handle other types */
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/* Reset default behavior */
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  document.addEventListener(
    eventName,
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    false
  );
});

/* Handle file(s) upload */
document.addEventListener("drop", async (e) => {
  if (!e.dataTransfer?.files) {
    return;
  }

  for (const file of e.dataTransfer.files) {
    const content = await readFile(file);

    const data = parseCSV(content)
    rawRows = data.rows
    populateTable(rawRows)
  }
});

function populateTable(rows) {
  // Delete exising rows (except header)
  articleTable.innerHTML = ''
  // Insert rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    var tableRow = document.createElement("tr")
    var shelfCell   = document.createElement("td")
    var articleCell = document.createElement("td")
    var desc1Cell   = document.createElement("td")
    var desc2Cell   = document.createElement("td")
    shelfCell.innerHTML = row[4]
    articleCell.innerHTML = row[0]
    desc1Cell.innerHTML = row[1]
    desc2Cell.innerHTML = row[2]
    tableRow.appendChild(shelfCell)
    tableRow.appendChild(articleCell)
    tableRow.appendChild(desc1Cell)
    tableRow.appendChild(desc2Cell)
    // New tab image link
    var img = document.createElement('img')
    img.src = "new-tab-icon.svg"
    img.classList.add("icon")
    img.onclick = function() {
      window.location.href = 'https://www.ahlsell.se/products/' + row[0];
    };
    tableRow.appendChild(img)
    articleTable.appendChild(tableRow)
  }
  console.log(articleTable)
}

function parseCSV(text) {
  const lines = text.replaceAll('\'', '').split('\n'); //
  console.log("Loading " + lines.length + " rows")
  let header = []
  const rows = []
  // Load data
  for (let i = 0; i < lines.length; i++) {
    const row = lines[i].split(';');
    if (i == 0) {
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        header = row;
      }
    } else {
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        rows.push(row);
      }  
    }
  }
  console.log(rows)
  return {
    header: header,
    rows: rows,
  };
}

function stringContains(searchString, targetString) {
  // Custom search function handling some special search syntax
  const search = searchString.toLowerCase().trim();
  const target = targetString.toLowerCase();
  
  // If the user hasn't typed anything, pass the check automatically
  if (search === "") return true; 
  
  // Correct order: Does the row data (target) include the user's query (search)?
  return target.includes(search);
}

function updateArticlesView() {
  // Load strings from all inputs
  const universalString   = document.getElementById("universalSearchInput").value;
  const shelfString       = document.getElementById("shelfInput").value;
  const articleString     = document.getElementById("articleInput").value;
  const descriptionString = document.getElementById("descriptionInput").value;
  
  // Filter results with these inputs
  var filteredRows = []
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i]
    // Universal condition
    const universalCheck = stringContains(universalString, row[SHELF_INDEX]) ||
      stringContains(universalString, row[ARTICLE_INDEX]) ||
      stringContains(universalString, row[DESCRIPTION1_INDEX]) ||
      stringContains(universalString, row[DESCRIPTION2_INDEX]);
    const descriptionCheck = stringContains(descriptionString, row[DESCRIPTION1_INDEX]) ||
          stringContains(descriptionString, row[DESCRIPTION2_INDEX]);
    if (
      universalCheck &&
      stringContains(shelfString, row[SHELF_INDEX]) &&
      stringContains(articleString, row[ARTICLE_INDEX]) &&
      descriptionCheck
    ) {
      filteredRows.push(row)
    }
  }
  populateTable(filteredRows)
  console.log('Updated table!')
}

function clearInputs() {
  console.log('Cleared inputs!')
  // Resets all inputs
  document.getElementById("universalSearchInput").value = "";
  document.getElementById("shelfInput").value = "";
  document.getElementById("articleInput").value = "";
  document.getElementById("descriptionInput").value = "";
  updateArticlesView()
}

function exportData() {
  var textOutput = "["
  for (let i = 0; i < rawRows.length; i++) {
    textOutput += '["' + rawRows[i][0] + '"'
    // length - 1 as last elem is newline
    for (let j = 1; j < rawRows[i].length - 1; j++) {
      // need to escape to get correct formatting
      textOutput += ', "' + rawRows[i][j].replaceAll('"', '\\"') + '"'
    }
    if (i < rawRows.length) {
      textOutput += "],\n"
    } else {
      textOutput += "]"
    }
  }
  textOutput += "]"
  navigator.clipboard.writeText(textOutput)
}