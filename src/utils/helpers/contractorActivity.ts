import {ActivityField} from '../../constants/options';
import {Contractors} from '../../services/models/response/ProductResService';
import {User} from '../../services/models/response/UseResrService';

const includesActivityField = (
  fields: unknown,
  activityField: ActivityField,
): boolean => {
  if (!Array.isArray(fields)) {
    return false;
  }

  return fields.some(value => Number(value) === Number(activityField));
};

const getContractorActivityFields = (item: Contractors): unknown[] => {
  const fromUser = Array.isArray(item.contractor?.activityFields)
    ? item.contractor.activityFields
    : [];
  const fromWrapper = Array.isArray(item.activityFields)
    ? item.activityFields
    : [];
  return [...fromUser, ...fromWrapper];
};

export const hasActivityField = (
  user: User | null | undefined,
  activityField: ActivityField,
): boolean => includesActivityField(user?.activityFields, activityField);

export const hasRegistrationActivity = (user?: User | null): boolean =>
  hasActivityField(user, ActivityField.Registration);

export const filterContractorsForRegistration = (
  contractors?: Contractors[] | null,
): Contractors[] =>
  (contractors ?? []).filter(item =>
    includesActivityField(
      getContractorActivityFields(item),
      ActivityField.Registration,
    ),
  );
