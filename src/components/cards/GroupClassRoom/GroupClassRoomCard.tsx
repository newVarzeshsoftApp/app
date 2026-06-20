import React, {useMemo} from 'react';
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
  getPrimarySchedule,
  getTotalPreReservedCount,
  resolveGroupClassRoomContractor,
} from '../../../utils/helpers/groupClassRoomHelpers';
import {TypeTextColor} from '../../../models/stylingTypes';

type GroupClassRoomCardProps = {
  data: GroupClassRoom;
  selectedContractor?: User;
  onJoinPress?: (item: GroupClassRoom) => void;
  isJoinLoading?: boolean;
};

const GroupClassRoomCard: React.FC<GroupClassRoomCardProps> = ({
  data,
  selectedContractor,
  onJoinPress,
  isJoinLoading = false,
}) => {
  const schedule = useMemo(() => getPrimarySchedule(data), [data]);
  const contractor = useMemo(
    () => resolveGroupClassRoomContractor(data, selectedContractor),
    [data, selectedContractor],
  );
  const preReservedCount = useMemo(() => getTotalPreReservedCount(data), [data]);
  const filled = data.filled ?? 0;
  const quantity = data.quantity ?? 0;
  const remainingCapacity = Math.max(quantity - filled, 0);
  const progress = quantity > 0 ? filled / quantity : 0;
  const colors = useMemo(
    () => getCapacityColors(filled, quantity),
    [filled, quantity],
  );
  const isActive = data.enabled && data.reservable && remainingCapacity > 0;

  const {data: imageSrc, isLoading: imageLoading} = useBase64ImageFromMedia(
    data.service?.image?.name,
    'Media',
  );

  const badges = useMemo(() => {
    const items: Array<{label: string; textColor: TypeTextColor}> = [];

    if (data.useJustInSchedules) {
      items.push({label: 'فقط در ساعت کلاس', textColor: 'supportive1'});
    }

    if (data.fixed) {
      items.push({label: 'غیبت غیرمجاز', textColor: 'error'});
    } else {
      items.push({label: 'انتخاب روزها', textColor: 'supportive5'});
    }

    return items;
  }, [data.fixed, data.useJustInSchedules]);

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
              {filled}
            </BaseText>
            <BaseText type="title4" color="muted">
              {quantity} /
            </BaseText>
          </View>
        </View>
      </View>

      <View className="pt-3 gap-3">
        {contractor ? (
          <View className="flex-row items-center">
            <ContractorInfo
              firstName={contractor.firstName}
              lastName={contractor.lastName}
              imageName={contractor.profile?.name}
              gender={contractor.gender}
            />
          </View>
        ) : null}

        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {formatScheduleDaysLabel(schedule?.days)}
          </BaseText>
          <BaseText type="body3" color="secondary">
            {formatScheduleTime(schedule)}
          </BaseText>
        </View>

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
          {preReservedCount > 0 ? (
            <View className="flex-1 px-3 py-2 rounded-full border border-dashed border-warning-500 items-center justify-center">
              <BaseText type="subtitle3" color="warning">
                {preReservedCount} نفر در حال خرید
              </BaseText>
            </View>
          ) : null}
          <View className={preReservedCount > 0 ? 'flex-1' : 'flex-1 w-full'}>
            <BaseButton
              text="عضویت در کلاس"
              type="Fill"
              color="Black"
              size="Large"
              rounded
              disabled={!isActive}
              isLoading={isJoinLoading}
              onPress={() => onJoinPress?.(data)}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default GroupClassRoomCard;
