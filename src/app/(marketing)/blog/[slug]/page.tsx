import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/content/ArticlePage";
import { docsIn, findDoc, readDocBody } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return docsIn("blog").map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDoc("blog", slug);
  if (!doc) return {};
  const path = `/blog/${doc.slug}`;
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: doc.title,
      description: doc.description,
      publishedTime: doc.date,
      modifiedTime: doc.updated ?? doc.date,
    },
  };
}

export default async function BlogArticleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = findDoc("blog", slug);
  if (!doc) notFound();
  const body = await readDocBody("blog", slug);
  return <ArticlePage doc={doc} body={body} />;
}
