// components/HelpTooltip.tsx
import React from 'react';
import { HelpCircle } from 'lucide-react'; // Import the HelpCircle icon
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming your Tooltip components are here

interface HelpTooltipProps {
  content: React.ReactNode; // Content to display inside the tooltip
  className?: string;       // Optional: additional class names for styling the icon
  iconSize?: number;        // Optional: size of the icon (default: 16)
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, className, iconSize = 16 }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}> {/* Add a slight delay for better UX */}
        <TooltipTrigger asChild>
          <HelpCircle
            className={`text-muted-foreground cursor-help ${className || ''}`}
            size={iconSize}
          />
        </TooltipTrigger>
        <TooltipContent>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HelpTooltip;