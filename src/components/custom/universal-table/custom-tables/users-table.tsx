"use client";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTableRowActions } from "../data-table-row-actions";
import { DataTable } from "../data-table";
import { Icon } from "@/components/common/icon";

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  flag: string;
  status: "Active" | "Inactive" | "Pending";
  balance: number;
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/users-01_fertyx.json"
        );
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      size: 180,
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 220,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div>
          <span className="text-lg leading-none">{row.original.flag}</span>{" "}
          {row.getValue("location")}
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={cn(
              status === "Inactive" &&
                "bg-muted-foreground/60 text-primary-foreground",
              status === "Active" &&
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
              status === "Pending" &&
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            )}
          >
            {status}
          </Badge>
        );
      },
      size: 100,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("balance"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-mono">{formatted}</div>;
      },
      size: 120,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          actions={[
            {
              label: "View",
              icon: <Icon name="Eye" size={16} />,
              onClick: (row) => console.log("View user:", row.original),
              shortcut: "⌘V",
            },
            {
              label: "Edit",
              icon: <Icon name="Eraser" size={16} />,
              onClick: (row) => console.log("Edit user:", row.original),
              shortcut: "⌘E",
            },
            {
              label: "Delete",
              icon: <Icon name="Trash2" size={16} />,
              onClick: (row) => console.log("Delete user:", row.original),
              variant: "destructive",
              shortcut: "⌘⌫",
            },
          ]}
        />
      ),
      size: 60,
      enableHiding: false,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDeleteUsers = (selectedRows: any[]) => {
    const updatedUsers = users.filter(
      (user) => !selectedRows.some((row) => row.original.id === user.id)
    );
    setUsers(updatedUsers);
    console.log(
      "Deleted users:",
      selectedRows.map((row) => row.original)
    );
  };

  return (
    <div className="bg-background">
      <DataTable
        data={users}
        columns={userColumns}
        searchableColumns={["name"]}
        filterableColumns={[
          {
            id: "status",
            title: "Status",
          },
        ]}
        onDelete={handleDeleteUsers}
        isLoading={isLoading}
        toolbar={{
          title: "Users Management",
          description: "Manage your users with advanced filtering and actions.",
          actions: (
            <Button>
              <Icon name="Plus" size={16} className="mr-2" />
              Add User
            </Button>
          ),
        }}
        emptyState={{
          title: "No users found",
          description: "Get started by creating a new user account.",
          action: (
            <Button>
              <Icon name="Plus" size={16} className="mr-2" />
              Add First User
            </Button>
          ),
        }}
      />
    </div>
  );
}
