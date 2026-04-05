// src/app/(commonRoute)/Blog/page.tsx
// import BlogCard from '../_component/shared/BlogCard'

import BlogCard from "../_component/BlogCard"

export default async function BlogListingPage() {
  // Fetch published blogs (Server Component)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog`, {
    cache: 'no-store'
  })
  const { data: blogs } = await res.json()

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Our Blog</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs?.map((blog: any) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  )
}