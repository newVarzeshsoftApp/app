import {ActivityField} from '../../constants/options';
import {Contractors} from '../../services/models/response/ProductResService';
import {User} from '../../services/models/response/UseResrService';

export const hasRegistrationActivity = (user?: User | null): boolean =>
  user?.activityFields?.includes(ActivityField.Registration) ?? false;

export const filterContractorsForRegistration = (
  contractors?: Contractors[] | null,
): Contractors[] =>
  (contractors ?? []).filter(item => hasRegistrationActivity(item.contractor));
