import DashboardPage from './pages/DashboardPage.jsx';
import RuntimeErrorBoundary from './components/RuntimeErrorBoundary.jsx';

export default function App() {
  return (
    <RuntimeErrorBoundary>
      <DashboardPage />
    </RuntimeErrorBoundary>
  );
}
