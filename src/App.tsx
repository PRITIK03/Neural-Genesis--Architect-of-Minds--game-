import { useAppStore } from './stores/appStore';
import MainMenu from './screens/MainMenu';
import CampaignMap from './screens/CampaignMap';
import NetworkBuilder from './screens/NetworkBuilder';
import ResultsScreen from './screens/ResultsScreen';
import Sandbox from './screens/Sandbox';
import Settings from './screens/Settings';
import DailyChallenge from './screens/DailyChallenge';
import CustomPuzzleBuilder from './screens/CustomPuzzleBuilder';
import Leaderboard from './screens/Leaderboard';
import ProfileAchievements from './screens/ProfileAchievements';

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
    case 'custom':
      return <CustomPuzzleBuilder />;
    case 'leaderboard':
      return <Leaderboard />;
    case 'profile':
      return <ProfileAchievements />;
    default:
      return <MainMenu />;
  }
}

export default App