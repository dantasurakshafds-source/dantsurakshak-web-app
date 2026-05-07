'use client' 

import dynamic from 'next/dynamic';
const AddDisease = dynamic(
  () => import('./component/addDisease'),  
  { ssr: false }
);
export default function Page() {
  return <AddDisease />;
}
