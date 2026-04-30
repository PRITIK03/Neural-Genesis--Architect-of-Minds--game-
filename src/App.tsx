import { useAppStore } from './stores/appStore';
import MainMenu from './screens/MainMenu';
import CampaignMap from './screens/CampaignMap';
import NetworkBuilder from './screens/NetworkBuilder';

function App() {
  const currentScreen = useAppStore((state) => state.currentScreen);

  switch (currentScreen) {
    case 'mainMenu':
      return <MainMenu />;
    case 'campaign':
      return <CampaignMap />;
    case 'network':
      return <NetworkBuilder />;
    default:
      return <MainMenu />;
  }
}

export default App