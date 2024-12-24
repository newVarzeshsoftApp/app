import React from 'react';
import {Image, Platform, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  CloseCircle,
  Danger,
  ProfileTick,
  TickCircle,
} from 'iconsax-react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'jalali-moment';
import {useTheme} from '../../../utils/ThemeContext';
import {useGetUserDashboard} from '../../../utils/hooks/User/useGetUserDashboard';
import {
  calculateRemainingDays,
  convertToPersianTimeLabel,
} from '../../../utils/helpers/helpers';
import BaseText from '../../BaseText';
import MedicalBag from '../../../assets/icons/MedicalBag.svg';
import Closet from '../../../assets/icons/Closet.svg';
import BMI from '../../../assets/icons/BMI.svg';
import Badge from '../../Badge/Badge';

function InfoCards({
  type,
}: {
  type: 'MembershipInfo' | 'InsuranceInfo' | 'ClosetInfo' | 'BMIInfo';
}) {
  const {theme} = useTheme();
  const {data, isSuccess} = useGetUserDashboard();
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  const BaseColor = theme === 'dark' ? '#1B1D21' : '#F4F4F5';
  const BaseHighlight = theme === 'dark' ? '#55575c' : '#FFFFFF';

  // Specific logic for warnings and errors based on type
  let isWarning = false;
  let isExpired = false;
  let remainingDays = 0;
  let duration = '';
  let endDate = '';
  let subscriptionServiceRemainingDays = 0;
  let insuranceServiceRemainingDays = 0;
  let isDataAvailable = true;
  if (isSuccess) {
    switch (type) {
      case 'MembershipInfo':
        if (
          data?.subscriptionService &&
          Object.keys(data.subscriptionService).length > 0
        ) {
          subscriptionServiceRemainingDays = calculateRemainingDays({
            start: data?.subscriptionService?.start,
            end: data?.subscriptionService?.end,
          });
          remainingDays = subscriptionServiceRemainingDays;
          duration = convertToPersianTimeLabel(
            data?.subscriptionService?.duration,
          );
          endDate = data?.subscriptionService?.end;
          isWarning = remainingDays > 0 && remainingDays <= 7;
          isExpired =
            remainingDays === 0 ||
            data?.subscriptionService?.status === 1 ||
            data?.subscriptionService?.status === 3;
        } else {
          isDataAvailable = false;
        }
        break;

      case 'InsuranceInfo':
        if (
          data?.insuranceService &&
          Object.keys(data.insuranceService).length > 0
        ) {
          insuranceServiceRemainingDays = calculateRemainingDays({
            start: data?.insuranceService?.start,
            end: data?.insuranceService?.end,
          });
          remainingDays = insuranceServiceRemainingDays;
          duration = convertToPersianTimeLabel(
            data?.insuranceService?.duration,
          );
          endDate = data?.insuranceService?.end;
          isWarning = remainingDays > 0 && remainingDays <= 7;
          isExpired =
            remainingDays === 0 ||
            data?.insuranceService?.status === 1 ||
            data?.insuranceService?.status === 3;
        } else {
          isDataAvailable = false;
        }
        break;

      case 'ClosetInfo':
        if (
          (data?.vipLocker && Object.keys(data.vipLocker).length > 0) ||
          Object.keys(data.lockers).length > 0
        ) {
          isWarning = data?.vipLocker?.duration <= 7; // Example check
          isExpired = data?.vipLocker?.duration === 0;
        } else {
          isDataAvailable = false;
        }
        break;

      case 'BMIInfo':
        // Assuming data?.bmi?.value logic is available, handle accordingly
        // if (!data?.bmi) {
        //   isDataAvailable = false;
        // }
        break;

      default:
        isDataAvailable = false;
        break;
    }
  } else {
    isDataAvailable = false;
  }

  // Colors for gradient
  const colors = isWarning
    ? ['#FF9134', BaseColor, '#FF9134']
    : isExpired
    ? ['#FD504F', BaseColor, '#FD504F']
    : [BaseHighlight, BaseColor, BaseHighlight];

  const renderIcon = () => {
    switch (type) {
      case 'MembershipInfo':
        return (
          <ProfileTick
            size="20"
            color={theme === 'dark' ? '#FFFFFF' : '#16181B'}
            variant="Bold"
          />
        );
      case 'InsuranceInfo':
        return (
          <MedicalBag
            width={20}
            height={20}
            stroke={theme === 'dark' ? '#FFFFFF' : '#16181B'}
          />
        );
      case 'ClosetInfo':
        return (
          <Closet
            width={20}
            height={20}
            stroke={theme === 'dark' ? '#FFFFFF' : '#16181B'}
          />
        );
      case 'BMIInfo':
        return (
          <BMI
            width="20"
            height="20"
            stroke={theme === 'dark' ? '#FFFFFF' : '#16181B'}
          />
        );
    }
  };

  const renderTitle = () => {
    switch (type) {
      case 'MembershipInfo':
        return t('Membership');
      case 'InsuranceInfo':
        return t('Insurance');
      case 'ClosetInfo':
        return t('Closet');
      case 'BMIInfo':
        return 'BMI';
    }
  };

  const renderEndDate = () => {
    if (endDate) {
      return (
        <View className="flex-row items-center gap-1">
          <BaseText type="subtitle3" color="secondary">
            {t('end')} :
          </BaseText>
          <BaseText type="subtitle3" color="secondary">
            {moment(endDate)
              .local(
                // @ts-ignore
                'fa',
              )
              .format('jYYYY/jMM/jDD')}
          </BaseText>
        </View>
      );
    }
    return null;
  };

  const renderWarningOrError = () => {
    if (isWarning) {
      if (subscriptionServiceRemainingDays && type === 'MembershipInfo') {
        return (
          <BaseText type="subtitle3" color="warning">
            {subscriptionServiceRemainingDays} {t('Days to completion')}
          </BaseText>
        );
      }
      if (insuranceServiceRemainingDays && type === 'InsuranceInfo') {
        return (
          <BaseText type="subtitle3" color="warning">
            {insuranceServiceRemainingDays} {t('Days to completion')}
          </BaseText>
        );
      }
    } else if (isExpired) {
      return (
        <BaseText type="subtitle3" color="error">
          {t('endTime')}
        </BaseText>
      );
    }
    return null;
  };

  const renderBadgeSection = () => {
    if (type === 'ClosetInfo' && isSuccess) {
      return (
        <View className="gap-1">
          {data?.vipLocker?.locker?.lockerId && (
            <View className="flex-row gap-2  items-center">
              <BaseText type="subtitle2" color="secondaryPurple">
                VIP
              </BaseText>
              <Badge
                defaultMode
                className="w-fit"
                textColor="secondaryPurple"
                value={data?.vipLocker?.locker?.lockerId}
              />
              <BaseText type="subtitle3" color="secondary">
                {convertToPersianTimeLabel(data?.vipLocker?.duration)}
              </BaseText>
            </View>
          )}
          {data.lockers && (
            <View className="flex flex-row gap-1">
              {data.lockers.map((item, index) => (
                <Badge
                  key={index}
                  className="w-fit"
                  defaultMode
                  textColor="secondary"
                  value={item.lockerNumber}
                />
              ))}
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <View className="w-full h-[125px]">
      <LinearGradient
        colors={colors}
        start={{x: 0, y: 1.5}}
        end={{x: 1, y: 0}}
        locations={[0, 0.5, 1]}
        style={{
          flex: 1,
          borderRadius: 24,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View className="flex-1 p-[2px] w-full h-full relative z-10 overflow-hidden">
          <View className="flex-1 w-full p-4 items-start justify-between overflow-hidden h-full dark:bg-neutral-dark-300/85 bg-neutral-0/85 rounded-3xl">
            <View className="flex-row gap-3 items-center">
              <View className="w-[44px] h-[44px] z-10 rounded-full bg-neutral-100 dark:bg-neutral-dark-100 justify-center items-center">
                {renderIcon()}
              </View>
              <BaseText type="title4">{renderTitle()}</BaseText>
            </View>
            {isSuccess && (
              <>
                {!isDataAvailable && (
                  <View className="items-center justify-center flex-row flex-1 w-full">
                    <BaseText type="subtitle3" color="secondary">
                      {t('without')} {''}
                      {renderTitle()}
                    </BaseText>
                  </View>
                )}
                {(type === 'MembershipInfo' || type === 'InsuranceInfo') && (
                  <View className="flex-row items-center gap-1">
                    {isExpired ? (
                      <CloseCircle size="16" color="#FD504F" variant="Bold" />
                    ) : isWarning ? (
                      <Danger size="16" color="#FF9134" variant="Bold" />
                    ) : (
                      isDataAvailable && (
                        <TickCircle size="16" color="#37C976" variant="Bold" />
                      )
                    )}

                    <View className="flex-row gap-1">
                      <BaseText type="subtitle3" color="secondary">
                        {duration}
                      </BaseText>
                      {renderWarningOrError()}
                    </View>
                  </View>
                )}
                {renderEndDate()}
                {renderBadgeSection()}
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default InfoCards;
