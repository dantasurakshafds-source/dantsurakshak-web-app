import React from 'react'
import UpdateDentalEmer from '../component/updateDentalEmergency'
 

async function page({params}:{params:Promise<{id:string}>}) {
  const id=(await params).id
 
  return (
    <>
    <UpdateDentalEmer id={id}/>
    </>
  )
}

export default page