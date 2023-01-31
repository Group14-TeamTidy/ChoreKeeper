 import { QueryClientProvider, QueryClient, useQuery } from 'react-query';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestData />
    </QueryClientProvider>
  );
}

const TestData = () => {
  const { isLoading, error, data } = useQuery('repoData', () =>
    fetch('http://localhost:4000/api').then(res =>
      res.text() // This could also (and likely will be .json() once the API is implemented)
    )
  )

  if (isLoading) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;

  return (
    <div className="App">
      <p>{ data }</p>
    </div>
  );
}

export default App;
