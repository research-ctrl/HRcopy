export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  alerts: string[];
}

