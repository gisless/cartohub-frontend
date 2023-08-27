import { useParams } from 'react-router-dom'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useGcpCanvas } from '../hooks/useGcpCanvas'
import { StyleSpecification } from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'

const checkTilesStatus = async (url_format: string) => {
  const url = url_format
    .replace('{z}', '0')
    .replace('{x}', '0')
    .replace('{y}', '0')
  const resp = await fetch(url, { method: 'HEAD' })
  if(resp.status > 199 && resp.status < 400) {
    return true
  } else {
    return false
  }
}

export function Map(): React.ReactNode {  const { map_id } = useParams<{ map_id: string }>()

  if(!map_id || !map_id.match(/^[0-9,a-f]+$/)) {
    throw new Error('Invalid map_id')
  }
  const raw_image_tile_url = import.meta.env.VITE_CARTOHUB_RASTER_TILE_ENDPOINT + `/${map_id}/{z}/{x}/{y}.png`

  const { isLoading } = useQuery(['tile-status', map_id], () => checkTilesStatus(raw_image_tile_url), {
    retry: 10,
    retryDelay: 1000 * 10,
  })

  const canvasStyle = {
    version: 8,
    sources:{
      'image-canvas': {
        type:'raster',
        tiles: [raw_image_tile_url],
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#000000',
        },
      },
      {
        id: 'image-canvas',
        type: 'raster',
        source: 'image-canvas',
      }
    ],
  } as StyleSpecification

  const {
    containerRef: imageCanvasContainerRef,
    gcpList: imageGcpList,
  } = useGcpCanvas({ style: canvasStyle, color: 'red' })

  const mapStyle = 'https://demotiles.maplibre.org/style.json'
  const {
    containerRef: mapCanvasContainerRef,
    gcpList: mapGcpList,
  } = useGcpCanvas({ style: mapStyle, color: 'green' })

  const gcpListLength = Math.max(imageGcpList.length, mapGcpList.length)

  return <>
    <dl>
      <dt>Map ID</dt>
      <dd>{ map_id }</dd>
      <dt>Map Tile Status</dt>
      <dd>{ isLoading ? 'Checking...' : 'Ready' }</dd>
    </dl>


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

  </>
}
