import { Outlet, ReactLocation, Router } from "@tanstack/react-location";
import { QueryClientProvider, QueryClient, useQuery } from "react-query";
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

const TestData = () => {
  const { isLoading, error, data } = useQuery("repoData", () =>
    fetch("http://127.0.0.1:4000/api").then(
      (res) => res.text() // This could also be, and likely will be, .json() once the API is implemented
    )
  );

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error;

  return (
    <div className="App">
      <p>{data}</p>
      <p>Hi</p>
    </div>
  );
};

export default App;
