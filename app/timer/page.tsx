"use client";

import { useEffect, useRef, useState } from "react";
import SectionToggleButton from "../components/ui/SectionToggleButton";
import TargetSelectionSection from "../components/timer/TargetSelectionSection";
import {
	TimerMode,
	TargetType,
	InputDialogType,
	TargetItem,
	TargetData,
	PomodoroSettings,
	TimerSettings,
	TimerUiState,
	TimerPageState,
	TimerStatus,
	TimerState,
} from "../types/timer";
import PomodoroSettingsSection from "../components/timer/PomodoroSettingsSection";
import StopwatchInfoSection from "../components/timer/StopwatchInfoSection";
import TimerDisplaySection from "../components/timer/TimerDisplaySection";
import InputDialog from "../components/ui/InputDialog";
import {
	MAX_TARGET_OPTION_COUNT,
	MAX_TIME_OPTION_COUNT,
} from "../constants/timer";
import {
	getTargetTypeLabel,
	addItemWithValidation,
	parseTextInput,
	getInvalidTextMessage,
	createTargetId,
	parseMinuteInput,
	getInvalidMinuteMessage,
	sortMinutes,
	getDialogTitle,
} from "../utils/timer";
import TimerOverlay from "../components/timer/TimerOverlay";
import Sidebar from "../components/layout/Sidebar";
import { playSound } from "../utils/sound";
import { saveSession } from "@/lib/supabase/session";

const initialState: TimerPageState = {
	settings: {
		targets: {
			study: [
				{ id: "study-1", label: "フロントエンド学習" },
				{ id: "study-2", label: "英会話" },
				{ id: "study-3", label: "放送大学" },
			],
			todo: [
				{ id: "todo-1", label: "SQL復習" },
				{ id: "todo-2", label: "Issue確認" },
				{ id: "todo-3", label: "英作文1問" },
			],
		},
		pomodoro: {
			workMinutes: [1],
			breakMinutes: [1],
			selectedWorkMinutes: 1,
			selectedBreakMinutes: 1,
		},
	},
	ui: {
		mode: "pomodoro",
		activeTargetType: "study",
		selectedTargetIdByType: {
			study: "study-1",
			todo: "todo-1",
		},
		timer: {
			status: "idle",
			phase: "idle",
			remainingSeconds: 1 * 60,
		},
		inputDialog: {
			isOpen: false,
			type: null,
			value: "",
			errorMessage: "",
		},
	},
};

export default function TimerPage() {
	const [state, setState] = useState<TimerPageState>(initialState);

	const activeTargetType = state.ui.activeTargetType;
	const activeTargetItems = state.settings.targets[activeTargetType];
	const selectedTargetId = state.ui.selectedTargetIdByType[activeTargetType];
	const selectedTarget =
		activeTargetItems.find((item) => item.id === selectedTargetId) ??
		activeTargetItems[0];

	const prevStatusRef = useRef(state.ui.timer.status);

	useEffect(() => {
		const prev = prevStatusRef.current;
		const curr = state.ui.timer.status;

		if (prev === "running" && curr === "breaking") {
			playSound();
			void handleWorkComplete();
		}

		if (prev === "breaking" && curr === "running") {
			playSound();
			startedAtRef.current = new Date();
		}

		prevStatusRef.current = curr;
	}, [state.ui.timer.status]);

	useEffect(() => {
		if (
			state.ui.timer.status === "running" ||
			state.ui.timer.status === "breaking"
		) {
			const interval = setInterval(() => {
				updateTimer((current) => {
					if (current.remainingSeconds === 0) {
						if (current.status === "running") {
							return {
								...current,
								remainingSeconds:
									state.settings.pomodoro
										.selectedBreakMinutes * 60,
								status: "breaking",
								phase: "breaking",
							};
						}
						if (current.status === "breaking") {
							return {
								...current,
								remainingSeconds:
									state.settings.pomodoro
										.selectedWorkMinutes * 60,
								status: "running",
								phase: "working",
							};
						}
						return { ...current, status: "finished" };
					}
					return {
						...current,
						remainingSeconds: current.remainingSeconds - 1,
					};
				});
			}, 1000);

			return () => clearInterval(interval);
		} else {
			return;
		}
	}, [
		state.ui.timer.status,
		state.settings.pomodoro.selectedWorkMinutes,
		state.settings.pomodoro.selectedBreakMinutes,
	]);

	const updateUi = (updater: (current: TimerUiState) => TimerUiState) => {
		setState((prev) => ({
			...prev,
			ui: updater(prev.ui),
		}));
	};

	const updateSettings = (
		updater: (current: TimerSettings) => TimerSettings,
	) => {
		setState((prev) => ({
			...prev,
			settings: updater(prev.settings),
		}));
	};

	const updatePomodoro = (
		updater: (current: PomodoroSettings) => PomodoroSettings,
	) => {
		updateSettings((current) => ({
			...current,
			pomodoro: updater(current.pomodoro),
		}));
	};

	const updateTargets = (updater: (current: TargetData) => TargetData) => {
		updateSettings((current) => ({
			...current,
			targets: updater(current.targets),
		}));
	};

	const updateTimer = (updater: (current: TimerState) => TimerState) => {
		updateUi((current) => ({
			...current,
			timer: updater(current.timer),
		}));
	};

	const closeInputDialog = () => {
		updateUi((current) => ({
			...current,
			inputDialog: {
				isOpen: false,
				type: null,
				value: "",
				errorMessage: "",
			},
		}));
	};

	const openInputDialog = (type: InputDialogType) => {
		updateUi((current) => ({
			...current,
			inputDialog: {
				isOpen: true,
				type,
				value: "",
				errorMessage: "",
			},
		}));
	};

	const handleChangeMode = (mode: TimerMode) => {
		updateUi((current) => ({ ...current, mode }));
	};

	const handleChangeTargetType = (targetType: TargetType) => {
		updateUi((current) => ({ ...current, activeTargetType: targetType }));
	};

	const handleSelectTargetItem = (targetType: TargetType, itemId: string) => {
		updateUi((current) => ({
			...current,
			selectedTargetIdByType: {
				...current.selectedTargetIdByType,
				[targetType]: itemId,
			},
		}));
	};

	const handleOpenAddTargetDialog = (targetType: TargetType) => {
		updateUi((current) => ({
			...current,
			activeTargetType: targetType,
			inputDialog: {
				isOpen: true,
				type: "target",
				value: "",
				errorMessage: "",
			},
		}));
	};

	const handleOpenAddWorkMinutesDialog = () => {
		openInputDialog("workMinutes");
	};

	const handleOpenAddBreakMinutesDialog = () => {
		openInputDialog("breakMinutes");
	};

	const handleDialogValueChange = (value: string) => {
		updateUi((current) => ({
			...current,
			inputDialog: {
				...current.inputDialog,
				value,
				errorMessage: "",
			},
		}));
	};

	const handleDialogSubmit = () => {
		const dialogType = state.ui.inputDialog.type;
		const input = state.ui.inputDialog.value;

		if (dialogType === null) {
			return;
		}

		if (dialogType === "target") {
			const targetType = state.ui.activeTargetType;
			const currentItems = state.settings.targets[targetType];
			const label = getTargetTypeLabel(targetType);

			const result = addItemWithValidation<string>({
				input,
				parser: parseTextInput,
				items: currentItems.map((item) => item.label),
				maxCount: MAX_TARGET_OPTION_COUNT,
				duplicateMessage: `${label}が重複しています。`,
				invalidMessage: getInvalidTextMessage,
			});

			if (result.status === "error") {
				updateUi((current) => ({
					...current,
					inputDialog: {
						...current.inputDialog,
						errorMessage: result.message,
					},
				}));
				return;
			}

			const newItem: TargetItem = {
				id: createTargetId(targetType),
				label: result.item,
			};

			updateTargets((current) => ({
				...current,
				[targetType]: [...current[targetType], newItem],
			}));

			updateUi((current) => ({
				...current,
				selectedTargetIdByType: {
					...current.selectedTargetIdByType,
					[targetType]: newItem.id,
				},
				inputDialog: {
					isOpen: false,
					type: null,
					value: "",
					errorMessage: "",
				},
			}));

			return;
		}

		if (dialogType === "workMinutes") {
			const result = addItemWithValidation<number>({
				input,
				parser: parseMinuteInput,
				items: state.settings.pomodoro.workMinutes,
				maxCount: MAX_TIME_OPTION_COUNT,
				duplicateMessage: "ポモドーロ時間が重複しています。",
				invalidMessage: getInvalidMinuteMessage,
			});

			if (result.status === "error") {
				updateUi((current) => ({
					...current,
					inputDialog: {
						...current.inputDialog,
						errorMessage: result.message,
					},
				}));
				return;
			}

			updatePomodoro((current) => ({
				...current,
				workMinutes: sortMinutes([...current.workMinutes, result.item]),
				selectedWorkMinutes: result.item,
			}));

			closeInputDialog();
			return;
		}

		const result = addItemWithValidation<number>({
			input,
			parser: parseMinuteInput,
			items: state.settings.pomodoro.breakMinutes,
			maxCount: MAX_TIME_OPTION_COUNT,
			duplicateMessage: "休憩時間が重複しています。",
			invalidMessage: getInvalidMinuteMessage,
		});

		if (result.status === "error") {
			updateUi((current) => ({
				...current,
				inputDialog: {
					...current.inputDialog,
					errorMessage: result.message,
				},
			}));
			return;
		}

		updatePomodoro((current) => ({
			...current,
			breakMinutes: sortMinutes([...current.breakMinutes, result.item]),
			selectedBreakMinutes: result.item,
		}));

		closeInputDialog();
	};

	const startedAtRef = useRef<Date | null>(null);
	const handleStart = () => {
		startedAtRef.current = new Date();
		updateTimer((current) => {
			const shouldReset =
				current.status === "idle" || current.status === "finished";
			return {
				...current,
				status: "running",
				phase: "working",
				remainingSeconds: shouldReset
					? state.settings.pomodoro.selectedWorkMinutes * 60
					: current.remainingSeconds,
			};
		});
	};

	const handleStop = () => {
		updateTimer((current) => ({ ...current, status: "paused" }));
	};

	const handleEnd = () => {
		updateTimer((current) => ({
			...current,
			status: "finished",
			remainingSeconds: state.settings.pomodoro.selectedWorkMinutes * 60,
		}));
	};

	const handleBreak = () => {
		updateTimer((current) => ({
			...current,
			status: "breaking",
			phase: "breaking",
			remainingSeconds: state.settings.pomodoro.selectedBreakMinutes * 60,
		}));
	};

	const handleWorkComplete = async () => {
		if (!startedAtRef.current) return;
		await saveSession({
			targetLabel: selectedTarget?.label ?? "",
			workMinutes: state.settings.pomodoro.selectedWorkMinutes,
			startedAt: startedAtRef.current,
			finishedAt: new Date(),
		});
		startedAtRef.current = null; // リセット
	};

	const modeLabel =
		state.ui.mode === "pomodoro"
			? "ポモドーロモード"
			: "ストップウォッチモード";
	const remainingSeconds = state.ui.timer.remainingSeconds;
	const minutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;
	const displayTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	const dialogTitle = getDialogTitle(
		state.ui.inputDialog.type ?? "target",
		state.ui.activeTargetType,
	);

	return (
		<>
			<div className="flex min-h-screen flex-col md:flex-row">
				<Sidebar />

				<div className="flex-1 bg-gray-100">
					<header className="border-b border-gray-200 bg-white px-6 py-4">
						<h1 className="text-3xl font-bold">
							ポモドーロタイマー
						</h1>
					</header>

					<main className="p-4 sm:p-6">
						<section className="mb-6 rounded bg-white p-4 shadow">
							<div className="flex flex-wrap gap-4">
								<SectionToggleButton
									label="ポモドーロ"
									active={state.ui.mode === "pomodoro"}
									onClick={() => handleChangeMode("pomodoro")}
								/>
								<SectionToggleButton
									label="ストップウォッチ"
									active={state.ui.mode === "stopwatch"}
									onClick={() =>
										handleChangeMode("stopwatch")
									}
								/>
							</div>
						</section>

						<TargetSelectionSection
							activeTargetType={state.ui.activeTargetType}
							targets={state.settings.targets}
							selectedTargetIdByType={
								state.ui.selectedTargetIdByType
							}
							onChangeTargetType={handleChangeTargetType}
							onSelectItem={handleSelectTargetItem}
							onAddItem={handleOpenAddTargetDialog}
						/>

						{state.ui.mode === "pomodoro" ? (
							<PomodoroSettingsSection
								pomodoro={state.settings.pomodoro}
								onSelectWorkMinutes={(minutes) =>
									updatePomodoro((current) => ({
										...current,
										selectedWorkMinutes: minutes,
									}))
								}
								onSelectBreakMinutes={(minutes) =>
									updatePomodoro((current) => ({
										...current,
										selectedBreakMinutes: minutes,
									}))
								}
								onAddWorkMinutes={
									handleOpenAddWorkMinutesDialog
								}
								onAddBreakMinutes={
									handleOpenAddBreakMinutesDialog
								}
							/>
						) : (
							<StopwatchInfoSection />
						)}

						<TimerDisplaySection
							targetLabel={selectedTarget?.label ?? "未選択"}
							modeLabel={modeLabel}
							displayTime={displayTime}
							timerStatus={state.ui.timer.status}
							onStart={handleStart}
						/>

						{(state.ui.timer.status === "running" ||
							state.ui.timer.status === "breaking" ||
							state.ui.timer.status === "paused") && (
							<TimerOverlay
								targetLabel={selectedTarget?.label ?? "未選択"}
								displayTime={displayTime}
								timerStatus={state.ui.timer.status}
								timerPhase={state.ui.timer.phase}
								onStop={handleStop}
								onResume={handleStart}
								onEnd={handleEnd}
								onBreak={handleBreak}
							/>
						)}
					</main>
				</div>
			</div>

			<InputDialog
				isOpen={state.ui.inputDialog.isOpen}
				title={dialogTitle}
				value={state.ui.inputDialog.value}
				errorMessage={state.ui.inputDialog.errorMessage}
				onChange={handleDialogValueChange}
				onClose={closeInputDialog}
				onSubmit={handleDialogSubmit}
			/>
		</>
	);
}
