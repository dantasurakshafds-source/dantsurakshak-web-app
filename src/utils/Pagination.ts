 
import { NextRequest } from 'next/server'
import { PAGE_PER_PAGE_LIMIT } from './Constants'

export function ReusePaginationMethod(req: NextRequest) {
  const url = new URL(req.url)
  const searchParams = url.searchParams
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || PAGE_PER_PAGE_LIMIT
  const skip = limit * (page - 1)
  return { page, limit, skip }
}
