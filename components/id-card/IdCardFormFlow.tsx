import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import api from '@/lib/api';
import { tryCatch } from '@/lib/apiUtils';
import { cn } from '@/lib/utils';

import { IdCardView } from './IdCardView';
import {
  BLOOD_GROUP_OPTIONS,
  GENDER_OPTIONS,
  PROFESSION_OPTIONS,
  QUALIFICATION_OPTIONS,
  RH_FACTOR_OPTIONS,
  formatDate,
  makePreviewCard,
} from './idCardUtils';
import {
  IdCardApiResponse,
  IdCardFormValues,
  IdCardUploadUrlResponse,
  UserCardRecord,
} from './types';

const STEPS = [
  { title: 'Personal', subtitle: 'Basic details' },
  { title: 'Professional', subtitle: 'Work and location' },
  { title: 'Review', subtitle: 'Final details' },
];

type IdCardFormFlowProps = {
  initialValues: IdCardFormValues;
  onGenerated: (card: UserCardRecord) => void;
};

type LabeledInputProps = React.ComponentProps<typeof Input> & {
  label: string;
};

function LabeledInput({ label, className, ...props }: LabeledInputProps) {
  return (
    <View>
      <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</Text>
      <Input
        className={cn(
          'h-12 rounded-lg border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
          className
        )}
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  );
}

function getMimeTypeFromFilename(filename: string) {
  const cleanFilename = filename.toLowerCase();

  if (cleanFilename.endsWith('.png')) return 'image/png';
  if (cleanFilename.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function getFilenameFromAsset(asset: ImagePicker.ImagePickerAsset) {
  if (asset.fileName) return asset.fileName;

  const uriName = asset.uri.split('/').pop();
  if (uriName && uriName.includes('.')) return uriName;

  return `passport-photo-${Date.now()}.jpg`;
}

async function uploadImageToPresignedUrl(uploadUrl: string, uri: string, fileType: string) {
  const imageResponse = await fetch(uri);
  const blob = await imageResponse.blob();
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': fileType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image');
  }
}

function PassportPhotoUploadField({
  imageUrl,
  uploading,
  onPick,
  onRemove,
}: {
  imageUrl: string;
  uploading: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <View>
      <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Passport Photo
      </Text>
      <View className="rounded-lg border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <View className="flex-row items-center gap-4">
          <View className="h-28 w-20 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-neutral-800 dark:bg-neutral-800">
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <ImagePlus size={24} color="#64748b" />
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-900 dark:text-white">
              Upload a clear portrait image
            </Text>
            <Text className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              JPG, PNG, or WEBP. The uploaded file is shown through CloudFront.
            </Text>
            <View className="mt-3 flex-row gap-2">
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-lg border-slate-300"
                onPress={onPick}
                disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator color="#047857" />
                ) : (
                  <>
                    <ImagePlus size={16} color="#334155" />
                    <Text className="font-semibold text-slate-700 dark:text-slate-100">
                      {imageUrl ? 'Change' : 'Upload'}
                    </Text>
                  </>
                )}
              </Button>
              {imageUrl ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg border-slate-300"
                  onPress={onRemove}
                  disabled={uploading}>
                  <Trash2 size={16} color="#dc2626" />
                </Button>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <View className="mt-5 flex-row gap-2">
      {STEPS.map((step, index) => {
        const isActive = index <= currentStep;

        return (
          <View
            key={step.title}
            className={cn(
              'h-2 flex-1 rounded-full',
              isActive ? 'bg-emerald-700' : 'bg-slate-200 dark:bg-neutral-800'
            )}
          />
        );
      })}
    </View>
  );
}

function isValidIsoInputDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

function getStepError(step: number, values: IdCardFormValues) {
  if (step === 0) {
    if (!values.fullName.trim()) return 'Full name is required';
    if (!values.mobileNumber.trim()) return 'Mobile number is required';
    if (!values.gender) return 'Please select gender';
    if (!isValidIsoInputDate(values.dateOfBirth)) {
      return 'Date of birth should be in YYYY-MM-DD format';
    }
  }

  if (step === 1) {
    if (!values.profession) return 'Please select profession';
    if (!values.qualification) return 'Please select qualification';
    if (!values.state.trim()) return 'State is required';
    if (!values.city.trim()) return 'City is required';
  }

  if (step === 2) {
    if (!values.termsAccepted) return 'Please accept the terms';
  }

  return null;
}

export function IdCardFormFlow({ initialValues, onGenerated }: IdCardFormFlowProps) {
  const [values, setValues] = useState<IdCardFormValues>(initialValues);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const previewCard = useMemo(() => makePreviewCard(values), [values]);

  const updateField = <K extends keyof IdCardFormValues>(field: K, value: IdCardFormValues[K]) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep === 2 && uploadingPhoto) {
      Alert.alert('Upload in progress', 'Please wait for the photo upload to finish.');
      return;
    }

    const stepError = getStepError(currentStep, values);
    if (stepError) {
      Alert.alert('Check details', stepError);
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    setIsPreviewing(true);
  };

  const handleGenerate = async () => {
    if (uploadingPhoto) {
      Alert.alert('Upload in progress', 'Please wait for the photo upload to finish.');
      return;
    }

    const firstError = STEPS.map((_, index) => getStepError(index, values)).find(Boolean);
    if (firstError) {
      Alert.alert('Check details', firstError);
      setIsPreviewing(false);
      return;
    }

    setSubmitting(true);
    const {
      data: response,
      error,
      rawError,
    } = await tryCatch(
      () => api.post<IdCardApiResponse>('/api/auth/mobile/id-card', values),
      'Failed to generate membership card'
    );
    setSubmitting(false);

    if (error) {
      console.error(rawError);
      Alert.alert('Generate failed', error);
      return;
    }

    if (response?.data?.card) {
      onGenerated(response.data.card);
      Alert.alert('Card generated', 'Your membership card is ready.');
    }
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload your card image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const filename = getFilenameFromAsset(asset);
    const fileType = asset.mimeType || getMimeTypeFromFilename(filename);

    setUploadingPhoto(true);
    const {
      data: uploadUrlResponse,
      error,
      rawError,
    } = await tryCatch(
      () =>
        api.post<IdCardUploadUrlResponse>('/api/auth/mobile/id-card/upload-url', {
          filename,
          fileType,
        }),
      'Failed to prepare image upload'
    );

    if (error || !uploadUrlResponse?.data) {
      console.error(rawError);
      setUploadingPhoto(false);
      Alert.alert('Upload failed', error || 'Failed to prepare image upload');
      return;
    }

    try {
      await uploadImageToPresignedUrl(uploadUrlResponse.data.uploadUrl, asset.uri, fileType);
      updateField('passportPhoto', uploadUrlResponse.data.key);
      updateField('passportPhotoUrl', uploadUrlResponse.data.cloudfrontUrl);
    } catch (uploadError) {
      console.error(uploadError);
      Alert.alert('Upload failed', 'Unable to upload image. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const renderStepFields = () => {
    if (currentStep === 0) {
      return (
        <View className="gap-4">
          <LabeledInput
            label="Full Name"
            value={values.fullName}
            onChangeText={(text) => updateField('fullName', text)}
            placeholder="Enter full name"
          />
          <LabeledInput
            label="Email"
            value={values.email}
            editable={false}
            className="bg-slate-100 text-slate-500 dark:bg-neutral-800"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <LabeledInput
            label="Mobile Number"
            value={values.mobileNumber}
            onChangeText={(text) => updateField('mobileNumber', text)}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
          />
          <Select
            label="Gender"
            value={values.gender}
            options={GENDER_OPTIONS}
            placeholder="Select gender"
            onValueChange={(value) => updateField('gender', value)}
          />
          <LabeledInput
            label="Date of Birth"
            value={values.dateOfBirth}
            onChangeText={(text) => updateField('dateOfBirth', text)}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Select
                label="Blood Group"
                value={values.bloodGroup}
                options={BLOOD_GROUP_OPTIONS}
                placeholder="Select"
                onValueChange={(value) => updateField('bloodGroup', value)}
              />
            </View>
            <View className="flex-1">
              <Select
                label="RH Factor"
                value={values.rhFactor}
                options={RH_FACTOR_OPTIONS}
                placeholder="Select"
                onValueChange={(value) => updateField('rhFactor', value)}
              />
            </View>
          </View>
        </View>
      );
    }

    if (currentStep === 1) {
      return (
        <View className="gap-4">
          <Select
            label="Profession"
            value={values.profession}
            options={PROFESSION_OPTIONS}
            placeholder="Select profession"
            onValueChange={(value) => updateField('profession', value)}
          />
          <Select
            label="Qualification"
            value={values.qualification}
            options={QUALIFICATION_OPTIONS}
            placeholder="Select qualification"
            onValueChange={(value) => updateField('qualification', value)}
          />
          <LabeledInput
            label="Organization Name"
            value={values.organizationName}
            onChangeText={(text) => updateField('organizationName', text)}
            placeholder="College, hospital, or organization"
          />
          <LabeledInput
            label="State"
            value={values.state}
            onChangeText={(text) => updateField('state', text)}
            placeholder="Enter state"
          />
          <LabeledInput
            label="City"
            value={values.city}
            onChangeText={(text) => updateField('city', text)}
            placeholder="Enter city"
          />
        </View>
      );
    }

    return (
      <View className="gap-4">
        <PassportPhotoUploadField
          imageUrl={values.passportPhotoUrl}
          uploading={uploadingPhoto}
          onPick={handlePickPhoto}
          onRemove={() => {
            updateField('passportPhoto', '');
            updateField('passportPhotoUrl', '');
          }}
        />
        <LabeledInput
          label="Referral Code"
          value={values.referralCode}
          onChangeText={(text) => updateField('referralCode', text)}
          placeholder="Optional"
          autoCapitalize="characters"
        />
        <LabeledInput
          label="How did you hear about RH?"
          value={values.hearAboutRh}
          onChangeText={(text) => updateField('hearAboutRh', text)}
          placeholder="Instagram, friend, workshop..."
        />
        <View className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <Text className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Free membership
          </Text>
          <Text className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
            Activation: {formatDate(new Date())}
          </Text>
          <Text className="text-sm text-emerald-800 dark:text-emerald-200">
            Valid till: {formatDate(previewCard.validityDate)}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => updateField('termsAccepted', !values.termsAccepted)}
          className="flex-row items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <View
            className={cn(
              'mt-[1px] h-6 w-6 items-center justify-center rounded-md border',
              values.termsAccepted
                ? 'border-emerald-700 bg-emerald-700'
                : 'border-slate-300 bg-white dark:border-neutral-700 dark:bg-neutral-950'
            )}>
            {values.termsAccepted ? <Check size={16} color="#ffffff" /> : null}
          </View>
          <Text className="flex-1 text-sm leading-5 text-slate-700 dark:text-slate-200">
            I confirm the details are correct and accept the RH Healthcare membership terms.
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isPreviewing) {
    return (
      <KeyboardAwareScrollView
        className="flex-1 bg-slate-50 dark:bg-neutral-950"
        contentContainerClassName="px-5 pb-32 pt-16"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid>
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-slate-950 dark:text-white">
            Preview Card
          </Text>
          <Text className="mt-2 text-slate-500 dark:text-slate-400">Review before generation</Text>
        </View>

        <IdCardView card={previewCard} isPreview />

        <View className="mt-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <Text className="text-base font-bold text-slate-900 dark:text-white">Card validity</Text>
          <Text className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Starts {formatDate(previewCard.activationDate)} and remains valid till{' '}
            {formatDate(previewCard.validityDate)}.
          </Text>
        </View>

        <View className="mt-6 flex-row gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-lg border-slate-300"
            onPress={() => setIsPreviewing(false)}
            disabled={submitting}>
            <Pencil size={17} color="#334155" />
            <Text className="font-semibold text-slate-700 dark:text-slate-100">Edit</Text>
          </Button>
          <Button
            className="h-12 flex-1 rounded-lg bg-emerald-700 active:bg-emerald-800"
            onPress={handleGenerate}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Sparkles size={17} color="#ffffff" />
                <Text className="font-semibold text-white">Generate</Text>
              </>
            )}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-slate-50 dark:bg-neutral-950"
      contentContainerClassName="px-5 pb-32 pt-16"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={120}>
      <View className="mb-7">
        <Text className="text-3xl font-extrabold text-slate-950 dark:text-white">
          Membership Card
        </Text>
        <Text className="mt-2 text-slate-500 dark:text-slate-400">
          Step {currentStep + 1} of {STEPS.length} - {STEPS[currentStep].subtitle}
        </Text>
        <StepProgress currentStep={currentStep} />
      </View>

      <View className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-black/5 dark:border-neutral-800 dark:bg-neutral-900">
        <Text className="mb-5 text-xl font-bold text-slate-950 dark:text-white">
          {STEPS[currentStep].title}
        </Text>
        {renderStepFields()}
      </View>

      <View className="mt-6 flex-row gap-3 pb-8">
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-lg border-slate-300"
          onPress={() => setCurrentStep((step) => Math.max(0, step - 1))}
          disabled={currentStep === 0}>
          <ChevronLeft size={18} color="#334155" />
          <Text className="font-semibold text-slate-700 dark:text-slate-100">Back</Text>
        </Button>
        <Button
          className="h-12 flex-1 rounded-lg bg-emerald-700 active:bg-emerald-800"
          onPress={handleNext}>
          <Text className="font-semibold text-white">
            {currentStep === STEPS.length - 1 ? 'Preview' : 'Next'}
          </Text>
          <ChevronRight size={18} color="#ffffff" />
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}
