import { useCallback, useEffect, useRef, useState } from 'react'
import maplibre from 'maplibre-gl'
import { StyleSpecification, IControl, Marker, Map, MapMouseEvent } from 'maplibre-gl'
import * as pmtiles from 'pmtiles';
const protocol = new pmtiles.Protocol();
maplibre.addProtocol("pmtiles",protocol.tile);

type Options = {
  color: string,
  style: string | StyleSpecification,
}

class TrashControl implements IControl {

  private onClick: () => void

  constructor({ onClick } : { onClick: () => void }) {
    this.onClick = onClick
  }

  onAdd() {
    const container = document.createElement('div')
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    const button = document.createElement('button')
    button.style.display = 'flex' // maplibre-ctrl has priority over tailwind CSS
    button.className = 'justify-center items-center'
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>`
    container.append(button)
    button.addEventListener('click', () => {
      this.onClick()
    })
    return container
  }
  onRemove() {}
}

const renumberMarker = (marker: Marker, index: number, selected: boolean) => {
  const markerElement = marker.getElement()
  const prevNumberElement = markerElement.querySelectorAll('span.__cartohub-marker-number')
  prevNumberElement.forEach((element) => element.remove())
  const numberElement = document.createElement('span')
  numberElement.className = '__cartohub-marker-number '
  numberElement.className += 'fixed top-[3.5px] left-[3.5px] rounded-full w-5 h-5 flex justify-center items-center text-sm '
  if(selected) {
    numberElement.className += 'bg-[yellow] text-black'
  } else {
    numberElement.className += 'bg-white text-black'
  }
  numberElement.textContent = `${index + 1}`
  markerElement.append(numberElement)
}

export const useGcpCanvas = ({ color, style }: Options) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gcpList, setGcpList] = useState<{marker: Marker, selected: boolean, lat: number, lng: number }[]>([])

  const onDeleteClick = useCallback(() => {
    setGcpList((gcpList) => {
      const selectedMarkerIndex = gcpList.findIndex((gcpItem) => gcpItem.selected)
      if(selectedMarkerIndex !== -1) {
        gcpList[selectedMarkerIndex].marker.remove()
      }
      const nextGcpList = gcpList.filter((gcpItem) => !gcpItem.selected)
      return nextGcpList
    })
  }, [])

  useEffect(() => {
    let map: Map | null = null

    const addMarker = (ev: { target: maplibregl.Map, lngLat: { lat: number, lng: number } }) => {
      const marker = new Marker({ color, draggable: true, clickTolerance: 20 })
      .setLngLat(ev.lngLat)
      .addTo(ev.target)

      marker
        .on('dragend', (ev) => {
          setGcpList((gcpList) => {
            const targetIndex = gcpList.findIndex((gcpItem) => gcpItem.marker === marker)
            const nextGcpList = gcpList.map((gcpItem, index) => {
              const selected = index === targetIndex
              if(selected) {
                const {lat, lng } = ev.target.getLngLat()
                return { ...gcpItem, selected, lat, lng }
              } else {
                return { ...gcpItem, selected }
              }
            })
            return nextGcpList
          })
        })

      const markerElement = marker.getElement()

      markerElement.addEventListener('click', (ev) => {
        ev.stopImmediatePropagation()
        setGcpList((gcpList) => {
          const selectingIndex = gcpList.findIndex((gcpItem) => gcpItem.marker === marker)
          const nextGcpList = gcpList.map((gcpItem, index) => ({ ...gcpItem, selected: index === selectingIndex }))
          return nextGcpList
        })
      })

      return marker
    }

    if(containerRef.current) {

      map = new maplibre.Map({
        container: containerRef.current,
        style,
      })
        .addControl(new maplibre.NavigationControl({}))
        .addControl(new TrashControl({ onClick: onDeleteClick }))
        .on('click', (ev: MapMouseEvent) => {
          const marker = addMarker({ target: ev.target, lngLat: ev.lngLat })
          setGcpList((gcpList) => {
            return [
              ...gcpList.map(gcpItem => ({ ...gcpItem, selected: false })),
              { marker, lng: ev.lngLat.lng, lat: ev.lngLat.lat, selected: true },
            ]
          })
        })

      map.once('load', (ev) => {
        const nextGcpList = []
        for (const gcpItem of gcpList) {
          const marker = addMarker({ target: ev.target, lngLat: gcpItem })
          nextGcpList.push({ marker, lat: gcpItem.lat, lng: gcpItem.lng, selected: gcpItem.selected })
        }
        setGcpList(nextGcpList)
      })
    }

    return () => {
      if(map) {
        map.remove()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // NOTE: no GCPList dependencies to prevent rerender

  useEffect(() => {
    gcpList.forEach((gcpItem, index) => {
      const { marker } = gcpItem
      renumberMarker(marker, index, gcpItem.selected)
    })
  }, [gcpList])

  return {containerRef, gcpList }
}
