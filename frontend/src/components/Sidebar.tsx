// Sidebar.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit2Icon, Trash2Icon, ChevronUp, FolderIcon, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

// Define the ProjectMeta interface that Sidebar expects
interface ProjectMeta {
  id: string;
  name: string;
  lastModified: string; // From backend meta data
}

interface SidebarProps {
  projects: ProjectMeta[]; // Now receives projects as a prop
  onProjectSelect: (projectId: string) => void;
  activeProjectId: string;
  onAddProject: (name: string) => void; // Callback to Dashboard
  onEditProject: (projectId: string, newName: string) => void; // Callback to Dashboard
  onDeleteProject: (projectId: string) => void; // Callback to Dashboard
}

const Sidebar = ({
  projects,
  onProjectSelect,
  activeProjectId,
  onAddProject,
  onEditProject,
  onDeleteProject,
}: SidebarProps) => {
  // State for Add Project Dialog
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // State for Edit Project Dialog
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editedProjectName, setEditedProjectName] = useState("");

  // State for Delete Project Dialog
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // New state for collapse functionality
  const [isProjectsCollapsed, setIsProjectsCollapsed] = useState(false);

  // New state for "See All Projects" Dialog
  const [showAllProjectsDialog, setShowAllProjectsDialog] = useState(false);

  // --- Add Project Handlers ---
  const handleOpenAddProjectDialog = () => {
    setNewProjectName(""); // Clear previous input
    setShowAddProjectDialog(true);
  };

  const handleConfirmAddProject = () => {
    if (newProjectName.trim() !== "") {
      onAddProject(newProjectName.trim()); // Call prop function
      setShowAddProjectDialog(false); // Close dialog
      setNewProjectName(""); // Clear input after adding
    }
  };

  // --- Edit Project Handlers ---
  const handleOpenEditProjectDialog = (id: string) => {
    const projectToEdit = projects.find((project) => project.id === id);
    if (projectToEdit) {
      setEditingProjectId(id);
      setEditedProjectName(projectToEdit.name);
      setShowEditProjectDialog(true);
    }
  };

  const handleConfirmEditProject = () => {
    if (editingProjectId && editedProjectName.trim() !== "") {
      onEditProject(editingProjectId, editedProjectName.trim()); // Call prop function
      setShowEditProjectDialog(false); // Close dialog
      setEditingProjectId(null); // Clear editing state
      setEditedProjectName(""); // Clear input
    }
  };

  // --- Delete Project Handlers ---
  const handleOpenDeleteProjectDialog = (id: string) => {
    setDeletingProjectId(id);
    setShowDeleteProjectDialog(true);
  };

  const handleConfirmDeleteProject = () => {
    if (deletingProjectId) {
      onDeleteProject(deletingProjectId); // Call prop function
      setShowDeleteProjectDialog(false); // Close dialog
      setDeletingProjectId(null); // Clear deleting state
    }
  };

  // --- Collapse Handler ---
  const handleToggleProjectsCollapse = () => {
    setIsProjectsCollapsed(!isProjectsCollapsed);
  };

  // --- See All Projects Handler ---
  const handleOpenAllProjectsDialog = () => {
    setShowAllProjectsDialog(true);
  };

  return (
    <div className="w-56 bg-app-blue text-white min-h-screen">
      <div className="p-4 border-b border-app-blue-dark">
        <div className="flex justify-between items-center">
          <h2 className="font-medium">Sidebar</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick= {handleOpenAddProjectDialog}
            className="text-gray-200 hover:text-app-blue"
            title="Add New Project"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <div
          className="py-2 px-4 bg-app-blue-dark hover:bg-app-blue transition cursor-pointer"
          onClick={handleToggleProjectsCollapse}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FolderIcon className="h-4 w-4 mr-2" />
              <span className="font-medium">Projects</span>
            </div>
            {isProjectsCollapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </div>
        </div>

        {!isProjectsCollapsed && (
          <div className="text-sm bg-app-blue-dark bg-opacity-50">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`py-2 px-6 hover:bg-app-blue-dark transition cursor-pointer flex justify-between items-center group
                  ${
                    activeProjectId === project.id
                      ? "border-l-2 border-app-orange"
                      : "border-l-2 border-transparent"
                  }`}
                onClick={() => onProjectSelect(project.id)}
              >
                <div>
                  {project.name} {activeProjectId === project.id && "(current)"}
                  {/* Optional: Show last modified timestamp */}
                  {/* <div className="text-xs text-gray-400">Last saved: {new Date(project.lastModified).toLocaleTimeString()}</div> */}
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditProjectDialog(project.id);
                    }}
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  {/* Do not allow deletion of the last remaining project, or a hardcoded 'default' if it exists */}
                  {projects.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-white opacity-80 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteProjectDialog(project.id);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isProjectsCollapsed && (
          <div className="p-2 pl-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-white opacity-80 hover:opacity-100 hover:bg-app-blue-dark"
              onClick={handleOpenAddProjectDialog}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              <span>ADD PROJECT</span>
            </Button>
          </div>
        )}

        <div className="mt-4 p-2 pl-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white opacity-80 hover:opacity-100 hover:bg-app-blue-dark"
            onClick={handleOpenAllProjectsDialog} // Add onClick handler
          >
            SEE ALL PROJECTS
          </Button>
        </div>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Enter a name for your new project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newProjectName" className="text-right">
                Project Name
              </Label>
              <Input
                id="newProjectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProjectDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleConfirmAddProject} disabled={newProjectName.trim() === ""}>
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project Name</DialogTitle>
            <DialogDescription>Rename your project here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editedProjectName" className="text-right">
                Project Name
              </Label>
              <Input
                id="editedProjectName"
                value={editedProjectName}
                onChange={(e) => setEditedProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProjectDialog(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleConfirmEditProject}
              disabled={editedProjectName.trim() === ""}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the project "
              <span className="font-bold text-red-500">
                {projects.find((p) => p.id === deletingProjectId)?.name}
              </span>
              "? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteProjectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* All Projects List Dialog */}
      <Dialog open={showAllProjectsDialog} onOpenChange={setShowAllProjectsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>All Projects</DialogTitle>
            <DialogDescription>Here is a list of all your projects.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {projects.length > 0 ? (
              <ul className="space-y-2">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      onProjectSelect(project.id);
                      setShowAllProjectsDialog(false); // Close dialog after selecting
                    }}
                  >
                    <div className="font-medium">
                      {project.name}
                      {activeProjectId === project.id && <span className="text-gray-500 text-sm ml-2">(current)</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last Modified: {new Date(project.lastModified).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No projects found.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAllProjectsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;