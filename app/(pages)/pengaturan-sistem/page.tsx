import { Metadata } from 'next';
import { getSystemSettings } from '@/lib/settings';
import SystemSettingsClient from './SystemSettingsClient';

export const metadata: Metadata = {
  title: 'Pengaturan Sistem',
};

export default async function SystemSettingsPage() {
  const settings = await getSystemSettings();
  return <SystemSettingsClient initialSettings={settings} />;
}
