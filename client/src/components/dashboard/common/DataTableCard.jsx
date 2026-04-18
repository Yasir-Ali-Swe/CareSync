import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const DataTableCard = ({
  title,
  description,
  columns,
  rows,
  minWidth = "min-w-[900px]",
  emptyState,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <ScrollArea className="w-full rounded-md border">
            <div className={minWidth}>
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-4 py-3 text-left font-semibold text-muted-foreground ${
                          column.className || ""
                        }`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t">
                      {columns.map((column) => (
                        <td key={`${row.id}-${column.key}`} className="px-4 py-3 align-middle">
                          {column.render ? column.render(row) : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          emptyState
        )}
      </CardContent>
    </Card>
  );
};

export default DataTableCard;
