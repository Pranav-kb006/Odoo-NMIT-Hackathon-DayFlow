import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmployeeStats } from "./types";

type StatCard = {
  label: string;
  value: number;
  testId: string;
};

export function EmployeeStatsCards({ stats }: { stats: EmployeeStats }) {
  const cards: StatCard[] = [
    { label: "Total Employees", value: stats.total, testId: "stat-total" },
    { label: "Active", value: stats.active, testId: "stat-active" },
    { label: "Present Today", value: stats.present, testId: "stat-present" },
    { label: "On Leave", value: stats.onLeave, testId: "stat-on-leave" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.testId}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              data-testid={card.testId}
              className="text-3xl font-bold tabular-nums text-slate-900"
            >
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default EmployeeStatsCards;
