import {create} from 'zustand';
import {RootStackParamList} from '../utils/types/NavigationTypes';

interface NavigationState {
  history: {
    name: keyof RootStackParamList;
    params?: RootStackParamList[keyof RootStackParamList];
  }[];
  addRoute: (
    name: keyof RootStackParamList,
    params?: RootStackParamList[keyof RootStackParamList],
  ) => void;
  goBack: () => {
    name: keyof RootStackParamList;
    params?: RootStackParamList[keyof RootStackParamList];
  } | null;
  resetHistory: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  history: [
    {
      name: 'Root',
      params: {
        screen: 'HomeNavigator',
        params: {screen: 'Home'},
      },
    },
  ],

  /**
   * Adds a new route to the history
   */
  addRoute: (name, params) =>
    set(state => {
      if (
        state.history.length > 0 &&
        state.history[state.history.length - 1].name === name &&
        JSON.stringify(state.history[state.history.length - 1].params) ===
          JSON.stringify(params)
      ) {
        console.log(
          `🔄 Route ${name} with the same params is already the last one, skipping.`,
        );
        return state;
      }

      const newHistory = [...state.history, {name, params}];
      console.log(`📌 Adding route to history: ${name}`, params);
      console.log('📜 Current History:', newHistory); // ✅ Log current history
      return {history: newHistory};
    }),

  /**
   * Goes back to the previous route and removes the last route from the history
   */
  goBack: () => {
    let previousRoute: {
      name: keyof RootStackParamList;
      params?: RootStackParamList[keyof RootStackParamList];
    } | null = null;

    set(state => {
      if (state.history.length > 1) {
        previousRoute = state.history[state.history.length - 2];
        console.log(
          `🔙 Found previous route: ${previousRoute.name}`,
          previousRoute.params,
        );

        const newHistory = state.history.slice(0, -1);
        console.log('📜 Updated History after goBack:', newHistory); // ✅ Log updated history after going back
        return {history: newHistory};
      } else {
        console.log('🚨 No previous route found');
        console.log('📜 History is now empty.'); // ✅ Log when history is cleared
        return {history: []};
      }
    });

    return previousRoute;
  },

  /**
   * Clears the navigation history
   */
  resetHistory: () => {
    console.log('🧹 Clearing navigation history');
    set({history: []});
    console.log('📜 History is now empty.'); // ✅ Log confirmation that history is reset
  },
}));
