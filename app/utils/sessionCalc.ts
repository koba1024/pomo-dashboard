import { useSessions } from "../hooks/useSessions"
import { Session, WeeklyChartDataItem } from "../types/session";

function getTodaySessions(sessions: Session[], day?: Date): Session[] {
    const today = day ? new Date(day) : new Date();

    return sessions.filter((session) => {
        const sessionDay = new Date(session.finishedAt);
        return (
            sessionDay.getFullYear() === today.getFullYear() &&
            sessionDay.getMonth() === today.getMonth() &&
            sessionDay.getDate() === today.getDate()
        );
    });
}

export function getTodayPomodoros(sessions: Session[]): number {
    return getTodaySessions(sessions).length;
}

export function getTodayWorkMinutes(sessions: Session[], day?: Date): number {
    const todayWorks = getTodaySessions(sessions, day);
    return todayWorks.reduce((accu, curr) => accu + curr.workMinutes, 0);
}

export function getWeekWorkMinutes(sessions: Session[]): number {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return sessions
        .filter((session) => {
            const finishedAt = new Date(session.finishedAt);
            return finishedAt >= startOfWeek && finishedAt < endOfWeek;
        })
        .reduce((sum, session) => sum + session.workMinutes, 0);
}

export function getMonthWorkMinutes(sessions: Session[]): number {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    return sessions
        .filter((session) => {
            const finishedAt = new Date(session.finishedAt);
            return finishedAt.getFullYear() === thisYear && finishedAt.getMonth() === thisMonth;
        })
        .reduce((sum, session) => sum + session.workMinutes, 0);
}

export function getWeeklyChartData(
    sessions: Session[]
): WeeklyChartDataItem[] {
    const today = new Date();

    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (6 - i));
        day.setHours(0, 0, 0, 0);

        const minutes = getTodayWorkMinutes(sessions, day);
        const date = `${day.getMonth() + 1}/${day.getDate()}`;

        return { date, minutes };
    });
}

export function getStreak(sessions: Session[]): number {
    if (sessions.length === 0) return 0;

    let streak = 0;
    let i = 0;

    const oldestSessionDate = new Date(
        Math.min(...sessions.map((session) => new Date(session.finishedAt).getTime()))
    );
    oldestSessionDate.setHours(0, 0, 0, 0);

    while (true) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);

        if (day < oldestSessionDate) {
            break;
        }

        const hasSession = getTodayWorkMinutes(sessions, day) > 0;

        if (!hasSession) {
            break;
        }

        streak++;
        i++;
    }

    return streak;
}