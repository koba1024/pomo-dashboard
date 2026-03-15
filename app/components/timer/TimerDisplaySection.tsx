import { TimerStatus } from "@/app/types/timer";

function TimerDisplaySection({
  targetLabel,
  modeLabel,
  displayTime,
  timerStatus,
  onStart,
}: {
  targetLabel: string;
  modeLabel: string;
  displayTime: string;
  timerStatus: TimerStatus;
  onStart: () => void;
}) {
  return (
    <section className="mb-6 rounded bg-white p-8 shadow">
      <div className="flex flex-col items-center">
        <div className="mb-3 text-sm opacity-75">現在の学習対象</div>
        <div className="mb-2 text-center text-lg">{targetLabel}</div>
        <div className="mb-2 text-sm opacity-75">{modeLabel}</div>
        <div className="mb-6 text-5xl font-bold sm:text-6xl">{displayTime}</div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onStart}
            disabled={timerStatus === "running" || timerStatus === "breaking"}
            className="disabled:opacity-60 disabled:cursor-not-allowed rounded bg-blue-500 px-8 py-3 font-medium text-white"
          >
            開始
          </button>
        </div>
      </div>
    </section>
  );
}

export default TimerDisplaySection;
