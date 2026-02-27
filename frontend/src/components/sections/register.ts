import { registerComponent, type RegistryEntry } from "@/lib/registry";

// Header
import { HeaderSimpleWithCta, simpleWithCtaMetadata } from "./header";
import { HeaderCentered, centeredMetadata as headerCenteredMeta } from "./header";
import { HeaderTransparent, transparentMetadata } from "./header";
import { HeaderFloating, floatingMetadata } from "./header";
// Hero
import { HeroCentered, centeredMetadata as heroCenteredMeta } from "./hero";
import { HeroSplitImageRight, splitImageRightMetadata } from "./hero";
import { HeroSplitImageLeft, splitImageLeftMetadata } from "./hero";
import { HeroGradientBold, gradientBoldMetadata } from "./hero";
import { HeroWithAppScreenshot, withAppScreenshotMetadata } from "./hero";
// Logos
import { LogosSimpleRow, simpleRowMetadata } from "./logos";
import { LogosMarquee, marqueeMetadata as logosMarqueeMeta } from "./logos";
import { LogosGrid, gridMetadata as logosGridMeta } from "./logos";
import { LogosWithTitle, withTitleMetadata } from "./logos";
// Features
import { FeaturesCardsGrid, cardsGridMetadata as featuresCardsMeta } from "./features";
import { FeaturesBentoGrid, bentoGridMetadata } from "./features";
import { FeaturesIconList, iconListMetadata } from "./features";
import { FeaturesAlternating, alternatingMetadata } from "./features";
import { FeaturesThreeColumn, threeColumnMetadata } from "./features";
// Social Proof
import { SocialProofCardsGrid, cardsGridMetadata as socialProofCardsMeta } from "./social-proof";
import { SocialProofCarousel, carouselMetadata } from "./social-proof";
import { SocialProofSingleQuote, singleQuoteMetadata } from "./social-proof";
import { SocialProofTwitterWall, twitterWallMetadata } from "./social-proof";
// Stats
import { StatsInlineRow, inlineRowMetadata } from "./stats";
import { StatsCards, cardsMetadata as statsCardsMeta } from "./stats";
import { StatsLargeCentered, largeCenteredMetadata } from "./stats";
import { StatsWithDescription, withDescriptionMetadata } from "./stats";
// Pricing
import { PricingThreeTier, threeTierMetadata } from "./pricing";
import { PricingTwoTier, twoTierMetadata } from "./pricing";
import { PricingComparisonTable, comparisonTableMetadata } from "./pricing";
import { PricingSingleHighlight, singleHighlightMetadata } from "./pricing";
// FAQ
import { FaqAccordion, accordionMetadata } from "./faq";
import { FaqTwoColumn, twoColumnMetadata } from "./faq";
import { FaqSimpleList, simpleListMetadata } from "./faq";
import { FaqWithCategories, withCategoriesMetadata } from "./faq";
// CTA
import { CtaBoldCentered, boldCenteredMetadata } from "./cta";
import { CtaWithImage, withImageMetadata } from "./cta";
import { CtaSplit, splitMetadata } from "./cta";
import { CtaMinimal, minimalMetadata as ctaMinimalMeta } from "./cta";
// Footer
import { FooterColumnsWithSocials, columnsWithSocialsMetadata } from "./footer";
import { FooterSimpleCentered, simpleCenteredMetadata } from "./footer";
import { FooterMinimal, minimalMetadata as footerMinimalMeta } from "./footer";
import { FooterMegaFooter, megaFooterMetadata } from "./footer";

const entries: RegistryEntry[] = [
  // Header (4)
  { component: HeaderSimpleWithCta as RegistryEntry["component"], metadata: simpleWithCtaMetadata },
  { component: HeaderCentered as RegistryEntry["component"], metadata: headerCenteredMeta },
  { component: HeaderTransparent as RegistryEntry["component"], metadata: transparentMetadata },
  { component: HeaderFloating as RegistryEntry["component"], metadata: floatingMetadata },
  // Hero (5)
  { component: HeroCentered as RegistryEntry["component"], metadata: heroCenteredMeta },
  { component: HeroSplitImageRight as RegistryEntry["component"], metadata: splitImageRightMetadata },
  { component: HeroSplitImageLeft as RegistryEntry["component"], metadata: splitImageLeftMetadata },
  { component: HeroGradientBold as RegistryEntry["component"], metadata: gradientBoldMetadata },
  { component: HeroWithAppScreenshot as RegistryEntry["component"], metadata: withAppScreenshotMetadata },
  // Logos (4)
  { component: LogosSimpleRow as RegistryEntry["component"], metadata: simpleRowMetadata },
  { component: LogosMarquee as RegistryEntry["component"], metadata: logosMarqueeMeta },
  { component: LogosGrid as RegistryEntry["component"], metadata: logosGridMeta },
  { component: LogosWithTitle as RegistryEntry["component"], metadata: withTitleMetadata },
  // Features (5)
  { component: FeaturesCardsGrid as RegistryEntry["component"], metadata: featuresCardsMeta },
  { component: FeaturesBentoGrid as RegistryEntry["component"], metadata: bentoGridMetadata },
  { component: FeaturesIconList as RegistryEntry["component"], metadata: iconListMetadata },
  { component: FeaturesAlternating as RegistryEntry["component"], metadata: alternatingMetadata },
  { component: FeaturesThreeColumn as RegistryEntry["component"], metadata: threeColumnMetadata },
  // Social Proof (4)
  { component: SocialProofCardsGrid as RegistryEntry["component"], metadata: socialProofCardsMeta },
  { component: SocialProofCarousel as RegistryEntry["component"], metadata: carouselMetadata },
  { component: SocialProofSingleQuote as RegistryEntry["component"], metadata: singleQuoteMetadata },
  { component: SocialProofTwitterWall as RegistryEntry["component"], metadata: twitterWallMetadata },
  // Stats (4)
  { component: StatsInlineRow as RegistryEntry["component"], metadata: inlineRowMetadata },
  { component: StatsCards as RegistryEntry["component"], metadata: statsCardsMeta },
  { component: StatsLargeCentered as RegistryEntry["component"], metadata: largeCenteredMetadata },
  { component: StatsWithDescription as RegistryEntry["component"], metadata: withDescriptionMetadata },
  // Pricing (4)
  { component: PricingThreeTier as RegistryEntry["component"], metadata: threeTierMetadata },
  { component: PricingTwoTier as RegistryEntry["component"], metadata: twoTierMetadata },
  { component: PricingComparisonTable as RegistryEntry["component"], metadata: comparisonTableMetadata },
  { component: PricingSingleHighlight as RegistryEntry["component"], metadata: singleHighlightMetadata },
  // FAQ (4)
  { component: FaqAccordion as RegistryEntry["component"], metadata: accordionMetadata },
  { component: FaqTwoColumn as RegistryEntry["component"], metadata: twoColumnMetadata },
  { component: FaqSimpleList as RegistryEntry["component"], metadata: simpleListMetadata },
  { component: FaqWithCategories as RegistryEntry["component"], metadata: withCategoriesMetadata },
  // CTA (4)
  { component: CtaBoldCentered as RegistryEntry["component"], metadata: boldCenteredMetadata },
  { component: CtaWithImage as RegistryEntry["component"], metadata: withImageMetadata },
  { component: CtaSplit as RegistryEntry["component"], metadata: splitMetadata },
  { component: CtaMinimal as RegistryEntry["component"], metadata: ctaMinimalMeta },
  // Footer (4)
  { component: FooterColumnsWithSocials as RegistryEntry["component"], metadata: columnsWithSocialsMetadata },
  { component: FooterSimpleCentered as RegistryEntry["component"], metadata: simpleCenteredMetadata },
  { component: FooterMinimal as RegistryEntry["component"], metadata: footerMinimalMeta },
  { component: FooterMegaFooter as RegistryEntry["component"], metadata: megaFooterMetadata },
];

let registered = false;

export function ensureRegistered() {
  if (registered) return;
  for (const entry of entries) {
    registerComponent(entry);
  }
  registered = true;
}
