import {useCallback, useMemo} from 'react';
import {useGetOrganizationBySKU} from './useGetOrganizationBySKU';
import {
  OrgConfigKey,
  OrgConfigs,
  isOrgFeatureEnabled,
  mergeOrgConfigs,
} from '../../helpers/orgConfigs';

export function useOrgConfigs(): {
  configs: OrgConfigs;
  isEnabled: (key: OrgConfigKey) => boolean;
  isLoading: boolean;
} {
  const {data, isLoading} = useGetOrganizationBySKU();
  const configs = useMemo(
    () => mergeOrgConfigs(data?.configs),
    [data?.configs],
  );

  const isEnabled = useCallback(
    (key: OrgConfigKey) => isOrgFeatureEnabled(configs, key),
    [configs],
  );

  return {configs, isEnabled, isLoading};
}

export function useIsOrgFeatureEnabled(key: OrgConfigKey): boolean {
  const {isEnabled} = useOrgConfigs();
  return isEnabled(key);
}
