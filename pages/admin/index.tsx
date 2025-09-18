import React from 'react';
import Head from 'next/head';
import { StableAdminDashboard } from '../../src/components/admin/StableAdminDashboard';

import { withAdminAuth } from '../../src/utils/adminAuth';

export const getServerSideProps = withAdminAuth(async () => ({ props: {} }));

export default function AdminPage() {
  return (
    <>
      <Head>
        <title>Admin Dashboard - OMA Digital</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <StableAdminDashboard />
    </>
  );
}