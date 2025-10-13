import React, { useState } from 'react';
import Head from 'next/head';
import { SimplifiedDashboard } from '../../src/components/admin/SimplifiedDashboard';
import { withAdminAuth } from '../../src/utils/adminAuth';

export const getServerSideProps = withAdminAuth(async () => ({ props: {} }));

export default function AdminPage() {
  return (
    <>
      <Head>
        <title>Admin Dashboard - OMA Digital</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <SimplifiedDashboard />
    </>
  );
}
