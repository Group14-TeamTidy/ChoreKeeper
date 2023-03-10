import { Outlet, ReactLocation, Router } from "@tanstack/react-location";
import { QueryClientProvider, QueryClient } from "react-query";
import "./App.css";
import LogIn from "./components/pages/LogIn";
import SignUp from "./components/pages/SignUp";
import HomePage from "./components/pages/HomePage"
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
          { path: "chores", element: <HomePage /> },
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