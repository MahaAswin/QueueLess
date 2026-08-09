import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function ShopProfileScreen() {
  const router = useRouter();
  const { setActiveRole } = useAuthStore();

  const handleSwitchToCustomer = () => {
    setActiveRole('CUSTOMER');
    router.replace('/(customer)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Avatar name="Green Leaf Owner" size={72} />
        <Text style={styles.userName}>Green Leaf Organic Café</Text>
        <Text style={styles.userEmail}>owner@greenleafcafe.com</Text>
      </View>

      <TouchableOpacity style={styles.switchCard} onPress={handleSwitchToCustomer}>
        <Ionicons name="person-outline" size={24} color={Colors.primaryDeep} />
        <View style={styles.switchContent}>
          <Text style={styles.switchTitle}>Switch to Customer Mode</Text>
          <Text style={styles.switchSub}>Experience zero-wait ordering as a customer</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
      </TouchableOpacity>

      <Button title="Return to QueueLess Landing" variant="outline" onPress={() => router.replace('/')} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: Theme.spacing.md, paddingTop: Theme.spacing.xl + 10 },
  header: { alignItems: 'center', marginBottom: Theme.spacing.xl },
  userName: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.bold, color: Colors.text, marginTop: Theme.spacing.sm },
  userEmail: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
  switchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.lg, borderWidth: 1, borderColor: Colors.sage, marginBottom: Theme.spacing.xl },
  switchContent: { flex: 1, marginLeft: Theme.spacing.sm },
  switchTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  switchSub: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
  btn: { marginTop: Theme.spacing.md },
});
