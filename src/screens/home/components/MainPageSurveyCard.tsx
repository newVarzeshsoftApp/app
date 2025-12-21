import React, {useCallback, useMemo} from 'react';
import {Image, Platform, TouchableOpacity, View} from 'react-native';
import BaseText from '../../../components/BaseText';
import {Survey} from '../../../services/models/response/SurveyResService';
import {useTranslation} from 'react-i18next';
import {navigate} from '../../../navigation/navigationRef';
import {useTheme} from '../../../utils/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import BaseButton from '../../../components/Button/BaseButton';
import {IColorButton} from '../../../models/stylingTypes';

interface MainPageSurveyCardProps {
  survey?: Survey;
  isSingleSurvey?: boolean;
}

const MainPageSurveyCard: React.FC<MainPageSurveyCardProps> = ({
  survey,
  isSingleSurvey,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Survey'});
  const hasSurvey = !!survey;
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const colors =
    theme === 'dark'
      ? ['#5454A9', '#2A2D33', '#5454A9']
      : ['#A3A3F4', '#FFFFFF', '#A3A3F4'];
  const Walletcolors =
    theme === 'dark'
      ? ['rgba(55, 201, 118, 0.5)', '#2A2D33', 'rgba(55, 201, 118, 0.5)']
      : ['rgba(55, 201, 118, 0.5)', '#FFFFFF', 'rgba(55, 201, 118, 0.5)'];
  const Redcolors =
    theme === 'dark'
      ? ['rgba(253, 80, 79, 0.5)', '#2A2D33', 'rgba(253, 80, 79, 0.5)']
      : ['rgba(253, 80, 79, 0.5)', '#FFFFFF', 'rgba(253, 80, 79, 0.5)'];
  const formatDate = useMemo(
    () => (value?: string | null) => value ? value.split('T')[0] : '---',
    [],
  );

  if (!hasSurvey) {
    return (
      <View className="bg-secondary-500 rounded-3xl px-5 py-6 gap-4">
        <BaseText type="title3" className="text-white">
          {t('title')}
        </BaseText>
      </View>
    );
  }

  const handleNavigateToSurveys = useCallback(() => {
    if (!survey) {
      return;
    }

    if (isSingleSurvey) {
      navigate('Root', {
        screen: 'SurveyNavigator',
        params: {screen: 'SurveyDetail', params: {id: survey.id}},
      });
    } else {
      navigate('Root', {
        screen: 'SurveyNavigator',
        params: {screen: 'SurveyList'},
      });
    }
  }, [isSingleSurvey, survey]);

  return (
    <LinearGradient
      colors={colors}
      start={Platform.OS === 'web' ? {x: 1, y: 1} : {x: 1, y: -1}}
      locations={[0.2, 1, 1]}
      style={{
        flex: 1,
        borderRadius: 24,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View className="flex-1  p-[1px] w-full  relative z-10 overflow-hidden ">
        <View className=" flex-1 w-full items-center px-7 py-4 gap-2  overflow-hidden h-full dark:bg-neutral-dark-300/80 bg-neutral-0/80 rounded-3xl">
          {/* First Shade  */}
          <View className="flex  justify-between items-center w-full flex-row gap-4">
            <View className="w-[61px] h-[61px]">
              <Image
                className="w-full h-full"
                source={require(!isDarkMode
                  ? '../../../assets/images/SurveyLight.png'
                  : '../../../assets/images/SurveyDark.png')}
                resizeMode="contain"
              />
            </View>
            <View className="gap-1 flex-col items-start   justify-center  w-full max-w-[230px] ">
              <BaseText type="body3" color="base">
                {t('title')}
              </BaseText>

              <BaseText
                type="body3"
                color="Primary600"
                className="w-fit  !font-light ">
                یه{' '}
                <BaseText
                  type="body3"
                  color="Primary600"
                  className="!font-semibold">
                  هـدیه
                </BaseText>{' '}
                باحال هم منتظرت هست!
              </BaseText>
            </View>
          </View>

          <View className="w-[200px] h-[200px] z-[1] bottom-[-85px]   web:-left-[15%]  left-[64%] absolute rotate-180 opacity-35 ">
            <Image
              source={require('../../../assets/images/shade/shape/SecondaryShade.png')}
              resizeMode="contain"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </View>
          <View className="w-full">
            <BaseButton
              text={t('participate')}
              type="Fill"
              rounded
              size="Large"
              color={'Primary !bg-error-600' as IColorButton}
              className="!w-full !z-50"
              onPress={handleNavigateToSurveys}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default MainPageSurveyCard;
