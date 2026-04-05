import { loadCSV } from "./services/csv.service";

(async () => {
  await loadCSV("deals.csv");
  console.log("CSV Loaded");
})();