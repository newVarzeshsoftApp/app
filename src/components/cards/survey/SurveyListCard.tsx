import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import BaseText from '../../BaseText';
import {Survey} from '../../../services/models/response/SurveyResService';
import {TaskSquare} from 'iconsax-react-native';
import {GiftIcon} from '../../../assets/icons';
import moment from 'jalali-moment';
import {useTranslation} from 'react-i18next';

interface SurveyListCardProps {
  survey: Survey;
  onPress?: (survey: Survey) => void;
  inpage?: boolean;
}

const SurveyListCard: React.FC<SurveyListCardProps> = ({
  survey,
  onPress,
  inpage,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Survey'});

  const handlePress = () => {
    if (onPress) {
      onPress(survey);
    }
  };

  const startDate = survey.start
    ? moment(survey.start)
        .local('fa' as any)
        .format('jYYYY/jMM/jDD')
    : '---';

  const endDate = survey.end
    ? moment(survey.end)
        .local('fa' as any)
        .format('jYYYY/jMM/jDD')
    : '---';

  return (
    <TouchableOpacity onPress={handlePress} disabled={inpage}>
      <View className="BaseServiceCard mb-4">
        <View>
          <View className="flex-row items-center  gap-4 pb-4 border-b border-neutral-200/40 dark:border-neutral-dark-400/50">
            <View className="bg-supportive5-500/20 rounded-full w-10 h-10 flex-row items-center justify-center">
              <TaskSquare size="24" variant="Bold" color="#5bc8ff" />
            </View>
            <BaseText type="title4" color="base">
              {survey.title}
            </BaseText>
          </View>
          <View className="pt-3 gap-3">
            {!!survey.description && (
              <BaseText type="body3" color="secondary">
                {survey.description}
              </BaseText>
            )}
            {survey.gift && (
              <View className="flex-row items-center justify-start gap-2">
                <GiftIcon width={24} height={24} />
                <BaseText type="caption" color="secondaryPurple">
                  {survey.gift?.title}{' '}
                  <BaseText
                    type="caption"
                    color="secondaryPurple"
                    className="!font-semibold">
                    {t('giftLabel')}
                  </BaseText>
                </BaseText>
              </View>
            )}
            <View className="flex-row items-center justify-between">
              <BaseText type="caption" color="secondary">
                {t('startDate')} : {startDate}
              </BaseText>
              <BaseText type="caption" color="secondary">
                {t('endDate')} : {endDate}
              </BaseText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SurveyListCard;
