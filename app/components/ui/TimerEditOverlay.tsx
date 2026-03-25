import { useState } from "react";

function TimerEditOverlay({
	workMinutes,
	breakMinutes,
	selectedWorkMinutes,
	selectedBreakMinutes,
	onDelete,
	onClose,
}: {
	workMinutes: number[];
	breakMinutes: number[];
	selectedWorkMinutes: number;
	selectedBreakMinutes: number;
	onDelete: (workMinutes: number[], breakMinutes: number[]) => void;
	onClose: () => void;
}) {
	const [checkedWork, setCheckedWork] = useState<number[]>([]);
	const [checkedBreak, setCheckedBreak] = useState<number[]>([]);

	const handleCheckWork = (minutes: number) => {
		setCheckedWork((prev) =>
			prev.includes(minutes)
				? prev.filter((m) => m !== minutes)
				: [...prev, minutes],
		);
	};

	const handleCheckBreak = (minutes: number) => {
		setCheckedBreak((prev) =>
			prev.includes(minutes)
				? prev.filter((m) => m !== minutes)
				: [...prev, minutes],
		);
	};

	const handleDelete = () => {
		const newWork = workMinutes.filter((m) => !checkedWork.includes(m));
		const newBreak = breakMinutes.filter((m) => !checkedBreak.includes(m));
		onDelete(newWork, newBreak);
		onClose();
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
			onClick={onClose}
		>
			<div
				className="bg-white rounded shadow p-6 w-80"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="font-bold mb-4">ポモドーロ時間</div>

				{workMinutes.map((m) => (
					<div
						key={m}
						className="flex items-center gap-2 py-2 border-b border-gray-100"
					>
						<input
							type="checkbox"
							disabled={
								m === selectedWorkMinutes ||
								workMinutes.length === 1
							}
							checked={checkedWork.includes(m)}
							onChange={() => handleCheckWork(m)}
						/>
						<span className="text-sm">{m}</span>
					</div>
				))}

				<div className="font-bold my-4">休憩時間</div>

				{breakMinutes.map((m) => (
					<div
						key={m}
						className="flex items-center gap-2 py-2 border-b border-gray-100"
					>
						<input
							type="checkbox"
							disabled={
								m === selectedBreakMinutes ||
								breakMinutes.length === 1
							}
							checked={checkedBreak.includes(m)}
							onChange={() => handleCheckBreak(m)}
						/>
						<span className="text-sm">{m}</span>
					</div>
				))}

				<button
					className="mt-4 w-full bg-red-400 text-white py-2 rounded text-sm disabled:opacity-50"
					disabled={
						checkedWork.length === 0 && checkedBreak.length === 0
					}
					onClick={handleDelete}
				>
					削除
				</button>
			</div>
		</div>
	);
}

export default TimerEditOverlay;
