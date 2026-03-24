import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  done: boolean
): string {
  const path = args.path as string | undefined;
  const filename = path ? path.split("/").pop() : undefined;

  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const map: Record<string, [string, string]> = {
      create: ["Creating", "Created"],
      str_replace: ["Editing", "Edited"],
      insert: ["Editing", "Edited"],
      view: ["Reading", "Read"],
      undo_edit: ["Undoing edit", "Undid edit"],
    };
    const [inProgress, doneLabel] = map[command ?? ""] ?? ["Editing", "Edited"];
    const verb = done ? doneLabel : inProgress;
    return filename ? `${verb} ${filename}` : `${verb} file`;
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const [inProgress, doneLabel] =
      command === "delete"
        ? ["Deleting", "Deleted"]
        : ["Renaming", "Renamed"];
    const verb = done ? doneLabel : inProgress;
    return filename ? `${verb} ${filename}` : `${verb} file`;
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const done = toolInvocation.state === "result";
  const label = getToolLabel(
    toolInvocation.toolName,
    toolInvocation.args as Record<string, unknown>,
    done
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
