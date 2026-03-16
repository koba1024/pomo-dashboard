import { MAX_TIME_OPTION_COUNT } from "@/app/constants/timer";
import SelectableOptionButton from "../ui/SelectableOptionButton";
import AddOptionButton from "../ui/AddOptionButton";
import { PomodoroSettings } from "@/app/types/timer";

function PomodoroSettingsSection({
  pomodoro,
  onSelectWorkMinutes,
  onSelectBreakMinutes,
  onAddWorkMinutes,
  onAddBreakMinutes,
}: {
  pomodoro: PomodoroSettings;
  onSelectWorkMinutes: (minutes: number) => void;
  onSelectBreakMinutes: (minutes: number) => void;
  onAddWorkMinutes: () => void;
  onAddBreakMinutes: () => void;
}) {
  return (
    <section className="mb-6 rounded bg-white p-4 shadow">
      <div className="mb-4 text-sm opacity-75">ポモドーロ設定</div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded border border-gray-200 p-4">
          <div className="mb-3 text-sm opacity-75">ポモドーロ時間</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pomodoro.workMinutes.map((minutes) => (
              <SelectableOptionButton
                key={minutes}
                label={`${minutes}分`}
                selected={minutes === pomodoro.selectedWorkMinutes}
                onClick={() => onSelectWorkMinutes(minutes)}
              />
            ))}
            {Array.from({
              length: MAX_TIME_OPTION_COUNT - pomodoro.workMinutes.length,
            }).map((_, index) => (
              <AddOptionButton
                key={`work-minutes-add-${index}`}
                onClick={onAddWorkMinutes}
              />
            ))}
          </div>
        </div>

        <div className="rounded border border-gray-200 p-4">
          <div className="mb-3 text-sm opacity-75">休憩時間</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pomodoro.breakMinutes.map((minutes) => (
              <SelectableOptionButton
                key={minutes}
                label={`${minutes}分`}
                selected={minutes === pomodoro.selectedBreakMinutes}
                onClick={() => onSelectBreakMinutes(minutes)}
              />
            ))}
            {Array.from({
              length: MAX_TIME_OPTION_COUNT - pomodoro.breakMinutes.length,
            }).map((_, index) => (
              <AddOptionButton
                key={`break-minutes-add-${index}`}
                onClick={onAddBreakMinutes}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PomodoroSettingsSection;
