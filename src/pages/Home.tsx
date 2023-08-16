import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

export function Home(): React.ReactNode {

  const navigate = useNavigate()

  const onUploadClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 400))
    navigate('/maps/hello')
  }, [navigate])

  return (
    <>
      <header>
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">CartoHub proto.</h1>
      </header>
      <div>
        <button onClick={onUploadClick} type="button" className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Upload TIFF</button>
      </div>
    </>
  )
}
