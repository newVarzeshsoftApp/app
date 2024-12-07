import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '../utils/types/NavigationTypes';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params as never);
  }
}
