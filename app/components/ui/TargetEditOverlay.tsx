import { useState } from "react";

function TargetEditOverlay({
	title,
	items,
	onDelete,
	onClose,
}: {
	title: string;
	items: { id: string; label: string; isSelected: boolean }[];
	onDelete: (ids: string[]) => void;
	onClose: () => void;
}) {
	const [checkedIds, setCheckedIds] = useState<string[]>([]);

	const handleCheck = (id: string) => {
		setCheckedIds((prev) =>
			prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
		);
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
				<div className="font-bold mb-4">{title}</div>

				{items.map((item) => (
					<div
						key={item.id}
						className="flex items-center gap-2 py-2 border-b border-gray-100"
					>
						<input
							type="checkbox"
							disabled={item.isSelected}
							checked={checkedIds.includes(item.id)}
							onChange={() => handleCheck(item.id)}
						/>
						<span className="text-sm">{item.label}</span>
					</div>
				))}

				<button
					className="mt-4 w-full bg-red-400 text-white py-2 rounded text-sm disabled:opacity-50"
					disabled={checkedIds.length === 0}
					onClick={() => {
						onDelete(checkedIds);
						onClose();
					}}
				>
					削除
				</button>
			</div>
		</div>
	);
}

export default TargetEditOverlay;
