import Spinner from '../components/ui/spinner'

const Loading = ({ children, loading }: { children: React.ReactNode; loading: boolean }) => {
  return (
    <>
      {loading ? (
        <div className="flex h-[80vh] w-full items-center justify-center">
          {<Spinner size="responsive" />}
        </div>
      ) : (
        children
      )}
    </>
  )
}

export default Loading
