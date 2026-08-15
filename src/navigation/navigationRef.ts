import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {Platform} from 'react-native';
import {RootStackParamList} from '../utils/types/NavigationTypes';
import {useNavigationStore} from '../store/navigationStore';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a new screen and store the route in history.
 * URL sync is handled by React Navigation linking — do not pushState manually.
 */
export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (!navigationRef.isReady()) return;

  useNavigationStore.getState().addRoute(name, params);
  navigationRef.navigate(name as any, params as any);
}

const trimNavigationStore = () => {
  const {history} = useNavigationStore.getState();
  if (history.length > 1) {
    useNavigationStore.setState({history: history.slice(0, -1)});
  }
};

/**
 * Go back using React Navigation stack first (keeps URL/history in sync).
 * Falls back to custom store only when the navigator cannot go back.
 */
export function goBackSafe() {
  if (!navigationRef.isReady()) return;

  if (navigationRef.canGoBack()) {
    trimNavigationStore();
    navigationRef.goBack();
    return;
  }

  const previousRoute = useNavigationStore.getState().goBack();
  if (previousRoute) {
    navigationRef.navigate(
      previousRoute.name as any,
      previousRoute.params as any,
    );
    return;
  }

  if (Platform.OS === 'web') {
    const confirmExit = window?.confirm('Do you want to exit the app?');
    if (confirmExit) {
      navigationRef.navigate('Root', {
        screen: 'HomeNavigator',
        params: {screen: 'Home'},
      } as any);
    }
  }
}

/**
 * Pop nested stack to its initial screen (e.g. tab re-press).
 */
export function resetNestedStackToInitial(
  tabName: string,
  initialScreen: string,
) {
  if (!navigationRef.isReady()) return;

  const rootState = navigationRef.getRootState();
  const homeRoute = rootState.routes.find(route => route.name === 'Root');
  const homeState = homeRoute?.state;
  const tabRoute = homeState?.routes.find(route => route.name === tabName);

  if (!tabRoute?.state?.key) return;

  navigationRef.dispatch({
    ...CommonActions.reset({
      index: 0,
      routes: [{name: initialScreen}],
    }),
    target: tabRoute.state.key,
  });
}

/**
 * Reset the navigation history store
 */
export function resetNavigationHistory() {
  useNavigationStore.getState().resetHistory();
}
