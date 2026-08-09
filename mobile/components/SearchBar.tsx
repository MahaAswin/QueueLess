import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './Input';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search shops or products...',
  onFilterPress,
}) => {
  return (
    <View style={styles.container}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        leftIcon={<Ionicons name="search-outline" size={20} color={Colors.secondaryText} />}
        rightIcon={
          value.length > 0 ? (
            <TouchableOpacity onPress={() => onChangeText('')}>
              <Ionicons name="close-circle" size={18} color={Colors.secondaryText} />
            </TouchableOpacity>
          ) : undefined
        }
        containerStyle={styles.inputWrapper}
      />
      {onFilterPress && (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <Ionicons name="options-outline" size={20} color={Colors.primaryDeep} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
  },
});
