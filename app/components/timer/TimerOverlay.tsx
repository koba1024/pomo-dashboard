import { TimerPhase, TimerStatus } from "@/app/types/timer";

function TimerOverlay({
  targetLabel,
  displayTime,
  timerStatus,
  timerPhase,
  onStop,
  onResume,
  onEnd,
  onBreak,
}: {
  targetLabel: string;
  displayTime: string;
  timerStatus: TimerStatus;
  timerPhase: TimerPhase;
  onStop: () => void;
  onResume: () => void;
  onEnd: () => void;
  onBreak: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="flex flex-col items-center">
        <div className="mb-2 text-sm opacity-75">現在の学習対象</div>
        {timerPhase === "working" ? (
          <div className="mb-2 text-center text-lg">🍅作業中</div>
        ) : timerPhase === "breaking" ? (
          <div className="mb-2 text-center text-lg">☕休憩中</div>
        ) : (
          ""
        )}
        <div className="mb-2 text-center text-lg">{targetLabel}</div>
        <div className="mb-6 text-5xl font-bold sm:text-6xl">{displayTime}</div>

        <div className="flex flex-wrap justify-center gap-4">
          {timerStatus === "paused" && (
            <button
              onClick={onResume}
              className="rounded bg-blue-500 px-8 py-3 font-medium text-white"
            >
              再開
            </button>
          )}

          <button
            onClick={onStop}
            disabled={
              timerStatus === "idle" ||
              timerStatus === "paused" ||
              timerStatus === "finished" ||
              timerStatus === "breaking"
            }
            className="disabled:opacity-60 disabled:cursor-not-allowed rounded border border-white bg-transparent px-8 py-3 font-medium text-white"
          >
            一時停止
          </button>
          <button
            onClick={onEnd}
            disabled={timerStatus === "finished"}
            className="disabled:opacity-60 disabled:cursor-not-allowed rounded border border-white bg-transparent px-8 py-3 font-medium text-white"
          >
            終了
          </button>
          <button
            onClick={onBreak}
            disabled={timerStatus === "idle" || timerStatus === "breaking"}
            className="disabled:opacity-60 disabled:cursor-not-allowed rounded border border-white bg-transparent px-8 py-3 font-medium text-white"
          >
            休憩
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimerOverlay;
