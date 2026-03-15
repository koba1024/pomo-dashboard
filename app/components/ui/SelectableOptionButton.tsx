type SelectableOptionButtonProps = {
  label: string;
  selected: boolean;
  onClick?: () => void;
};

function SelectableOptionButton({
  label,
  selected,
  onClick,
}: SelectableOptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded p-4 text-center font-medium ${
        selected
          ? "border-2 border-blue-500 bg-blue-50"
          : "border border-gray-300 bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export default SelectableOptionButton;
