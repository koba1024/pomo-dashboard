export type Session = {
    id: string;
    userId: string;
    targetLabel: string;
    workMinutes: number;
    startedAt: string;
    finishedAt: string;
}

export type WeeklyChartDataItem = {
    date: string;
    minutes: number;
};