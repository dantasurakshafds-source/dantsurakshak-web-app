import React from 'react'
import EditHabitsHealth from '../component/updateHabithealth'
 

async function page({params}:{params:Promise<{id:string}>}) {
  const id=(await params).id
  return (
    <>
    <EditHabitsHealth id={id}/>
    </>
  )
}

export default page