import { useId } from 'react';
import type { SVGProps } from 'react';

interface TagClusterIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  startColor?: string;
  endColor?: string;
  secondaryColor?: string;
}

export const TagClusterIcon = ({
  size = 16,
  startColor = '#7280FF',
  endColor = '#4FC3FF',
  secondaryColor = 'rgba(114, 128, 255, 0.22)',
  ...props
}: TagClusterIconProps) => {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="5.2" y1="6.4" x2="18.8" y2="17.6">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
      <path
        d="M11.35 4.35h4.94c.53 0 1.04.21 1.41.58l1.37 1.37c.78.78.78 2.05 0 2.83l-4.75 4.75a2 2 0 0 1-2.82 0l-1.37-1.37a2 2 0 0 1-.58-1.41V6.35c0-1.1.9-2 2-2Z"
        fill={secondaryColor}
      />
      <path
        d="M7.72 7.05h6.24c.53 0 1.04.21 1.41.59l1.99 1.98c.78.79.78 2.05 0 2.83l-5.68 5.69a2 2 0 0 1-2.83 0L6.86 16.15a2 2 0 0 1-.58-1.42V9.05c0-1.1.89-2 2-2Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M7.72 7.05h6.24c.53 0 1.04.21 1.41.59l1.99 1.98c.78.79.78 2.05 0 2.83l-5.68 5.69a2 2 0 0 1-2.83 0L6.86 16.15a2 2 0 0 1-.58-1.42V9.05c0-1.1.89-2 2-2Z"
        stroke="rgba(255,255,255,0.46)"
        strokeWidth="0.9"
      />
      <circle cx="9.38" cy="10.18" r="1.2" fill="white" fillOpacity="0.98" />
      <path
        d="M15.28 8.35l0.88-0.88M16.66 9.74l0.88-0.88"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default TagClusterIcon;
