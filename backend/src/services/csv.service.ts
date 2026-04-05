import fs from "fs";
import csv from "csv-parser";
import { pool } from "../config/db";

export const loadCSV = async (filePath: string) => {
  const results: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        for (const row of results) {
          await pool.query(`INSERT INTO deals (deal_id, created_date, closed_date, stage, deal_value, region, source)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [row.deal_id,row.created_date, row.closed_date || null, row.stage, Number(row.deal_value), row.region, row.source,]
          );
        }
        resolve();
      })
      .on("error", reject);
  });
};