import React from 'react';
import {View} from 'react-native';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../../components/Button/BaseButton';
import {MoneyRecive, MoneySend} from 'iconsax-react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {DrawerStackParamList} from '../../../utils/types/NavigationTypes';
import {useNavigation} from '@react-navigation/native';
import {SaleTransaction} from '../../../services/models/response/UseResrService';
import moment from 'jalali-moment';
import {formatNumber} from '../../../utils/helpers/helpers';
import {
  TransactionSourceType,
  TransactionType,
} from '../../../constants/options';
import Badge from '../../../components/Badge/Badge';

type NavigationProps = NativeStackNavigationProp<DrawerStackParamList>;
type TransactionProps = {
  item: SaleTransaction;
  inDetail?: boolean;
};
const TransactionCard: React.FC<TransactionProps> = ({item, inDetail}) => {
  const navigation = useNavigation<NavigationProps>();
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const isWithdraw = [
    TransactionType.Settle,
    TransactionType.Withdraw,
  ].includes(item?.type ?? 0);

  return (
    <View className="CardBase">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t('Type')}: {''}
          </BaseText>
          {isWithdraw ? (
            <View className="flex-row gap-2">
              <MoneySend size={20} color="#FD504F" variant="Bold" />
              <BaseText type="subtitle2" color="error">
                {t('withdraw')}
              </BaseText>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <MoneyRecive size={20} color="#37C976" variant="Bold" />
              <BaseText type="subtitle2" color="success">
                {t('deposit')}
              </BaseText>
            </View>
          )}
        </View>
        {isWithdraw && (
          <View className="flex-row items-center justify-between ">
            <BaseText type="body3" color="secondary">
              {t('orderNumber')}: {''}
            </BaseText>
            {inDetail ? (
              <BaseText type="body3" color="base">
                {item.id}
              </BaseText>
            ) : (
              <BaseButton
                onPress={() =>
                  navigation.navigate('HistoryNavigator', {
                    screen: 'orderDetail',
                    params: {id: item.orderId ?? 0},
                  })
                }
                // orderDetail
                LinkButton
                size="Small"
                type="Outline"
                color="Supportive5-Blue"
                text={(item.orderId ?? 0).toString()}
                rounded
              />
            )}
          </View>
        )}
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Source')}: {''}
          </BaseText>
          <View className="flex-row gap-1 items-center">
            <BaseText type="body3" color="base">
              {t(`${TransactionSourceType[item.sourceType ?? 0]}`)}
            </BaseText>
            {[
              'OfferedDiscount',
              'WalletGift',
              'ChargingService',
              'Loan',
            ].includes(TransactionSourceType[item.sourceType ?? 0]) ? (
              <Badge
                color="primary"
                textColor="supportive5"
                CreditMode={['ChargingService'].includes(
                  TransactionSourceType[item.sourceType ?? 0],
                )}
                defaultMode
                value={item?.title ?? ''}
              />
            ) : null}
          </View>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('DateAndTime')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {moment(item.createdAt).format('jYYYY/jMM/jDD HH:MM')}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Amount')}: {''}
          </BaseText>
          <BaseText type="body3" color={isWithdraw ? 'error' : 'success'}>
            {formatNumber(item.amount)}
            {isWithdraw ? `- ` : '+ '}
            ریال
          </BaseText>
        </View>
        {/* کیف پول  transaction sort type 
        کیف پول سرویس شارژی 
        ولت گیفت
        */}
        {['UserCredit', 'WalletGift', 'ChargingService'].includes(
          TransactionSourceType[item.sourceType ?? 0],
        ) && (
          <View className="flex-row items-center justify-between ">
            <BaseText type="body3" color="secondary">
              {t('Source residue')}: {''}
            </BaseText>
            <BaseText type="body3" color="base">
              {formatNumber(item.chargeRemainCredit ?? 0)} ریال
            </BaseText>
          </View>
        )}
      </View>
      <View className="flex-row gap-2">
        <BaseButton
          onPress={() =>
            navigation.navigate('HistoryNavigator', {
              screen: isWithdraw ? 'WithdrawDetail' : 'DepositDetail',
              params: {id: item.id},
            })
          }
          color="Black"
          LinkButton
          type="TextButton"
          text={t('details')}
          Extraclass=" !flex-1 "
        />
      </View>
    </View>
  );
};
export default TransactionCard;
