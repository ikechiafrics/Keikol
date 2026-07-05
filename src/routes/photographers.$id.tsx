import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, MapPin, Video } from "lucide-react";

import { Breadcrumb, Section, SectionHeader } from "@/components";
import { PhotographerInquiryForm } from "@/components/PhotographerInquiryForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageLoaded } from "@/lib/use-image-loaded";
import { fetchPhotographerById } from "@/lib/photographers-data";

export const Route = createFileRoute("/photographers/$id")({
  loader: async ({ params }) => ({ photographer: await fetchPhotographerById(params.id) }),
  head: ({ loaderData }) => {
    const p = loaderData?.photographer ?? null;
    return {
      meta: [{ title: p ? `${p.name} — Keikol` : "Photographer — Keikol" }],
    };
  },
  component: PhotographerDetailPage,
});

function youTubeEmbedUrl(url: string): string | null {
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function PhotographerDetailPage() {
  const { id } = Route.useParams();
  const { photographer: p } = Route.useLoaderData();

  if (!p) return <NotFoundState id={id} />;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-hero pt-32 pb-16 lg:pt-40">
        <div className="absolute inset-0 -z-10">
          {p.profileImage && (
            <img src={p.profileImage} alt="" className="h-full w-full object-cover opacity-25" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Photographers", to: "/photographers" },
              { label: p.name },
            ]}
          />

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                {p.name}
              </h1>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {p.city}, {p.country}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {p.specialties.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold border border-border"
                  >
                    {s === "Photography" ? (
                      <Camera className="h-3.5 w-3.5" />
                    ) : (
                      <Video className="h-3.5 w-3.5" />
                    )}
                    {s}
                  </span>
                ))}
                <span className="text-sm font-semibold text-gold">{p.rateNote}</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#request-quote"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
                >
                  Request a Quote
                </a>
                <Link
                  to="/photographers"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Directory
                </Link>
              </div>
            </div>
            {p.profileImage && (
              <div className="relative">
                <div className="overflow-hidden rounded-3xl bg-card-premium p-1 shadow-elegant ring-hairline">
                  <img
                    src={p.profileImage}
                    alt={p.name}
                    className="aspect-[4/3] w-full rounded-[1.35rem] object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Section>
        <SectionHeader
          align="left"
          eyebrow="About"
          title={
            <>
              About <span className="text-gradient-gold">{p.name}.</span>
            </>
          }
        />
        <div className="mt-10 rounded-3xl bg-card-premium p-8 shadow-elegant ring-hairline">
          <p className="text-base leading-relaxed text-muted-foreground">{p.bio}</p>
        </div>
      </Section>

      {p.portfolioImages.length > 0 && (
        <Section tone="surface">
          <SectionHeader
            align="left"
            eyebrow="Portfolio"
            title={
              <>
                See <span className="text-gradient-gold">{p.name}'s</span> work.
              </>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.portfolioImages.map((src, i) => (
              <GalleryPhoto key={src} src={src} alt={`${p.name} — photo ${i + 1}`} />
            ))}
          </div>
        </Section>
      )}

      {p.videoLinks.length > 0 && (
        <Section>
          <SectionHeader
            align="left"
            eyebrow="Video"
            title={
              <>
                Watch <span className="text-gradient-gold">{p.name}'s</span> reel.
              </>
            }
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {p.videoLinks.map((url) => {
              const embed = youTubeEmbedUrl(url);
              return (
                <div
                  key={url}
                  className="aspect-video overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline"
                >
                  {embed ? (
                    <iframe
                      src={embed}
                      title="Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-full w-full items-center justify-center text-sm font-semibold text-gold hover:underline"
                    >
                      Watch video
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {p.portfolioImages.length === 0 && p.videoLinks.length === 0 && (
        <Section tone="surface">
          <div className="rounded-2xl border border-border bg-surface/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Portfolio coming soon — check back shortly, or request a quote to discuss {p.name}'s
              past work directly.
            </p>
          </div>
        </Section>
      )}

      <Section id="request-quote">
        <SectionHeader
          align="left"
          eyebrow="Get In Touch"
          title={
            <>
              Request a quote from <span className="text-gradient-gold">{p.name}.</span>
            </>
          }
        />
        <div className="mt-10 max-w-2xl">
          <PhotographerInquiryForm photographer={p} />
        </div>
      </Section>
    </>
  );
}

function GalleryPhoto({ src, alt }: { src: string; alt: string }) {
  const { loaded, onLoad, imgRef } = useImageLoaded();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline">
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={onLoad}
        className={`aspect-[4/3] w-full object-cover ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

function NotFoundState({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-40 pb-24 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Not Found
      </span>
      <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        Profile <span className="text-gradient-gold">Not Found</span>
      </h1>
      <p className="mt-4 text-base text-muted-foreground">
        The photographer/videographer{" "}
        {id ? (
          <>
            (<code className="text-foreground">{id}</code>)
          </>
        ) : null}{" "}
        may have been moved or is no longer listed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/photographers"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
      </div>
    </div>
  );
}
