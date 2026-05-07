
import UpdateSlider from '../components/updateSlider'

async function page({params}:{params:Promise<{id:string}>}) {
    const id=(await (params)).id
  return (
    <UpdateSlider id={id}/>
  )
}

export default page