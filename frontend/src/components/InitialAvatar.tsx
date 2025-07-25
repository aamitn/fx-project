// components/ui/InitialAvatar.tsx
import React from "react";
// Assuming you have a utility for conditional classNames like 'clsx' or 'classnames'
// If not, you can replace `cn` with a simple string concatenation or install `clsx`.
import { cn } from "@/lib/utils"; 

interface InitialAvatarProps {
  name: string;
  size?: number; // Size in pixels for width and height (e.g., 64, 80, 100)
  className?: string; // Additional Tailwind CSS classes to apply
  style?: React.CSSProperties; // Additional inline styles to apply
}

/**
 * Generates initials from a given name.
 * Takes the first letter of the first word and the first letter of the last word.
 * Handles single-word names gracefully.
 */
const getInitials = (name: string): string => {
  if (!name) return "";
  const words = name.trim().split(" ").filter(Boolean); // Split by space and remove empty strings
  if (words.length === 0) return "";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Generates a deterministic HSL background color and a contrasting text color
 * based on a given seed (name). This ensures consistent colors for the same name.
 */
const generateColors = (seed: string) => {
  // Simple hash function to get a consistent number from the string
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360; // Hue from 0 to 359 (full spectrum)

  // Fixed saturation and lightness for a more professional, balanced color range.
  // These values are chosen to produce vibrant yet not overly bright/neon colors,
  // and to ensure good contrast with black/white text.
  const saturation = 70; // Percentage: 60-80% is often good
  const lightness = 65;  // Percentage: 50-70% is often good

  const bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  // Determine contrasting text color (black or white) based on background luminance.
  // This is a simplified HSL to RGB conversion for luminance calculation.
  const h = hue / 60;
  const s = saturation / 100;
  const l = lightness / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = l - c / 2;

  let r, g, b;
  if (0 <= h && h < 1) { [r, g, b] = [c, x, 0]; }
  else if (1 <= h && h < 2) { [r, g, b] = [x, c, 0]; }
  else if (2 <= h && h < 3) { [r, g, b] = [0, c, x]; }
  else if (3 <= h && h < 4) { [r, g, b] = [0, x, c]; }
  else if (4 <= h && h < 5) { [r, g, b] = [x, 0, c]; }
  else { [r, g, b] = [c, 0, x]; }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  // Calculate relative luminance (WCAG 2.0 formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Choose black or white text for best contrast
  const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF'; 

  return { bgColor, textColor };
};

/**
 * Renders a circular avatar with user initials, a deterministic background color,
 * and a contrasting text color. Includes professional styling and accessibility features.
 */
export default function InitialAvatar({ name, size = 64, className, style }: InitialAvatarProps) {
  const initials = getInitials(name);
  const { bgColor, textColor } = generateColors(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold select-none",
        "shadow-md ring-2 ring-offset-2 ring-offset-background", // Added shadow and ring for a professional look
        className // Allows consumers to pass additional Tailwind classes
      )}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        width: size,
        height: size,
        fontSize: size / 2.5, // Dynamically adjust font size based on avatar size
        ...style // Allows consumers to pass additional inline styles
      }}
      aria-label={`Avatar for ${name}`} // Accessibility: Provides a label for screen readers
      title={name} // Tooltip on hover
    >
      {initials}
    </div>
  );
}
