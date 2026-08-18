/**
 * In-box overlay showing the category short-code and the box's live render
 * count. Rendered in a dark translucent pill so it stays legible on any theme
 * background.
 */

import React from "react";
import { Text, View } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

type BoxContentProps = {
  label: string;
  count: number;
};

const stylesheet = createStyleSheet({
  pill: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "700",
  },
  count: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});

function BoxContent({ label, count }: BoxContentProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

export { BoxContent };
