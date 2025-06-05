import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: "com.anujupadhyay.MedRemind",
  },
});