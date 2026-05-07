import React from 'react'
import UpdatePrivacyPolicy from '../component/updatePrivacyPolicy'
 
 

async function page({params}:{params:Promise<{id:string}>}) {
  const id=(await params).id
  return (
    <>
     <UpdatePrivacyPolicy id={id}/>
    </>
  )
}

export default page