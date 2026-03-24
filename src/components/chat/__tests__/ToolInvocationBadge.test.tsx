import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create in-progress without path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" }, false)).toBe("Creating file");
});

test("getToolLabel: str_replace_editor create done without path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" }, true)).toBe("Created file");
});

test("getToolLabel: str_replace_editor create with path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/components/Button.tsx" }, false)).toBe("Creating Button.tsx");
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/components/Button.tsx" }, true)).toBe("Created Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "App.tsx" }, false)).toBe("Editing App.tsx");
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "App.tsx" }, true)).toBe("Edited App.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "App.tsx" }, false)).toBe("Editing App.tsx");
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "App.tsx" }, true)).toBe("Edited App.tsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "index.ts" }, false)).toBe("Reading index.ts");
  expect(getToolLabel("str_replace_editor", { command: "view", path: "index.ts" }, true)).toBe("Read index.ts");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit" }, false)).toBe("Undoing edit file");
  expect(getToolLabel("str_replace_editor", { command: "undo_edit" }, true)).toBe("Undid edit file");
});

test("getToolLabel: str_replace_editor unknown command falls back", () => {
  expect(getToolLabel("str_replace_editor", {}, false)).toBe("Editing file");
  expect(getToolLabel("str_replace_editor", {}, true)).toBe("Edited file");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "src/old.tsx" }, false)).toBe("Deleting old.tsx");
  expect(getToolLabel("file_manager", { command: "delete", path: "src/old.tsx" }, true)).toBe("Deleted old.tsx");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/old.tsx" }, false)).toBe("Renaming old.tsx");
  expect(getToolLabel("file_manager", { command: "rename", path: "src/old.tsx" }, true)).toBe("Renamed old.tsx");
});

test("getToolLabel: file_manager without path", () => {
  expect(getToolLabel("file_manager", { command: "delete" }, false)).toBe("Deleting file");
  expect(getToolLabel("file_manager", { command: "delete" }, true)).toBe("Deleted file");
});

test("getToolLabel: unknown tool returns raw toolName", () => {
  expect(getToolLabel("some_unknown_tool", {}, false)).toBe("some_unknown_tool");
  expect(getToolLabel("some_unknown_tool", {}, true)).toBe("some_unknown_tool");
});

// --- ToolInvocationBadge component tests ---

test("ToolInvocationBadge shows green dot and past-tense label when done", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/Button.tsx" },
    state: "result",
    result: "Success",
  };

  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Created Button.tsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationBadge shows spinner and present-tense label when state is call", () => {
  const toolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/Button.tsx" },
    state: "call",
  } as ToolInvocation;

  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge shows spinner when state is partial-call", () => {
  const toolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "App.tsx" },
    state: "partial-call",
  } as ToolInvocation;

  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Editing App.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolInvocationBadge handles file_manager delete", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "2",
    toolName: "file_manager",
    args: { command: "delete", path: "src/old.tsx" },
    state: "result",
    result: { success: true },
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Deleted old.tsx")).toBeDefined();
});
