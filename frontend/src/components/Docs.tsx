// src/pages/Docs.tsx (original file name)

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown (tables, task lists, etc.)

// Import content from separate files
import { introductionContent } from '@/docs/introduction';
import { materialManagementContent } from '@/docs/materialManagement';
import { calculationModulesContent } from '@/docs/calculationModules';
import { projectManagementContent } from '@/docs/projectManagement';
import { adminPanelContent } from '@/docs/adminPanel';

// Define the structure for a documentation section
interface DocSection {
  id: string;
  title: string;
  content: string; // Markdown content
}

// Predefined Markdown content for different sections
const docSections: DocSection[] = [
  {
    id: 'introduction',
    title: 'Introduction to the App',
    content: introductionContent, // Now imports from a separate file
  },
  {
    id: 'material-management',
    title: 'Material Management',
    content: materialManagementContent, // Now imports from a separate file
  },
  {
    id: 'calculation-modules',
    title: 'Calculation Modules',
    content: calculationModulesContent, // Now imports from a separate file
  },
  {
    id: 'project-management',
    title: 'Project Management',
    content: projectManagementContent, // Now imports from a separate file
  },
  {
    id: 'admin-panel',
    title: 'Admin Panel (Admin Only)',
    content: adminPanelContent, // Now imports from a separate file
  },
];

const Docs: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>(docSections[0].id);

  const activeSectionContent = docSections.find(
    (section) => section.id === activeSectionId
  )?.content || 'No content found for this section.';

  return (
    <Card className="p-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-160px)]">
      {/* Sidebar for Navigation */}
      <div className="w-full lg:w-64 flex-shrink-0 border-r lg:border-r-0 lg:border-b-0 lg:border-l-0 lg:pr-6 pb-4 lg:pb-0">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookText className="h-5 w-5" /> Documentation Topics
        </h3>
        <nav>
          <ul className="space-y-2">
            {docSections.map((section) => (
              <li key={section.id}>
                <Button
                  variant={activeSectionId === section.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSectionId(section.id)}
                >
                  {section.title}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto prose max-w-none p-4 bg-gray-50 rounded-md">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {activeSectionContent}
        </ReactMarkdown>
      </div>
    </Card>
  );
};

export default Docs;