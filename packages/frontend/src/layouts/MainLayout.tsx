import AppShell from '../components/app-shell/AppShell';
import { evaluationMenuItems } from '../app/navigation';

const MainLayout = () => {
  return <AppShell menuItems={evaluationMenuItems} />;
};

export default MainLayout;
