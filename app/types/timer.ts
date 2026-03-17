export type TimerMode = "pomodoro" | "stopwatch";
export type TargetType = "study" | "todo";
export type InputDialogType = "target" | "workMinutes" | "breakMinutes";
export type TimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "finished"
  | "breaking";
export type TimerPhase = "working" | "breaking" | "idle";

export type TimerState = {
  status: TimerStatus;
  phase: TimerPhase;
  remainingSeconds: number;
};

export type TargetItem = {
  id: string;
  label: string;
};

export type TargetData = {
  study: TargetItem[];
  todo: TargetItem[];
};

export type PomodoroSettings = {
  workMinutes: number[];
  breakMinutes: number[];
  selectedWorkMinutes: number;
  selectedBreakMinutes: number;
};

export type TimerSettings = {
  targets: TargetData;
  pomodoro: PomodoroSettings;
};

export type TimerUiState = {
  mode: TimerMode;
  activeTargetType: TargetType;
  selectedTargetIdByType: Record<TargetType, string>;
  timer: TimerState;
  inputDialog: {
    isOpen: boolean;
    type: InputDialogType | null;
    value: string;
    errorMessage: string;
  };
};

export type TimerPageState = {
  settings: TimerSettings;
  ui: TimerUiState;
};

export type AddItemResult<T> =
  | { status: "success"; item: T }
  | { status: "error"; message: string };
