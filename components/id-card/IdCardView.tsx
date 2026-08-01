import React, { useMemo } from 'react';
import { Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Globe,
  Globe2,
  IdCard,
  MapPin,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { cloudfrontAssetUrl } from '@/lib/cloudfront';
import { cn } from '@/lib/utils';

import { formatDate, formatProfession, getInitials } from './idCardUtils';
import { UserCardRecord } from './types';
import Svg, { Polygon } from 'react-native-svg';

const RH_LOGO = require('@/assets/images/rh_logo.png');
const NAVY = '#2196F3';
const GOLD = '#c9a24a';

type IdCardViewProps = {
  card: UserCardRecord;
  className?: string;
  isPreview?: boolean;
};

type DetailRow = {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  valueClassName?: string;
};

function makeQrCells(seed: string) {
  const size = 15;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const inFinder =
      (row < 5 && col < 5) || (row < 5 && col >= size - 5) || (row >= size - 5 && col < 5);

    if (inFinder) {
      const localRow = row < 5 ? row : row - (size - 5);
      const localCol = col < 5 ? col : col - (size - 5);
      return (
        localRow === 0 ||
        localRow === 4 ||
        localCol === 0 ||
        localCol === 4 ||
        (localRow === 2 && localCol === 2)
      );
    }

    return ((hash >> ((row + col) % 24)) + row * 7 + col * 11) % 3 !== 0;
  });
}

function DetailIcon({
  icon: Icon,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}) {
  return (
    <View
      className="h-[16px] w-[16px] items-center justify-center rounded-full"
      style={{ backgroundColor: NAVY }}>
      <Icon size={9} color="#ffffff" strokeWidth={2.5} />
    </View>
  );
}

function QrCodeBlock({ seed }: { seed: string }) {
  const cells = useMemo(() => makeQrCells(seed), [seed]);

  return (
    <View
      className="items-center justify-center rounded-md border bg-white p-[4px]"
      style={{ borderColor: GOLD }}>
      <View className="h-[56px] w-[56px] flex-row flex-wrap bg-white">
        {cells.map((isDark, index) => (
          <View
            key={`${seed}-${index}`}
            style={{
              width: 3.73,
              height: 3.73,
              backgroundColor: isDark ? '#050505' : '#ffffff',
            }}
          />
        ))}
      </View>
    </View>
  );
}

function MemberPhoto({ card }: { card: UserCardRecord }) {
  const passportPhotoUrl = card.passportPhotoUrl || cloudfrontAssetUrl(card.passportPhoto);

  return (
    <View
      className="h-[112px] w-[76px] overflow-hidden rounded-md border-[0.5px] bg-slate-100"
      style={{ borderColor: NAVY }}>
      {passportPhotoUrl ? (
        <Image source={{ uri: passportPhotoUrl }} className="h-full w-full" resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={['#e8f2ff', '#d6efe7']}
          style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Text className="text-xl font-extrabold" style={{ color: NAVY }}>
            {getInitials(card.fullName)}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

export function IdCardView({ card, className, isPreview = false }: IdCardViewProps) {
  const memberId = card.memberShipId || 'RH-MEM-PENDING';
  const detailRows: DetailRow[] = [
    { label: 'Name', value: card.fullName, icon: UserRound },
    { label: 'Member ID', value: memberId, icon: IdCard },
    { label: 'Membership', value: 'Free Member', icon: UsersRound },
    { label: 'Profession', value: formatProfession(card.profession), icon: BriefcaseBusiness },
    { label: 'Organization', value: card.organizationName || 'Not provided', icon: Building2 },
    { label: 'City', value: `${card.city}, ${card.state}`, icon: MapPin },
    { label: 'Valid Till', value: formatDate(card.validityDate), icon: CalendarDays },
    {
      label: 'Status',
      value: card.isActive ? 'Active' : 'Inactive',
      icon: ShieldCheck,
      valueClassName: card.isActive ? 'text-emerald-700' : 'text-red-600',
    },
  ];

  return (
    <View
      className={cn(
        'w-full overflow-hidden rounded-lg border bg-white shadow-md shadow-black/20',
        className
      )}
      style={{ aspectRatio: 3 / 2, borderColor: '#fff' }}>
      <View
        className="absolute bottom-0 left-0 right-0 h-[38px]"
        style={{ backgroundColor: NAVY }}
      />
      <View
        className="absolute bottom-[36px] left-0 right-0 h-[3px]"
        style={{ backgroundColor: GOLD }}
      />
      <View
        className="absolute right-0 top-0 h-[48px] w-[58px] rounded-bl-md"
        style={{ backgroundColor: NAVY }}
      />
      {/* <View
        className="absolute right-[98px] top-0 h-[52px] w-[3px]"
        style={{ backgroundColor: GOLD }}
      /> */}

      <View className="flex-1 px-[12px] pb-[40px] pt-[10px]">
        <View className="h-[56px] flex-row items-start">
          <View className="flex-row">
            <Image source={RH_LOGO} className="h-[28px] w-[38px]" resizeMode="contain" />
            {/* <View className="ml-[9px] h-[38px] w-[1px] bg-slate-300" /> */}
            <View className="ml-[9px]">
              <Text className="font-extrabold leading-[19px] text-black">RH HEALTHCARE</Text>
              <Text
                className="text-[7px] font-bold uppercase leading-[10px]"
                style={{ color: GOLD }}>
                Simulation | Education | Research
              </Text>
              {/* <Text className="text-[7px] font-semibold leading-[10px]" style={{ color: NAVY }}>
                Building Competence. Enhancing Care.
              </Text> */}
            </View>
          </View>

          <View className="absolute right-0 top-0 items-center">
            <Text className="text-[10px] font-extrabold uppercase leading-[15px] text-white">
              Free
            </Text>
            <Text className="text-[8px] uppercase leading-[13px] text-white">Member</Text>
            {/* <Text className="text-[12px] leading-[16px]" style={{ color: GOLD }}>
              - * * * -
            </Text> */}
          </View>
        </View>

        <View className="flex-1 flex-row items-start gap-1">
          <MemberPhoto card={card} />

          <View className="ml-[8px] h-full flex-1 gap-[1px] pt-[2px]">
            <Text className={cn('font-extrabold capitalize leading-[12px] text-blue-950')}>
              {detailRows[0].value}
            </Text>

            <View className="gap-0.5 py-1.5">
              <Text className={cn('text-[10px] font-bold text-neutral-900')}>
                {detailRows[3].value}
              </Text>
              <Text className={cn('text-[10px] font-bold text-neutral-900')}>
                {detailRows[4].value}
              </Text>
              <Text className={cn('text-[10px] font-bold text-neutral-900')}>
                {detailRows[5].value}
              </Text>
            </View>
            <View className={`h-[0.5px] w-[80%] bg-[#c9a24a]`}></View>
            <View className="flex-1 gap-1 pt-1">
              <Text className={cn('text-[10px] font-bold capitalize text-neutral-900')}>
                membership id
              </Text>
              <Text
                className={cn('text-sm font-extrabold capitalize leading-[10px] text-blue-950')}>
                {detailRows[1].value}
              </Text>
            </View>

            {/* {detailRows.splice(0, 5).map((row) => (
              <View key={row.label} className="flex-row items-center">
                <DetailIcon icon={row.icon} />
                <Text className="ml-[5px] w-[50px] text-[8px] font-bold leading-[10px] text-black">
                  {row.label}
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                  className={cn(
                    'flex-1 text-[9px] font-extrabold leading-[11px]',
                    row.valueClassName
                  )}
                  style={!row.valueClassName ? { color: NAVY } : undefined}>
                  {row.value}
                </Text>
                {row.label === 'Status' && card.isActive ? (
                  <View className="ml-[3px]">
                    <CheckCircle2 size={12} color="#118443" fill="#118443" />
                  </View>
                ) : null}
              </View>
            ))} */}
          </View>

          <View className="ml-[4px] items-center pt-[16px]">
            <QrCodeBlock seed={memberId} />
            <View
              className="mt-[1px] w-[58px] items-center rounded-b-md px-[3px] py-[3px]"
              // style={{ backgroundColor: NAVY }}
            >
              <Text className="text-center text-[6px] font-semibold uppercase leading-[8px] text-black">
                Scan to Verify
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 h-[38px] flex-row items-center justify-between px-[14px]">
        <View className="flex-row items-center">
          <CalendarDays size={16} color={GOLD} />
          <View className="ml-1">
            <Text className="text-[8px] font-bold text-white">Valid till</Text>
            <Text className="text-[8px] font-bold text-white">{formatDate(card.validityDate)}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <CalendarDays size={16} color={GOLD} />
          <View className="ml-1">
            <Text className="text-[8px] font-bold text-white">Member since</Text>
            <Text className="text-[8px] font-bold text-white">
              {formatDate(card.createdAt).split(' ').slice(1).join(' ')}
            </Text>
          </View>
        </View>
        <View className="flex-row">
          <Globe size={10} color="#ffffff" className="mt-1" />
          <Text className="ml-[5px] text-[7px] font-semibold text-white">
            www.rhhealthcaresimulation.com
          </Text>
        </View>
      </View>

      {isPreview ? (
        <View className="absolute left-[8px] top-[8px] rounded-sm bg-amber-100 px-[5px] py-[2px]">
          <Text className="text-[7px] font-extrabold uppercase" style={{ color: NAVY }}>
            Preview
          </Text>
        </View>
      ) : null}
    </View>
  );
}
