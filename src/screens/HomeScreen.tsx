import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  Pressable,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {useTranslation} from 'react-i18next';
import {switchLanguage} from '../utils/helpers/languageUtils';
import {useTheme} from '../utils/ThemeContext';
import BaseText from '../components/BaseText';
import BaseButton from '../components/Button/BaseButton';
import {Home} from 'iconsax-react-native';
import Checkbox from '../components/Checkbox/Checkbox';
import RadioButton from '../components/Button/RadioButton/RadioButton';
import SwitchButton from '../components/Button/SwitchButton/SwitchButton';
import ThemeSwitchButton from '../components/Button/SwitchButton/ThemeSwitchButton';
import ControlledInput from '../components/Input/ControlledInput';
import OTPCode from '../components/OTP/OTPCode';
import CountdownTimer from '../components/CountDown/CountDownTimer';
import Badge from '../components/Badge/Badge';
import {Picker} from '@react-native-picker/picker';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {t, i18n} = useTranslation('translation', {keyPrefix: 'Global'});
  const {theme, toggleTheme} = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [value, setvalue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState();
  return (
    <View className="flex-1 items-center justify-center  dark:bg-neutral-dark-0 bg-neutral-0">
      <BaseText>{t('Home Screen')}</BaseText>
      {/* <Text className="en_title1 text-text-active">{t('Home Screen')}</Text> */}
      <TouchableOpacity
        className="bg-secondary-400 py-3 px-6 rounded-lg mt-5 shadow-lg"
        onPress={() => navigation.navigate('Details')}>
        <BaseText className="text-white text-base  font-yekan">
          Detail Page
        </BaseText>
      </TouchableOpacity>
      <View className="flex flex-row w-full justify-center items-center mt-6 gap-4">
        <BaseButton
          text={t('en')}
          onPress={() => switchLanguage('en')}
          disabled={i18n.resolvedLanguage === 'en'}
          size="Large"
          color="Success"
          type="Outline"
          rounded
        />
        <BaseButton
          text={t('fa')}
          onPress={() => switchLanguage('fa')}
          disabled={i18n.resolvedLanguage === 'fa'}
          size="Large"
          color="Success"
          type="Outline"
          rounded
        />
      </View>

      <View className="flex px-3 flex-row w-full justify-center items-center mt-6 gap-4">
        <BaseButton
          onPress={toggleTheme}
          type="Fill"
          color="Success"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Toggle"
        />
        <BaseButton
          onPress={toggleTheme}
          type="Tonal"
          color="Success"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Theme"
        />
        <BaseButton
          onPress={toggleTheme}
          type="Outline"
          color="Success"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Curent"
        />
      </View>

      <View className="w-full px-6">
        <ControlledInput
          id="test"
          label="Name"
          PlaceHolder="HiitsForTest"
          error="Error Test"
          LeftIcon={Home}
        />
        <ControlledInput
          id="test2"
          type="password"
          label="Test"
          info="some text"
          PlaceHolder="Placeholder"
          LeftIcon={Home}
        />
      </View>
      <View className="flex flex-row items-center justify-between gap-10 ">
        <Checkbox checked={isPressed} onPress={setIsPressed} />
        <RadioButton checked={isPressed} onPress={setIsPressed} />
        <SwitchButton
          status={isPressed}
          onPress={() => setIsPressed(!isPressed)}
        />
        <Badge value="5" rounded color="primary" />
        <Badge value="100" color="secondary" />
      </View>
      <View className="flex flex-row items-center justify-between gap-10 my-4">
        <ThemeSwitchButton />
      </View>
      <View className="w-full h-">
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={(itemValue, itemIndex) =>
            setSelectedLanguage(itemValue)
          }>
          <Picker.Item label="Java" value="java" />
          <Picker.Item label="JavaScript" value="js" />
        </Picker>
      </View>
      <View className="px-4">
        <OTPCode length={5} onChange={e => setvalue(e)} value={value} />
      </View>
      <View className="mt-2">
        <CountdownTimer initialTime={1000} />
      </View>
    </View>
  );
};
2;

export default HomeScreen;
