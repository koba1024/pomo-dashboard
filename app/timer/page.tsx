"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SectionToggleButton from "../components/ui/SectionToggleButton";
import TargetSelectionSection from "../components/timer/TargetSelectionSection";
import {
	TimerMode,
	TargetType,
	InputDialogType,
	TargetItem,
	PomodoroSettings,
	TimerSettings,
	TimerUiState,
	TimerPageState,
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
	parseMinuteInput,
	getInvalidMinuteMessage,
	sortMinutes,
	getDialogTitle,
} from "../utils/timer";
import TimerOverlay from "../components/timer/TimerOverlay";
import Sidebar from "../components/layout/Sidebar";
import { playSound } from "../utils/sound";
import { saveSession } from "@/lib/supabase/session";
import { supabase } from "@/lib/supabase/client";
import Header from "../components/layout/Header";
import { useTodos } from "../hooks/useTodos";
import { useStudyCards } from "../hooks/useStudyCards";
import { usePomoSettings } from "../hooks/usePomoSettings";

const initialState: TimerPageState = {
	settings: {
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
			study: "",
			todo: "",
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
	const router = useRouter();
	const [checking, setChecking] = useState(true);
	const { todos, addTodo, deleteTodo } = useTodos();
	const { studyCards, addStudyCard, deleteStudyCard } = useStudyCards();
	const { pomoSettings, saveSettings } = usePomoSettings();
	const [state, setState] = useState<TimerPageState>(initialState);
	const startedAtRef = useRef<Date | null>(null);

	useEffect(() => {
		const checkAuth = async () => {
			const { data } = await supabase.auth.getSession();
			if (!data.session) {
				router.replace("/signin");
				return;
			}
			setChecking(false);
		};
		void checkAuth();
	}, [router]);

	const todoTargetItems: TargetItem[] = todos.map((todo) => ({
		id: todo.id,
		label: todo.text,
	}));

	const studyTargetItems: TargetItem[] = studyCards.map((card) => ({
		id: card.id,
		label: card.label,
	}));

	const activeTargetType = state.ui.activeTargetType;
	const activeTargetItems =
		activeTargetType === "study" ? studyTargetItems : todoTargetItems;
	const selectedTargetId = state.ui.selectedTargetIdByType[activeTargetType];
	const selectedTarget =
		activeTargetItems.find((item) => item.id === selectedTargetId) ??
		activeTargetItems[0];

	// ページ遷移時などに先頭アイテムを選択する。(studyCard)
	useEffect(() => {
		const selectedId = state.ui.selectedTargetIdByType.study;
		const exists = studyTargetItems.some((item) => item.id === selectedId);

		if (studyTargetItems.length > 0 && !exists) {
			handleSelectTargetItem("study", studyTargetItems[0].id);
		}
	}, [studyTargetItems, state.ui.selectedTargetIdByType.study]);

	// ページ遷移時などに先頭アイテムを選択する。(todo)
	useEffect(() => {
		const selectedId = state.ui.selectedTargetIdByType.todo;
		const exists = todoTargetItems.some((item) => item.id === selectedId);

		if (todoTargetItems.length > 0 && !exists) {
			handleSelectTargetItem("todo", todoTargetItems[0].id);
		}
	}, [todoTargetItems, state.ui.selectedTargetIdByType.todo]);

	// workタイマー終了時処理
	const handleWorkComplete = useCallback(
		async (workMinutes: number, startedAt: Date) => {
			try {
				await saveSession({
					targetLabel: selectedTarget?.label ?? "",
					workMinutes,
					startedAt,
					finishedAt: new Date(),
				});
			} catch (error) {
				console.error("セッションの保存に失敗しました:", error);
			}
		},
		[selectedTarget],
	);

	// Supabaseから保存済み設定を読み込んで、ローカルのstateに反映するための処理
	useEffect(() => {
		if (pomoSettings) {
			updatePomodoro(() => pomoSettings);
		}
	}, [pomoSettings]);

	// 1つ前のステータスを使用したい。
	const prevStatusRef = useRef(state.ui.timer.status);

	// workとbreakを交互に行いたい
	useEffect(() => {
		const prev = prevStatusRef.current;
		const curr = state.ui.timer.status;
		// running→breakingになった時の処理
		if (prev === "running" && curr === "breaking") {
			playSound();
			const finishedStartedAt = startedAtRef.current;
			startedAtRef.current = new Date();
			if (finishedStartedAt) {
				void handleWorkComplete(
					state.settings.pomodoro.selectedWorkMinutes,
					finishedStartedAt,
				);
			}
		}

		// breaking→runningになったときの処理
		if (prev === "breaking" && curr === "running") {
			startedAtRef.current = new Date();
			playSound();
		}

		prevStatusRef.current = curr;
	}, [
		state.ui.timer.status,
		handleWorkComplete,
		state.settings.pomodoro.selectedWorkMinutes,
		state.settings.pomodoro.selectedBreakMinutes,
	]);

	// タイマーの選択時間が変わったら表示時間を更新する処理
	useEffect(() => {
		if (
			state.ui.timer.status === "idle" ||
			state.ui.timer.status === "finished"
		) {
			updateTimer((current) => ({
				...current,
				remainingSeconds:
					state.settings.pomodoro.selectedWorkMinutes * 60,
			}));
			return;
		}
	}, [state.ui.timer.status, state.settings.pomodoro.selectedWorkMinutes]);

	useEffect(() => {
		// runningまたはbreakingの時にだけインターバルタイマーを起動したい。
		if (
			state.ui.timer.status === "running" ||
			state.ui.timer.status === "breaking"
		) {
			const interval = setInterval(() => {
				updateTimer((current) => {
					// 開始時間を使用したい。
					const startedAt = startedAtRef.current;
					if (!startedAt) {
						return current;
					}

					// 基となる時間を選択したい
					const baseSeconds =
						current.status === "running"
							? state.settings.pomodoro.selectedWorkMinutes * 60
							: state.settings.pomodoro.selectedBreakMinutes * 60;

					// 現在時刻を取得したい。
					const currentTime = Date.now();

					// 現在時間 - スタート時間を引いて、経過時間を取得したい。
					const elapsed = Math.floor(
						(currentTime - startedAt.getTime()) / 1000,
					);

					// 選択した時間よりも経過時間が多い時は0にしたい。
					const nextRemainingSeconds = Math.max(
						baseSeconds - elapsed,
						0,
					);

					// 残り時間が0になったときの処理
					if (nextRemainingSeconds === 0) {
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

					// 値を更新したい。
					return {
						...current,
						remainingSeconds: nextRemainingSeconds,
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

	const handleDialogSubmit = async () => {
		const dialogType = state.ui.inputDialog.type;
		const input = state.ui.inputDialog.value;

		if (dialogType === null) {
			return;
		}

		if (dialogType === "target") {
			const targetType = state.ui.activeTargetType;
			const currentItems =
				targetType === "study" ? studyTargetItems : todoTargetItems;
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

			if (targetType === "study") {
				const newCard = await addStudyCard(result.item);
				if (newCard) handleSelectTargetItem(targetType, newCard.id);
			}
			if (targetType === "todo") {
				const newTodo = await addTodo(result.item);
				if (newTodo) handleSelectTargetItem(targetType, newTodo.id);
			}

			closeInputDialog();

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

			const newPomodoro: PomodoroSettings = {
				...state.settings.pomodoro,
				workMinutes: sortMinutes([
					...state.settings.pomodoro.workMinutes,
					result.item,
				]),
				selectedWorkMinutes: result.item,
			};
			updatePomodoro(() => newPomodoro);
			closeInputDialog();
			void saveSettings(newPomodoro);
		}

		if (dialogType === "breakMinutes") {
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

			const newPomodoro: PomodoroSettings = {
				...state.settings.pomodoro,
				breakMinutes: sortMinutes([
					...state.settings.pomodoro.breakMinutes,
					result.item,
				]),
				selectedBreakMinutes: result.item,
			};
			updatePomodoro(() => newPomodoro);
			closeInputDialog();
			void saveSettings(newPomodoro);
		}
	};

	// タイマーのスタートボタン、一時停止後の再開ボタン処理。
	const handleStart = () => {
		updateTimer((current) => {
			// idleまたはfinishedの時は時間を選択した値に戻したい。(初期値はidleなのでtrueになる)
			const shouldReset =
				current.status === "idle" || current.status === "finished";

			// 次のフェーズを指定したい。(idleの次はworking)
			const nextPhase = shouldReset ? "working" : current.phase;

			// 基となる秒数を選択したい。(一時停止ではステータスのみがpauseになる。phaseはworking)
			const baseSeconds =
				nextPhase === "working"
					? state.settings.pomodoro.selectedWorkMinutes * 60
					: state.settings.pomodoro.selectedBreakMinutes * 60;

			// 残時間を求めたい。(初回はidleなのでbaseを選ぶが、一時停止後の再開では現在の残時間を選択する)
			const nextRemainingSeconds = shouldReset
				? baseSeconds
				: current.remainingSeconds;

			// このフェーズですでに経過した秒数を求めたい。
			// 再開時は、この経過秒数だけ過去にstartedAtをずらして、一時停止中の時間を含めないようにする。
			const elapsedSeconds = baseSeconds - nextRemainingSeconds;

			// startedAtを更新したい。
			// 再開時は「すでに経過した秒数」だけ現在時刻から戻した時刻をstartedAtにすることで、
			// 一時停止していた時間を経過時間に含めないようにする。
			startedAtRef.current = new Date(Date.now() - elapsedSeconds * 1000);

			// ステータスの更新をしたい。
			return {
				...current,
				status: nextPhase === "working" ? "running" : "breaking",
				phase: nextPhase,
				remainingSeconds: nextRemainingSeconds,
			};
		});
	};

	// タイマーストップボタン処理
	const handleStop = () => {
		updateTimer((current) => ({ ...current, status: "paused" }));
	};

	// タイマー終了ボタン処理
	const handleEnd = () => {
		const timer = state.ui.timer;

		if (timer.phase === "working" && startedAtRef.current) {
			const workSeconds =
				state.settings.pomodoro.selectedWorkMinutes * 60;
			const actualMinutes = Math.max(
				Math.floor((workSeconds - timer.remainingSeconds) / 60),
				0,
			);
			void handleWorkComplete(actualMinutes, startedAtRef.current);
		}

		startedAtRef.current = null;

		updateTimer((current) => ({
			...current,
			status: "finished",
			phase: "idle",
			remainingSeconds: state.settings.pomodoro.selectedWorkMinutes * 60,
		}));
	};

	// 休憩ボタン処理
	const handleBreak = () => {
		startedAtRef.current = new Date();

		updateTimer((current) => ({
			...current,
			status: "breaking",
			phase: "breaking",
			remainingSeconds: state.settings.pomodoro.selectedBreakMinutes * 60,
		}));
	};

	// アイテム削除処理
	const handleDeleteItem = (targetType: TargetType, id: string) => {
		if (targetType === "todo") deleteTodo(id);
		if (targetType === "study") deleteStudyCard(id);
	};

	// タイマー削除処理
	const handleDeleteMinutes = (newWork: number[], newBreak: number[]) => {
		const pomodoro = state.settings.pomodoro;
		const newPomodoro: PomodoroSettings = {
			...pomodoro,
			workMinutes: newWork,
			breakMinutes: newBreak,

			selectedWorkMinutes: newWork.includes(pomodoro.selectedWorkMinutes)
				? pomodoro.selectedWorkMinutes
				: newWork[0],
			selectedBreakMinutes: newBreak.includes(
				pomodoro.selectedBreakMinutes,
			)
				? pomodoro.selectedBreakMinutes
				: newBreak[0],
		};
		updatePomodoro(() => newPomodoro);
		saveSettings(newPomodoro);
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

	if (checking) return <div>Loading...</div>;

	return (
		<>
			<div className="flex min-h-screen flex-col md:flex-row">
				<Sidebar />

				<div className="flex-1 bg-gray-100">
					<Header title="ポモドーロタイマー" />

					<main className="p-4 sm:p-6">
						{/* 後でstowwatchモードを作る */}
						<section className="mb-6 rounded bg-white p-4 shadow hidden">
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
							targets={{
								study: studyTargetItems,
								todo: todoTargetItems,
							}}
							selectedTargetIdByType={
								state.ui.selectedTargetIdByType
							}
							onChangeTargetType={handleChangeTargetType}
							onSelectItem={handleSelectTargetItem}
							onAddItem={handleOpenAddTargetDialog}
							onDeleteItem={handleDeleteItem}
						/>

						{state.ui.mode === "pomodoro" ? (
							<PomodoroSettingsSection
								pomodoro={state.settings.pomodoro}
								onSelectWorkMinutes={(minutes) => {
									const newPomodoro: PomodoroSettings = {
										...state.settings.pomodoro,
										selectedWorkMinutes: minutes,
									};
									updatePomodoro(() => newPomodoro);
									void saveSettings(newPomodoro);
								}}
								onSelectBreakMinutes={(minutes) => {
									const newPomodoro: PomodoroSettings = {
										...state.settings.pomodoro,
										selectedBreakMinutes: minutes,
									};
									updatePomodoro(() => newPomodoro);
									void saveSettings(newPomodoro);
								}}
								onAddWorkMinutes={
									handleOpenAddWorkMinutesDialog
								}
								onAddBreakMinutes={
									handleOpenAddBreakMinutesDialog
								}
								onDeleteTimer={handleDeleteMinutes}
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
