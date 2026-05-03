import { useAppStore } from './stores/appStore';
import MainMenu from './screens/MainMenu';
import CampaignMap from './screens/CampaignMap';
import NetworkBuilder from './screens/NetworkBuilder';
import ResultsScreen from './screens/ResultsScreen';
import Sandbox from './screens/Sandbox';
import Settings from './screens/Settings';
import DailyChallenge from './screens/DailyChallenge';

function App() {
  const currentScreen = useAppStore((state) => state.currentScreen);

  switch (currentScreen) {
    case 'mainMenu':
      return <MainMenu />;
    case 'campaign':
      return <CampaignMap />;
    case 'network':
      return <NetworkBuilder />;
    case 'results':
      return <ResultsScreen />;
    case 'sandbox':
      return <Sandbox />;
    case 'daily':
      return <DailyChallenge />;
    case 'settings':
      return <Settings />;
    default:
      return <MainMenu />;
  }
}

export default App