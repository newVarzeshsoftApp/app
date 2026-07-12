import React, {useCallback, useMemo} from 'react';
import {Image, View} from 'react-native';
import {Circle} from 'react-native-progress';
import BaseText from '../../BaseText';
import BaseButton from '../../Button/BaseButton';
import Badge from '../../Badge/Badge';
import ContractorInfo from '../../ContractorInfo/ContractorInfo';
import StatusDot from '../../StatusDot';
import {GroupClassRoom} from '../../../services/models/response/GroupClassRoomResService';
import {User} from '../../../services/models/response/UseResrService';
import {useBase64ImageFromMedia} from '../../../utils/hooks/useBase64Image';
import {
  formatScheduleDaysLabel,
  formatScheduleTime,
  getCapacityColors,
  getGroupClassRoomActionState,
  getGroupClassRoomCapacity,
  getGroupClassRoomContractorProfile,
  getGroupClassRoomPreReserveDisplay,
  getGroupClassRoomPreReserveOthersLabel,
} from '../../../utils/helpers/groupClassRoomHelpers';
import {TypeTextColor} from '../../../models/stylingTypes';
import {useAuth} from '../../../utils/hooks/useAuth';
import {useCartContext} from '../../../utils/CartContext';
import {navigate} from '../../../navigation/navigationRef';

type GroupClassRoomCardProps = {
  data: GroupClassRoom;
  contractorId?: number;
  selectedContractor?: User;
  onJoinPress?: (item: GroupClassRoom) => void;
  onWaitingListPress?: (item: GroupClassRoom) => void;
  isJoinLoading?: boolean;
  isWaitingListLoading?: boolean;
};

const GroupClassRoomCard: React.FC<GroupClassRoomCardProps> = ({
  data,
  contractorId,
  selectedContractor,
  onJoinPress,
  onWaitingListPress,
  isJoinLoading = false,
  isWaitingListLoading = false,
}) => {
  const {profile} = useAuth();
  const {items: cartItems} = useCartContext();

  const contractorProfile = useMemo(
    () => getGroupClassRoomContractorProfile(data, selectedContractor),
    [data, selectedContractor],
  );
  const capacity = useMemo(
    () => getGroupClassRoomCapacity(data, contractorId),
    [contractorId, data],
  );
  const preReserveDisplay = useMemo(
    () =>
      getGroupClassRoomPreReserveDisplay(data, {
        userId: profile?.id,
        contractorId,
        cartItems,
      }),
    [cartItems, contractorId, data, profile?.id],
  );
  const actionState = useMemo(
    () =>
      getGroupClassRoomActionState(data, contractorId, {
        isPreReservedByMe: preReserveDisplay.isPreReservedByMe,
      }),
    [contractorId, data, preReserveDisplay.isPreReservedByMe],
  );

  const handleContinuePurchase = useCallback(() => {
    navigate('Root', {
      screen: 'HomeNavigator',
      params: {screen: 'cart'},
    });
  }, []);

  const progress =
    capacity.max > 0 ? capacity.filled / capacity.max : 0;
  const colors = useMemo(
    () => getCapacityColors(capacity.filled, capacity.max),
    [capacity.filled, capacity.max],
  );
  const isActive = capacity.max > 0 && capacity.filled < capacity.max;

  const {data: imageSrc, isLoading: imageLoading} = useBase64ImageFromMedia(
    data.service?.image?.name,
    'Media',
  );

  const badges = useMemo(() => {
    const items: Array<{label: string; textColor: TypeTextColor}> = [];

    if (data.useJustInSchedules) {
      items.push({label: 'فقط در ساعت کلاس', textColor: 'supportive1'});
    }

    if (data.fixed || data.burnAfterAbsence) {
      items.push({label: 'غیبت غیرمجاز', textColor: 'error'});
    }

    if (data.isFlexible) {
      items.push({label: 'انتخاب روزها', textColor: 'supportive5'});
    }

    return items;
  }, [
    data.burnAfterAbsence,
    data.fixed,
    data.isFlexible,
    data.useJustInSchedules,
  ]);

  const schedules = data.schedules ?? [];

  return (
    <View className="BaseServiceCard">
      <View
        className={`w-full h-[185px] rounded-3xl overflow-hidden ${
          imageLoading
            ? 'bg-black/20 dark:bg-white/20 animate-pulse'
            : 'bg-neutral-0 dark:bg-neutral-dark-0'
        }`}>
        {imageSrc ? (
          <Image
            style={{width: '100%', height: '100%'}}
            source={{uri: imageSrc}}
            resizeMode="cover"
          />
        ) : null}
      </View>

      <View className="py-3 items-center flex-row justify-between border-b border-neutral-0 dark:border-neutral-dark-400/50">
        <View className="flex-row gap-2 items-center flex-1">
          <StatusDot isActive={isActive} />
          <BaseText type="title4" className="flex-1">
            {data.title}
          </BaseText>
        </View>
        <View className="flex-row items-center gap-2">
          <Circle
            size={20}
            progress={progress}
            thickness={3}
            borderWidth={0}
            strokeCap="round"
            color={colors.progress}
            unfilledColor={colors.unfilled}
            showsText={false}
          />
          <View className="flex-row gap-1 items-center">
            <BaseText type="title4" color={colors.TextColor as TypeTextColor}>
              {capacity.filled}
            </BaseText>
            <BaseText type="title4" color="muted">
              {capacity.max} /
            </BaseText>
          </View>
        </View>
      </View>

      <View className="pt-3 gap-3">
        {contractorProfile ? (
          <View className="flex-row items-center">
            <ContractorInfo
              fullName={contractorProfile.fullName}
              firstName={contractorProfile.firstName}
              imageName={contractorProfile.imageName}
              gender={contractorProfile.gender}
            />
          </View>
        ) : null}

        {schedules.length > 0 ? (
          <View className="gap-1">
            {schedules.map((schedule, index) => (
              <View
                key={schedule.id ?? index}
                className="flex-row items-center justify-between">
                <BaseText type="body3" color="secondary">
                  {formatScheduleDaysLabel(schedule.days)}
                </BaseText>
                <BaseText type="body3" color="secondary">
                  {formatScheduleTime(schedule)}
                </BaseText>
              </View>
            ))}
          </View>
        ) : null}

        {badges.length > 0 ? (
          <View className="flex-row flex-wrap gap-1">
            {badges.map(badge => (
              <Badge
                key={badge.label}
                defaultMode
                textColor={badge.textColor}
                className="w-fit"
                value={badge.label}
              />
            ))}
          </View>
        ) : null}

        <View className="flex-row items-center gap-2 pt-2 border-t border-neutral-0 dark:border-neutral-dark-400/50">
          {preReserveDisplay.isPreReservedByMe ? (
            <View className="flex-1 px-3 py-2 rounded-full border border-white dark:border-white items-center justify-center">
              <BaseText type="subtitle3" color="base">
                در سبد خرید شما
              </BaseText>
            </View>
          ) : preReserveDisplay.othersPreReservedCount > 0 &&
            (actionState.type === 'join' ||
              actionState.type === 'waitingList') ? (
            <View className="flex-1 px-3 py-2 rounded-full border border-dashed border-warning-500 items-center justify-center">
              <BaseText type="subtitle3" color="warning">
                {getGroupClassRoomPreReserveOthersLabel(
                  preReserveDisplay.othersPreReservedCount,
                  preReserveDisplay.countMode,
                )}
              </BaseText>
            </View>
          ) : null}

          <View
            className={
              preReserveDisplay.isPreReservedByMe ||
              (preReserveDisplay.othersPreReservedCount > 0 &&
                (actionState.type === 'join' ||
                  actionState.type === 'waitingList'))
                ? 'flex-1'
                : 'flex-1 w-full'
            }>
            {actionState.type === 'preReservedByMe' ? (
              <BaseButton
                text="ادامه خرید"
                type="Fill"
                color="Primary"
                size="Large"
                rounded
                onPress={handleContinuePurchase}
              />
            ) : actionState.type === 'waitingList' ? (
              <BaseButton
                text="رزرو لیست انتظار"
                type="Fill"
                color="Supportive5-Blue"
                size="Large"
                rounded
                disabled={!actionState.canPress}
                isLoading={isWaitingListLoading}
                onPress={() => onWaitingListPress?.(data)}
              />
            ) : actionState.type === 'join' ? (
              <BaseButton
                text="عضویت در کلاس"
                type="Fill"
                color="Black"
                size="Large"
                rounded
                disabled={!actionState.canPress}
                isLoading={isJoinLoading}
                onPress={() => onJoinPress?.(data)}
              />
            ) : (
              <BaseButton
                text="عضویت در کلاس"
                type="Fill"
                color="Black"
                size="Large"
                rounded
                disabled
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default GroupClassRoomCard;
