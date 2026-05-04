import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { BANNER_SLIDES } from '../../constants/products';
import Colors from '../../constants/colors';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 16;
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const ITEM_WIDTH = BANNER_WIDTH + GAP;
const BANNER_HEIGHT = 180;
const DotIndicator = ({ index, activeIndex }: { index: number; activeIndex: number }) => {
  const dotStyle = useAnimatedStyle(() => {
    const isActive = activeIndex === index;
    return {
      width: withSpring(isActive ? 24 : 8, { damping: 15 }),
      opacity: withSpring(isActive ? 1 : 0.3, { damping: 15 }),
    };
  });
  return <Animated.View style={[styles.dot, dotStyle]} />;
};

const BannerCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const activeValue = useSharedValue(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNER_SLIDES.length;
      scrollRef.current?.scrollTo({ x: nextIndex * ITEM_WIDTH, animated: true });
      setActiveIndex(nextIndex);
      activeValue.value = nextIndex;
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex]);
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / ITEM_WIDTH);
      if (index !== activeIndex && index >= 0 && index < BANNER_SLIDES.length) {
        setActiveIndex(index);
        activeValue.value = index;
      }
    },
    [activeIndex]
  );
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        contentContainerStyle={styles.scrollContent}
      >
        {BANNER_SLIDES.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.slide, 
              { 
                backgroundColor: slide.backgroundColor,
                marginRight: index === BANNER_SLIDES.length - 1 ? 0 : GAP 
              }
            ]}
          >
            <View style={styles.slideContent}>
              {slide.tag && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{slide.tag}</Text>
                </View>
              )}
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
            <Image
              source={{ uri: slide.image }}
              style={styles.slideImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      {}
      <View style={styles.pagination}>
        {BANNER_SLIDES.map((_, index) => (
          <DotIndicator key={index} index={index} activeIndex={activeIndex} />
        ))}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  slide: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  slideContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  slideImage: {
    width: 140,
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textPrimary,
  },
});
export default BannerCarousel;
