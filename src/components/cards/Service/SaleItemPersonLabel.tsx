import React from 'react';
import {useTranslation} from 'react-i18next';
import type {
  Content,
  User,
} from '../../../services/models/response/UseResrService';
import BaseText from '../../BaseText';

export type SaleItemCardProps = {
  data: Content;
  viewerId: number | undefined;
};

type Props = {
  person?: User | null;
  role: 'owner' | 'consumer';
  viewerId: number | undefined;
};

export default function SaleItemPersonLabel({person, role, viewerId}: Props) {
  const {t} = useTranslation('translation');
  if (viewerId == null || person?.id == null || person.id === viewerId) {
    return null;
  }

  const fullName = [person.firstName?.trim(), person.lastName?.trim()]
    .filter(Boolean)
    .join(' ');
  const name = fullName || t('ServiceUsage.userById', {id: person.id});
  const labelKey =
    role === 'consumer' ? 'Detail.consumer' : 'ServiceUsage.owner';

  return (
    <BaseText type="body3" color="secondary">
      {t(labelKey, {name})}
    </BaseText>
  );
}
