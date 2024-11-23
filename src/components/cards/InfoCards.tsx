import React from 'react';
import {View} from 'react-native';
import MembershipInfo from './infoCards/MembershipInfo';
import BMIInfo from './infoCards/BMIInfo';
import ClosetInfo from './infoCards/ClosetInfo';
import InsuranceInfo from './infoCards/InsuranceInfo';

function InfoCards({
  type,
}: {
  type: 'MembershipInfo' | 'InsuranceInfo' | 'ClosetInfo' | 'BMIInfo';
}) {
  switch (type) {
    case 'MembershipInfo':
      return <MembershipInfo />;
    case 'BMIInfo':
      return <BMIInfo />;
    case 'ClosetInfo':
      return <ClosetInfo />;
    case 'InsuranceInfo':
      return <InsuranceInfo />;
  }
}

export default InfoCards;
