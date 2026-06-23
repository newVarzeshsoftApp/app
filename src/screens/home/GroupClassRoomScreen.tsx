import React, {useState, useRef, useMemo, useCallback, useEffect} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Clock,
  ArrowDown2,
  CloseCircle,
  SearchNormal1,
  Sun1,
  Moon,
} from 'iconsax-react-native';
import type {Icon} from 'iconsax-react-native';
import NavigationHeader from '../../components/header/NavigationHeader';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import BottomSheet, {
  BottomSheetMethods,
} from '../../components/BottomSheet/BottomSheet';
import WheelPicker from '../../components/Picker/WheelPicker';
import UserRadioButton from '../../components/Button/RadioButton/UserRadioButton';
import {useTheme} from '../../utils/ThemeContext';
import {useAuth} from '../../utils/hooks/useAuth';
import {useGetGroupClassRoomServices} from '../../utils/hooks/GroupClassRoom/useGetGroupClassRoomServices';
import {useGetGroupClassRoomOrganizationUnit} from '../../utils/hooks/GroupClassRoom';
import {useGetContractors} from '../../utils/hooks/Contractor';
import {DayType, TimeRanges} from '../../constants/options';
import {buildGroupClassRoomListParams, validateGroupClassRoomFilters, GroupClassRoomFilterErrors} from '../../utils/helpers/groupClassRoomHelpers';
import {useNavigation} from '@react-navigation/native';
import {GroupClassRoomStackParamList} from '../../utils/types/NavigationTypes';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  GroupClassRoomService,
  OrganizationUnit,
} from '../../services/models/response/GroupClassRoomResService';
import {User} from '../../services/models/response/UseResrService';

type GroupClassRoomScreenNavigationProp = NativeStackNavigationProp<
  GroupClassRoomStackParamList,
  'groupClassRoom'
>;

interface FilterState {
  organizationUnit: {
    value: string;
    label: string;
    data?: OrganizationUnit;
  } | null;
  service: {value: string; label: string; data?: GroupClassRoomService} | null;
  contractor: {value: string; label: string; data?: User} | null;
  dayType: DayType;
  timeRange: TimeRanges;
}

type TimeRangeStyle = {
  shortLabel: string;
  Icon?: Icon;
  getIconColor: (isSelected: boolean, isDark: boolean) => string;
};

const TIME_RANGE_STYLES: Record<TimeRanges, TimeRangeStyle> = {
  [TimeRanges.ALL]: {
    shortLabel: 'همه',
    Icon: Clock,
    getIconColor: (isSelected, isDark) =>
      isSelected
        ? isDark
          ? '#d2e897'
          : '#859d47'
        : isDark
          ? '#717181'
          : '#717181',
  },
  [TimeRanges.MIXED]: {
    shortLabel: 'ترکیبی',
    getIconColor: (isSelected, isDark) =>
      isSelected
        ? isDark
          ? '#d2e897'
          : '#859d47'
        : isDark
          ? '#717181'
          : '#717181',
  },
  [TimeRanges.PM]: {
    shortLabel: 'عصر',
    Icon: Moon,
    getIconColor: (isSelected, isDark) =>
      isSelected
        ? isDark
          ? '#d2e897'
          : '#859d47'
        : isDark
          ? '#717181'
          : '#717181',
  },
  [TimeRanges.AM]: {
    shortLabel: 'صبح',
    Icon: Sun1,
    getIconColor: (isSelected, isDark) =>
      isSelected
        ? isDark
          ? '#d2e897'
          : '#859d47'
        : isDark
          ? '#717181'
          : '#717181',
  },
};

const TIME_RANGE_ROWS: TimeRanges[][] = [
  [TimeRanges.ALL, TimeRanges.MIXED],
  [TimeRanges.AM, TimeRanges.PM],
];

const MixedTimeIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 22,
}) => (
  <View
    style={{width: size, height: size}}
    className="relative items-center justify-center">
    <View className="absolute -top-0.5 -left-0.5">
      <Sun1 size={size * 0.58} variant="Bold" color={color} />
    </View>
    <View className="absolute -bottom-0.5 -right-0.5">
      <Moon size={size * 0.58} variant="Bold" color={color} />
    </View>
  </View>
);

const renderTimeRangeIcon = (
  timeRange: TimeRanges,
  isSelected: boolean,
  isDark: boolean,
) => {
  const style = TIME_RANGE_STYLES[timeRange];
  const color = style.getIconColor(isSelected, isDark);
  const iconSize = 18;

  if (timeRange === TimeRanges.MIXED) {
    return <MixedTimeIcon color={color} size={iconSize} />;
  }

  const IconComponent = style.Icon;
  if (!IconComponent) return null;

  return (
    <IconComponent
      size={iconSize}
      variant={isSelected ? 'Bold' : 'Linear'}
      color={color}
    />
  );
};

const DAY_TYPE_OPTIONS = [
  {value: DayType.ALL, label: 'همه'},
  {value: DayType.ODD, label: 'فرد'},
  {value: DayType.EVEN, label: 'زوج'},
  {value: DayType.OTHER, label: 'عادی'},
];

const GroupClassRoomScreen: React.FC = () => {
  const {theme} = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation<GroupClassRoomScreenNavigationProp>();
  const {profile} = useAuth();

  // Fetch data
  const {data: servicesData, isLoading: servicesLoading} =
    useGetGroupClassRoomServices();
  const {data: organizationUnitsData, isLoading: orgUnitsLoading} =
    useGetGroupClassRoomOrganizationUnit();
  const {data: contractorsData, isLoading: contractorsLoading} =
    useGetContractors();

  // Bottom sheet refs
  const organizationUnitSheetRef = useRef<BottomSheetMethods>(null);
  const serviceSheetRef = useRef<BottomSheetMethods>(null);
  const contractorSheetRef = useRef<BottomSheetMethods>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    organizationUnit: null,
    service: null,
    contractor: null,
    dayType: DayType.ALL,
    timeRange: TimeRanges.ALL,
  });

  // Temp states for pickers
  const [tempOrganizationUnit, setTempOrganizationUnit] = useState<string>('');
  const [tempService, setTempService] = useState<string>('');
  const [tempContractor, setTempContractor] = useState<string>('');

  // Search state for contractors
  const [contractorSearchQuery, setContractorSearchQuery] =
    useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] =
    useState<GroupClassRoomFilterErrors>({});

  const iconColor = useMemo(() => (isDark ? '#55575C' : '#AAABAD'), [isDark]);

  // Convert data to options
  const organizationUnitOptions = useMemo(() => {
    if (!organizationUnitsData || !Array.isArray(organizationUnitsData))
      return [];
    return organizationUnitsData.map(unit => ({
      value: unit.organizationUnitId.toString(),
      label: unit.organizationUnitTitle,
      data: unit,
    }));
  }, [organizationUnitsData]);

  const serviceOptions = useMemo(() => {
    if (!servicesData || !Array.isArray(servicesData)) return [];
    const allServicesOption = {
      value: 'all',
      label: 'همه خدمات',
      data: undefined,
    };
    const serviceList = servicesData.map(service => ({
      value: service.id.toString(),
      label: service.title,
      data: service,
    }));
    return [allServicesOption, ...serviceList];
  }, [servicesData]);

  const contractorOptions = useMemo(() => {
    if (!contractorsData || !Array.isArray(contractorsData)) return [];
    const allContractorsOption = {
      value: 'all',
      label: 'همه مربیان',
      data: undefined,
    };
    const contractorList = contractorsData.map(contractor => ({
      value: contractor.id.toString(),
      label: `${contractor.firstName || ''} ${
        contractor.lastName || ''
      }`.trim(),
      data: contractor,
    }));
    return [allContractorsOption, ...contractorList];
  }, [contractorsData]);

  // Filtered contractors based on search query
  const filteredContractors = useMemo(() => {
    if (!contractorsData || !Array.isArray(contractorsData)) return [];
    if (!contractorSearchQuery.trim()) return contractorsData;

    const query = contractorSearchQuery.trim().toLowerCase();
    return contractorsData.filter(contractor => {
      const fullName = `${contractor.firstName || ''} ${
        contractor.lastName || ''
      }`
        .trim()
        .toLowerCase();
      return fullName.includes(query);
    });
  }, [contractorsData, contractorSearchQuery]);

  useEffect(() => {
    if (organizationUnitOptions.length !== 1) return;

    setFilters(prev => {
      if (prev.organizationUnit) return prev;
      return {...prev, organizationUnit: organizationUnitOptions[0]};
    });
  }, [organizationUnitOptions]);

  useEffect(() => {
    if (!servicesData || !Array.isArray(servicesData) || servicesData.length !== 1) {
      return;
    }

    const singleService = serviceOptions.find(option => option.value !== 'all');
    if (!singleService) return;

    setFilters(prev => {
      if (prev.service) return prev;
      return {...prev, service: singleService};
    });
  }, [servicesData, serviceOptions]);

  // Save handlers
  const saveOrganizationUnit = () => {
    const selected = organizationUnitOptions.find(
      o => o.value === tempOrganizationUnit,
    );
    if (selected) {
      setFilters(prev => ({...prev, organizationUnit: selected}));
      setValidationErrors(prev => ({...prev, organizationUnit: undefined}));
    }
    organizationUnitSheetRef.current?.close();
  };

  const saveService = () => {
    const selected = serviceOptions.find(s => s.value === tempService);
    if (selected) {
      setFilters(prev => ({...prev, service: selected}));
      setValidationErrors(prev => ({...prev, service: undefined}));
    }
    serviceSheetRef.current?.close();
  };

  const saveContractor = () => {
    const selected = contractorOptions.find(c => c.value === tempContractor);
    if (selected) {
      setFilters(prev => ({...prev, contractor: selected}));
      setValidationErrors(prev => ({...prev, contractor: undefined}));
    }
    contractorSheetRef.current?.close();
  };

  const handleShowResults = useCallback(() => {
    const errors = validateGroupClassRoomFilters(filters);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    if (
      !filters.organizationUnit ||
      !filters.service ||
      !filters.contractor
    ) {
      return;
    }

    navigation.navigate(
      'groupClassRoomList',
      buildGroupClassRoomListParams({
        dayType: filters.dayType,
        timeRange: filters.timeRange,
        organizationUnit: filters.organizationUnit,
        service: filters.service,
        contractor: filters.contractor,
      }),
    );
  }, [filters, navigation]);

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100 relative">
      {/* Background shapes */}
      <View className="absolute -top-[25%] web:rotate-[10deg] web:-left-[30%] android:-right-[80%] ios:-right-[80%] opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%] web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>

      {/* Header */}
      <NavigationHeader title="کلاس گروهی" CenterText MainBack />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        <View className="Container gap-6 pt-4">
          {/* Filter Card */}
          <View className="p-5 rounded-3xl gap-6 BaseServiceCard">
            {/* شعبه */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                شعبه
              </BaseText>
              <TouchableOpacity
                onPress={() => {
                  if (organizationUnitOptions.length > 0) {
                    const defaultValue =
                      filters.organizationUnit?.value ||
                      organizationUnitOptions[0].value;
                    setTempOrganizationUnit(defaultValue);
                    // Use setTimeout to ensure state is updated before opening sheet
                    setTimeout(() => {
                      organizationUnitSheetRef.current?.expand();
                    }, 0);
                  }
                }}
                disabled={
                  orgUnitsLoading || organizationUnitOptions.length === 0
                }
                className={`h-12 py-3 px-4 flex-row items-center justify-between border rounded-full bg-neutral-0 dark:bg-neutral-dark-200 ${
                  validationErrors.organizationUnit
                    ? 'border-[#F55F56]'
                    : 'border-neutral-300 dark:border-neutral-dark-400'
                }`}>
                <BaseText
                  type="subtitle2"
                  color={filters.organizationUnit ? 'base' : 'muted'}>
                  {orgUnitsLoading
                    ? 'در حال بارگذاری...'
                    : filters.organizationUnit?.label || 'انتخاب شعبه'}
                </BaseText>
                <ArrowDown2 size={20} color={iconColor} />
              </TouchableOpacity>
              {validationErrors.organizationUnit ? (
                <BaseText type="caption" className="text-[#F55F56] px-1">
                  {validationErrors.organizationUnit}
                </BaseText>
              ) : null}
            </View>

            {/* خدمت */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                خدمت
              </BaseText>
              <TouchableOpacity
                onPress={() => {
                  if (serviceOptions.length > 0) {
                    const defaultValue =
                      filters.service?.value || serviceOptions[0].value;
                    setTempService(defaultValue);
                    // Use setTimeout to ensure state is updated before opening sheet
                    setTimeout(() => {
                      serviceSheetRef.current?.expand();
                    }, 0);
                  }
                }}
                disabled={servicesLoading || serviceOptions.length === 0}
                className={`h-12 py-3 px-4 flex-row items-center justify-between border rounded-full bg-neutral-0 dark:bg-neutral-dark-200 ${
                  validationErrors.service
                    ? 'border-[#F55F56]'
                    : 'border-neutral-300 dark:border-neutral-dark-400'
                }`}>
                <BaseText
                  type="subtitle2"
                  color={filters.service ? 'base' : 'muted'}>
                  {servicesLoading
                    ? 'در حال بارگذاری...'
                    : filters.service?.label || 'انتخاب خدمت'}
                </BaseText>
                <ArrowDown2 size={20} color={iconColor} />
              </TouchableOpacity>
              {validationErrors.service ? (
                <BaseText type="caption" className="text-[#F55F56] px-1">
                  {validationErrors.service}
                </BaseText>
              ) : null}
            </View>

            {/* مربی */}
            <View className="gap-2">
              <BaseText type="title4" color="base">
                مربی
              </BaseText>
              <View className="gap-1 flex-row items-center flex-1">
                <UserRadioButton
                  checked={Boolean(filters.contractor?.data)}
                  asButton
                  genders={
                    filters.contractor?.data?.gender ?? profile?.gender ?? 0
                  }
                  placeHolder="انتخاب مربی"
                  Name={
                    filters.contractor?.data
                      ? `${filters.contractor.data.firstName || ''} ${
                          filters.contractor.data.lastName || ''
                        }`.trim()
                      : null
                  }
                  onCheckedChange={() => {
                    if (
                      contractorsData &&
                      Array.isArray(contractorsData) &&
                      contractorsData.length > 0
                    ) {
                      setContractorSearchQuery('');
                      contractorSheetRef.current?.expand();
                    }
                  }}
                  ImageUrl={filters.contractor?.data?.profile?.name}
                />
                {filters.contractor && (
                  <BaseButton
                    noText
                    LeftIcon={CloseCircle}
                    LeftIconVariant="Bold"
                    style={{padding: 10}}
                    onPress={() => {
                      setFilters(prev => ({...prev, contractor: null}));
                      setValidationErrors(prev => ({
                        ...prev,
                        contractor: undefined,
                      }));
                    }}
                    type="TextButton"
                    size="Large"
                    rounded
                    color="Black"
                  />
                )}
              </View>
              {validationErrors.contractor ? (
                <BaseText type="caption" className="text-[#F55F56] px-1">
                  {validationErrors.contractor}
                </BaseText>
              ) : null}
            </View>

            {/* ساعت */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                ساعت
              </BaseText>
              <View className="gap-2">
                {TIME_RANGE_ROWS.map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-row gap-2">
                    {row.map(timeRange => {
                      const isSelected = filters.timeRange === timeRange;
                      const style = TIME_RANGE_STYLES[timeRange];

                      return (
                        <TouchableOpacity
                          key={timeRange}
                          activeOpacity={0.7}
                          onPress={() =>
                            setFilters(prev => ({...prev, timeRange}))
                          }
                          className={`flex-1 flex-row items-center gap-2.5 px-3 py-3 rounded-xl border ${
                            isSelected
                              ? 'bg-primary-100 dark:bg-primary-dark-200 border-primary-500 dark:border-primary-dark-400'
                              : 'bg-neutral-0 dark:bg-neutral-dark-200 border-neutral-200 dark:border-neutral-dark-400'
                          }`}>
                          <View
                            className={`w-9 h-9 rounded-full items-center justify-center ${
                              isSelected
                                ? 'bg-primary-200 dark:bg-primary-dark-300'
                                : 'bg-neutral-100 dark:bg-neutral-dark-300'
                            }`}>
                            {renderTimeRangeIcon(
                              timeRange,
                              isSelected,
                              isDark,
                            )}
                          </View>
                          <View className="flex-1">
                            <BaseText
                              type="subtitle2"
                              color={isSelected ? 'base' : 'secondary'}>
                              {style.shortLabel}
                            </BaseText>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* روزهای هفته */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                روزهای هفته
              </BaseText>
              <View className="flex-row gap-2">
                {DAY_TYPE_OPTIONS.map(option => {
                  const isSelected = filters.dayType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() =>
                        setFilters(prev => ({...prev, dayType: option.value}))
                      }
                      className={`flex-1 h-10 rounded-full items-center justify-center border ${
                        isSelected
                          ? 'bg-primary-700 border-primary-500 dark:bg-primary-dark-500 dark:border-primary-dark-400'
                          : 'bg-neutral-0 dark:bg-neutral-dark-200 border-neutral-300 dark:border-neutral-dark-400'
                      }`}>
                      <BaseText
                        type="subtitle2"
                        color={isSelected ? 'button' : 'base'}>
                        {option.label}
                      </BaseText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 24,
          paddingTop: 8,
        }}>
        <SafeAreaView edges={['bottom']}>
          <BaseButton
            text="نمایش"
            type="Fill"
            color="Black"
            size="Large"
            rounded
            onPress={handleShowResults}
          />
        </SafeAreaView>
      </View>

      {/* Bottom Sheets */}
      {/* شعبه */}
      <BottomSheet
        ref={organizationUnitSheetRef}
        Title="انتخاب شعبه"
        snapPoints={[60]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveOrganizationUnit}>
        {organizationUnitOptions.length > 0 ? (
          <WheelPicker
            values={organizationUnitOptions}
            defaultValue={
              tempOrganizationUnit ||
              filters.organizationUnit?.value ||
              organizationUnitOptions[0]?.value ||
              ''
            }
            onChange={item => setTempOrganizationUnit(item.value)}
            position="SINGLE"
          />
        ) : (
          <View className="py-10 items-center">
            <BaseText type="body2" color="muted">
              {orgUnitsLoading ? 'در حال بارگذاری...' : 'شعبه‌ای یافت نشد'}
            </BaseText>
          </View>
        )}
      </BottomSheet>

      {/* خدمت */}
      <BottomSheet
        ref={serviceSheetRef}
        Title="انتخاب خدمت"
        snapPoints={[60]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveService}>
        {serviceOptions.length > 0 ? (
          <WheelPicker
            values={serviceOptions}
            defaultValue={
              tempService ||
              filters.service?.value ||
              serviceOptions[0]?.value ||
              ''
            }
            onChange={item => setTempService(item.value)}
            position="SINGLE"
          />
        ) : (
          <View className="py-10 items-center">
            <BaseText type="body2" color="muted">
              {servicesLoading ? 'در حال بارگذاری...' : 'خدمتی یافت نشد'}
            </BaseText>
          </View>
        )}
      </BottomSheet>

      {/* مربی */}
      <BottomSheet
        ref={contractorSheetRef}
        scrollView={true}
        disablePan
        snapPoints={[80]}
        Title="لیست مربیان">
        <View className="gap-3">
          {/* Header - Fixed (sticky header) */}
          <View className="gap-3 sticky top-0 bg-[#F8F8F9] dark:bg-[#24262C] pb-2 z-10">
            {/* Search Input */}
            <View className="relative">
              <View
                className={`h-12 flex-row items-center px-4 border rounded-full bg-neutral-0 dark:bg-neutral-dark-200 ${
                  isSearchFocused
                    ? 'border-primary-500 dark:border-primary-500'
                    : 'border-neutral-300 dark:border-neutral-dark-400'
                }`}>
                <SearchNormal1 size={20} color={iconColor} variant="Linear" />
                <TextInput
                  className="flex-1 px-3 text-base text-text-base dark:text-text-base-dark rtl:text-right ltr:text-left outline-none"
                  placeholder="جستجوی مربی"
                  placeholderTextColor={isDark ? '#AAABAD' : '#AAABAD'}
                  value={contractorSearchQuery}
                  onChangeText={setContractorSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={{
                    fontFamily: 'YekanBakhFaNum-Regular',
                  }}
                />
                {contractorSearchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setContractorSearchQuery('')}
                    className="p-1">
                    <CloseCircle size={20} color={iconColor} variant="Bold" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View className="flex-row items-center justify-between px-1">
              <BaseText type="title4" color="base">
                لیست مربیان
              </BaseText>
              <BaseText type="subtitle2" color="secondaryPurple">
                {contractorsData && Array.isArray(contractorsData)
                  ? `${filteredContractors.length} مربی`
                  : '۰ مربی'}
              </BaseText>
            </View>
          </View>

          {/* List - Scrollable */}
          {contractorsLoading ? (
            <View className="py-10 items-center">
              <BaseText type="body2" color="muted">
                در حال بارگذاری...
              </BaseText>
            </View>
          ) : filteredContractors.length > 0 ? (
            filteredContractors.map((contractor, index) => {
              const isSelected = filters.contractor?.data?.id === contractor.id;
              return (
                <UserRadioButton
                  key={contractor.id || index}
                  genders={contractor.gender ?? 0}
                  checked={isSelected}
                  onCheckedChange={() => {
                    const selectedOption = contractorOptions.find(
                      c => c.value === contractor.id.toString(),
                    );
                    if (selectedOption) {
                      setFilters(prev => ({
                        ...prev,
                        contractor: selectedOption,
                      }));
                      setValidationErrors(prev => ({
                        ...prev,
                        contractor: undefined,
                      }));
                    }
                    contractorSheetRef.current?.close();
                  }}
                  Name={`${contractor.firstName || ''} ${
                    contractor.lastName || ''
                  }`.trim()}
                  ImageUrl={contractor.profile?.name}
                />
              );
            })
          ) : (
            <View className="py-10 items-center">
              <BaseText type="body2" color="muted">
                مربی‌ای یافت نشد
              </BaseText>
            </View>
          )}
        </View>
      </BottomSheet>
    </View>
  );
};

export default GroupClassRoomScreen;
