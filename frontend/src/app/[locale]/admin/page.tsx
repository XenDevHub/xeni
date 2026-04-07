import { redirect } from '@/i18n/routing';

export default function AdminRootRedirect() {
  redirect('/admin/overview');
  return null;
}
