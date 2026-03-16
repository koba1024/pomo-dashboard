import { TargetType, TargetData } from "@/app/types/timer";
import SectionToggleButton from "../ui/SectionToggleButton";
import SelectableOptionButton from "../ui/SelectableOptionButton";
import AddOptionButton from "../ui/AddOptionButton";
import { MAX_TARGET_OPTION_COUNT } from "@/app/constants/timer";

function TargetSelectionSection({
  activeTargetType,
  targets,
  selectedTargetIdByType,
  onChangeTargetType,
  onSelectItem,
  onAddItem,
}: {
  activeTargetType: TargetType;
  targets: TargetData;
  selectedTargetIdByType: Record<TargetType, string>;
  onChangeTargetType: (targetType: TargetType) => void;
  onSelectItem: (targetType: TargetType, itemId: string) => void;
  onAddItem: (targetType: TargetType) => void;
}) {
  const currentItems = targets[activeTargetType];
  const selectedTargetId = selectedTargetIdByType[activeTargetType];

  return (
    <section className="mb-6 rounded bg-white p-4 shadow">
      <div className="mb-6 flex flex-wrap gap-4">
        <SectionToggleButton
          label="学習カード"
          active={activeTargetType === "study"}
          onClick={() => onChangeTargetType("study")}
        />
        <SectionToggleButton
          label="ToDo"
          active={activeTargetType === "todo"}
          onClick={() => onChangeTargetType("todo")}
        />
      </div>

      <div className="mb-4 text-sm opacity-75">学習対象</div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {currentItems.map((item) => (
          <SelectableOptionButton
            key={item.id}
            label={item.label}
            selected={item.id === selectedTargetId}
            onClick={() => onSelectItem(activeTargetType, item.id)}
          />
        ))}

        {Array.from({
          length: MAX_TARGET_OPTION_COUNT - currentItems.length,
        }).map((_, index) => (
          <AddOptionButton
            key={`${activeTargetType}-add-${index}`}
            onClick={() => onAddItem(activeTargetType)}
          />
        ))}
      </div>
    </section>
  );
}

export default TargetSelectionSection;
