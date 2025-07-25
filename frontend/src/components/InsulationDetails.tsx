// InsulationDetails.tsx
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";

// For date picker (you might need to install a library like react-day-picker)
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar"; // Assuming you have this component
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Assuming you have this component
import { Button } from "@/components/ui/button"; // Assuming you have this component
import { cn } from "@/lib/utils"; // A utility for conditionally joining class names

interface InsulationDetailsProps {
  systemApplication: string;
  dimensionalConstruction: string;
  thickness: string;
  // New props
  unitSystem: string;
  location: string;
  equipment: string;
  customer: string;
  engineerInitial: string;
  date: string; // ISO string for date (YYYY-MM-DD)
  calcPerPage: number;
  onUpdate: (details: {
    systemApplication: string;
    dimensionalConstruction: string;
    thickness: string;
    // New fields in update payload
    unitSystem: string;
    location: string;
    equipment: string;
    customer: string;
    engineerInitial: string;
    date: string; // ISO string
    calcPerPage: number;
  }) => void;
}

const InsulationDetails: React.FC<InsulationDetailsProps> = ({
  systemApplication,
  dimensionalConstruction,
  thickness,
  unitSystem,
  location,
  equipment,
  customer,
  engineerInitial,
  date,
  calcPerPage,
  onUpdate,
}) => {
  const [localSystemApplication, setLocalSystemApplication] = useState(systemApplication);
  const [localDimensionalConstruction, setLocalDimensionalConstruction] = useState(dimensionalConstruction);
  const [localThickness, setLocalThickness] = useState(thickness);

  // New local states
  const [localUnitSystem, setLocalUnitSystem] = useState(unitSystem);
  const [localLocation, setLocalLocation] = useState(location);
  const [localEquipment, setLocalEquipment] = useState(equipment);
  const [localCustomer, setLocalCustomer] = useState(customer);
  const [localEngineerInitial, setLocalEngineerInitial] = useState(engineerInitial);
  // For date, useState can hold a Date object or string depending on your calendar component
  const [localDate, setLocalDate] = useState<Date | undefined>(date ? new Date(date) : undefined);
  const [localCalcPerPage, setLocalCalcPerPage] = useState(calcPerPage);


  // Sync internal state when props change (e.g., when switching projects)
  useEffect(() => {
    setLocalSystemApplication(systemApplication);
    setLocalDimensionalConstruction(dimensionalConstruction);
    setLocalThickness(thickness);
    // Sync new fields
    setLocalUnitSystem(unitSystem);
    setLocalLocation(location);
    setLocalEquipment(equipment);
    setLocalCustomer(customer);
    setLocalEngineerInitial(engineerInitial);
    setLocalDate(date ? new Date(date) : undefined);
    setLocalCalcPerPage(calcPerPage);
  }, [systemApplication, dimensionalConstruction, thickness, unitSystem, location, equipment, customer, engineerInitial, date, calcPerPage]);

  // Helper to construct the full update object
  const createUpdatePayload = (
    updatedFields: Partial<{
      systemApplication: string;
      dimensionalConstruction: string;
      thickness: string;
      unitSystem: string;
      location: string;
      equipment: string;
      customer: string;
      engineerInitial: string;
      date: Date | undefined;
      calcPerPage: number;
    }>
  ) => {
    const payload = {
      systemApplication: updatedFields.systemApplication ?? localSystemApplication,
      dimensionalConstruction: updatedFields.dimensionalConstruction ?? localDimensionalConstruction,
      thickness: updatedFields.thickness ?? localThickness,
      unitSystem: updatedFields.unitSystem ?? localUnitSystem,
      location: updatedFields.location ?? localLocation,
      equipment: updatedFields.equipment ?? localEquipment,
      customer: updatedFields.customer ?? localCustomer,
      engineerInitial: updatedFields.engineerInitial ?? localEngineerInitial,
      date: updatedFields.date instanceof Date ? updatedFields.date.toISOString().split('T')[0] : (localDate?.toISOString().split('T')[0] || ""),
      calcPerPage: updatedFields.calcPerPage ?? localCalcPerPage,
    };
    return payload;
  };

  // Handler for each field, calling onUpdate
  const handleSystemApplicationChange = (value: string) => {
    setLocalSystemApplication(value);
    onUpdate(createUpdatePayload({ systemApplication: value }));
  };

  const handleDimensionalConstructionChange = (value: string) => {
    setLocalDimensionalConstruction(value);
    onUpdate(createUpdatePayload({ dimensionalConstruction: value }));
  };

  const handleThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalThickness(e.target.value);
    onUpdate(createUpdatePayload({ thickness: e.target.value }));
  };

  // New field handlers
  const handleUnitSystemChange = (value: string) => {
    setLocalUnitSystem(value);
    onUpdate(createUpdatePayload({ unitSystem: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalLocation(e.target.value);
    onUpdate(createUpdatePayload({ location: e.target.value }));
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEquipment(e.target.value);
    onUpdate(createUpdatePayload({ equipment: e.target.value }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalCustomer(e.target.value);
    onUpdate(createUpdatePayload({ customer: e.target.value }));
  };

  const handleEngineerInitialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEngineerInitial(e.target.value);
    onUpdate(createUpdatePayload({ engineerInitial: e.target.value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setLocalDate(date);
    onUpdate(createUpdatePayload({ date: date }));
  };

  const handleCalcPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLocalCalcPerPage(isNaN(value) ? 0 : value); // Handle potential NaN
    onUpdate(createUpdatePayload({ calcPerPage: isNaN(value) ? 0 : value }));
  };


  return (
    <div className="insulation-card">
      <div className="insulation-card-header">
        <h2>Insulation Details</h2>
        <HelpCircle className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/*       <div>
          <label className="block text-sm text-gray-600 mb-1">System Application</label>
          <Select value={localSystemApplication} onValueChange={handleSystemApplicationChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select system application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tank Shell - Horizontal">Tank Shell - Horizontal</SelectItem>
              <SelectItem value="Tank Shell - Vertical">Tank Shell - Vertical</SelectItem>
              <SelectItem value="Pipe">Pipe</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

    {/*     <div>
          <label className="block text-sm text-gray-600 mb-1">Dimensional Construction</label>
          <Select value={localDimensionalConstruction} onValueChange={handleDimensionalConstructionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select dimensional construction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Even Increment">Even Increment</SelectItem>
              <SelectItem value="Odd Increment">Odd Increment</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

  {/*    <div>
          <label className="block text-sm text-gray-600 mb-1">Thickness (mm)</label>
          <div className="input-group">
            <Input
              type="number"
              value={localThickness}
              onChange={handleThicknessChange}
              className="input"
            />
            <span className="unit">mm</span>
          </div>
        </div> */}

     
     {/*   <div>
          <label className="block text-sm text-gray-600 mb-1">Unit System</label>
          <Select value={localUnitSystem} onValueChange={handleUnitSystemChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select unit system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Metric">Metric</SelectItem>
              <SelectItem value="Imperial">Imperial</SelectItem>
              <SelectItem value="US Customary">US Customary</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        <div>
          <label className="block text-sm text-gray-600 mb-1">Location</label>
          <Input
            type="text"
            value={localLocation}
            onChange={handleLocationChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Equipment</label>
          <Input
            type="text"
            value={localEquipment}
            onChange={handleEquipmentChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Customer</label>
          <Input
            type="text"
            value={localCustomer}
            onChange={handleCustomerChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Engineer Initial</label>
          <Input
            type="text"
            value={localEngineerInitial}
            onChange={handleEngineerInitialChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !localDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localDate ? format(localDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* 
        <div>
          <label className="block text-sm text-gray-600 mb-1">Calc Per Page</label>
          <Input
            type="number"
            value={localCalcPerPage}
            onChange={handleCalcPerPageChange}
            className="input"
          />
        </div> */}

      </div>
    </div>
  );
};

export default InsulationDetails;