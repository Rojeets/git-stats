export interface DayContribution {
  date: string;
  count: number;
}

export interface Stats {
  total: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: DayContribution;
  dailyAverage: number;
}
