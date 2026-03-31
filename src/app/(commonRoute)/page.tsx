import HeroBanner from "./_component/shared/page/Home/Banner";


export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        {/* <h1 className="text-2xl font-bold">Hero Section</h1>
         */}
            <HeroBanner></HeroBanner>

      </div>
    </div>
  )
}