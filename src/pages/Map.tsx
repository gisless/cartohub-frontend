import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

export function Map(): React.ReactNode {
  const { map_id } = useParams<{ map_id: string }>()

  const { isFetching } = useQuery(['map', map_id], async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true }
  })

  return <div>
    <dl>
      <dt>Map ID</dt>
      <dd>{ map_id }</dd>
    </dl>
    <dl>
      <dt>Status</dt>
      <dd>{ isFetching ? 'Fetching...' : 'OK!' }</dd>
    </dl>
  </div>
}
