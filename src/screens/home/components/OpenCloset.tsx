import React, {useRef, useState, useEffect} from 'react';
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
import {useTheme} from '../../../utils/ThemeContext';

type OpenLockerMutationInput = openLockerBody & {type: 'vip' | 'regular'};
const getLockerKey = (type: 'vip' | 'regular', lockerId: number) =>
  `${type}-${lockerId}`;

const OpenCloset: React.FC = () => {
  const {data} = useGetUserDashboard();
  const {theme} = useTheme();
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  // stateها را با کلید ترکیبی مدیریت می‌کنیم
  const [openLockers, setOpenLockers] = useState<{[key: string]: boolean}>({});
  const [remainingTimes, setRemainingTimes] = useState<{[key: string]: number}>(
    {},
  );
  const [loadingLockerKey, setLoadingLockerKey] = useState<string | null>(null);
  const intervalRefs = useRef<{[key: string]: NodeJS.Timeout}>({});

  const openClosetMutation = useMutation<
    unknown,
    unknown,
    OpenLockerMutationInput
  >({
    mutationFn: variables => {
      // اگر سرویس به type نیاز نداره فقط داده‌های اصلی رو بفرست
      return ManagerLockerService.OpenLocker({
        lockerId: variables.lockerId,
        relayNumber: variables.relayNumber,
        relayOnTime: variables.relayOnTime,
      });
    },
    onMutate: variables => {
      const key = getLockerKey(variables.type, variables.lockerId);
      setLoadingLockerKey(key);
    },
    onSuccess: (_data, variables) => {
      const key = getLockerKey(variables.type, variables.lockerId);
      setOpenLockers(prev => ({...prev, [key]: true}));
      setRemainingTimes(prev => ({...prev, [key]: variables.relayOnTime}));

      if (intervalRefs.current[key]) clearInterval(intervalRefs.current[key]);
      intervalRefs.current[key] = setInterval(() => {
        setRemainingTimes(prev => {
          const remaining = prev[key];
          if (remaining > 1) {
            return {...prev, [key]: remaining - 1};
          } else {
            clearInterval(intervalRefs.current[key]);
            setOpenLockers(prev => ({...prev, [key]: false}));
            delete intervalRefs.current[key];
            return {...prev, [key]: 0};
          }
        });
      }, 1000);
    },
    onError: error => {
      handleMutationError(error);
      setLoadingLockerKey(null);
    },
    onSettled: () => {
      setLoadingLockerKey(null);
    },
  });

  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  // تابع openLocker را نوع را هم بگیرد
  const OpenLocker = (data: openLockerBody & {type: 'vip' | 'regular'}) => {
    openClosetMutation.mutate(data);
  };

  return (
    <ScrollView style={{flex: 1, gap: 16}}>
      <View className="gap-4">
        {/* VIP Locker */}
        {data?.vipLocker && data.vipLocker.locker?.lockerId && (
          <View className="gap-2">
            <BaseText color="secondaryPurple" className="!text-end">
              VIP
            </BaseText>
            {(() => {
              const vipId = data.vipLocker.locker.lockerId;
              const vipKey = getLockerKey('vip', vipId);
              return (
                <View className="items-center flex-row justify-between bg-white dark:bg-neutral-dark-100 px-4 py-2 rounded-full">
                  <View className="flex-row items-center gap-2">
                    {openLockers[vipKey] ? (
                      <Unlock size="24" color="#bcdd64" />
                    ) : (
                      <Lock1
                        size="24"
                        color={theme === 'dark' ? '#FFFFFF' : '#1b1d21'}
                      />
                    )}
                    <View className="flex-row gap-1 items-center">
                      <BaseText type="subtitle2" color="muted">
                        {t('Closet')} :
                      </BaseText>
                      <BaseText>{data.vipLocker.locker.lockerNumber}</BaseText>
                    </View>
                  </View>
                  <BaseButton
                    isLoading={loadingLockerKey === vipKey}
                    disabled={openLockers[vipKey]}
                    onPress={() =>
                      OpenLocker({
                        lockerId: vipId,
                        relayNumber: data.vipLocker.locker.relayNumber,
                        relayOnTime: data.vipLocker.locker.relayOnTime,
                        type: 'vip',
                      })
                    }
                    text={
                      openLockers[vipKey]
                        ? `${t('open')} ${remainingTimes[vipKey]} ثانیه`
                        : t('openCloset')
                    }
                    type={openLockers[vipKey] ? 'Fill' : 'Outline'}
                    color={openLockers[vipKey] ? 'Primary' : 'Black'}
                    rounded
                    size="Small"
                  />
                </View>
              );
            })()}
          </View>
        )}

        {/* Regular Lockers */}
        {data?.lockers && data.lockers.length > 0 && (
          <View className="gap-3">
            <BaseText color="base" type="subtitle1">
              {t('regularCloset')}
            </BaseText>
            {data.lockers.map((item, index) => {
              const regKey = getLockerKey('regular', item.lockerId);
              return (
                <View
                  key={regKey}
                  className="items-center flex-row justify-between bg-white dark:bg-neutral-dark-100 px-4 py-2 rounded-full">
                  <View className="flex-row items-center gap-2">
                    {openLockers[regKey] ? (
                      <Unlock size="24" color="#bcdd64" />
                    ) : (
                      <Lock1
                        size="24"
                        color={theme === 'dark' ? '#FFFFFF' : '#1b1d21'}
                      />
                    )}
                    <View className="flex-row gap-1 items-center">
                      <BaseText type="subtitle2" color="muted">
                        {t('Closet')} :
                      </BaseText>
                      <BaseText>{item.lockerNumber}</BaseText>
                    </View>
                  </View>

                  <BaseButton
                    isLoading={loadingLockerKey === regKey}
                    disabled={openLockers[regKey]}
                    onPress={() =>
                      OpenLocker({
                        lockerId: item.lockerId,
                        relayNumber: item.relayNumber,
                        relayOnTime: item.relayOnTime,
                        type: 'regular',
                      })
                    }
                    text={
                      openLockers[regKey]
                        ? `${t('open')} ${remainingTimes[regKey]} ثانیه`
                        : t('openCloset')
                    }
                    type={openLockers[regKey] ? 'Fill' : 'Outline'}
                    color={openLockers[regKey] ? 'Primary' : 'Black'}
                    rounded
                    size="Small"
                  />
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default OpenCloset;
