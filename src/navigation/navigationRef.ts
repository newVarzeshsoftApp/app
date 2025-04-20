import {createNavigationContainerRef} from '@react-navigation/native';
import {Platform} from 'react-native';
import {RootStackParamList} from '../utils/types/NavigationTypes';
import {useNavigationStore} from '../store/navigationStore';
import linking from './Linking';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a new screen and store the route in history
 */
export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (!navigationRef.isReady()) return;

  useNavigationStore.getState().addRoute(name, params);
  navigationRef.navigate(name as any, params as any);

  if (Platform.OS === 'web') {
    const url = linking.getPathFromState
      ? linking.getPathFromState({routes: [{name, params}]})
      : '';
    window.history.pushState({name, params}, '', url.toString());
  }
}

/**
 * Go back to the previous screen and remove the last route from history
 */
export function goBackSafe() {
  if (!navigationRef.isReady()) return;

  const previousRoute = useNavigationStore.getState().goBack();

  if (previousRoute) {
    navigationRef.navigate(
      previousRoute.name as any,
      previousRoute.params as any,
    );

    if (Platform.OS === 'web') {
      window.history.back();
    }
  } else {
    if (navigationRef.canGoBack()) {
      navigationRef.goBack();
    } else if (Platform.OS === 'web') {
      const confirmExit = window.confirm('Do you want to exit the app?');
      if (confirmExit) {
        navigate('Root', {
          screen: 'HomeNavigator',
        });
      } else {
        window.history.pushState({}, '', '');
      }
    }
  }
}

/**
 * Reset the navigation history
 */
export function resetNavigationHistory() {
  useNavigationStore.getState().resetHistory();
}
