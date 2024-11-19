import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import React, {useMemo} from 'react';
import {Platform} from 'react-native';

function TenstackProvider({children}: {children: React.ReactNode}) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60,
            refetchOnWindowFocus: true,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}

      {Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default TenstackProvider;
