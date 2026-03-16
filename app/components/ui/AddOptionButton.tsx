type AddOptionButtonProps = {
  onClick?: () => void;
  label?: string;
};

function AddOptionButton({ onClick, label = "+追加" }: AddOptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-500"
    >
      {label}
    </button>
  );
}

export default AddOptionButton;
