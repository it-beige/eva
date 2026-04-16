import AppShell from '../components/app-shell/AppShell';
import { observabilityMenuItems } from '../app/navigation';

const ObservabilityLayout = () => {
  return <AppShell menuItems={observabilityMenuItems} />;
};

export default ObservabilityLayout;
