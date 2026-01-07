import React from 'react';
import {useGetOrganizationBySKU} from '../utils/hooks/Organization/useGetOrganizationBySKU';
import ResponsiveImage from './ResponsiveImage';

const Logo: React.FC<{header?: boolean}> = ({header}) => {
  const {data: organization} = useGetOrganizationBySKU();

  const customSource = header
    ? organization?.brandedLogo?.srcset
    : organization?.officialLogo?.srcset ?? organization?.brandedLogo?.srcset;
  const aspectRatio = header || organization?.officialLogo?.srcset ? 1 : 16 / 9;

  return (
    <ResponsiveImage
      ImageType="App"
      customSource={customSource}
      fallback={'../../assets/images/testImage.png'}
      resizeMode="contain"
      style={{aspectRatio, width: '100%', height: '100%', maxWidth: 300}}
    />
  );
};

export default Logo;
