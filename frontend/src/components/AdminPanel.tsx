// AdminPanel.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { fetchUsers, deleteUser, createUser, updateUser, UserCreateDto, UserUpdateDto } from "@/utils/api"; // Import new functions and DTOs
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, // Import Dialog for create/edit forms
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"; // Assuming you have a Label component
import {
  Select as ShadcnSelect, // Renamed to avoid conflict with react-select
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For roles selection
import { useToast } from "@/components/ui/use-toast";

// Imports for country picker
import Select from "react-select";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { Upload } from "lucide-react"; // Import Upload icon

// Register the English locale
countries.registerLocale(enLocale);

interface User {
  id: string;
  email: string;
  fullName: string;
  emailConfirmed: boolean;
  twoFactorEnabled: boolean;
  registeredAt: string;
  roles: string[];
  organization: string | null;
  jobTitle: string | null;
  country: string | null;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // User currently being edited
  const [newUserData, setNewUserData] = useState<UserCreateDto>({
    fullName: "",
    email: "",
    password: "",
    role: "User", // Default role
  });
  const [editUserData, setEditUserData] = useState<UserUpdateDto & { id: string, email: string, roles: string[] } | null>(null); // For editing
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null); // New state for hovered row ID
  const { toast } = useToast();

  // State for Excel upload functionality for users
  const [showUserUploadDialog, setShowUserUploadDialog] = useState(false);
  const [selectedUserExcelFile, setSelectedUserExcelFile] = useState<File | null>(null);
  const [isUserUploading, setIsUserUploading] = useState(false);


  // Prepare country options for react-select
  const countryOptions = useMemo(() => {
    const countryObj = countries.getNames("en", { select: "official" });
    return Object.entries(countryObj).map(([code, name]) => ({
      value: code, // ISO 3166-1 alpha-2 code
      label: name,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const getUsers = async () => {
    const fetchedUsers = await fetchUsers();
    setUsers(fetchedUsers);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const confirmDelete = (user: User) => setUserToDelete(user);

  const performDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      toast({
        title: "User deleted",
        description: `${userToDelete.fullName} has been removed.`,
        variant: "default",
      });
      setUserToDelete(null);
      getUsers();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "An error occurred while deleting the user.",
        variant: "destructive",
      });
    }
  };

  // Handle opening edit dialog
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setEditUserData({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        organization: user.organization,
        jobTitle: user.jobTitle,
        country: user.country,
        roles: user.roles,
        newPassword: "" // Initialize new password as empty
    });
    setIsEditDialogOpen(true);
  };

  // Handle saving edited user
  const handleSaveEdit = async () => {
    if (!editUserData) return;

    try {
      const { id, email, ...dataToUpdate } = editUserData; // Exclude ID and email from update payload

      // Filter out empty strings for optional fields, except password if it's explicitly set
      const payload: UserUpdateDto = {};
      if (dataToUpdate.fullName !== undefined && dataToUpdate.fullName !== null) payload.fullName = dataToUpdate.fullName;
      if (dataToUpdate.organization !== undefined && dataToUpdate.organization !== null) payload.organization = dataToUpdate.organization;
      if (dataToUpdate.jobTitle !== undefined && dataToUpdate.jobTitle !== null) payload.jobTitle = dataToUpdate.jobTitle;
      // IMPORTANT: Now saving the full country name (label) instead of the code (value)
      if (dataToUpdate.country !== undefined && dataToUpdate.country !== null) payload.country = dataToUpdate.country;
      if (dataToUpdate.newPassword && dataToUpdate.newPassword.length > 0) payload.newPassword = dataToUpdate.newPassword;
      if (dataToUpdate.roles !== undefined) payload.roles = dataToUpdate.roles;


      await updateUser(id, payload);
      toast({
        title: "User updated",
        description: `${editUserData.fullName} has been updated.`,
        variant: "default",
      });
      setIsEditDialogOpen(false);
      setCurrentUser(null);
      setEditUserData(null);
      getUsers();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating the user.",
        variant: "destructive",
      });
    }
  };


  // Handle creating a new user
  const handleCreateUser = async () => {
    try {
      await createUser(newUserData);
      toast({
        title: "User created",
        description: `${newUserData.fullName} has been created.`,
        variant: "default",
      });
      setIsCreateUserDialogOpen(false);
      setNewUserData({ fullName: "", email: "", password: "", role: "User" });
      getUsers();
    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: error.message || "An error occurred while creating the user.",
        variant: "destructive",
      });
    }
  };

  // Handle file selection for user upload
  const handleUserFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedUserExcelFile(file);
      } else {
        setSelectedUserExcelFile(null);
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xlsx or .xls).",
          variant: "destructive",
        });
      }
    } else {
      setSelectedUserExcelFile(null);
    }
  };

  const handleUserFileUpload = async () => {
    if (!selectedUserExcelFile) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      });
      return;
    }
  
    setIsUserUploading(true);
    const formData = new FormData();
    formData.append('file', selectedUserExcelFile);
  
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5227';
    const token = localStorage.getItem("token"); // Get the token from localStorage
  
    try {
      const response = await fetch(`${baseUrl}/api/material/upload-excel`, {
        method: 'POST',
        body: formData,
        headers: {
          // Add the Authorization header with the Bearer token
          'Authorization': `Bearer ${token}` 
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Upload Successful",
          description: data.message,
        });
        setShowUserUploadDialog(false);
        setSelectedUserExcelFile(null);
        getUsers(); // Refresh user list after upload
      } else {
        const errorData = await response.json();
        toast({
          title: "Upload Failed",
          description: errorData.message || "An unknown error occurred during upload.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading user file:", error);
      toast({
        title: "Error",
        description: "Network error or server unreachable.",
        variant: "destructive",
      });
    } finally {
      setIsUserUploading(false);
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()} className="flex items-center gap-2">
          Full Name
          {column.getIsSorted() && <span>{column.getIsSorted() === "asc" ? "⬆️" : "⬇️"}</span>}
        </button>
      ),
      accessorKey: "fullName",
    },
    {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()} className="flex items-center gap-2">
          Email
          {column.getIsSorted() && <span>{column.getIsSorted() === "asc" ? "⬆️" : "⬇️"}</span>}
        </button>
      ),
      accessorKey: "email",
    },
    {
      header: "Email Confirmed",
      accessorKey: "emailConfirmed",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
    },
    {
      header: "Two Factor Enabled",
      accessorKey: "twoFactorEnabled",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
    },
    {
      header: "Roles",
      accessorKey: "roles",
      filterFn: (row, columnId, filterValue) => {
        const roles = row.getValue(columnId) as string[];
        return roles.some((role) =>
          role.toLowerCase().includes(String(filterValue).toLowerCase())
        );
      },
      cell: (info) => (info.getValue() as string[]).join(", "),
    },
    {
      header: "Organization",
      accessorKey: "organization",
    },
    {
      header: "Job Title",
      accessorKey: "jobTitle",
    },
    {
      header: "Country",
      accessorKey: "country",
    },
    {
      header: "User ID",
      accessorKey: "id",
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        // Only show buttons if the row is hovered
        if (hoveredRowId === row.original.id) {
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditUser(row.original)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => confirmDelete(row.original)}
              >
                Delete
              </Button>
            </div>
          );
        }
        return null; // Don't render anything if not hovered
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [handleEditUser, hoveredRowId]); // Include handleEditUser and hoveredRowId in dependency array

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const rolesColumn = table.getColumn("roles");

  return (
    <>
      <Card className="p-6">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <p className="text-gray-600 mb-6">User Management</p>

        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
          <Input
            type="text"
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full max-w-md"
          />
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder="Filter roles..."
              value={(rolesColumn?.getFilterValue() as string) ?? ""}
              onChange={(e) => rolesColumn?.setFilterValue(e.target.value)}
              className="w-full max-w-[200px]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => rolesColumn?.setFilterValue("")}
            >
              Remove Role Filter
            </Button>
          </div>
          <Button onClick={() => setIsCreateUserDialogOpen(true)} className="ml-auto">
            Create New User
          </Button>
          {/* New Button for Import from Excel */}
          <Dialog open={showUserUploadDialog} onOpenChange={setShowUserUploadDialog}>
            <DialogTrigger asChild>
              <Button className="ml-2">
                <Upload className="h-4 w-4 mr-2" />
                Import Materials from Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Materials from Excel</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Upload an Excel file to import new users or update existing ones.
                  <br />
                  <a
                    href="./fx_sample_material_import.xlsx" // link to sample file for user import
                    download="fx_sample_material_import.xlsx"
                    className="text-primary hover:underline"
                  >
                    Download sample Excel format
                  </a>
                </p>
                <div>
                  <Label htmlFor="userExcelFile">Select Excel File (.xlsx or .xls)</Label>
                  <Input
                    id="userExcelFile"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleUserFileChange}
                    className="mt-2"
                  />
                  {selectedUserExcelFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected file: {selectedUserExcelFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowUserUploadDialog(false);
                  setSelectedUserExcelFile(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUserFileUpload} disabled={!selectedUserExcelFile || isUserUploading}>
                  {isUserUploading ? "Uploading..." : "Upload & Import Users"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-left font-medium [&:has([role=button])]:cursor-pointer"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-none"
                  onMouseEnter={() => setHoveredRowId(row.original.id)} // Set hovered row
                  onMouseLeave={() => setHoveredRowId(null)} // Clear hovered row
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-500">
            This action is irreversible and will permanently remove{" "}
            <strong>{userToDelete?.fullName}</strong>.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="create-fullName"
                value={newUserData.fullName}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, fullName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-email" className="text-right">
                Email
              </Label>
              <Input
                id="create-email"
                type="email"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-password" className="text-right">
                Password
              </Label>
              <Input
                id="create-password"
                type="password"
                value={newUserData.password}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, password: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-role" className="text-right">
                Role
              </Label>
              <ShadcnSelect // Use ShadcnSelect for roles
                value={newUserData.role}
                onValueChange={(value) =>
                  setNewUserData({ ...newUserData, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </ShadcnSelect>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User: {currentUser?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="edit-fullName"
                value={editUserData?.fullName || ""}
                onChange={(e) =>
                  setEditUserData({ ...editUserData!, fullName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserData?.email || ""}
                disabled // Email is typically not editable
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-organization" className="text-right">
                Organization
              </Label>
              <Input
                id="edit-organization"
                value={editUserData?.organization || ""}
                onChange={(e) =>
                  setEditUserData({ ...editUserData!, organization: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-jobTitle" className="text-right">
                Job Title
              </Label>
              <Input
                id="edit-jobTitle"
                value={editUserData?.jobTitle || ""}
                onChange={(e) =>
                  setEditUserData({ ...editUserData!, jobTitle: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-country" className="text-right">
                Country
              </Label>
              <div className="col-span-3">
                <Select
                  id="edit-country"
                  options={countryOptions}
                  value={countryOptions.find(option => option.label === editUserData?.country) || null} // Changed to match label
                  onChange={(selectedOption) =>
                    // Changed to save the label (full name)
                    setEditUserData({ ...editUserData!, country: selectedOption ? selectedOption.label : null })
                  }
                  isClearable
                  placeholder="Select a country"
                  classNamePrefix="react-select" // For styling with Tailwind
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '38px', // Match Shadcn Input height
                      borderColor: 'hsl(var(--input))', // Match Shadcn input border color
                      backgroundColor: 'hsl(var(--background))',
                      '&:hover': {
                        borderColor: 'hsl(var(--input))',
                      },
                      boxShadow: 'none',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'white',
                      color: state.isFocused ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
                      '&:active': {
                        backgroundColor: 'hsl(var(--accent))',
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'hsl(var(--foreground))',
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'hsl(var(--foreground))',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'hsl(var(--muted-foreground))',
                    }),
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-newPassword" className="text-right">
                New Password
              </Label>
              <Input
                id="edit-newPassword"
                type="password"
                value={editUserData?.newPassword || ""}
                onChange={(e) =>
                  setEditUserData({ ...editUserData!, newPassword: e.target.value })
                }
                placeholder="Leave blank to keep current password"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-roles" className="text-right">
                    Roles
                </Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                    {/* For simplicity, using checkboxes for roles */}
                    {["User", "Admin"].map(role => ( // Assuming these are your available roles
                        <div key={role} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={`role-${role}`}
                                checked={editUserData?.roles?.includes(role) || false}
                                onChange={(e) => {
                                    const currentRoles = editUserData?.roles || [];
                                    if (e.target.checked) {
                                        setEditUserData({ ...editUserData!, roles: [...currentRoles, role] });
                                    } else {
                                        setEditUserData({ ...editUserData!, roles: currentRoles.filter(r => r !== role) });
                                    }
                                }}
                            />
                            <label htmlFor={`role-${role}`}>{role}</label>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;