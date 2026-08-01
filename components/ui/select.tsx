import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import { cn } from '@/lib/utils';
import { Text } from './text';

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

type SelectProps<T extends string> = {
  label: string;
  value: T | '';
  options: SelectOption<T>[];
  placeholder: string;
  onValueChange: (value: T) => void;
  className?: string;
};

export function Select<T extends string>({
  label,
  value,
  options,
  placeholder,
  onValueChange,
  className,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View className={className}>
      <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-12 flex-row items-center justify-between rounded-lg border border-slate-200 bg-white px-3 active:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:active:bg-neutral-800">
        <Text
          numberOfLines={1}
          className={cn(
            'flex-1 text-base',
            selectedOption ? 'text-slate-950 dark:text-white' : 'text-slate-400'
          )}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={18} color="#64748b" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <View className="max-h-[72%] rounded-t-2xl bg-white p-5 dark:bg-neutral-900">
            <Text className="mb-4 text-lg font-bold dark:text-white">{label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.75}
                    onPress={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    className="min-h-12 flex-row items-center justify-between border-b border-slate-100 py-3 dark:border-neutral-800">
                    <Text className="text-base text-slate-800 dark:text-slate-100">
                      {option.label}
                    </Text>
                    {isSelected ? <Check size={18} color="#047857" /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
