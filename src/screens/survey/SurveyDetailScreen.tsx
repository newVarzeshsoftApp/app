import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import BaseText from '../../components/BaseText';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {SurveyStackParamList} from '../../utils/types/NavigationTypes';
import {useGetSurveyById} from '../../utils/hooks/Survey/useGetSurveyById';
import {useSubmitSurveyAnswers} from '../../utils/hooks/Survey/useSubmitSurveyAnswers';
import {
  Survey,
  SurveyQuestion,
} from '../../services/models/response/SurveyResService';
import {useTranslation} from 'react-i18next';
import SurveyListCard from '../../components/cards/survey/SurveyListCard';
import RadioButton from '../../components/Button/RadioButton/RadioButton';
import Checkbox from '../../components/Checkbox/Checkbox';
import {MessageQuestion} from 'iconsax-react-native';
import BaseButton from '../../components/Button/BaseButton';
import SurveySuccessNotification from '../../components/cards/survey/SurveySuccessNotification';
import TextArea from '../../components/Input/TextArea';
import {useQueryClient} from '@tanstack/react-query';
import {navigate} from '../../navigation/navigationRef';

type SurveyDetailRoute = RouteProp<SurveyStackParamList, 'SurveyDetail'>;

const SurveyDetailScreen: React.FC = () => {
  const route = useRoute<SurveyDetailRoute>();
  const navigation = useNavigation();
  const {t} = useTranslation('translation', {keyPrefix: 'Survey'});
  const {data, isLoading, refetch, isRefetching} = useGetSurveyById(
    route.params.id,
  );
  const submitMutation = useSubmitSurveyAnswers();
  const queryClient = useQueryClient();
  const questions = useMemo<SurveyQuestion[]>(() => {
    const rawQuestions = (data?.surveyQuestions || data?.questions || []) as
      | SurveyQuestion[]
      | undefined;

    if (!rawQuestions) {
      return [];
    }

    // Sort questions by id ascending
    return [...rawQuestions].sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [data]);
  // Store answers as string for text, string for single_choice, string[] for multiple_choice
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Check if all questions are answered - must be before any early returns
  const allQuestionsAnswered = useMemo(() => {
    if (questions.length === 0) return false;

    return questions.every(question => {
      const answerValue = answers[question.id];

      if (question.questionType === 'text') {
        return typeof answerValue === 'string' && answerValue.trim().length > 0;
      }

      if (question.questionType === 'single_choice') {
        return typeof answerValue === 'string' && answerValue.length > 0;
      }

      if (question.questionType === 'multiple_choice') {
        return Array.isArray(answerValue) && answerValue.length > 0;
      }

      return false;
    });
  }, [answers, questions]);

  const handleTextChange = useCallback((questionId: number, value: string) => {
    setAnswers(prev => ({...prev, [questionId]: value}));
  }, []);

  const handleSingleChoiceChange = useCallback(
    (questionId: number, optionKey: string) => {
      setAnswers(prev => ({...prev, [questionId]: optionKey}));
    },
    [],
  );

  const handleMultipleChoiceChange = useCallback(
    (questionId: number, optionKey: string, checked: boolean) => {
      setAnswers(prev => {
        const current = (prev[questionId] as string[]) || [];
        if (checked) {
          return {...prev, [questionId]: [...current, optionKey]};
        } else {
          return {
            ...prev,
            [questionId]: current.filter(key => key !== optionKey),
          };
        }
      });
    },
    [],
  );

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSubmit = useCallback(() => {
    const surveySheetId = data?.surveySheetId ?? data?.id;
    if (!surveySheetId) {
      Alert.alert(t('errorTitle'), t('missingSurveyId'));
      return;
    }

    const payloadAnswers = questions
      .map(question => {
        const answerValue = answers[question.id];
        let answer: string;

        if (Array.isArray(answerValue)) {
          // multiple_choice: join array with comma
          answer = answerValue.join(',');
        } else if (answerValue) {
          // single_choice or text: use string value
          answer = answerValue;
        } else {
          return null;
        }

        return {
          questionId: question.id,
          questionType: question.questionType || 'text',
          answer: answer.trim(),
        };
      })
      .filter(answer => answer !== null && answer.answer.length > 0) as any[];

    if (payloadAnswers.length === 0) {
      Alert.alert(t('errorTitle'), t('emptyAnswers'));
      return;
    }
    submitMutation.mutate(
      {surveySheetId, answers: payloadAnswers},
      {
        onSuccess: () => {
          // Show success notification
          queryClient.invalidateQueries({queryKey: ['survey']});
          queryClient.invalidateQueries({queryKey: ['surveys']});
          queryClient.invalidateQueries({queryKey: ['UnansweredSurvey']});
          setShowSuccessNotification(true);
          // Auto navigate to home after 3 seconds
          setTimeout(() => {
            navigate('Root', {
              screen: 'HomeNavigator',
              params: {screen: 'Home'},
            });
          }, 3000);
        },
        onError: () => {
          Alert.alert(t('errorTitle'), t('submitError'));
        },
      },
    );
  }, [
    answers,
    data?.id,
    data?.surveySheetId,
    navigation,
    questions,
    submitMutation,
    t,
  ]);

  const renderQuestion = useCallback(
    (question: SurveyQuestion) => {
      const questionText = question.question || question.title || '';
      const answerValue = answers[question.id];

      return (
        <View key={question.id} className="py-5 px-4 gap-4">
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <MessageQuestion size="24" color="#7E638F" variant="Bold" />
              <BaseText type="body1">{questionText}</BaseText>
            </View>
            {!!question.description && (
              <BaseText type="body2" color="secondary">
                {question.description}
              </BaseText>
            )}
          </View>

          {question.questionType === 'single_choice' && question.options && (
            <View className="gap-3">
              {question.options.map(option => {
                const optionKey = option.key || String(option.value);
                const optionLabel = option.title || String(option.value);
                const isSelected =
                  typeof answerValue === 'string' && answerValue === optionKey;

                return (
                  <RadioButton
                    key={`${question.id}-${optionKey}`}
                    id={`${question.id}-${optionKey}`}
                    checked={isSelected}
                    label={optionLabel}
                    onCheckedChange={() =>
                      handleSingleChoiceChange(question.id, optionKey)
                    }
                  />
                );
              })}
            </View>
          )}

          {question.questionType === 'multiple_choice' && question.options && (
            <View className="gap-3">
              {question.options.map(option => {
                const optionKey = option.key || String(option.value);
                const optionLabel = option.title || String(option.value);
                const isChecked =
                  Array.isArray(answerValue) && answerValue.includes(optionKey);

                return (
                  <Checkbox
                    key={`${question.id}-${optionKey}`}
                    id={`${question.id}-${optionKey}`}
                    checked={isChecked}
                    label={optionLabel}
                    onCheckedChange={checked =>
                      handleMultipleChoiceChange(
                        question.id,
                        optionKey,
                        checked,
                      )
                    }
                  />
                );
              })}
            </View>
          )}

          {question.questionType === 'text' && (
            <TextArea
              placeholder={t('answerPlaceholder')}
              value={typeof answerValue === 'string' ? answerValue : ''}
              onChangeText={value => handleTextChange(question.id, value)}
              numberOfLines={4}
            />
          )}
        </View>
      );
    },
    [
      answers,
      handleTextChange,
      handleSingleChoiceChange,
      handleMultipleChoiceChange,
      t,
    ],
  );

  const hasGift = !!data?.gift;

  if (isLoading && !isRefetching && !data) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#bcdd64" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SurveySuccessNotification
        hasGift={hasGift}
        visible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        duration={3000}
      />
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{padding: 16, paddingBottom: 100}}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor="#bcdd64"
              />
            }>
            <View className="gap-1">
              {data && <SurveyListCard inpage survey={data as Survey} />}
              <View className="BaseServiceCard gap-4 divide-y divide-neutral-200 dark:divide-neutral-dark-200">
                {questions.length === 0 ? (
                  <BaseText type="body2" color="secondary">
                    {t('noQuestions')}
                  </BaseText>
                ) : (
                  questions.map(renderQuestion)
                )}
              </View>
            </View>
          </ScrollView>

          {/* Sticky bottom buttons - glassmorphism style */}
          {Platform.OS === 'web' ? (
            <View
              className="absolute bottom-0 left-0 right-0 px-4 py-3 gap-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.75)',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
              }}>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <BaseButton
                    type="Fill"
                    color="Black"
                    size="Large"
                    rounded
                    text={t('submit')}
                    disabled={submitMutation.isPending || !allQuestionsAnswered}
                    onPress={handleSubmit}
                    className="!w-full"
                  />
                </View>
                <View className="w-full max-w-[130px]">
                  <BaseButton
                    type="Outline"
                    color="Error"
                    redbutton
                    size="Large"
                    rounded
                    text={t('cancel')}
                    onPress={handleCancel}
                    className="!w-fit"
                  />
                </View>
              </View>
            </View>
          ) : (
            <BlurView
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: 'hidden',
              }}
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.8)">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <BaseButton
                    type="Fill"
                    color="Black"
                    size="Large"
                    rounded
                    text={t('submit')}
                    disabled={submitMutation.isPending || !allQuestionsAnswered}
                    onPress={handleSubmit}
                    className="!w-full"
                  />
                </View>
                <View className="w-full max-w-[130px]">
                  <BaseButton
                    type="Outline"
                    color="Error"
                    redbutton
                    size="Large"
                    rounded
                    text={t('cancel')}
                    onPress={handleCancel}
                    className="!w-fit"
                  />
                </View>
              </View>
            </BlurView>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SurveyDetailScreen;
