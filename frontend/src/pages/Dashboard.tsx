// Dashboard.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Corrected path to AuthContext
import { InsulationProvider, InsulationLayer } from "@/contexts/InsulationContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import InsulationDetails from "@/components/InsulationDetails";
import InsulationLayers from "@/components/InsulationLayers";
import Calculations from "@/components/Calculations";
import InsulationPreview from "@/components/InsulationPreview";
import Materials from "@/components/Materials";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AdminPanel from "@/components/AdminPanel";
import Docs from "@/components/Docs"; // Import the new Docs component
import {
    createProjectInDb,
    saveProjectToDb,
    loadProjectListMetaFromDb,
    loadProjectFullDataFromDb,
    deleteProjectFromDb,
    ProjectSaveData,
    ProjectListMeta,
} from "@/utils/projectApi";
import { fetchUserRoles } from "@/utils/api";

// Define the structure for a Project's content (all changeable data)
interface ProjectContent {
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
        date: string; // Storing as ISO string to match backend's string representation
        calcPerPage: number;
    };
    insulationLayers: InsulationLayer[];
    calculations: {
        selectedTabs: string[];
        calculationResults: Record<string, any>;
    };
    insulationPreview: {
        modelHeight: number;
        modelWidth: number;
        modelDepth: number;
        zoomLevel: number;
    };
}

// Define the full ProjectData structure as stored in frontend state
interface ProjectData extends ProjectContent {
    id: string; // Project ID from DB
    name: string; // Project name from DB
    // lastModified: string; // Optionally store last modified timestamp from DB
}

// Define default insulation layers.
const defaultInsulationLayers: InsulationLayer[] = [
    { id: 'insulation-1', type: 'Insulation 1', name: 'Select Material', thickness: '50', color: '#ADD8E6' },
];

// Define default project content (excluding ID and Name)
const defaultProjectContent: ProjectContent = {
    insulationDetails: {
        systemApplication: "Tank Shell - Horizontal",
        dimensionalConstruction: "Even Increment",
        thickness: "0",
        // Default values for new fields
        unitSystem: "Metric",
        location: "",
        equipment: "",
        customer: "",
        engineerInitial: "",
        date: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
        calcPerPage: 10,
    },
    insulationLayers: defaultInsulationLayers.map(layer => ({ ...layer })), // Deep copy
    calculations: {
        selectedTabs: ["heat-loss"],
        calculationResults: {},
    },
    insulationPreview: {
        modelHeight: 60,
        modelWidth: 200,
        modelDepth: 20,
        zoomLevel: 100,
    },
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("CALCULATIONS");
    const { user, getProfile, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserRoles(setUserRoles);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        setIsAdmin(userRoles.includes("Admin"));
    }, [userRoles]);


    // State to hold all project data loaded from DB (or newly created)
    // This is a map where key is projectId and value is ProjectData
    const [allProjectsData, setAllProjectsData] = useState<Record<string, ProjectData>>({});

    // State for the currently active project ID
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    // State to hold the list of project metadata (id, name, lastModified) for the sidebar
    const [projectListMeta, setProjectListMeta] = useState<ProjectListMeta[]>([]);

    // Ref for the debounced save timer
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce function for saving data to DB
    const debounceSave = useCallback((projectId: string, projectData: ProjectData) => {
        if (!user?.id) {
            console.warn("Cannot save: User not authenticated.");
            return;
        }
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(async () => {
            try {
                console.log(`Debounced saving project ${projectId}...`);
                // Prepare data for the backend API
                const dataToSave: ProjectSaveData = {
                    id: projectId,
                    name: projectData.name,
                    userId: user.id, // User ID is added here, though backend should verify from token
                    data: { // This structure matches ProjectContentDto
                        insulationDetails: projectData.insulationDetails,
                        insulationLayers: projectData.insulationLayers,
                        calculations: projectData.calculations,
                        insulationPreview: projectData.insulationPreview,
                    },
                };
                await saveProjectToDb(dataToSave);
                console.log(`Project ${projectId} saved successfully.`);
                // Optionally update the projectListMeta with a new lastModified timestamp if returned by saveProjectToDb
                // (You'd need saveProjectToDb to return ProjectListMeta or the full ProjectSaveData to get this)
                // For now, we'll refetch project list on successful save if a timestamp is critical
            } catch (error) {
                console.error(`Failed to save project ${projectId}:`, error);
                toast({
                    title: "Auto-Save Failed",
                    description: `Could not save project "${projectData.name}". Please check your connection.`,
                    variant: "destructive",
                });
            }
        }, 1500); // 1.5 seconds debounce
    }, [user?.id, toast]);

    // Effect to load projects on initial mount and when user becomes authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            // Clear data and redirect if not authenticated
            setAllProjectsData({});
            setProjectListMeta([]);
            setActiveProjectId(null);
            console.log("Redirecting to /auth");
            navigate("/auth");
            return;
        }

        if (user?.id) {
            const fetchProjects = async () => {
                try {
                    const loadedMeta = await loadProjectListMetaFromDb();
                    setProjectListMeta(loadedMeta);

                    if (loadedMeta.length === 0) {
                        // If no projects in DB, create a default one
                        console.log("No projects found in DB for user, creating a default project.");
                        const newDefaultProject = await createProjectInDb("Default Project");
                        const mappedProject: ProjectData = {
                            id: newDefaultProject.id,
                            name: newDefaultProject.name,
                            ...defaultProjectContent, // Initialize with default content on frontend
                        };
                        setAllProjectsData({ [mappedProject.id]: mappedProject });
                        setProjectListMeta(prev => [...prev, { id: mappedProject.id, name: mappedProject.name, lastModified: new Date().toISOString() }]);
                        setActiveProjectId(mappedProject.id);
                        toast({
                            title: "Welcome!",
                            description: "A default project has been created for you.",
                        });
                    } else {
                        // Set active project to the first one loaded
                        const firstProjectId = loadedMeta[0].id;
                        setActiveProjectId(firstProjectId);
                        // Load full data for the first project immediately
                        const fullProjectData = await loadProjectFullDataFromDb(firstProjectId);
                        const mappedProject: ProjectData = {
                            id: fullProjectData.id,
                            name: fullProjectData.name,
                            ...fullProjectData.data,
                        };
                        setAllProjectsData({ [mappedProject.id]: mappedProject });
                    }
                } catch (error) {
                    console.error("Failed to load projects:", error);
                    toast({
                        title: "Loading Projects Failed",
                        description: "Could not load your projects. Please try refreshing.",
                        variant: "destructive",
                    });
                }
            };
            fetchProjects();
            getProfile(); // Ensure user profile is fetched
        }
    }, [isAuthenticated, user?.id, navigate, getProfile, toast]); // Depend on auth state and user ID

    // Effect to trigger debounced save when active project data changes
    // This will trigger whenever allProjectsData[activeProjectId] changes
    useEffect(() => {
        if (activeProjectId && allProjectsData[activeProjectId] && user?.id) {
            debounceSave(activeProjectId, allProjectsData[activeProjectId]);
        }
    }, [activeProjectId, allProjectsData, debounceSave, user?.id]);

    // Handler for updating any part of the current project's content
    const updateCurrentProjectContent = useCallback((updater: (prevContent: ProjectContent) => ProjectContent) => {
        if (!activeProjectId) return; // Should not happen if a project is active

        setAllProjectsData(prevAllProjects => {
            const currentProject = prevAllProjects[activeProjectId];
            if (!currentProject) {
                console.error(`Project with ID ${activeProjectId} not found for update.`);
                return prevAllProjects;
            }

            // Extract content part from ProjectData
            const currentContent: ProjectContent = {
                insulationDetails: currentProject.insulationDetails,
                insulationLayers: currentProject.insulationLayers,
                calculations: currentProject.calculations,
                insulationPreview: currentProject.insulationPreview,
            };

            const newContent = updater(currentContent);

            const updatedProject: ProjectData = {
                ...currentProject, // Keep id and name
                ...newContent, // Update content fields
            };

            return {
                ...prevAllProjects,
                [activeProjectId]: updatedProject,
            };
        });
    }, [activeProjectId]);

    // --- Specific Update Handlers for Child Components ---
    const handleUpdateInsulationDetails = useCallback((newDetails: ProjectContent['insulationDetails']) => {
        updateCurrentProjectContent(prev => ({
            ...prev,
            insulationDetails: newDetails,
        }));
    }, [updateCurrentProjectContent]);

    const handleUpdateInsulationLayers = useCallback((updater: InsulationLayer[] | ((prevLayers: InsulationLayer[]) => InsulationLayer[])) => {
        updateCurrentProjectContent(prev => {
            let newLayers: InsulationLayer[];
            if (typeof updater === 'function') {
                newLayers = updater(prev.insulationLayers);
            } else {
                newLayers = updater;
            }
            if (!Array.isArray(newLayers)) {
                console.error("Attempted to update insulationLayers with a non-array value after processing updater:", newLayers);
                newLayers = defaultInsulationLayers.map(layer => ({ ...layer }));
            }
            return {
                ...prev,
                insulationLayers: newLayers,
            };
        });
    }, [updateCurrentProjectContent]);

    const handleUpdateCalculations = useCallback((
        selectedTabsUpdater: string[] | ((prevTabs: string[]) => string[]),
        calculationResultsUpdater: Record<string, any> | ((prevResults: Record<string, any>) => Record<string, any>)
    ) => {
        updateCurrentProjectContent(prev => {
            let updatedSelectedTabs: string[];
            if (typeof selectedTabsUpdater === 'function') {
                updatedSelectedTabs = selectedTabsUpdater(prev.calculations.selectedTabs);
            } else {
                updatedSelectedTabs = selectedTabsUpdater;
            }

            let updatedCalculationResults: Record<string, any>;
            if (typeof calculationResultsUpdater === 'function') {
                updatedCalculationResults = calculationResultsUpdater(prev.calculations.calculationResults);
            } else {
                updatedCalculationResults = calculationResultsUpdater;
            }

            return {
                ...prev,
                calculations: {
                    selectedTabs: updatedSelectedTabs,
                    calculationResults: updatedCalculationResults,
                },
            };
        });
    }, [updateCurrentProjectContent]);

    const handleUpdateInsulationPreview = useCallback((newPreview: ProjectContent['insulationPreview']) => {
        updateCurrentProjectContent(prev => ({
            ...prev,
            insulationPreview: newPreview,
        }));
    }, [updateCurrentProjectContent]);

    // --- Project Lifecycle Handlers (for Sidebar) ---

    const handleProjectSelect = useCallback(async (projectId: string) => {
        if (activeProjectId === projectId) return; // Already active

        setActiveProjectId(projectId);

        // If project data is not already loaded, fetch it
        if (!allProjectsData[projectId]) {
            try {
                const fullProjectData = await loadProjectFullDataFromDb(projectId);
                const mappedProject: ProjectData = {
                    id: fullProjectData.id,
                    name: fullProjectData.name,
                    ...fullProjectData.data,
                };
                setAllProjectsData(prev => ({ ...prev, [projectId]: mappedProject }));
            } catch (error) {
                console.error(`Failed to load project ${projectId}:`, error);
                toast({
                    title: "Loading Project Failed",
                    description: `Could not load project "${projectListMeta.find(p => p.id === projectId)?.name || projectId}".`,
                    variant: "destructive",
                });
                // Optionally revert to a previous active project or default
                setActiveProjectId(projectListMeta[0]?.id || null);
            }
        }
    }, [activeProjectId, allProjectsData, projectListMeta, toast]);

    const handleAddProject = useCallback(async (name: string) => {
        if (!user?.id) {
            toast({ title: "Authentication Required", description: "Please log in to create projects." });
            return;
        }
        try {
            const newProjectInDb = await createProjectInDb(name);
            const newProjectData: ProjectData = {
                id: newProjectInDb.id,
                name: newProjectInDb.name,
                ...defaultProjectContent, // Initialize with default content on frontend
            };
            setAllProjectsData(prev => ({ ...prev, [newProjectData.id]: newProjectData }));
            setProjectListMeta(prev => [...prev, { id: newProjectData.id, name: newProjectData.name, lastModified: new Date().toISOString() }]);
            setActiveProjectId(newProjectData.id);
            toast({ title: "Project Added", description: `Project "${name}" created successfully.` });
        } catch (error) {
            console.error("Failed to add project:", error);
            toast({ title: "Error", description: `Failed to create project "${name}".`, variant: "destructive" });
        }
    }, [user?.id, toast]);

    const handleEditProject = useCallback(async (projectId: string, newName: string) => {
        if (!user?.id) {
            toast({ title: "Authentication Required", description: "Please log in to edit projects." });
            return;
        }
        if (!allProjectsData[projectId]) {
            console.error(`Attempted to edit non-existent project: ${projectId}`);
            toast({ title: "Error", description: "Project not found for editing.", variant: "destructive" });
            return;
        }

        try {
            // Create a temporary project object with updated name for saving
            const projectToUpdate: ProjectSaveData = {
                id: projectId,
                name: newName,
                userId: user.id,
                data: allProjectsData[projectId] // Pass existing content
            };
            await saveProjectToDb(projectToUpdate);

            // Update local state and meta list
            setAllProjectsData(prev => ({
                ...prev,
                [projectId]: { ...prev[projectId], name: newName }
            }));
            setProjectListMeta(prev => prev.map(p =>
                p.id === projectId ? { ...p, name: newName, lastModified: new Date().toISOString() } : p
            ));
            toast({ title: "Project Updated", description: `Project renamed to "${newName}".` });
        } catch (error) {
            console.error(`Failed to edit project ${projectId}:`, error);
            toast({ title: "Error", description: `Failed to rename project to "${newName}".`, variant: "destructive" });
        }
    }, [user?.id, allProjectsData, toast]);

    const handleDeleteProject = useCallback(async (projectId: string) => {
        if (!user?.id) {
            toast({ title: "Authentication Required", description: "Please log in to delete projects." });
            return;
        }
        try {
            await deleteProjectFromDb(projectId);
            setAllProjectsData(prev => {
                const newProjects = { ...prev };
                delete newProjects[projectId];
                return newProjects;
            });
            setProjectListMeta(prev => prev.filter(p => p.id !== projectId));

            // If the deleted project was active, switch to the first available project or null
            if (activeProjectId === projectId) {
                const newActiveId = projectListMeta.find(p => p.id !== projectId)?.id || null;
                setActiveProjectId(newActiveId);
                if (newActiveId) {
                    await handleProjectSelect(newActiveId); // Load the new active project's data
                } else {
                    // If no projects left, create a new default one
                    await handleAddProject("Default Project");
                }
            }
            toast({ title: "Project Deleted", description: "Project successfully deleted." });
        } catch (error) {
            console.error(`Failed to delete project ${projectId}:`, error);
            toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
        }
    }, [user?.id, activeProjectId, projectListMeta, toast, handleProjectSelect, handleAddProject]);

    // Derive current project data for children
    const currentProjectData = activeProjectId ? allProjectsData[activeProjectId] : null;

    // Render nothing or a loading state if project data is not yet loaded
    if (!isAuthenticated || (user?.id && activeProjectId && !currentProjectData)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p>Loading projects...</p> {/* Or a spinner */}
            </div>
        );
    }

    // Fallback if no project is active after initial load (shouldn't happen with default creation)
    if (!activeProjectId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p>No projects available. Please create one.</p>
                {/* Render a button to create the first project */}
                <Button onClick={() => window.location.reload()} className="mt-4">
                    Refresh Page
                </Button>
            </div>
        );
    }

    return (
        <InsulationProvider
            layers={currentProjectData.insulationLayers}
            setLayers={handleUpdateInsulationLayers}
        >
            <div className="flex flex-col min-h-screen">
                <Header
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    username={user?.fullName || "User"}
                    lastSaved="Auto-saving..." // Placeholder
                    onLogout={logout}
                    isAdmin={isAdmin}
                />

                <div className="flex flex-1">
                    <div className="sticky top-16 h-[calc(100vh-4rem)] z-20 overflow-y-auto">
                        <Sidebar
                            projects={projectListMeta}
                            onProjectSelect={handleProjectSelect}
                            activeProjectId={activeProjectId}
                            onAddProject={handleAddProject}
                            onEditProject={handleEditProject}
                            onDeleteProject={handleDeleteProject}
                        />
                    </div>

                    <div className="flex-1 p-4">
                        {activeTab === "CALCULATIONS" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 space-y-4">
                                    <InsulationDetails
                                        systemApplication={currentProjectData.insulationDetails.systemApplication}
                                        dimensionalConstruction={currentProjectData.insulationDetails.dimensionalConstruction}
                                        thickness={currentProjectData.insulationDetails.thickness}
                                        unitSystem={currentProjectData.insulationDetails.unitSystem}
                                        location={currentProjectData.insulationDetails.location}
                                        equipment={currentProjectData.insulationDetails.equipment}
                                        customer={currentProjectData.insulationDetails.customer}
                                        engineerInitial={currentProjectData.insulationDetails.engineerInitial}
                                        date={currentProjectData.insulationDetails.date}
                                        calcPerPage={currentProjectData.insulationDetails.calcPerPage}
                                        onUpdate={handleUpdateInsulationDetails}
                                    />
                                    <InsulationLayers />
                                    <Calculations
                                        selectedTabs={currentProjectData.calculations.selectedTabs}
                                        setSelectedTabs={(updater) => handleUpdateCalculations(updater, currentProjectData.calculations.calculationResults)}
                                        calculationResults={currentProjectData.calculations.calculationResults}
                                        setCalculationResults={(updater) => handleUpdateCalculations(currentProjectData.calculations.selectedTabs, updater)}
                                    />
                                </div>

                                <div className="lg:col-span-1 sticky top-20 self-start h-fit">
                                    <InsulationPreview
                                        modelHeight={currentProjectData.insulationPreview.modelHeight}
                                        modelWidth={currentProjectData.insulationPreview.modelWidth}
                                        modelDepth={currentProjectData.insulationPreview.modelDepth}
                                        zoomLevel={currentProjectData.insulationPreview.zoomLevel}
                                        onUpdate={handleUpdateInsulationPreview}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "MATERIALS" && <Materials />}

                        {activeTab === "DOCS" && <Docs />} {/* Render the Docs component here */}

                        {activeTab === "ADMIN PANEL" && isAdmin && (
                            <AdminPanel />
                        )}

                        <Footer />
                    </div>
                </div>
            </div>
        </InsulationProvider>
    );
};

export default Dashboard;
