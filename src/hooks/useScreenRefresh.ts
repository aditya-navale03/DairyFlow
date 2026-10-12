
import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';

export default function useScreenRefresh(
  refreshData: () => void | Promise<void>,
) {
  useFocusEffect(
    useCallback(() => {
      void refreshData();
    }, [refreshData]),
  );
}
