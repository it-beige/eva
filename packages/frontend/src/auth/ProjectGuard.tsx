import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppSelector } from '../hooks/useRedux';

type ProjectGuardProps = {
  children: ReactNode;
};

const ProjectGuard = ({ children }: ProjectGuardProps) => {
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject,
  );

  if (!selectedProject) {
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
};

export default ProjectGuard;
