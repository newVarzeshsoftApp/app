export const ORG_CONFIG_KEYS = [
  'onlinePayment',
  'walletUsage',
  'walletCharge',
  'onlineSale',
  'groupClassRoom',
  'reservation',
  'chargingServiceSettlement',
  'showInsurance',
  'showMembership',
  'showLocker',
  'showBmi',
  'openLocker',
  'showGift',
  'showMyGifts',
  'showSurvey',
  'onlineSignup',
  'showPurchaseProfit',
] as const;

export type OrgConfigKey = (typeof ORG_CONFIG_KEYS)[number];

export type OrgConfigs = Record<OrgConfigKey, boolean>;

/** Legacy gateway key. Backend maps it to onlineSignup on read. */
export type OrgConfigsInput = Partial<OrgConfigs> & {
  createMembershipFile?: boolean;
};

export const DEFAULT_ORG_CONFIGS: OrgConfigs = {
  onlinePayment: true,
  walletUsage: true,
  walletCharge: true,
  onlineSale: true,
  groupClassRoom: true,
  reservation: true,
  chargingServiceSettlement: true,
  showInsurance: true,
  showMembership: true,
  showLocker: true,
  showBmi: true,
  openLocker: true,
  showGift: true,
  showMyGifts: true,
  showSurvey: true,
  onlineSignup: true,
  showPurchaseProfit: true,
};

export function mergeOrgConfigs(partial?: OrgConfigsInput | null): OrgConfigs {
  const source = partial ?? {};
  const merged: OrgConfigs = {...DEFAULT_ORG_CONFIGS};

  ORG_CONFIG_KEYS.forEach(key => {
    const value = source[key];
    if (typeof value === 'boolean') {
      merged[key] = value;
    }
  });

  if (
    typeof source.onlineSignup !== 'boolean' &&
    typeof source.createMembershipFile === 'boolean'
  ) {
    merged.onlineSignup = source.createMembershipFile;
  }

  return merged;
}

/** Missing or non-false values stay enabled, matching the gateway default. */
export function isOrgFeatureEnabled(
  configs: OrgConfigs,
  key: OrgConfigKey,
): boolean {
  return configs[key] !== false;
}

/** Opening a locker only makes sense when the locker itself is visible. */
export function canOpenOrganizationLocker(configs: OrgConfigs): boolean {
  return (
    isOrgFeatureEnabled(configs, 'showLocker') &&
    isOrgFeatureEnabled(configs, 'openLocker')
  );
}

export function isHomeTabEnabled(configs: OrgConfigs, tabName: string): boolean {
  switch (tabName) {
    case 'reserve':
      return isOrgFeatureEnabled(configs, 'reservation');
    case 'groupClassRoom':
      return isOrgFeatureEnabled(configs, 'groupClassRoom');
    case 'cart':
      return (
        isOrgFeatureEnabled(configs, 'onlineSale') ||
        isOrgFeatureEnabled(configs, 'reservation') ||
        isOrgFeatureEnabled(configs, 'groupClassRoom')
      );
    default:
      return true;
  }
}
