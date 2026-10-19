/** StarRating — filled / half / empty stars with optional interactive */
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  size = 24,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const { theme } = useTheme();

  const renderStar = useCallback(
    (index: number) => {
      const starValue = index + 1;
      let iconName: 'star' | 'star-border' | 'star-half' = 'star-border';

      if (rating >= starValue) {
        iconName = 'star';
      } else if (rating >= starValue - 0.5) {
        iconName = 'star-half';
      }

      const handlePress = () => {
        if (interactive && onChange) {
          onChange(starValue);
        }
      };

      return (
        <Pressable
          key={index}
          onPress={handlePress}
          disabled={!interactive}
          style={styles.starContainer}
          accessibilityLabel={`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
          accessibilityHint={interactive ? 'Double tap to rate' : undefined}
          accessibilityRole={interactive ? 'button' : 'none'}
        >
          <MaterialIcons name={iconName} size={size} color={theme.warning} />
        </Pressable>
      );
    },
    [rating, size, interactive, onChange]
  );

  return (
    <View style={styles.container} accessibilityLabel={`${rating.toFixed(1)} star rating`}>
      {[0, 1, 2, 3, 4].map(renderStar)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    padding: 2,
  },
});
