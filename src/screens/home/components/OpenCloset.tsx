import React, {useState, useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {useGetUserDashboard} from '../../../utils/hooks/User/useGetUserDashboard';
import BaseText from '../../../components/BaseText';
import {Lock1, Unlock} from 'iconsax-react-native';
import BaseButton from '../../../components/Button/BaseButton';
import {useMutation} from '@tanstack/react-query';
import {ManagerLockerService} from '../../../services/ManagerLockerService';
import {handleMutationError} from '../../../utils/helpers/errorHandler';
import {openLockerBody} from '../../../services/models/request/ManagerLockerReqService';
import {useTranslation} from 'react-i18next';

const OpenCloset: React.FC = () => {
  const {data} = useGetUserDashboard();
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  const [openLockers, setOpenLockers] = useState<{[key: number]: boolean}>({});
  const [remainingTimes, setRemainingTimes] = useState<{[key: number]: number}>(
    {},
  );
  const [loadingLockerId, setLoadingLockerId] = useState<number | null>(null);

  const openClosetMutation = useMutation({
    mutationFn: ManagerLockerService.OpenLocker,
    onMutate: variables => {
      setLoadingLockerId(variables.lockerId);
    },
    onSuccess: (_data, variables) => {
      const {lockerId, relayOnTime} = variables;

      setOpenLockers(prev => ({...prev, [lockerId]: true}));
      setRemainingTimes(prev => ({...prev, [lockerId]: relayOnTime}));

      const interval = setInterval(() => {
        setRemainingTimes(prev => {
          if (prev[lockerId] > 1) {
            return {...prev, [lockerId]: prev[lockerId] - 1};
          } else {
            clearInterval(interval);
            setOpenLockers(prev => ({...prev, [lockerId]: false}));
            return {...prev, [lockerId]: 0};
          }
        });
      }, 1000);
    },
    onError: error => {
      handleMutationError(error);
      setLoadingLockerId(null);
    },
    onSettled: () => {
      setLoadingLockerId(null);
    },
  });

  const OpenLocker = ({data}: {data: openLockerBody}) => {
    openClosetMutation.mutate({...data});
  };

  return (
    <ScrollView style={{flex: 1, gap: 16}}>
      <View className="gap-4">
        {data?.vipLocker && Object.keys(data.vipLocker).length > 0 && (
          <View className="gap-2">
            <BaseText color="secondaryPurple" className="!text-end">
              VIP
            </BaseText>
            <View className="items-center flex-row justify-between bg-neutral-dark-100 px-4 py-2 rounded-full">
              <View className="flex-row items-center gap-2">
                {openLockers[data.vipLocker.locker.lockerId] ? (
                  <Unlock size="24" color="#bcdd64" />
                ) : (
                  <Lock1 size="24" color="#FFFFFF" />
                )}
                <View className="flex-row gap-1 items-center">
                  <BaseText type="subtitle2" color="muted">
                    {t('Closet')} :
                  </BaseText>
                  <BaseText>{data.vipLocker.locker.lockerNumber}</BaseText>
                </View>
              </View>
              <BaseButton
                isLoading={loadingLockerId === data.vipLocker.locker.lockerId}
                disabled={openLockers[data.vipLocker.locker.lockerId]}
                onPress={() =>
                  OpenLocker({
                    data: {
                      lockerId: data.vipLocker.locker.lockerId,
                      relayNumber: data.vipLocker.locker.relayNumber,
                      relayOnTime: data.vipLocker.locker.relayOnTime,
                    },
                  })
                }
                text={
                  openLockers[data.vipLocker.locker.lockerId]
                    ? `${t('open')} ${
                        remainingTimes[data.vipLocker.locker.lockerId]
                      } ثانیه`
                    : t('openCloset')
                }
                type={
                  openLockers[data.vipLocker.locker.lockerId]
                    ? 'Fill'
                    : 'Outline'
                }
                color={
                  openLockers[data.vipLocker.locker.lockerId]
                    ? 'Primary'
                    : 'Black'
                }
                rounded
                size="Small"
              />
            </View>
          </View>
        )}
        {data?.lockers && data.lockers.length > 0 && (
          <View className="gap-3">
            <BaseText color="base" type="subtitle1">
              {t('regularCloset')}
            </BaseText>
            {data.lockers.map((item, index) => (
              <View
                key={index}
                className="items-center flex-row justify-between bg-neutral-dark-100 px-4 py-2 rounded-full">
                <View className="flex-row items-center gap-2">
                  {openLockers[item.lockerId] ? (
                    <Unlock size="24" color="#bcdd64" />
                  ) : (
                    <Lock1 size="24" color="#FFFFFF" />
                  )}
                  <View className="flex-row gap-1 items-center">
                    <BaseText type="subtitle2" color="muted">
                      {t('Closet')} :
                    </BaseText>
                    <BaseText>{item.lockerNumber}</BaseText>
                  </View>
                </View>

                <BaseButton
                  isLoading={loadingLockerId === item.lockerId}
                  disabled={openLockers[item.lockerId]}
                  onPress={() =>
                    OpenLocker({
                      data: {
                        lockerId: item.lockerId,
                        relayNumber: item.relayNumber,
                        relayOnTime: item.relayOnTime,
                      },
                    })
                  }
                  text={
                    openLockers[item.lockerId]
                      ? `${t('open')} ${remainingTimes[item.lockerId]} ثانیه`
                      : t('openCloset')
                  }
                  type={openLockers[item.lockerId] ? 'Fill' : 'Outline'}
                  color={openLockers[item.lockerId] ? 'Primary' : 'Black'}
                  rounded
                  size="Small"
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default OpenCloset;
