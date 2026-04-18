import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DataTableCard = ({
  title,
  description,
  columns,
  rows,
  minWidth = "min-w-[900px]",
  emptyState,
}) => {
  return (
    <Card className={"bg-background border-0"}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="w-full rounded-md border-b-2">
            <Table className={minWidth}>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={`px-4 py-3 font-semibold text-muted-foreground ${
                        column.className || ""
                      }`}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={`${row.id}-${column.key}`} className="px-4 py-3 align-middle">
                        {column.render ? column.render(row) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          emptyState
        )}
      </CardContent>
    </Card>
  );
};

export default DataTableCard;
