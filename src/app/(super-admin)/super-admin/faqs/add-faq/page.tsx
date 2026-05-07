'use client' 

import dynamic from 'next/dynamic';
 
const FaqFormCKEditor = dynamic(
  () => import('./component/addFaqs'),  
  { ssr: false }
);
export default function Page() {
  return < FaqFormCKEditor/>;
}