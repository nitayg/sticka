
import { useQueryClient } from "@tanstack/react-query";

export const useQueryUtils = () => {
  const queryClient = useQueryClient();
  
  const invalidateQueries = (queryKeys: string | string[]) => {
    if (typeof queryKeys === 'string') {
      queryClient.invalidateQueries({ queryKey: [queryKeys] });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys });
    }
  };
  
  const prefetchQueries = async (queryKey: string[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn
    });
  };
  
  const updateQueryData = <T>(queryKey: string[], updater: (oldData: T) => T) => {
    queryClient.setQueryData(queryKey, (oldData: T) => {
      return updater(oldData);
    });
  };
  
  return {
    invalidateQueries,
    prefetchQueries,
    updateQueryData
  };
};
