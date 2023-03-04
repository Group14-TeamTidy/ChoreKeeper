import { Outlet, ReactLocation, Router } from "@tanstack/react-location";
import { QueryClientProvider, QueryClient } from "react-query";
import "./App.css";
import LogIn from "./components/pages/LogIn";
import SignUp from "./components/pages/SignUp";
import ChoresPage from "./components/pages/ChoresPage";

const queryClient = new QueryClient();
const location = new ReactLocation();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        location={location}
        routes={[
          { path: "/", element: <ChoresPage /> },
          { path: "chores", element: <ChoresPage /> },
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