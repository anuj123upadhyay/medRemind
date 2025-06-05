import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  Animated,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import { createCommonStyles, spacing, typography, borderRadius } from '../utils/StyleSystem';
import Button from '../components/Button';
import { registerForPushNotificationsAsync } from '../utils/notifications';

const { width, height } = Dimensions.get('window');

// Onboarding screens data
const slides = [
  {
    id: '1',
    title: 'Welcome to MedRemind',
    description: 'Your personal medication companion to help you stay on track with your health journey.',
    image: require('../assets/images/icon.png'),
    icon: 'medical-outline' as const,
    color: ['#4c669f', '#3b5998', '#192f6a'] as unknown as readonly [string, string],
  },
  {
    id: '2',
    title: 'Never Miss a Dose',
    description: 'Get timely reminders for your medications and track your adherence with beautiful visualizations.',
    image: require('../assets/images/icon.png'),
    icon: 'notifications-outline' as const,
    color: ['#00b09b', '#96c93d'] as unknown as readonly [string, string],
  },
  {
    id: '3',
    title: 'Manage Your Medications',
    description: 'Easily add, edit and keep track of all your medications in one place.',
    image: require('../assets/images/icon.png'),
    icon: 'list-outline' as const,
    color: ['#ff9966', '#ff5e62'] as unknown as readonly [string, string],
  },
  {
    id: '4',
    title: 'Ready to Start?',
    description: 'Allow notifications to get timely reminders and make the most of MedRemind.',
    image: require('../assets/images/icon.png'),
    icon: 'checkmark-circle-outline' as const,
    color: ['#5f2c82', '#49a09d'] as unknown as readonly [string, string],
    isLast: true,
  },
];

export default function Onboarding() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const commonStyles = createCommonStyles(theme);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Animation values
  const inputRange = [(currentIndex - 1) * width, currentIndex * width, (currentIndex + 1) * width];
  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });
  
  // Handle skip
  const handleSkip = () => {
    router.replace('/home');
  };
  
  // Handle next
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };
  
  // Handle get started (on last slide)
  const handleGetStarted = async () => {
    // Request notification permissions
    await registerForPushNotificationsAsync();
    
    // Navigate to home
    router.replace('/home');
  };
  
  // Handle slide change
  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };
  
  // Render slide item
  const renderItem = ({ item, index }: { item: typeof slides[0], index: number }) => {
    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.color as unknown as readonly [string, string]}
          style={styles.slideBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
            <View style={styles.iconBackground}>
              <Ionicons name={item.icon} size={120} color="white" />
            </View>
          </Animated.View>
        </LinearGradient>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          
          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  i === currentIndex ? styles.paginationDotActive : null,
                  { backgroundColor: i === currentIndex ? theme.primary : theme.border }
                ]}
              />
            ))}
          </View>
          
          {/* Footer Actions */}
          <View style={styles.buttonsContainer}>
            {!item.isLast && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            )}
            
            <Button 
              title={item.isLast ? "Get Started" : "Next"} 
              onPress={handleNext}
              icon={item.isLast ? undefined : "arrow-forward"}
              style={styles.nextButton}
            />
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  slide: {
    width,
    height: '100%',
  },
  slideBackground: {
    height: height * 0.5,
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.7,
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.header,
    fontSize: 28,
    color: theme.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: spacing.xs,
  },
  paginationDotActive: {
    width: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.xl,
  },
  skipButton: {
    padding: spacing.md,
  },
  skipButtonText: {
    color: theme.textSecondary,
    ...typography.body,
  },
  nextButton: {
    paddingHorizontal: spacing.xl,
  },
});