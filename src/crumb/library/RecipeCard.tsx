// The shelf/grid recipe card. Full-bleed cover, gradient-faded text at the
// bottom, a press-driven lift + deepening shadow, and a staggered fade/rise
// entrance so a hundred-card grid still feels calm rather than chaotic.

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { CrumbTheme, fonts, hearth } from '../../theme/crumb';
import type { LibraryRecipe } from './types';
import { DishPhoto, photoTextShadow } from './DishPhoto';
import { PhotoCover } from './PhotoCover';

// Extra width rendered either side of the cover so a parallax shift never
// reveals blank space at the crop edges.
const PARALLAX_PAD = 26;

export function RecipeCard({
  recipe,
  theme,
  width,
  height,
  index = 0,
  variant = 'shelf',
  onPress,
  scrollX,
  cardStride,
}: {
  recipe: LibraryRecipe;
  theme: CrumbTheme;
  width: number;
  height: number;
  index?: number;
  variant?: 'shelf' | 'grid';
  onPress: () => void;
  /** Row's horizontal scroll position — enables the image parallax. */
  scrollX?: Animated.Value;
  /** Distance in px between one card's start and the next, for parallax math. */
  cardStride?: number;
}) {
  const [pressed, setPressed] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const shadow = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.min(index, 12) * 45;
    Animated.timing(entrance, {
      toValue: 1,
      duration: 480,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const press = (down: boolean) => {
    setPressed(down);
    Animated.spring(scale, { toValue: down ? 1.035 : 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
    Animated.timing(shadow, { toValue: down ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  };

  const entranceStyle = {
    opacity: entrance,
    transform: [
      { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
      { scale },
    ],
  };

  const shadowOpacity = shadow.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] });
  const shadowRadius = shadow.interpolate({ inputRange: [0, 1], outputRange: [8, 20] });
  const shadowOffsetY = shadow.interpolate({ inputRange: [0, 1], outputRange: [3, 12] });

  // A real photo's gradient deepens to a warm dark brown, so the overlay text
  // switches to the hearth's cream tone (plus a soft shadow) instead of the
  // illustrated cover's dark ink-on-pale-fade scheme.
  const overPhoto = !!recipe.photoSource;
  const titleColor = overPhoto ? hearth.ink : theme.ink;
  const mutedColor = overPhoto ? hearth.inkMuted : theme.muted;
  const textShadow = overPhoto ? photoTextShadow : undefined;

  const cover = recipe.photoSource ? (
    <DishPhoto source={recipe.photoSource} pressed={pressed} height={height} />
  ) : (
    <PhotoCover theme={theme} hue={recipe.hue} art={recipe.art} pressed={pressed} height={height} />
  );

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: variant === 'shelf' ? 20 : 18 },
        entranceStyle,
        {
          shadowColor: '#000',
          shadowOpacity: shadowOpacity as any,
          shadowRadius: shadowRadius as any,
          shadowOffset: { width: 0, height: shadowOffsetY as any },
          elevation: pressed ? 10 : 3,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => press(true)}
        onPressOut={() => press(false)}
        style={{ flex: 1, borderRadius: variant === 'shelf' ? 20 : 18, overflow: 'hidden' }}
      >
        {scrollX && cardStride ? (
          <Animated.View
            style={{
              position: 'absolute',
              left: -PARALLAX_PAD,
              right: -PARALLAX_PAD,
              top: 0,
              height,
              transform: [
                {
                  translateX: scrollX.interpolate({
                    inputRange: [
                      (index - 1) * cardStride,
                      index * cardStride,
                      (index + 1) * cardStride,
                    ],
                    outputRange: [-PARALLAX_PAD, 0, PARALLAX_PAD],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}
          >
            {cover}
          </Animated.View>
        ) : (
          cover
        )}

        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.metaRow}>
            {recipe.minutes <= 30 && (
              <View style={[styles.metaPill, { backgroundColor: theme.surf }]}>
                <Ionicons name="time-outline" size={10} color={theme.acc} />
                <Text style={[styles.metaText, { color: theme.acc }]}>{recipe.minutes}m</Text>
              </View>
            )}
            {recipe.spice > 0 && (
              <View style={[styles.metaPill, { backgroundColor: theme.surf }]}>
                {Array.from({ length: recipe.spice }).map((_, i) => (
                  <Ionicons key={i} name="flame" size={10} color={theme.acc} style={{ marginLeft: i > 0 ? -2 : 0 }} />
                ))}
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: titleColor }, textShadow]} numberOfLines={2}>
            {recipe.title}
          </Text>
          {variant === 'shelf' && (
            <Text style={[styles.desc, { color: mutedColor }, textShadow]} numberOfLines={2}>
              {recipe.description}
            </Text>
          )}
          <Text style={[styles.subTag, { color: mutedColor }, textShadow]}>{recipe.subTag}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, gap: 3 },
  metaRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  metaText: { fontFamily: fonts.sansMedium, fontSize: 10 },
  title: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 20 },
  desc: { fontFamily: fonts.sansLight, fontSize: 12, lineHeight: 16, marginTop: 2 },
  subTag: {
    fontFamily: fonts.sans,
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 3,
  },
});
