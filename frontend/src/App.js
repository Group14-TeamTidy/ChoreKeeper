import { Outlet, ReactLocation, Router } from "@tanstack/react-location";
import { QueryClientProvider, QueryClient } from "react-query";
import "./App.css";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import HomePage from "./pages/HomePage";
import ChoreService from "./services/ChoreService";

const queryClient = new QueryClient();
const location = new ReactLocation();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        location={location}
        routes={[
          { path: "/", element: <HomePage /> },
          {
            path: "chores",
            element: <HomePage />,
            loader: () =>
              queryClient.getQueryData("chores") ??
              queryClient
                .fetchQuery("chores", ChoreService.getChores)
                .then(() => ({})),
          },
          { path: "schedule", element: <HomePage /> },
          { path: "login", element: <LogIn /> },
          { path: "signup", element: <SignUp /> },
        ]}
      >
        <Outlet />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
export { queryClient, location };
