import React, { useMemo } from "react";
import {
  format,
  parseISO,
  differenceInDays,
  addDays,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CncOrderTask } from "@/polymet/data/cnc-orders-data";
import StatusBadge from "@/polymet/components/status-badge";

interface GanttChartProps {
  tasks: CncOrderTask[];
  startDate?: string;
  endDate?: string;
}

export default function GanttChart({
  tasks,
  startDate: propStartDate,
  endDate: propEndDate,
}: GanttChartProps) {
  // Calculate the overall date range for the chart
  const { startDate, endDate, dateRange } = useMemo(() => {
    // Use provided dates or calculate from tasks
    let start = propStartDate ? parseISO(propStartDate) : null;
    let end = propEndDate ? parseISO(propEndDate) : null;

    // If not provided, determine from tasks
    if (!start || !end) {
      tasks.forEach((task) => {
        const taskStart = parseISO(task.startDate);
        const taskEnd = parseISO(task.endDate);

        if (!start || isBefore(taskStart, start)) {
          start = taskStart;
        }

        if (!end || isAfter(taskEnd, end)) {
          end = taskEnd;
        }
      });
    }

    // Add buffer days
    start = start ? addDays(start, -1) : new Date();
    end = end ? addDays(end, 1) : addDays(new Date(), 14);

    // Generate date range
    const days = differenceInDays(end, start) + 1;
    const range = Array.from({ length: days }, (_, i) => addDays(start!, i));

    return {
      startDate: start,
      endDate: end,
      dateRange: range,
    };
  }, [tasks, propStartDate, propEndDate]);

  // Calculate task positions and widths
  const getTaskStyle = (task: CncOrderTask) => {
    const taskStart = parseISO(task.startDate);
    const taskEnd = parseISO(task.endDate);

    // Calculate position
    const startOffset = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;

    // Calculate percentages for positioning
    const totalDays = dateRange.length;
    const startPercentage = (startOffset / totalDays) * 100;
    const widthPercentage = (duration / totalDays) * 100;

    return {
      left: `${startPercentage}%`,
      width: `${widthPercentage}%`,
    };
  };

  // Get color based on task status
  const getTaskColor = (status: CncOrderTask["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500 dark:bg-green-600";
      case "in-progress":
        return "bg-blue-500 dark:bg-blue-600";
      case "delayed":
        return "bg-amber-500 dark:bg-amber-600";
      default:
        return "bg-gray-300 dark:bg-gray-600";
    }
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header - Task names */}
        <div className="flex">
          <div className="w-1/4 min-w-[200px] p-2 font-medium border-b">
            Task
          </div>
          <div className="w-3/4 relative">
            <div className="flex border-b">
              {dateRange.map((date, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex-1 p-2 text-center text-xs border-r last:border-r-0",
                    isToday(date) && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <div className="font-medium">{format(date, "MMM d")}</div>
                  <div className="text-muted-foreground">
                    {format(date, "EEE")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task rows */}
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="flex hover:bg-gray-50 dark:hover:bg-gray-900/20"
          >
            {/* Task info */}
            <div className="w-1/4 min-w-[200px] p-2 border-b flex flex-col justify-center">
              <div className="font-medium">{task.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={task.status} className="text-xs" />

                <span className="text-xs text-muted-foreground">
                  {task.progress}% complete
                </span>
              </div>
            </div>

            {/* Gantt bar area */}
            <div className="w-3/4 relative border-b">
              {/* Date grid lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {dateRange.map((date, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 border-r last:border-r-0",
                      isToday(date) && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                  />
                ))}
              </div>

              {/* Task bar */}
              <div className="h-16 relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 h-6 rounded-md",
                          getTaskColor(task.status)
                        )}
                        style={getTaskStyle(task)}
                      >
                        <div className="h-full relative overflow-hidden">
                          <div
                            className="absolute inset-0 bg-white dark:bg-black opacity-50"
                            style={{ right: `${100 - task.progress}%` }}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{task.name}</p>
                        <p className="text-xs">
                          {format(parseISO(task.startDate), "MMM d")} -{" "}
                          {format(parseISO(task.endDate), "MMM d")}
                        </p>
                        <Progress value={task.progress} className="h-2 mt-1" />

                        <p className="text-xs">{task.progress}% complete</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
