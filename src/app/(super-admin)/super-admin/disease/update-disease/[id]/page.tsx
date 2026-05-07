import React from 'react'
import UpdateDiseasePage from '../component/updateDisease'

async function page({params}:{params:Promise<{id:string}>}) {
  const id=(await params).id
  return (
    <>
    <UpdateDiseasePage id={id}/>
    </>
  )
}

export default page