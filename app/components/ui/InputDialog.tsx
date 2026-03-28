function InputDialog({
	isOpen,
	title,
	value,
	errorMessage,
	onChange,
	onClose,
	onSubmit,
}: {
	isOpen: boolean;
	title: string;
	value: string;
	errorMessage: string;
	onChange: (value: string) => void;
	onClose: () => void;
	onSubmit: () => void;
}) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
				<h2 className="mb-4 text-lg font-bold text-gray-900">
					{title}
				</h2>
				<input
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
				/>
				{errorMessage !== "" && (
					<p className="mt-2 text-sm text-red-600">{errorMessage}</p>
				)}
				<div className="mt-6 flex justify-end gap-3">
					<button
						onClick={onClose}
						className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700"
					>
						キャンセル
					</button>
					<button
						onClick={onSubmit}
						className="rounded bg-blue-600 px-4 py-2 text-white"
					>
						追加
					</button>
				</div>
			</div>
		</div>
	);
}

export default InputDialog;
