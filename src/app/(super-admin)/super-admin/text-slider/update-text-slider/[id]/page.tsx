import React from 'react'
import UpdateTextSlider from '../component/textSliderUpdate'
 
async function page({params}:{params:Promise<{id:string}>}) {
  const id=(await params).id
  return (
    <>
    <UpdateTextSlider id={id}/>
    </>
  )
}

export default page