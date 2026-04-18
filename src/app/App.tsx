import { RouterProvider } from 'react-router';
import { router } from './routes';
import { NotificationSystem } from './components/NotificationSystem';
import { IndustryProvider } from './contexts/IndustryContext';

export default function App() {
  return (
    <IndustryProvider>
      <NotificationSystem />
      <RouterProvider router={router} />
    </IndustryProvider>
  );
}
