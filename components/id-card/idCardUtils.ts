import {
  BloodGroup,
  IdCardFormValues,
  RhFactor,
  SelectOption,
  UserCardRecord,
  UserGender,
  UserProfession,
  UserQualification,
} from './types';
import { cloudfrontAssetUrl } from '@/lib/cloudfront';

export const GENDER_OPTIONS: SelectOption<UserGender>[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const BLOOD_GROUP_OPTIONS: SelectOption<BloodGroup>[] = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'AB', value: 'AB' },
  { label: 'O', value: 'O' },
];

export const RH_FACTOR_OPTIONS: SelectOption<RhFactor>[] = [
  { label: 'Positive', value: 'positive' },
  { label: 'Negative', value: 'negative' },
];

export const PROFESSION_OPTIONS: SelectOption<UserProfession>[] = [
  { label: 'Nursing Student', value: 'nursing_student' },
  { label: 'Nursing Officer', value: 'nursing_officer' },
  { label: 'Nursing Tutor', value: 'nursing_tutor' },
  { label: 'Assistant Professor', value: 'assistant_professor' },
  { label: 'Associate Professor', value: 'associate_professor' },
  { label: 'Professor', value: 'professor' },
  { label: 'Principal', value: 'principal' },
  { label: 'Hospital Administrator', value: 'hospital_administrator' },
  { label: 'Other', value: 'other' },
];

export const QUALIFICATION_OPTIONS: SelectOption<UserQualification>[] = [
  { label: 'ANM', value: 'anm' },
  { label: 'GNM', value: 'gnm' },
  { label: 'B.Sc Nursing', value: 'bsc_nursing' },
  { label: 'P.B.B.Sc Nursing', value: 'pbbsc_nursing' },
  { label: 'M.Sc Nursing', value: 'msc_nursing' },
  { label: 'PhD', value: 'phd' },
  { label: 'Other', value: 'other' },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const PROFESSION_CODE: Record<UserProfession, string> = {
  nursing_student: 'NST',
  nursing_officer: 'NUR',
  nursing_tutor: 'NTU',
  assistant_professor: 'APR',
  associate_professor: 'ASP',
  professor: 'PRO',
  principal: 'PRI',
  hospital_administrator: 'HAD',
  other: 'MEM',
};

function getOptionLabel<T extends string>(options: SelectOption<T>[], value?: T | '' | null) {
  return options.find((option) => option.value === value)?.label || '';
}

export function formatGender(value?: UserGender | '' | null) {
  return getOptionLabel(GENDER_OPTIONS, value);
}

export function formatProfession(value?: UserProfession | '' | null) {
  return getOptionLabel(PROFESSION_OPTIONS, value);
}

export function formatQualification(value?: UserQualification | '' | null) {
  return getOptionLabel(QUALIFICATION_OPTIONS, value);
}

export function formatRhFactor(value?: RhFactor | '' | null) {
  return getOptionLabel(RH_FACTOR_OPTIONS, value);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return 'Not set';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function toIsoDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addYears(date: Date, years: number) {
  const nextDate = new Date(date);
  nextDate.setFullYear(nextDate.getFullYear() + years);
  return nextDate;
}

export function buildPreviewMembershipId(profession?: UserProfession | '') {
  const year = new Date().getFullYear();
  const code = profession ? PROFESSION_CODE[profession] : 'MEM';

  return `RH-${code}-${year}-PREVIEW`;
}

export function makePreviewCard(values: IdCardFormValues): UserCardRecord {
  const now = new Date();
  const validTill = addYears(now, 2);

  return {
    id: 'preview',
    userId: 'preview',
    memberShipNumber: 0,
    memberShipId: buildPreviewMembershipId(values.profession),
    memberShipType: 'temporary',
    fullName: values.fullName || 'Your Name',
    mobileNumber: values.mobileNumber,
    email: values.email,
    gender: values.gender || 'other',
    bloodGroup: values.bloodGroup || null,
    rhFactor: values.rhFactor || null,
    dateOfBirth: values.dateOfBirth || null,
    state: values.state || 'State',
    city: values.city || 'City',
    profession: values.profession || 'other',
    qualification: values.qualification || 'other',
    organizationName: values.organizationName || null,
    passportPhoto: values.passportPhoto || null,
    passportPhotoUrl: values.passportPhotoUrl || cloudfrontAssetUrl(values.passportPhoto) || null,
    referralCode: values.referralCode || null,
    hearAboutRh: values.hearAboutRh || null,
    termsAccepted: values.termsAccepted,
    activationDate: now.toISOString(),
    validityDate: validTill.toISOString(),
    cardType: 'free',
    isActive: true,
    membershipPurchaseType: 'free',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return 'RH';

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}
