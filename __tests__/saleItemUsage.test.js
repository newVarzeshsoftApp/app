import React from 'react';
import {act, create} from 'react-test-renderer';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import i18next from 'i18next';
import {I18nextProvider} from 'react-i18next';
import fa from '../translations/fa.json';
import PackageCard from '../src/components/cards/Service/PackageCard';
import SaleItemPersonLabel from '../src/components/cards/Service/SaleItemPersonLabel';
import UserService from '../src/services/UserService';
import {useGetUserSaleItemPages} from '../src/utils/hooks/User/useGetUserSaleItem';
import {getSharedSessionUsage} from '../src/utils/helpers/sessionUsage';

jest.mock('../src/services/UserService', () => ({GetUserSaleItem: jest.fn()}));
jest.mock('../src/components/BaseText', () => 'Text');
jest.mock('../src/components/Badge/Badge', () => 'Badge');
jest.mock('iconsax-react-native', () => ({ArrowUp: 'Icon', Box1: 'Icon'}));

const i18n = i18next.createInstance();
const parent = {id: 1, firstName: 'رضا', lastName: 'احمدی'};
const child = {id: 2, firstName: 'سارا', lastName: 'احمدی'};

beforeAll(() =>
  i18n.init({
    lng: 'fa',
    resources: {fa: {translation: fa}},
    initImmediate: false,
  }),
);

function render(element) {
  return create(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

test('the owner sees no extra person on a personal service without a consumer', () => {
  const card = render(
    <PackageCard data={{user: parent}} viewerId={parent.id} />,
  );
  expect(card.root.findByType(SaleItemPersonLabel).children).toHaveLength(0);
});

test('an assigned service identifies its owner to the consumer', () => {
  const card = render(
    <PackageCard data={{user: parent, consumer: child}} viewerId={child.id} />,
  );
  expect(
    card.root.findByType(SaleItemPersonLabel).findByType('Text').children,
  ).toEqual(['صاحب خدمت: رضا احمدی']);
});

test('a session identifies another consumer, and hides the current or missing consumer', () => {
  const session = {user: parent, consumer: child};
  const label = viewerId => (
    <SaleItemPersonLabel
      role="consumer"
      person={session.consumer}
      viewerId={viewerId}
    />
  );
  expect(render(label(parent.id)).toJSON().children).toEqual([
    'مصرف‌کننده: سارا احمدی',
  ]);
  expect(render(label(child.id)).toJSON()).toBeNull();
  expect(render(label(undefined)).toJSON()).toBeNull();
  expect(
    render(
      <SaleItemPersonLabel role="consumer" viewerId={parent.id} />,
    ).toJSON(),
  ).toBeNull();
});

test('a shared history totals session quantities from each viewer’s perspective', () => {
  const sessions = [
    {user: parent, consumer: parent, quantity: 1},
    {user: parent, consumer: child, quantity: 2},
    {user: parent, consumer: child, quantity: 1},
  ];
  expect(getSharedSessionUsage(sessions, parent.id, parent.id)).toEqual({
    mine: 1,
    others: 3,
  });
  expect(getSharedSessionUsage(sessions, child.id, parent.id)).toEqual({
    mine: 3,
    others: 1,
  });
  expect(
    getSharedSessionUsage([{quantity: 1}, ...sessions], child.id, parent.id),
  ).toBeNull();
});

test('refreshing the list drops a previously returned parent service when the gateway omits it', async () => {
  const mine = {id: 100, user: child};
  const inherited = {id: 101, user: parent};
  UserService.GetUserSaleItem.mockResolvedValueOnce({total: 2, content: [mine]})
    .mockResolvedValueOnce({total: 2, content: [inherited]})
    .mockResolvedValueOnce({total: 1, content: [mine]});
  const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
  let query;
  function List() {
    query = useGetUserSaleItemPages({status: 0, isReserved: false}, 1);
    return (query.data?.pages ?? []).flatMap(page =>
      page.content.map(item => (
        <SaleItemPersonLabel
          key={item.id}
          role="owner"
          person={item.user}
          viewerId={child.id}
        />
      )),
    );
  }

  let list;
  await act(async () => {
    list = render(
      <QueryClientProvider client={client}>
        <List />
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await query.fetchNextPage();
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  expect(list.root.findAllByType('Text').map(text => text.children)).toEqual([
    ['صاحب خدمت: رضا احمدی'],
  ]);
  await act(async () => {
    await client.invalidateQueries({queryKey: ['UserSaleItem']});
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  expect(list.root.findAllByType(SaleItemPersonLabel)).toHaveLength(1);
  expect(list.toJSON()).toBeNull();
  expect(
    UserService.GetUserSaleItem.mock.calls.map(([filters]) => filters),
  ).toEqual(
    [0, 1, 0].map(offset => ({status: 0, isReserved: false, limit: 1, offset})),
  );
  act(() => list.unmount());
  client.clear();
});
