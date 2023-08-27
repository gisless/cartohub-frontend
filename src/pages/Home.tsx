import { useQuery } from "@tanstack/react-query"
import { useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import type { createPresignedPost } from '@aws-sdk/s3-presigned-post'

type Fields = Awaited<ReturnType<typeof createPresignedPost>>['fields']
type LinksUploadCreateResponse = {
  presignedPosts: {
    [contentType: string]: {
      url: string,
      fields: Fields,
    },
  },
  map_id: string,
}

export function Home(): React.ReactNode {

  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: { presignedPosts, map_id } = {}, isFetching } = useQuery(['links', 'upload', 'create'], async () => {
    const url = import.meta.env.VITE_CARTOHUB_API_ENDPOINT + '/links/upload/create'
    let presignedPosts: LinksUploadCreateResponse['presignedPosts']
    let map_id: LinksUploadCreateResponse['map_id']
    try {
      const linksCreateResp = await fetch(url, { method: 'POST' })
      if(linksCreateResp.status > 399) {
        throw new Error('API error')
      }
      const { data } = (await linksCreateResp.json()) as { data: LinksUploadCreateResponse }
      presignedPosts = data.presignedPosts
      map_id = data.map_id
      return { presignedPosts, map_id }
    } catch (error) {
      return
    }
  })

  const onUploadClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    const fileInput = inputRef.current
    if(fileInput) {
      fileInput.click()
    }
  }, [])

  const onFileInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(async (event) => {
    const fileInput = event.target

    if(presignedPosts && fileInput.files && fileInput.files.length > 0) {
      const imageFile = fileInput.files[0]

      if(!presignedPosts[imageFile.type]) {
        alert('Unsupported file type.')
        return
      }

      const { url, fields } = presignedPosts[imageFile.type]

      const formData = new FormData()
      for (const field in fields) {
        formData.append(field, fields[field])
      }
      formData.append('file', imageFile)

      const uploadResp = await fetch(url, {
        method: 'POST',
        body: formData,

      })
      if(uploadResp.status > 399) {
        console.error('Upload error')
        return
      }
      navigate(`/maps/${map_id}`)
    }
  }, [map_id, navigate, presignedPosts])

  return (
    <>
      <header>
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          CartoHub prototype
        </h1>
        <p className="mb-3 text-gray-500 dark:text-gray-400">
        CartoHub is the next generation of cloud-optimized geo-referencing communities.<br />
        You can make geo-reference on uploaded images.<br />
        CartoHub is on prototyping stage.
        </p>
      </header>
      { isFetching || <div>
        <input onChange={onFileInputChange} className={'fixed top-[-999px]'} ref={inputRef} type="file" />
        <button
          disabled={ isFetching }
          onClick={onUploadClick}
          type="button"
          className={'mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
          }>Upload Image</button>
      </div>}
    </>
  )
}
