import React, {useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseText from '../../components/BaseText';
import {useGetUnansweredSurvey} from '../../utils/hooks/Survey/useGetUnansweredSurvey';
import {Survey} from '../../services/models/response/SurveyResService';
import {useNavigation} from '@react-navigation/native';
import {SurveyStackParamList} from '../../utils/types/NavigationTypes';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {TaskSquare} from 'iconsax-react-native';
import {GiftIcon} from '../../assets/icons';
import moment from 'jalali-moment';
import SurveyListCard from '../../components/cards/survey/SurveyListCard';
const SurveyListScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<SurveyStackParamList>>();
  const {data, isLoading, refetch, isRefetching} = useGetUnansweredSurvey();
  const {t} = useTranslation('translation', {keyPrefix: 'Survey'});

  const surveys = useMemo<Survey[]>(() => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && 'surveys' in (data as any)) {
      return (data as any).surveys || [];
    }
    return [];
  }, [data]);

  const handleNavigateToDetail = useCallback(
    (survey: Survey) => {
      navigation.navigate('SurveyDetail', {
        id: survey.id,
        title: survey.title || t('detailTitle'),
      });
    },
    [navigation, t],
  );

  const renderItem = useCallback(
    ({item}: {item: Survey}) => (
      <SurveyListCard survey={item} onPress={handleNavigateToDetail} />
    ),
    [handleNavigateToDetail],
  );

  if (isLoading && !isRefetching && surveys.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#bcdd64" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="absolute -top-[28%] web:rotate-[10deg]  web:-left-[34%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[25%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <FlatList
        data={surveys}
        keyExtractor={item => `survey-${item.id}`}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#bcdd64"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center mt-10">
              <BaseText type="subtitle2" color="secondary">
                {t('empty')}
              </BaseText>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default SurveyListScreen;
