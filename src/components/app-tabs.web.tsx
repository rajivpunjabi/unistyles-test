import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps } from 'expo-router/ui';
import React from 'react';
import { Pressable, Text, useColorScheme, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const { styles } = useStyles(stylesheet);

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="static" href="/static" asChild>
            <TabButton>Static</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function CustomTabList({ children, ...props }: React.PropsWithChildren) {
  const { styles } = useStyles(stylesheet);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={[styles.tabList, { backgroundColor: colors.backgroundElement }]}>
      {children}
    </View>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Pressable {...props}>
      <Text style={{ color: isFocused ? colors.text : colors.textSecondary, fontWeight: '600' }}>
        {children}
      </Text>
    </Pressable>
  );
}

const stylesheet = createStyleSheet({
  slot: {
    height: '100%',
  },
  tabList: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 8,
    borderRadius: 32,
  },
});
