import React from 'react'
import UpdateFaqFormCKEditor from '../component/updateFaq'
 

async function page({params}:{params:Promise<{id:string}>}) {
  const id=(await params).id
  return (
    <>
    <UpdateFaqFormCKEditor id={id}/>
    </>
  )
}

export default page