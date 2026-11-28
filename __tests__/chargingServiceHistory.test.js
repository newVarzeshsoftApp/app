import React from 'react';
import {act, create} from 'react-test-renderer';
import i18next from 'i18next';
import {I18nextProvider} from 'react-i18next';
import fa from '../translations/fa.json';
import CreditDetail from '../src/screens/Saleitem/Detail/CreditDetail';
import {useAuth} from '../src/utils/hooks/useAuth';
import {useGetUserChargingServiceByID} from '../src/utils/hooks/User/useGetUserChargingServiceByID';

jest.mock('../src/utils/hooks/useAuth', () => ({useAuth: jest.fn()}));
jest.mock('../src/utils/hooks/User/useGetUserChargingServiceByID', () => ({
  useGetUserChargingServiceByID: jest.fn(),
}));
jest.mock('../src/utils/hooks/Organization/useGetOrganizationBySKU', () => ({
  useGetOrganizationBySKU: () => ({}),
  useIsMultiOrg: () => true,
}));
jest.mock('../src/utils/hooks/Organization/useOrgConfigs', () => ({
  useIsOrgFeatureEnabled: () => false,
}));
jest.mock(
  '../src/components/header/NavigationHeader',
  () => 'NavigationHeader',
);
jest.mock('../src/components/Button/BaseButton', () => 'Button');
jest.mock('../src/components/BaseText', () => 'Text');
jest.mock('../src/components/cards/SubProduct', () => 'SubProduct');
jest.mock('../src/navigation/navigationRef', () => ({navigate: jest.fn()}));
jest.mock('iconsax-react-native', () => ({FlashCircle: 'Icon'}));
jest.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  Image: 'Image',
  View: 'View',
}));
jest.mock('react-native-css-interop/jsx-runtime', () =>
  jest.requireActual('react/jsx-runtime'),
);
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));
jest.mock('react-native-reanimated', () => ({
  default: {ScrollView: 'ScrollView'},
  __esModule: true,
  useSharedValue: value => ({value}),
  useAnimatedScrollHandler: jest.fn(),
}));

const i18n = i18next.createInstance();
const owner = {id: 1, firstName: 'رضا', lastName: 'احمدی'};
const child = {id: 2, firstName: 'سارا', lastName: 'احمدی'};

beforeAll(() =>
  i18n.init({
    lng: 'fa',
    resources: {fa: {translation: fa}},
    initImmediate: false,
  }),
);

test.each([
  {profile: owner, expected: [[], ['مصرف‌کننده: سارا احمدی'], [], []]},
  {profile: child, expected: [['مصرف‌کننده: رضا احمدی'], [], [], []]},
])(
  'shows each usage consumer relative to viewer $profile.id',
  ({profile, expected}) => {
    useAuth.mockReturnValue({profile});
    useGetUserChargingServiceByID.mockReturnValue({
      data: [owner, child, null, undefined].map((consumer, index) => ({
        order: index + 100,
        submitAt: '2026-11-28T12:00:00Z',
        amount: 1000,
        remain: 4000,
        organizationUnit: {id: 1, title: 'شعبه یک'},
        user: owner,
        consumer,
      })),
    });

    const detail = create(
      <I18nextProvider i18n={i18n}>
        <CreditDetail
          data={{
            id: 10,
            credit: 5000,
            usedCredit: 1000,
            start: '2026-11-01',
            end: '2026-12-01',
            user: owner,
            consumer: child,
          }}
          navigation={{setOptions: jest.fn()}}
        />
      </I18nextProvider>,
    );

    expect(useGetUserChargingServiceByID).toHaveBeenLastCalledWith(10);
    const orderButtons = detail.root.findAllByType('Button');
    expect(orderButtons.map(button => button.props.text)).toEqual([
      '100',
      '101',
      '102',
      '103',
    ]);
    const historyRows = orderButtons.map(button =>
      button.parent.parent
        .findAllByType('Text')
        .map(text => text.children.join('')),
    );
    for (const row of historyRows) {
      expect(row).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/),
          '1,000',
          '4,000',
          'شعبه یک',
        ]),
      );
    }
    expect(
      historyRows.map(row =>
        row.filter(text => text.startsWith('مصرف‌کننده:')),
      ),
    ).toEqual(expected);
    act(() => detail.unmount());
  },
);
