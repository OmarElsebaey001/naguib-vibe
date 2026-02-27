"""Pydantic mirrors of the frontend Zod schemas. Frontend Zod is source of truth."""

from __future__ import annotations

from pydantic import BaseModel, Field

# --- Content schemas (one per section type) ---


class NavItem(BaseModel):
    label: str
    href: str


class LogoRef(BaseModel):
    text: str
    href: str = "/"


class CtaButton(BaseModel):
    label: str
    href: str


class ImageRef(BaseModel):
    src: str
    alt: str


class HeaderContent(BaseModel):
    logo: LogoRef
    navItems: list[NavItem] = []
    cta: CtaButton | None = None


class HeroContent(BaseModel):
    headline: str
    subheadline: str | None = None
    primaryCta: CtaButton | None = None
    secondaryCta: CtaButton | None = None
    image: ImageRef | None = None
    badge: str | None = None


class LogoItem(BaseModel):
    name: str
    src: str
    href: str | None = None


class LogosContent(BaseModel):
    title: str | None = None
    logos: list[LogoItem] = []


class FeatureItem(BaseModel):
    icon: str | None = None
    title: str
    description: str
    image: ImageRef | None = None


class FeaturesContent(BaseModel):
    tagline: str | None = None
    headline: str
    description: str | None = None
    features: list[FeatureItem] = Field(min_length=1)


class Testimonial(BaseModel):
    quote: str
    author: str
    role: str | None = None
    company: str | None = None
    avatar: str | None = None
    rating: int | None = Field(None, ge=1, le=5)


class SocialProofContent(BaseModel):
    tagline: str | None = None
    headline: str | None = None
    testimonials: list[Testimonial] = Field(min_length=1)


class StatItem(BaseModel):
    value: str
    label: str
    description: str | None = None


class StatsContent(BaseModel):
    tagline: str | None = None
    headline: str | None = None
    stats: list[StatItem] = Field(min_length=1)


class PricingFeature(BaseModel):
    text: str
    included: bool = True


class PricingPlan(BaseModel):
    name: str
    description: str | None = None
    price: str
    period: str = "/month"
    features: list[PricingFeature] = []
    cta: CtaButton
    highlighted: bool = False
    badge: str | None = None


class PricingContent(BaseModel):
    tagline: str | None = None
    headline: str
    description: str | None = None
    plans: list[PricingPlan] = Field(min_length=1)


class FaqItem(BaseModel):
    question: str
    answer: str
    category: str | None = None


class FaqContent(BaseModel):
    tagline: str | None = None
    headline: str
    description: str | None = None
    items: list[FaqItem] = Field(min_length=1)


class CtaContent(BaseModel):
    headline: str
    description: str | None = None
    primaryCta: CtaButton
    secondaryCta: CtaButton | None = None
    image: ImageRef | None = None


class FooterLink(BaseModel):
    label: str
    href: str


class FooterColumn(BaseModel):
    title: str
    links: list[FooterLink] = []


class SocialLink(BaseModel):
    platform: str
    href: str
    icon: str | None = None


class Newsletter(BaseModel):
    title: str
    description: str | None = None
    placeholder: str = "Enter your email"
    buttonLabel: str = "Subscribe"


class FooterContent(BaseModel):
    logo: LogoRef | None = None
    columns: list[FooterColumn] = []
    socialLinks: list[SocialLink] = []
    copyright: str | None = None
    newsletter: Newsletter | None = None


# --- Map type names to content models ---

CONTENT_MODEL_MAP: dict[str, type[BaseModel]] = {
    "header": HeaderContent,
    "hero": HeroContent,
    "logos": LogosContent,
    "features": FeaturesContent,
    "social-proof": SocialProofContent,
    "stats": StatsContent,
    "pricing": PricingContent,
    "faq": FaqContent,
    "cta": CtaContent,
    "footer": FooterContent,
}


# --- Theme ---

class ThemeConfig(BaseModel):
    primary: str = "221.2 83.2% 53.3%"
    primaryForeground: str = "210 40% 98%"
    secondary: str = "210 40% 96.1%"
    secondaryForeground: str = "222.2 47.4% 11.2%"
    background: str = "0 0% 100%"
    foreground: str = "240 10% 3.9%"
    muted: str = "210 40% 96.1%"
    mutedForeground: str = "215.4 16.3% 46.9%"
    accent: str = "210 40% 96.1%"
    accentForeground: str = "222.2 47.4% 11.2%"
    border: str = "214.3 31.8% 91.4%"
    ring: str = "221.2 83.2% 53.3%"
    destructive: str = "0 84.2% 60.2%"
    destructiveForeground: str = "210 40% 98%"
    radius: str = "0.5rem"
    fontHeading: str = "Inter"
    fontBody: str = "Inter"


# --- Section ---

SECTION_TYPES = [
    "header", "hero", "logos", "features", "social-proof",
    "stats", "pricing", "faq", "cta", "footer",
]


class SectionConfig(BaseModel):
    id: str
    type: str  # validated against SECTION_TYPES
    variant: str
    mode: str = "light"  # "light" | "dark"
    content: dict  # validated per-type using CONTENT_MODEL_MAP


# --- Page metadata ---

class PageMetadata(BaseModel):
    title: str = ""
    description: str = ""
    ogImage: str | None = None
    favicon: str | None = None


# --- Page config (top-level) ---

class PageConfig(BaseModel):
    id: str
    name: str
    theme: ThemeConfig = ThemeConfig()
    sections: list[SectionConfig] = []
    metadata: PageMetadata = PageMetadata()
    version: int = 1


def validate_page_config(config: dict) -> PageConfig:
    """Validate a raw dict as a PageConfig, including per-section content validation."""
    pc = PageConfig.model_validate(config)
    for section in pc.sections:
        if section.type in CONTENT_MODEL_MAP:
            model = CONTENT_MODEL_MAP[section.type]
            model.model_validate(section.content)
    return pc
