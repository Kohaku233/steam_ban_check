import Papa from "papaparse";

export type ImportRejectedRow = {
  row: number;
  reason: string;
};

export type ParsedAccountImport = {
  name: string;
  identifiers: string[];
  rejectedRows: ImportRejectedRow[];
};

export function parseAccountImport(content: string, fileName: string): ParsedAccountImport {
  const lowerName = fileName.toLowerCase();
  const isCsv = lowerName.endsWith(".csv");
  const rawRows = isCsv
    ? parseCsvRows(content)
    : content.split(/\r?\n/).map((line, index) => ({ row: index + 1, value: line.trim() }));

  const seen = new Set<string>();
  const identifiers: string[] = [];
  const rejectedRows: ImportRejectedRow[] = [];

  for (const row of rawRows) {
    if (!row.value && !isCsv) {
      continue;
    }

    const normalized = row.value.trim();
    if (!normalized) {
      rejectedRows.push({ row: row.row, reason: "No Steam identifier found" });
      continue;
    }

    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      identifiers.push(normalized);
    }
  }

  if (identifiers.length === 0) {
    throw new Error("No Steam identifiers found");
  }

  return {
    name: fileName,
    identifiers,
    rejectedRows,
  };
}

function parseCsvRows(content: string): Array<{ row: number; value: string }> {
  const result = Papa.parse<string[]>(content.trim(), {
    skipEmptyLines: true,
  });

  const rows = result.data;
  if (rows.length === 0) {
    return [];
  }

  const firstRow = rows[0]?.map((cell) => cell.trim().toLowerCase()) ?? [];
  const identifierColumn = firstRow.findIndex((cell) =>
    ["steamid", "steam_id", "steamid64", "profile", "profile_url", "url", "vanity"].includes(cell),
  );
  const hasHeader = identifierColumn >= 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const offset = hasHeader ? 2 : 1;

  return dataRows.map((row, index) => ({
    row: index + offset,
    value: hasHeader ? row[identifierColumn]?.trim() ?? "" : firstNonEmptyCell(row),
  }));
}

function firstNonEmptyCell(row: string[]): string {
  return row.find((cell) => cell.trim().length > 0)?.trim() ?? "";
}
