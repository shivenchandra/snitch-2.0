import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/colors';

const FAQS = [
  {
    question: 'How do I track my order?',
    answer: 'You can track your order status in the "My Orders" tab. Once shipped, a tracking link will be provided.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day hassle-free return policy. Items must be unworn and in their original packaging.',
  },
  {
    question: 'Can I change my shipping address?',
    answer: 'Yes, but only if the order is still in the "Pending" or "Processing" state. Please contact support immediately.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Currently, we only ship domestically. We are working on expanding our reach in the near future.',
  },
];

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

export default function HelpScreen() {
  return (
    <AnimatedSafeArea style={styles.container} entering={FadeInRight.duration(400)}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <Ionicons name="chatbubbles" size={28} color={Colors.textPrimary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Need immediate help?</Text>
            <Text style={styles.contactSub}>Chat with our support team</Text>
          </View>
          <TouchableOpacity style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqList}>
          {FAQS.map((faq, index) => (
            <Animated.View key={index} style={styles.faqCard} entering={FadeInDown.delay(index * 100).duration(400)}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </AnimatedSafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 40 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  contactSub: { fontSize: 13, color: Colors.textSecondary },
  contactBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactBtnText: { color: Colors.textWhite, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  faqList: { gap: 12 },
  faqCard: {
    backgroundColor: Colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
