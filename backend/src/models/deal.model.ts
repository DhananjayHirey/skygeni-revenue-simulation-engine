export interface Deal {
  deal_id: string;
  created_date: Date;
  closed_date: Date | null;
  stage: string;
  deal_value: number;
  region: string;
  source: string;
}