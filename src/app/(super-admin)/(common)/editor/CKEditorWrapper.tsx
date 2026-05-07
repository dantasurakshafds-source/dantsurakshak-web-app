
'use client'
import dynamic from 'next/dynamic';
const CKEditorWrapper = dynamic( () => import( './CKEditor' ), { ssr: false } );
export default CKEditorWrapper;
