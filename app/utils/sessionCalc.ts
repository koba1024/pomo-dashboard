import { useSessions } from "../hooks/useSessions"
import { Session } from "../types/session";

/*
今日のポモドーロ数取得
１. 現実世界の日付(例: 2026/03/19)を取得する。
2. sessionsのfinishedと現実世界の日付が同じ場合に、作業時間(work_minutes)を配列に格納する。(filter?)
3. 作業時間配列の長さが今日のポモドーロ数とする。
*/

/*
今日の作業時間取得
１. 現実世界の日付(例: 2026/03/19)を取得する。
2. sessionsのfinishedと現実世界の日付が同じ場合に、作業時間(work_minutes)を配列に格納する。(filter?)
3. 作業時間配列を全て足す。
*/

/*
今週の作業時間取得
日-土までを1週間とする。
１. 現実世界の日付(例: 2026/03/19)を取得する。
2. 曜日を取得する？(1週間の始まりを日曜日に設定するため)
3. 1週間の日付の時間を足す。
*/

/*
今月の作業時間取得
１. finished_atから月を取得する。
2. 月ごとにworkminutesを足す.
*/

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