import React from 'react';
import { Tabs, router } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Receipt, Layers, MoreHorizontal, Plus } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D6847',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <Receipt size={22} color={color} />,
        }}
      />

      {/* Central Floating Action Button (+) */}
      <Tabs.Screen
        name="fab-placeholder"
        options={{
          title: '',
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.fabButton}
              onPress={() => router.push('/modal/quick-actions')}
              activeOpacity={0.85}
            >
              <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color }) => <Layers size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <MoreHorizontal size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0D6847',
    elevation: 6,
    shadowColor: '#0D6847',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
