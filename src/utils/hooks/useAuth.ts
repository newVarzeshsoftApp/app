import {useQuery} from '@tanstack/react-query';
import {SENTRY} from '../helpers/sentryConfig';
import {getTokens} from '../helpers/tokenStorage';
import {useProfile} from './useProfile';
import {GetSKU} from '../helpers/GetSKU';

export const useAuth = () => {
  const SKU = GetSKU();

  // Get token using react-query
  const {data: tokens, isLoading: isTokensLoading} = useQuery({
    queryKey: ['Tokens'],
    queryFn: getTokens,
  });

  // Get user profile using react-query
  const {data: profile, isLoading: isProfileLoading} = useProfile({
    token: tokens?.accessToken,
  });

  // Check if the user is logged in
  const isLoggedIn = !!tokens?.accessToken; // Adjust as per your token structure

  // Set user data in Sentry if logged in
  if (isLoggedIn && profile) {
    SENTRY.setUser({
      id: profile.id,
      email: profile.email ?? '',
      username: `${profile.firstName} ${profile.lastName}`,
    });
    SENTRY.setContext('user_metadata', {
      username: `${profile.firstName} ${profile.lastName}`,
      phone: profile.mobile,
      email: profile.email ?? '',
      gender: profile.gender,
      SKU,
    });
  } else {
    // Clear user data in Sentry if not logged in
    SENTRY.setUser(null);
    SENTRY.setContext('user_metadata', {});
  }

  return {
    isLoggedIn,
    isTokensLoading,
    isProfileLoading,
    profile,
    SKU: SKU,
  };
};
