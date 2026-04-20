import type { PublicProfile } from "@/lib/profile/public";
import type { ProfileSectionKey } from "@/lib/industries";

import { AboutSection } from "./sections/AboutSection";
import { ContactSection } from "./sections/ContactSection";
import { GallerySection } from "./sections/GallerySection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { PublicHeader } from "./sections/PublicHeader";
import { ServicesSection } from "./sections/ServicesSection";

type SectionRenderer = (profile: PublicProfile) => React.ReactNode;

const RENDERERS: Partial<Record<ProfileSectionKey, SectionRenderer>> = {
  header: (profile) => <PublicHeader profile={profile} />,
  about: (profile) => <AboutSection profile={profile} />,
  services: (profile) => <ServicesSection profile={profile} />,
  gallery: (profile) => <GallerySection profile={profile} />,
  portfolio: (profile) => <PortfolioSection profile={profile} />,
  contact: (profile) => <ContactSection profile={profile} />,
};

export function PublicPageBody({ profile }: { profile: PublicProfile }) {
  const sections = profile.defaultSections.length > 0
    ? profile.defaultSections
    : (["header", "about", "services", "portfolio", "contact"] as ProfileSectionKey[]);

  // header always first, even if omitted from defaults
  const rendered = new Set<ProfileSectionKey>();
  const orderedKeys: ProfileSectionKey[] = ["header"];
  for (const key of sections) {
    if (key === "header") continue;
    // Booking lives only in the sticky bar by design — never in the body.
    if (key === "booking") continue;
    if (!rendered.has(key)) orderedKeys.push(key);
    rendered.add(key);
  }
  // Inject a gallery slot after "about" when the profile has images
  // and the industry config didn't declare one explicitly.
  if (profile.gallery.length > 0 && !rendered.has("gallery")) {
    const aboutIdx = orderedKeys.indexOf("about");
    const insertAt = aboutIdx >= 0 ? aboutIdx + 1 : 1;
    orderedKeys.splice(insertAt, 0, "gallery");
    rendered.add("gallery");
  }

  return (
    <div className="space-y-14 sm:space-y-20">
      {orderedKeys.map((key) => {
        const render = RENDERERS[key];
        if (!render) return null;
        return <div key={key}>{render(profile)}</div>;
      })}
    </div>
  );
}
