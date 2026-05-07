import React from 'react'
import UpdateMythFact from '../component/updateMythFacts'
 

async function page({params}:{params:Promise<{id:string}>}) {
  const id=(await params).id
  return (
    <>
    <UpdateMythFact id={id}/>
    </>
  )
}

export default page