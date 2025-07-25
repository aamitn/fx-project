// src/utils/projectApi.ts

import { InsulationLayer } from "@/contexts/InsulationContext"; // Assuming this path

// Define Frontend ProjectData structure for saving/loading
export interface ProjectSaveData {
  id?: string;
  name: string;
  userId?: string;
  data: {
    insulationDetails: {
      systemApplication: string;
      dimensionalConstruction: string;
      thickness: string;
      // New fields
      unitSystem: string;
      location: string;
      equipment: string;
      customer: string;
      engineerInitial: string;
      date: string; // ISO string for date
      calcPerPage: number;
    };
    insulationLayers: InsulationLayer[];
    calculations: {
      selectedTabs: string[];
      // Updated to reflect the backend's HeatLossCalculationDataDto structure.
      // This will contain both 'Inputs' and 'CalculationOutput' for 'heat-loss' tab.
      // For other calculation types, you'd define similar interfaces if they have structured data.
      calculationResults: {
        'heat-loss'?: { // 'heat-loss' is the key corresponding to the tab name
          Inputs?: { // Matches HeatLossParametersDto from backend
            analysisNo?: string;
            surfaceOrientation?: string;
            surfaceArea?: number;
            surfaceName?: string;
            surfaceType?: string;
            insideRadius?: number | null;
            includeFreezePlane?: boolean;
            convectionType?: string;
            airVelocity?: number;
            emissivity?: number;
            ambientTemp?: number;
            hotFaceTemp?: number;
            porousGas?: boolean;
            freezePlaneTemp?: number | null;
          };
          CalculationOutput?: { // Matches HeatLossCalculationOutputDto from backend
            coldFaceTemp?: number;
            heatLossPerM2?: number;
            totalHeatLoss?: number;
            locatedDistance?: number;
            temperatureResults?: Array<{
              no: number;
              heatStorage: number;
              hotSideTemp: number;
              coldSideTemp: number;
            }>;
            graphImageUrl?: string;
            graphPoints?: Array<{ x: number; y: number }>;
            // ... potentially other properties from your calculation results
          };
        };
        // You might add other calculation types here, e.g., 'pressure-drop'?: { ... }
        [key: string]: any; // Allow for other generic calculation results if needed, though specific types are better
      };
    };
    insulationPreview: {
      modelHeight: number;
      modelWidth: number;
      modelDepth: number;
      zoomLevel: number;
    };
  };
}

// Data structure for just the metadata (for sidebar list)
export interface ProjectListMeta {
  id: string;
  name: string;
  lastModified: string; // ISO string
}

// Assuming your backend runs on a specific port or path
// Adjust this to your actual backend API base URL
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5227/'; // Example: your .NET API might be on port 5000
const API_BASE_URL = 'http://localhost:5227/api'; // Example: your .NET API might be on port 5000

// Utility to get auth token
const getAuthToken = (): string | null => {
  // Replace with your actual token retrieval logic (e.g., from localStorage, cookie, or AuthContext)
  return localStorage.getItem('token'); // get token
};

// Generic API fetch helper with error handling and auth
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorData: any = { message: 'Something went wrong on the server.' };
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      errorData.message = response.statusText || errorData.message;
    }
    const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    console.error(`API Error: ${response.status} - ${errorMessage}`, errorData);
    throw new Error(errorMessage);
  }

  // Handle cases where response might be empty (e.g., 204 No Content for DELETE)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return {} as T; // Return empty object for non-JSON responses (e.g., 204 No Content)
}

/**
 * Creates a new project in the database.
 * @param name The name of the new project.
 * @returns The newly created ProjectSaveData object from the backend.
 */
export const createProjectInDb = async (name: string): Promise<ProjectSaveData> => {
  console.log(`Creating new project "${name}" in DB...`);
  return fetchApi<ProjectSaveData>(`${API_BASE_URL}/projects`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

/**
 * Saves/Updates a project in the database.
 * @param project The project data to save/update. Requires project.id.
 * @returns The updated ProjectSaveData object from the backend.
 */
export const saveProjectToDb = async (project: ProjectSaveData): Promise<ProjectSaveData> => {
  if (!project.id) {
    throw new Error("Project ID is required for saving/updating a project.");
  }
  console.log(`Saving project ${project.id} to DB...`);
  // Send only the necessary fields for update, mimicking UpdateProjectRequestDto
  const payload = {
    id: project.id, // Include ID as expected by backend's UpdateProjectRequestDto for validation
    name: project.name,
    // Flatten the 'data' object's properties directly into the payload
    insulationDetails: project.data.insulationDetails,
    insulationLayers: project.data.insulationLayers,
    calculations: project.data.calculations,
    insulationPreview: project.data.insulationPreview,
  };

  return fetchApi<ProjectSaveData>(`${API_BASE_URL}/projects/${project.id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

/**
 * Fetches all project metadata (id, name, lastModified) for the authenticated user.
 * @returns A list of ProjectListMeta objects.
 */
export const loadProjectListMetaFromDb = async (): Promise<ProjectListMeta[]> => {
  console.log(`Loading project list meta from DB...`);
  return fetchApi<ProjectListMeta[]>(`${API_BASE_URL}/projects`, {
    method: 'GET',
  });
};

/**
 * Fetches a single project's full data by its ID.
 * @param projectId The ID of the project to fetch.
 * @returns The full ProjectSaveData object.
 */
export const loadProjectFullDataFromDb = async (projectId: string): Promise<ProjectSaveData> => {
  console.log(`Loading full project data for ${projectId} from DB...`);
  return fetchApi<ProjectSaveData>(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'GET',
  });
};

/**
 * Deletes a project from the database.
 * @param projectId The ID of the project to delete.
 */
export const deleteProjectFromDb = async (projectId: string): Promise<void> => {
  console.log(`Deleting project ${projectId} from DB...`);
  await fetchApi<void>(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
  });
};