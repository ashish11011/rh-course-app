import { BellRing, Settings, X } from 'lucide-react-native';
import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type NotificationPermissionSheetProps = {
  visible: boolean;
  mode: 'request' | 'settings';
  onAllow: () => void;
  onDismiss: () => void;
  onOpenSettings: () => void;
};

export function NotificationPermissionSheet({
  visible,
  mode,
  onAllow,
  onDismiss,
  onOpenSettings,
}: NotificationPermissionSheetProps) {
  const isSettingsMode = mode === 'settings';

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View className="flex-1 justify-end bg-black/45">
        <Pressable className="flex-1" onPress={onDismiss} />
        <View className="rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl shadow-black/20 dark:bg-neutral-950">
          <View className="mb-4 flex-row justify-center">
            <View className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-neutral-800" />
          </View>

          <View className="flex-row items-start gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
              {isSettingsMode ? (
                <Settings size={24} color="#047857" />
              ) : (
                <BellRing size={24} color="#047857" />
              )}
            </View>

            <View className="flex-1">
              <Text className="text-xl font-extrabold text-slate-950 dark:text-white">
                {isSettingsMode ? 'Notifications are off' : 'Enable notifications'}
              </Text>
              <Text className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                {isSettingsMode
                  ? 'Turn on notifications in settings to receive course, workshop, certificate, and account updates.'
                  : 'Get important updates about courses, workshops, certificates, and your account.'}
              </Text>
            </View>

            <Pressable
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-900"
              onPress={onDismiss}>
              <X size={18} color="#64748b" />
            </Pressable>
          </View>

          <View className="mt-6 gap-3">
            <Button
              className="h-12 rounded-lg bg-green-700 active:bg-green-800"
              onPress={isSettingsMode ? onOpenSettings : onAllow}>
              <Text className="font-semibold text-white">
                {isSettingsMode ? 'Open Settings' : 'Allow Notifications'}
              </Text>
            </Button>
            <Button variant="outline" className="h-12 rounded-lg" onPress={onDismiss}>
              <Text className="font-semibold text-slate-700 dark:text-slate-100">Not now</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
