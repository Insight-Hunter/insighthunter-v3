// ============================================================================
// CSV PARSING
// Parse CSV content and validate structure
// ============================================================================

function parseCSV(csvText) {
// Split into lines and handle different line ending styles
const lines = csvText.split(/\r?\n/).filter(line => line.trim());

if (lines.length === 0) {
throw new Error(‘CSV file is empty’);
}

// Parse the header row to identify columns
const headers = lines[0].split(’,’).map(h => h.trim().toLowerCase());

// Check for required columns with flexible matching
const dateColumn = headers.findIndex(h =>
h.includes(‘date’) || h.includes(‘transaction date’)
);
const amountColumn = headers.findIndex(h =>
h.includes(‘amount’) || h.includes(‘transaction amount’)
);
const descriptionColumn = headers.findIndex(h =>
h.includes(‘description’) || h.includes(‘memo’) || h.includes(‘details’)
);

if (dateColumn === -1 || amountColumn === -1 || descriptionColumn === -1) {
throw new Error(
’CSV must include date, amount, and description columns. ’ +
‘Found columns: ’ + headers.join(’, ’)
);
}

// Parse data rows
const transactions = [];

for (let i = 1; i < lines.length; i++) {
const line = lines[i];
if (!line.trim()) continue;

```
// Simple CSV parsing - in production you'd want a more robust parser
// that handles quoted fields with commas
const values = line.split(',').map(v => v.trim());

// Skip rows that don't have enough columns
if (values.length <= Math.max(dateColumn, amountColumn, descriptionColumn)) {
  continue;
}

const date = values[dateColumn];
const amount = parseFloat(values[amountColumn].replace(/[^0-9.-]/g, ''));
const description = values[descriptionColumn];

// Validate the parsed data
if (!date || isNaN(amount) || !description) {
  continue; // Skip invalid rows
}

transactions.push({
  date: normalizeDate(date),
  amount,
  description,
  rawLine: line
});
```

}

return transactions;
}

