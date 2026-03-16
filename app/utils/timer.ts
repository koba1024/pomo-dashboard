import { AddItemResult } from "../types/timer";
import { TargetType, InputDialogType } from "../types/timer";
import { MAX_MINUTES } from "../constants/timer";

export function createTargetId(targetType: TargetType): string {
  return `${targetType}-${crypto.randomUUID()}`;
}

export function getTargetTypeLabel(targetType: TargetType): string {
  return targetType === "study" ? "学習カード" : "ToDo";
}

export function getDialogTitle(
  dialogType: InputDialogType,
  targetType: TargetType,
): string {
  if (dialogType === "target") {
    return `追加する${getTargetTypeLabel(targetType)}を入力してください`;
  }

  if (dialogType === "workMinutes") {
    return "追加するポモドーロ時間を分で入力してください";
  }

  return "追加する休憩時間を分で入力してください";
}

export function parseTextInput(input: string | null): string | null {
  if (input === null) return null;

  const trimmed = input.trim();
  if (trimmed === "") return null;

  return trimmed;
}

export function parseMinuteInput(input: string | null): number | null {
  if (input === null) return null;

  const trimmed = input.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return null;

  const value = Number(trimmed);

  if (!Number.isInteger(value)) return null;
  if (value <= 0) return null;
  if (value > MAX_MINUTES) return null;

  return value;
}

export function getInvalidMinuteMessage(input: string | null): string {
  if (input === null || input.trim() === "") {
    return "値を入力してください。";
  }

  if (!/^\d+$/.test(input.trim())) {
    return `分は1〜${MAX_MINUTES}の整数で入力してください。`;
  }

  const value = Number(input.trim());

  if (!Number.isInteger(value) || value <= 0) {
    return "0より大きい整数を入力してください。";
  }

  if (value > MAX_MINUTES) {
    return `分は${MAX_MINUTES}以下で入力してください。`;
  }

  return "入力値が不正です。";
}

export function getInvalidTextMessage(input: string | null): string {
  if (input === null || input.trim() === "") {
    return "値を入力してください。";
  }

  return "入力値が不正です。";
}

export function addItemWithValidation<T>({
  input,
  parser,
  items,
  maxCount,
  duplicateMessage,
  invalidMessage,
}: {
  input: string | null;
  parser: (value: string | null) => T | null;
  items: T[];
  maxCount: number;
  duplicateMessage: string;
  invalidMessage: (value: string | null) => string;
}): AddItemResult<T> {
  if (items.length >= maxCount) {
    return {
      status: "error",
      message: `追加できるのは最大${maxCount}件までです。`,
    };
  }

  const item = parser(input);

  if (item === null) {
    return {
      status: "error",
      message: invalidMessage(input),
    };
  }

  if (items.some((currentItem) => currentItem === item)) {
    return {
      status: "error",
      message: duplicateMessage,
    };
  }

  return {
    status: "success",
    item,
  };
}

export function sortMinutes(minutes: number[]): number[] {
  return [...minutes].sort((a, b) => a - b);
}