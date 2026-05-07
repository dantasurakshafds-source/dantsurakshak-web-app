import React from 'react'
import UpdateTermsAndConditions from '../component/UpdateTerms'



async function page({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    return (
        <>
            <UpdateTermsAndConditions id={id} />
        </>
    )
}

export default page