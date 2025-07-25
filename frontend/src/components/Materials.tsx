import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HelpTooltip from '@/components/HelpTooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Database, Plus, List, Grid, Search, Trash2, Pencil, BarChart } from 'lucide-react'; // Added BarChart icon
import { fetchMaterials, addMaterial, deleteMaterial, editMaterial, deleteMaterials } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Recharts imports for the plot
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip, // Renamed to avoid conflict with UI Tooltip
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Material = {
  id?: number;
  materialType: string;
  manufacturer: string;
  productClass: string;
  maxTemperatureLimit: number;
  density: number;
  specificHeat: number;
  conductivities: number[];
};

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);

  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    return (localStorage.getItem('viewMode') as 'card' | 'list') || 'list';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const [filters, setFilters] = useState<{ searchTerm: string; productClass: string }>({ searchTerm: '', productClass: 'All' });
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [newMaterial, setNewMaterial] = useState<Material>({
    materialType: '',
    manufacturer: '',
    productClass: '',
    maxTemperatureLimit: 0,
    density: 0,
    specificHeat: 0,
    conductivities: [0, 0, 0, 0, 0, 0, 0]
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMaterialData, setEditMaterialData] = useState<Material | null>(null);
  const [rowSelection, setRowSelection] = useState({});

  // New state for plot dialog
  const [showPlotDialog, setShowPlotDialog] = useState(false);
  const [materialToPlot, setMaterialToPlot] = useState<Material | null>(null);

  const handleOpenEditDialog = (material: Material) => {
    setEditMaterialData(material);
    setIsEditDialogOpen(true);
  };

  // Fixed temperature points for conductivity plot
  const fixedTemperatures = [200, 500, 1000, 1500, 2000, 2500, 3000];

  // Function to prepare data for the conductivity plot
  const getConductivityPlotData = (material: Material) => {
    if (!material || !material.conductivities || material.conductivities.length === 0) {
      return [];
    }
    return material.conductivities.map((conductivity, index) => ({
      temperature: fixedTemperatures[index] || 0, // Fallback to 0 if index out of bounds
      conductivity: conductivity,
    }));
  };


  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await fetchMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast({
        title: "Error",
        description: "Failed to load materials from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    // Start of Validation
    const textFields = ['materialType', 'manufacturer', 'productClass'];
    for (const field of textFields) {
      const value = newMaterial[field as keyof Material];
      if (typeof value !== 'string' || value.trim().length < 3) {
        toast({
          title: "Validation Error",
          description: `The "${field}" must be at least 3 characters long.`,
          variant: "destructive",
        });
        return;
      }
    }

    const numberFields = ['maxTemperatureLimit', 'density', 'specificHeat'];
    for (const field of numberFields) {
      const value = newMaterial[field as keyof Material];
      if (typeof value !== 'number' || value <= 0) {
        toast({
          title: "Validation Error",
          description: `The "${field}" must be a number greater than zero.`,
          variant: "destructive",
        });
        return;
      }
    }

    if (newMaterial.conductivities.some(c => typeof c !== 'number' || c < 0)) {
      toast({
        title: "Validation Error",
        description: "All conductivity values must be valid numbers.",
        variant: "destructive",
      });
      return;
    }
    // End of Validation

    try {
      await addMaterial(newMaterial);
      toast({
        title: "Success",
        description: "Material added successfully",
      });
      setIsAddDialogOpen(false);
      setNewMaterial({
        materialType: '',
        manufacturer: '',
        productClass: '',
        maxTemperatureLimit: 0,
        density: 0,
        specificHeat: 0,
        conductivities: [0, 0, 0, 0, 0, 0, 0]
      });
      loadMaterials();
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await deleteMaterial(materialId);
      setMaterials(prev => prev.filter(mat => mat.id !== materialId));
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting material:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete material",
        variant: "destructive",
      });
    }
  };


  const handleBulkDelete = async () => {
    console.log("INSIDE BULKKDEL");
    try {
      const selectedMaterialsIds = table.getSelectedRowModel().rows.map(row => row.original.id!);
      if (selectedMaterialsIds.length === 0) {
        toast({
          title: "Error",
          description: "No materials selected for deletion.",
          variant: "destructive"
        });
        return;
      }

      await deleteMaterials(selectedMaterialsIds);
      setMaterials(prev => prev.filter(mat => !selectedMaterialsIds.includes(mat.id!)));
      setRowSelection({}); // Clear selection after deletion

      toast({
        title: "Success",
        description: `${selectedMaterialsIds.length} materials deleted successfully`,
      });
    } catch (error) {
      console.error("Error bulk deleting materials:", error);
      toast({
        title: "Error",
        description: "Failed to delete materials",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Material>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 rounded"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 rounded"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: 'id',
      header: 'MID',
      cell: (info) => info.getValue(),
    },
    { accessorKey: 'materialType', header: 'Type', enableSorting: true },
    {
      accessorKey: 'manufacturer',
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting()}>
          Manufacturer {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : ''}
        </button>
      ),
    },
    { accessorKey: 'productClass', header: 'Product Class' },
    {
      accessorKey: 'maxTemperatureLimit',
      enableSorting: true,
      header: 'Max Temp (°C)',
      cell: info => info.getValue() + '°C',
    },
    {
      accessorKey: 'density',
      header: 'Density',
      cell: info => info.getValue() + ' kg/m³',
      enableSorting: true,
    },
    {
      accessorKey: 'specificHeat',
      header: 'Specific Heat',
      cell: info => info.getValue() + ' J/kg·K',
      enableSorting: true,
    },
    {
      accessorKey: 'conductivities',
      header: ({ column }) => ( // Ensure this is a function to access column properties if needed
        <div className="flex items-center gap-1"> {/* Use flex to align label and tooltip */}
          <span>Conductivities</span> {/* Your existing label text */}
          <HelpTooltip
            content="These are the thermal conductivity values for this material at fixed temperatures: 200, 500, 1000, 1500, 2000, 2500, 3000 °C."
            className="ml-1 inline-block" // Adjust margin as needed
            iconSize={14} // Adjust size as needed
          />
          {/* Optional: Add sorting indicator if desired, similar to 'manufacturer' column */}
          {column.getIsSorted() === 'asc' ? ' 🔼' : column.getIsSorted() === 'desc' ? ' 🔽' : ''}
        </div>
      ),
      enableSorting: true,
      cell: ({ row }) => {
        const values = row.original.conductivities;
        return (
          <div className="flex flex-wrap gap-1">
            {values.map((value, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {value.toFixed(2)}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="relative flex space-x-2 h-full w-full"> {/* Adjusted for better spacing of multiple buttons */}
          {/* View Plot Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setMaterialToPlot(row.original);
                    setShowPlotDialog(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <BarChart className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>View Conductivity Plot</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Edit Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => handleOpenEditDialog(row.original)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Edit Material</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Delete Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    setSelectedId(row.original.id!);
                    setConfirmOpen(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Delete Material</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: materials,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,

    globalFilterFn: (row, columnId, filterValue) => {
      const material = row.original as Material;
      const { searchTerm, productClass } = filterValue as { searchTerm: string, productClass: string };

      const matchesSearch = material.materialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.productClass.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = productClass === 'All' || material.productClass === productClass;

      return matchesSearch && matchesFilter;
    },
  });

  const uniqueClasses = Array.from(new Set(materials.map((m) => m.productClass)));
  const updateConductivity = (index: number, value: string) => {
    const newConductivities = [...newMaterial.conductivities];
    newConductivities[index] = parseFloat(value) || 0;
    setNewMaterial({ ...newMaterial, conductivities: newConductivities });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading materials...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Materials Database</h2>
        <HelpTooltip content="The maximum operating temperature limit for this material." className="ml-1 inline-block" iconSize={14} />
      </div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-10"
          />
        </div>

        <Select
          onValueChange={(value) => setFilters(prev => ({ ...prev, productClass: value }))}
          defaultValue="All"
          value={filters.productClass}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {uniqueClasses.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('card')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Multi-Delete Button and Dialog */}
        <AlertDialog open={isBulkConfirmOpen} onOpenChange={setIsBulkConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={() => setIsBulkConfirmOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                {table.getFilteredSelectedRowModel().rows.length} selected materials.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleBulkDelete()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Material</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materialType">Material Type</Label>
                  <Input
                    id="materialType"
                    value={newMaterial.materialType}
                    onChange={(e) => setNewMaterial({ ...newMaterial, materialType: e.target.value })}
                    placeholder="e.g., Ceramic"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={newMaterial.manufacturer}
                    onChange={(e) => setNewMaterial({ ...newMaterial, manufacturer: e.target.value })}
                    placeholder="e.g., ThermoTech"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="productClass">Product Class</Label>
                <Input
                  id="productClass"
                  value={newMaterial.productClass}
                  onChange={(e) => setNewMaterial({ ...newMaterial, productClass: e.target.value })}
                  placeholder="e.g., High Temp Insulation"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxTemp">Max Temperature (°C)</Label>
                  <Input
                    id="maxTemp"
                    type="number"
                    value={newMaterial.maxTemperatureLimit}
                    onChange={(e) => setNewMaterial({ ...newMaterial, maxTemperatureLimit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="density">Density (kg/m³)</Label>
                  <Input
                    id="density"
                    type="number"
                    step="0.1"
                    value={newMaterial.density}
                    onChange={(e) => setNewMaterial({ ...newMaterial, density: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="specificHeat">Specific Heat (J/kg·K)</Label>
                  <Input
                    id="specificHeat"
                    type="number"
                    step="0.1"
                    value={newMaterial.specificHeat}
                    onChange={(e) => setNewMaterial({ ...newMaterial, specificHeat: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Thermal Conductivities (W/m·K)</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {newMaterial.conductivities.map((value, index) => (
                    <Input
                      key={index}
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => updateConductivity(index, e.target.value)}
                      placeholder={`Value ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddMaterial} className="w-full">
                Add Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {materials.length} materials
        </p>
      </div>
      {/* Materials display */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {table.getFilteredRowModel().rows.map(row => {
            const material = row.original;
            return (
              <Card
                key={material.id || row.id}
                className="group relative p-4 border border-border flex flex-col justify-between transition-shadow hover:shadow-md"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setMaterialToPlot(material);
                          setShowPlotDialog(true);
                        }}
                        className="absolute bottom-4 right-28 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <BarChart className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Conductivity Plot</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Edit Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => handleOpenEditDialog(material)}
                        className="absolute bottom-4 right-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Material</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Delete button with tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setSelectedId(material.id!);
                          setConfirmOpen(true);
                        }}
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Material</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>


                <div className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold">{material.materialType}</h3>
                    <Badge variant="secondary">MID: {material.id}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{material.productClass}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Manufacturer:</span>
                      <span>{material.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Temp:</span>
                      <span>{material.maxTemperatureLimit}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Density:</span>
                      <span>{material.density} kg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Specific Heat:</span>
                      <span>{material.specificHeat} J/kg·K</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Conductivities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {material.conductivities.map((value, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {value.toFixed(2)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="overflow-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase font-bold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-3 text-left cursor-pointer select-none whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: "🔼",
                          desc: "🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="group border-b hover:bg-muted/50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {table.getFilteredRowModel().rows.length === 0 && (
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No materials found matching your criteria</p>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the material.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedId !== null) {
                  handleDeleteMaterial(selectedId);
                  setSelectedId(null);
                }
                setConfirmOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editMaterialData && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Material</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materialType">Material Type</Label>
                  <Input
                    id="materialType"
                    value={editMaterialData.materialType}
                    onChange={(e) => setEditMaterialData({ ...editMaterialData, materialType: e.target.value })}
                    placeholder="e.g., Ceramic"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={editMaterialData.manufacturer}
                    onChange={(e) => setEditMaterialData({ ...editMaterialData, manufacturer: e.target.value })}
                    placeholder="e.g., ThermoTech"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="productClass">Product Class</Label>
                <Input
                  id="productClass"
                  value={editMaterialData.productClass}
                  onChange={(e) => setEditMaterialData({ ...editMaterialData, productClass: e.target.value })}
                  placeholder="e.g., High Temp Insulation"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxTemp">Max Temperature (°C)</Label>
                  <Input
                    id="maxTemp"
                    type="number"
                    value={editMaterialData.maxTemperatureLimit}
                    onChange={(e) => setEditMaterialData({ ...editMaterialData, maxTemperatureLimit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="density">Density (kg/m³)</Label>
                  <Input
                    id="density"
                    type="number"
                    step="0.1"
                    value={editMaterialData.density}
                    onChange={(e) => setEditMaterialData({ ...editMaterialData, density: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="specificHeat">Specific Heat (J/kg·K)</Label>
                  <Input
                    id="specificHeat"
                    type="number"
                    step="0.1"
                    value={editMaterialData.specificHeat}
                    onChange={(e) => setEditMaterialData({ ...editMaterialData, specificHeat: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Thermal Conductivities (W/m·K)</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {editMaterialData.conductivities.map((value, index) => (
                    <Input
                      key={index}
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => {
                        const newConductivities = [...editMaterialData.conductivities];
                        newConductivities[index] = parseFloat(e.target.value) || 0;
                        setEditMaterialData({ ...editMaterialData, conductivities: newConductivities });
                      }}
                      placeholder={`Value ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (editMaterialData.id) {
                    // Start of Validation
                    const textFields = ['materialType', 'manufacturer', 'productClass'];
                    for (const field of textFields) {
                      const value = editMaterialData[field as keyof Material];
                      if (typeof value !== 'string' || value.trim().length < 3) {
                        toast({
                          title: "Validation Error",
                          description: `The "${field}" must be at least 3 characters long.`,
                          variant: "destructive",
                        });
                        return;
                      }
                    }

                    const numberFields = ['maxTemperatureLimit', 'density', 'specificHeat'];
                    for (const field of numberFields) {
                      const value = editMaterialData[field as keyof Material];
                      if (typeof value !== 'number' || value <= 0) {
                        toast({
                          title: "Validation Error",
                          description: `The "${field}" must be a number greater than zero.`,
                          variant: "destructive",
                        });
                        return;
                      }
                    }

                    if (editMaterialData.conductivities.some(c => typeof c !== 'number' || c < 0)) {
                      toast({
                        title: "Validation Error",
                        description: "All conductivity values must be valid numbers.",
                        variant: "destructive",
                      });
                      return;
                    }
                    // End of Validation

                    try {
                      await editMaterial(editMaterialData.id, editMaterialData);
                      toast({
                        title: "Success",
                        description: "Material updated successfully",
                      });
                      loadMaterials();
                      setIsEditDialogOpen(false);
                    } catch (error) {
                      console.error("Error updating material:", error);
                      toast({
                        title: "Error",
                        description: "Failed to update material",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                className="w-full"
              >
                Update Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Conductivity Plot Dialog */}
      <Dialog open={showPlotDialog} onOpenChange={setShowPlotDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thermal Conductivity Plot</DialogTitle>
          </DialogHeader>
          {materialToPlot ? (
            <div className="h-80 w-full">
              <h4 className="text-md font-semibold mb-2">
                {materialToPlot.materialType} ({materialToPlot.manufacturer})
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getConductivityPlotData(materialToPlot)}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="temperature" label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Conductivity (W/m·K)", angle: -90, position: "insideLeft" }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="conductivity" stroke="#8884d8" name="Conductivity" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>No material selected for plot.</p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Materials;