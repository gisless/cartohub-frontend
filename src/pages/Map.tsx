import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useGcpCanvas } from '../hooks/useGcpCanvas'

export function Map(): React.ReactNode {
  const { map_id } = useParams<{ map_id: string }>()

  const { isFetching } = useQuery(['map', map_id], async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true }
  })

  const style = 'https://demotiles.maplibre.org/style.json'
  const {
    containerRef: imageCanvasContainerRef,
    gcpList: imageGcpList,
  } = useGcpCanvas({
    style,
    enabled: isFetching,
    color: 'red',
  })

  const {
    containerRef: mapCanvasContainerRef,
    gcpList: mapGcpList,
  } = useGcpCanvas({
    style,
    enabled: isFetching,
    color: 'green',
  })

  const gcpListLength = Math.max(imageGcpList.length, mapGcpList.length)

  return <div>
    <dl>
      <dt>Map ID</dt>
      <dd>{ map_id }</dd>
    </dl>
    <dl>
      <dt>Status</dt>
      <dd>{ isFetching ? 'Fetching...' : 'OK!' }</dd>
    </dl>

    {
      isFetching || (
        <div>
          <h2>Warping</h2>
          <div className="flex">
            <div className={'m-1 h-[500px] w-1/2'} ref={ imageCanvasContainerRef }></div>
            <div className={'m-1 h-[500px] w-1/2'} ref={ mapCanvasContainerRef }></div>
          </div>
          {
            (imageGcpList.length > 0 || mapGcpList.length > 0) && <>
              <h2>Ground Control Points</h2>
              <table>
                <thead>
                  <tr>
                    <th>index</th>
                    <th>Image</th>
                    <th>Map</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    Array(gcpListLength).fill(0).map((_, index) => {
                      const imageGcp = imageGcpList[index] || { lat: '-', lng: '-' }
                      const mapGcp = mapGcpList[index] || { lat: '-', lng: '-' }
                      return <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{`${imageGcp.selected ? '★' : ''} ${imageGcp.lat}, ${imageGcp.lng}`}</td>
                        <td>{`${mapGcp.selected ? '★' : ''} ${mapGcp.lat}, ${mapGcp.lng}`}</td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </>
          }
        </div>
      )
    }
  </div>
}
