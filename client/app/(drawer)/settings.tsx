// Snitch 2.0 — Settings Screen
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCurrency } from '../../context/CurrencyContext';
import Colors from '../../constants/colors';

export default function SettingsScreen() {
  const { currencyCode, setCurrency } = useCurrency();
  const [notifications, setNotifications] = React.useState(true);

  const toggleCurrency = () => {
    setCurrency(currencyCode === 'USD' ? 'INR' : 'USD');
  };

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', hasSwitch: true, value: notifications, onToggle: () => setNotifications(!notifications) },
        { icon: 'cash-outline', label: 'Currency', detail: currencyCode === 'USD' ? 'USD ($)' : 'INR (₹)', onPress: toggleCurrency },
        { icon: 'globe-outline', label: 'Language', detail: 'English' },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: 'information-circle-outline', label: 'About Snitch', detail: '' },
        { icon: 'document-text-outline', label: 'Terms of Service', detail: '' },
        { icon: 'shield-outline', label: 'Privacy Policy', detail: '' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.settingItem, ii < section.items.length - 1 && styles.settingBorder]}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.7 : 1}
                  disabled={!item.onPress && !item.hasSwitch}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <Ionicons name={item.icon as any} size={20} color={Colors.textPrimary} />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  {item.hasSwitch ? (
                    <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ false: Colors.border, true: Colors.textPrimary }} thumbColor={Colors.surface} />
                  ) : (
                    <View style={styles.settingRight}>
                      {item.detail ? <Text style={styles.settingDetail}>{item.detail}</Text> : null}
                      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: { backgroundColor: Colors.surfaceLight, borderRadius: 16, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  settingBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingDetail: { fontSize: 14, color: Colors.textTertiary },
});
