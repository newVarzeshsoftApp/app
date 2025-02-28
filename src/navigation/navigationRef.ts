import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '../utils/types/NavigationTypes';
import {useNavigationStore} from '../store/navigationStore';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a new screen and store the route in history
 */
export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T] | undefined,
) {
  if (!navigationRef.isReady()) {
    console.warn('🚨 navigationRef is not ready');
    return;
  }

  console.log(`🟢 Navigating to: ${name}`, params);
  useNavigationStore.getState().addRoute(name, params);

  navigationRef.navigate(name as any, params as any);
}

/**
 * Go back to the previous screen and remove the last route from history
 */
export function goBackSafe() {
  if (!navigationRef.isReady()) {
    console.warn('🚨 navigationRef is not ready');
    return;
  }

  const previousRoute = useNavigationStore.getState().goBack();

  if (previousRoute) {
    console.log(
      `🔙 Navigating back to: ${previousRoute.name}`,
      previousRoute.params,
    );
    navigationRef.navigate(
      previousRoute.name as any,
      previousRoute.params as any,
    );
  } else {
    console.warn('🚨 No previous route found, using default goBack');
    if (navigationRef.canGoBack()) {
      navigationRef.goBack(); // Go back to the previous route normally
    }
  }
}

/**
 * Reset the navigation history
 */
export function resetNavigationHistory() {
  console.log('🧹 Resetting navigation history');
  useNavigationStore.getState().resetHistory();
}
