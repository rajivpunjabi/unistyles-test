import { StyleSheet, Text, View } from 'react-native';

export default function PlaygroundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Playground</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
  },
});
