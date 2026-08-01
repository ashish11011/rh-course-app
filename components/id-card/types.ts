export type MembershipType = 'temporary';
export type MembershipPurchaseType = 'free' | 'paid' | 'referred' | 'complimentary' | 'admin';
export type UserGender = 'male' | 'female' | 'other';
export type BloodGroup = 'A' | 'B' | 'AB' | 'O';
export type RhFactor = 'positive' | 'negative';
export type UserProfession =
  | 'nursing_student'
  | 'nursing_officer'
  | 'nursing_tutor'
  | 'assistant_professor'
  | 'associate_professor'
  | 'professor'
  | 'principal'
  | 'hospital_administrator'
  | 'other';
export type UserQualification =
  'anm' | 'gnm' | 'bsc_nursing' | 'pbbsc_nursing' | 'msc_nursing' | 'phd' | 'other';

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

export type IdCardFormValues = {
  fullName: string;
  mobileNumber: string;
  email: string;
  gender: UserGender | '';
  bloodGroup: BloodGroup | '';
  rhFactor: RhFactor | '';
  dateOfBirth: string;
  state: string;
  city: string;
  profession: UserProfession | '';
  qualification: UserQualification | '';
  organizationName: string;
  passportPhoto: string;
  passportPhotoUrl: string;
  referralCode: string;
  hearAboutRh: string;
  termsAccepted: boolean;
};

export type UserCardRecord = {
  id: string;
  userId: string;
  memberShipNumber: number;
  memberShipId: string | null;
  memberShipType: MembershipType;
  fullName: string;
  mobileNumber: string;
  email: string;
  gender: UserGender;
  bloodGroup: BloodGroup | null;
  rhFactor: RhFactor | null;
  dateOfBirth: string | null;
  state: string;
  city: string;
  profession: UserProfession;
  qualification: UserQualification;
  organizationName: string | null;
  passportPhoto: string | null;
  passportPhotoUrl?: string | null;
  referralCode: string | null;
  hearAboutRh: string | null;
  termsAccepted: boolean;
  activationDate: string | null;
  validityDate: string | null;
  cardType: string;
  isActive: boolean;
  membershipPurchaseType: MembershipPurchaseType;
  createdAt: string | null;
  updatedAt: string | null;
};

export type IdCardApiResponse = {
  success: boolean;
  card: UserCardRecord | null;
  defaults?: Partial<IdCardFormValues>;
  message?: string;
};

export type IdCardUploadUrlResponse = {
  success: boolean;
  uploadUrl: string;
  key: string;
  cloudfrontUrl: string;
};
