type SectionToggleButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function SectionToggleButton({
  label,
  active,
  onClick,
}: SectionToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-6 py-2 font-medium ${
        active
          ? "bg-blue-600 text-white"
          : "border border-gray-300 bg-white text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

export default SectionToggleButton;
