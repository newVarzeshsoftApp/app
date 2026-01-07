import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Platform, View} from 'react-native';
import {useGetWalletTransaction} from '../../../utils/hooks/User/useGetWalletTransaction';
import {limit} from '../../../constants/options';
import {SaleTransaction} from '../../../services/models/response/UseResrService';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import TransactionCard from '../../history/components/TransactionCard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {DrawerStackParamList} from '../../../utils/types/NavigationTypes';
type NavigationProp = NativeStackNavigationProp<
  DrawerStackParamList,
  'HistoryNavigator'
>;
const WalletTransaction: React.FC = ({
  inMoreScreen = false,
}: {
  inMoreScreen?: boolean;
}) => {
  const [offset, setOffset] = useState(0);
  const {t} = useTranslation('translation', {keyPrefix: 'Wallet'});

  const [data, setData] = useState<SaleTransaction[]>([]);
  const {
    data: fetchedData,
    isLoading,
    isError,
    isFetching,
  } = useGetWalletTransaction({
    limit: limit,
    offset,
    sortField: 'submitAt',
    sortOrder: -1,
  });

  useEffect(() => {
    if (fetchedData?.content) {
      setData(prevItems => [...prevItems, ...fetchedData?.content]);
    }
  }, [fetchedData]);

  const loadMore = () => {
    if (!isError && !isFetching && data.length < (fetchedData?.total ?? 5)) {
      setOffset(prevOffset => prevOffset + limit);
    }
  };

  return (
    <View className="flex-1 gap-4">
      {!inMoreScreen && (
        <View className="w-full items-center flex-row justify-between">
          <BaseText type="title3" color="secondary">
            {t('transactions')}
          </BaseText>
        </View>
      )}
      <FlatList
        data={data}
        renderItem={({item, index}) => (
          <TransactionCard summaryView item={item} />
        )}
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
        onEndReached={loadMore}
        keyExtractor={(item, index) => `key` + index}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? (
            <View style={{marginTop: 16, alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#bcdd64" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <View className="flex-1 items-center justify-center flex-row py-10">
              <BaseText type="subtitle1" color="secondary">
                {t('noTransaction')}
              </BaseText>
            </View>
          ) : null
        }
        ListFooterComponentStyle={{
          paddingBottom: Platform.OS === 'web' ? 60 : 20,
        }}
        contentContainerStyle={{
          paddingBottom: isLoading ? 40 : Platform.OS === 'web' ? 100 : 20,
        }}
      />
    </View>
  );
};

export default WalletTransaction;
