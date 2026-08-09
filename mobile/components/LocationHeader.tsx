import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface LocationHeaderProps {
  locationName?: string;
  userName?: string;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  hasUnreadNotifications?: boolean;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({
  locationName = 'Vellakovil',
  userName = 'Aswin',
  onLocationPress,
  onNotificationPress,
  onProfilePress,
  hasUnreadNotifications = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Location Selector */}
      <TouchableOpacity
        style={styles.locationSelector}
        onPress={onLocationPress}
        activeOpacity={0.7}
        accessibilityLabel={`Location selected: ${locationName}`}
        accessibilityRole="button"
      >
        <View style={styles.locationIconBadge}>
          <Ionicons name="location-sharp" size={16} color={Colors.primaryDeep} />
        </View>
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationLabel}>LOCATION</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationName} numberOfLines={1}>
              {locationName}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.primaryDeep} style={styles.chevron} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Header Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          {hasUnreadNotifications && <View style={styles.unreadDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          activeOpacity={0.8}
          accessibilityLabel="User Profile"
          accessibilityRole="button"
        >
          <Avatar name={userName} size={40} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.xs,
    marginBottom: Theme.spacing.sm,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  locationIconBadge: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.xs + 4,
  },
  locationTextContainer: {
    justifyContent: 'center',
  },
  locationLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondaryText,
    letterSpacing: 0.8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginRight: 4,
  },
  chevron: {
    marginTop: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs + 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  profileButton: {
    padding: 2,
  },
});
