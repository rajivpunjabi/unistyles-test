// Unistyles v3 must be configured before any StyleSheet.create runs, so the
// config is imported before expo-router mounts the app.
import './src/styles/init';
import 'expo-router/entry';
