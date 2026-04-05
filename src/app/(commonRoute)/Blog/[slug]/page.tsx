// src/app/(commonRoute)/Blog/[slug]/page.tsx
export default async function SingleBlogPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/${params.slug}`, {
    cache: 'no-store'
  })
  
  if (!res.ok) {
    return <div>Blog post not found</div>
  }

  const { data: blog } = await res.json()

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }} 
      />
    </div>
  )
}