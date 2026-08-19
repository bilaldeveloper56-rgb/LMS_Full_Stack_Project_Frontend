import { RouterProvider } from 'react-router-dom';
import Providers from './providers';
import router from './router';

/**
 * Root application component.
 * Wraps the router with all required providers.
 */
export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
