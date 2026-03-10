"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Eye, Home, Info, MessageSquare, Save, Sparkles } from "lucide-react";
import { adminCmsService } from "@/services/adminCmsService";
import { useAdminAuth } from "@/store/useAdminAuth";
import {
    AboutTeamMemberContent,
    AboutValueContent,
    CmsContent,
    DEFAULT_CMS_CONTENT,
    HeroSlideContent,
    mapCmsContentToSettings,
    mapSettingsToCmsContent,
} from "@/lib/cms";

type TabKey = "home" | "contact" | "about" | "footer" | "policies";
type SaveMessageTone = "success" | "error" | "info";

const TABS: Array<{ key: TabKey; label: string; icon: typeof Home }> = [
    { key: "home", label: "Home", icon: Home },
    { key: "contact", label: "Contact", icon: MessageSquare },
    { key: "about", label: "About", icon: Info },
    { key: "footer", label: "Footer & Social", icon: Sparkles },
    { key: "policies", label: "Policies & Checkout", icon: CreditCard },
];

const TAB_PREFIXES: Record<TabKey, string[]> = {
    home: ["homeHeroSlides", "promotionBanner"],
    contact: ["contact"],
    about: ["about"],
    footer: ["footer"],
    policies: ["rules", "terms", "checkout"],
};

const isValidExternalUrl = (value: string) => /^https?:\/\//i.test(value.trim());
const isValidRouteOrExternalUrl = (value: string) => value.trim().startsWith("/") || isValidExternalUrl(value);

const validateContent = (content: CmsContent): Record<string, string> => {
    const errors: Record<string, string> = {};

    content.homeHeroSlides.forEach((slide, index) => {
        if (!slide.tag.trim()) errors[`homeHeroSlides.${index}.tag`] = "Tag is required.";
        if (!slide.title.trim()) errors[`homeHeroSlides.${index}.title`] = "Title is required.";
        if (!slide.titleAccent.trim()) errors[`homeHeroSlides.${index}.titleAccent`] = "Accent word is required.";
        if (!slide.description.trim()) errors[`homeHeroSlides.${index}.description`] = "Description is required.";
        if (!slide.image.trim()) {
            errors[`homeHeroSlides.${index}.image`] = "Image URL is required.";
        } else if (!isValidExternalUrl(slide.image)) {
            errors[`homeHeroSlides.${index}.image`] = "Use a valid image URL starting with http:// or https://.";
        }
        if (!slide.ctaText.trim()) errors[`homeHeroSlides.${index}.ctaText`] = "Primary CTA text is required.";
        if (!slide.secondaryCtaText.trim()) errors[`homeHeroSlides.${index}.secondaryCtaText`] = "Secondary CTA text is required.";
        if (!slide.ctaLink.trim() || !isValidRouteOrExternalUrl(slide.ctaLink)) {
            errors[`homeHeroSlides.${index}.ctaLink`] = "Use /route or a full https:// URL.";
        }
        if (!slide.secondaryCtaLink.trim() || !isValidRouteOrExternalUrl(slide.secondaryCtaLink)) {
            errors[`homeHeroSlides.${index}.secondaryCtaLink`] = "Use /route or a full https:// URL.";
        }
        if (!slide.badges[0].trim()) errors[`homeHeroSlides.${index}.badges.0`] = "Badge text is required.";
        if (!slide.badges[1].trim()) errors[`homeHeroSlides.${index}.badges.1`] = "Badge text is required.";
        if (!slide.badges[2].trim()) errors[`homeHeroSlides.${index}.badges.2`] = "Badge text is required.";
    });

    if (!content.promotionBanner.highlight.trim()) errors["promotionBanner.highlight"] = "Highlight text is required.";
    if (!content.promotionBanner.text.trim()) errors["promotionBanner.text"] = "Banner text is required.";

    if (!content.contact.heroTitle.trim()) errors["contact.heroTitle"] = "Hero title is required.";
    if (!content.contact.heroAccent.trim()) errors["contact.heroAccent"] = "Hero accent is required.";
    if (!content.contact.heroDescription.trim()) errors["contact.heroDescription"] = "Hero description is required.";
    if (!content.contact.formTitle.trim()) errors["contact.formTitle"] = "Form title is required.";
    if (!content.contact.phoneNumber.trim()) errors["contact.phoneNumber"] = "Phone number is required.";

    if (!content.about.heroTitle.trim()) errors["about.heroTitle"] = "Hero title is required.";
    if (!content.about.storyTitle.trim()) errors["about.storyTitle"] = "Story title is required.";
    if (!content.about.storyParagraphOne.trim()) errors["about.storyParagraphOne"] = "Story paragraph one is required.";
    if (!content.about.storyParagraphTwo.trim()) errors["about.storyParagraphTwo"] = "Story paragraph two is required.";
    if (!content.about.ctaButtonText.trim()) errors["about.ctaButtonText"] = "CTA button text is required.";

    content.about.values.forEach((value, index) => {
        if (!value.title.trim()) errors[`about.values.${index}.title`] = "Value title is required.";
        if (!value.description.trim()) errors[`about.values.${index}.description`] = "Value description is required.";
    });

    content.about.team.forEach((member, index) => {
        if (!member.name.trim()) errors[`about.team.${index}.name`] = "Name is required.";
        if (!member.role.trim()) errors[`about.team.${index}.role`] = "Role is required.";
        if (!member.image.trim() || !isValidExternalUrl(member.image)) {
            errors[`about.team.${index}.image`] = "Use a valid image URL starting with http:// or https://.";
        }
    });

    if (!content.footer.brandDescription.trim()) errors["footer.brandDescription"] = "Brand description is required.";
    if (!content.footer.email.trim() || !content.footer.email.includes("@")) errors["footer.email"] = "Use a valid email address.";
    if (!content.footer.instagramUrl.trim() || !(content.footer.instagramUrl === "#" || isValidExternalUrl(content.footer.instagramUrl))) errors["footer.instagramUrl"] = "Use # or a full https:// URL.";
    if (!content.footer.facebookUrl.trim() || !(content.footer.facebookUrl === "#" || isValidExternalUrl(content.footer.facebookUrl))) errors["footer.facebookUrl"] = "Use # or a full https:// URL.";
    if (!content.footer.twitterUrl.trim() || !(content.footer.twitterUrl === "#" || isValidExternalUrl(content.footer.twitterUrl))) errors["footer.twitterUrl"] = "Use # or a full https:// URL.";

    if (!content.rules.pageTitle.trim()) errors["rules.pageTitle"] = "Rules page title is required.";
    if (!content.rules.deliveryText.trim()) errors["rules.deliveryText"] = "Delivery text is required.";
    if (!content.rules.availabilityText.trim()) errors["rules.availabilityText"] = "Availability text is required.";
    if (!content.rules.paymentText.trim()) errors["rules.paymentText"] = "Payment text is required.";

    if (!content.terms.pageTitle.trim()) errors["terms.pageTitle"] = "Terms page title is required.";
    content.terms.sections.forEach((section, index) => {
        if (!section.title.trim()) errors[`terms.sections.${index}.title`] = "Section title is required.";
        if (!section.body.trim()) errors[`terms.sections.${index}.body`] = "Section body is required.";
    });

    if (!content.checkout.orderInfoTitle.trim()) errors["checkout.orderInfoTitle"] = "Order info title is required.";
    if (!content.checkout.paymentTitle.trim()) errors["checkout.paymentTitle"] = "Payment title is required.";
    if (!content.checkout.successTitle.trim()) errors["checkout.successTitle"] = "Success title is required.";
    if (!content.checkout.successMessageTemplate.includes("{{name}}")) {
        errors["checkout.successMessageTemplate"] = "Success template must include {{name}}.";
    }
    if (!content.checkout.telebirrAccount.trim()) errors["checkout.telebirrAccount"] = "Telebirr account text is required.";
    if (!content.checkout.cbeAccount.trim()) errors["checkout.cbeAccount"] = "CBE account text is required.";

    return errors;
};

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-dark">{title}</h2>
                {description ? <p className="mt-1 text-sm text-dark/55">{description}</p> : null}
            </div>
            <div className="grid gap-4">{children}</div>
        </section>
    );
}

function Field({ label, value, onChange, placeholder, error }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; error?: string }) {
    return (
        <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-dark/45">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`h-11 rounded-xl border px-4 text-sm text-dark outline-none transition ${error ? "border-red-300 bg-red-50/30 focus:border-red-400" : "border-secondary/20 focus:border-accent"}`}
            />
            <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className={error ? "font-medium text-red-600" : "text-dark/35"}>{error ?? " "}</span>
                <span className="text-dark/30">{value.length} chars</span>
            </div>
        </label>
    );
}

function TextareaField({ label, value, onChange, rows = 3, placeholder, error }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string; error?: string }) {
    return (
        <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-dark/45">{label}</span>
            <textarea
                rows={rows}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`rounded-xl border p-4 text-sm text-dark outline-none transition ${error ? "border-red-300 bg-red-50/30 focus:border-red-400" : "border-secondary/20 focus:border-accent"}`}
            />
            <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className={error ? "font-medium text-red-600" : "text-dark/35"}>{error ?? " "}</span>
                <span className="text-dark/30">{value.length} chars</span>
            </div>
        </label>
    );
}

export default function CMSPage() {
    const token = useAdminAuth((state) => state.token);
    const [activeTab, setActiveTab] = useState<TabKey>("home");
    const [content, setContent] = useState<CmsContent>(DEFAULT_CMS_CONTENT);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saveTone, setSaveTone] = useState<SaveMessageTone>("info");
    const [initialSerialized, setInitialSerialized] = useState(JSON.stringify(DEFAULT_CMS_CONTENT));

    useEffect(() => {
        const load = async () => {
            try {
                const settings = await adminCmsService.getSettings();
                const mapped = mapSettingsToCmsContent(settings);
                setContent(mapped);
                setInitialSerialized(JSON.stringify(mapped));
            } catch {
                setContent(DEFAULT_CMS_CONTENT);
                setInitialSerialized(JSON.stringify(DEFAULT_CMS_CONTENT));
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const settingsPayload = useMemo(() => mapCmsContentToSettings(content), [content]);
    const validationErrors = useMemo(() => validateContent(content), [content]);
    const totalErrors = Object.keys(validationErrors).length;
    const currentTabErrors = useMemo(
        () => Object.keys(validationErrors).filter((path) => TAB_PREFIXES[activeTab].some((prefix) => path.startsWith(prefix))).length,
        [activeTab, validationErrors]
    );
    const isDirty = useMemo(() => JSON.stringify(content) !== initialSerialized, [content, initialSerialized]);
    const getError = (path: string) => validationErrors[path];

    const handleSave = async () => {
        if (!token) {
            setSaveTone("error");
            setSaveMessage("Missing admin session. Please sign in again.");
            return;
        }

        if (totalErrors > 0) {
            setSaveTone("error");
            setSaveMessage(`Please resolve ${totalErrors} validation issue${totalErrors > 1 ? "s" : ""} before saving.`);
            return;
        }

        if (!isDirty) {
            setSaveTone("info");
            setSaveMessage("No changes to save.");
            return;
        }

        setSaving(true);
        setSaveMessage(null);

        try {
            await adminCmsService.updateSettings(token, settingsPayload);
            setInitialSerialized(JSON.stringify(content));
            setSaveTone("success");
            setSaveMessage("Content updated successfully.");
        } catch {
            setSaveTone("error");
            setSaveMessage("Failed to save content changes.");
        } finally {
            setSaving(false);
        }
    };

    const updateHeroSlide = (index: number, patch: Partial<HeroSlideContent>) => {
        setContent((current) => ({
            ...current,
            homeHeroSlides: current.homeHeroSlides.map((slide, slideIndex) => (
                slideIndex === index ? { ...slide, ...patch } : slide
            )),
        }));
    };

    const addHeroSlide = () => {
        setContent((current) => ({
            ...current,
            homeHeroSlides: [
                ...current.homeHeroSlides,
                {
                    ...DEFAULT_CMS_CONTENT.homeHeroSlides[0],
                    id: Date.now(),
                    tag: "New Slide",
                    titleAccent: "Moment",
                },
            ],
        }));
    };

    const removeHeroSlide = (index: number) => {
        setContent((current) => ({
            ...current,
            homeHeroSlides: current.homeHeroSlides.filter((_, slideIndex) => slideIndex !== index),
        }));
    };

    const updateAboutValue = (index: number, patch: Partial<AboutValueContent>) => {
        setContent((current) => ({
            ...current,
            about: {
                ...current.about,
                values: current.about.values.map((value, valueIndex) => (valueIndex === index ? { ...value, ...patch } : value)),
            },
        }));
    };

    const addAboutValue = () => {
        setContent((current) => ({
            ...current,
            about: {
                ...current.about,
                values: [
                    ...current.about.values,
                    { id: Date.now(), title: "New Value", description: "Describe the value.", icon: "Shield" },
                ],
            },
        }));
    };

    const removeAboutValue = (index: number) => {
        setContent((current) => ({
            ...current,
            about: {
                ...current.about,
                values: current.about.values.filter((_, valueIndex) => valueIndex !== index),
            },
        }));
    };

    const updateTeamMember = (index: number, patch: Partial<AboutTeamMemberContent>) => {
        setContent((current) => ({
            ...current,
            about: {
                ...current.about,
                team: current.about.team.map((member, memberIndex) => (memberIndex === index ? { ...member, ...patch } : member)),
            },
        }));
    };

    const addTeamMember = () => {
        setContent((current) => ({
            ...current,
            about: {
                ...current.about,
                team: [
                    ...current.about.team,
                    { id: Date.now(), name: "New Team Member", role: "Role", image: "" },
                ],
            },
        }));
    };

    const removeTeamMember = (index: number) => {
        setContent((current) => ({
            ...current,
            about: {
                ...current.about,
                team: current.about.team.filter((_, memberIndex) => memberIndex !== index),
            },
        }));
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
            <aside className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm xl:sticky xl:top-24 xl:h-fit">
                <div className="mb-4">
                    <h1 className="font-display text-2xl font-bold text-dark">Content Management</h1>
                    <p className="mt-1 text-sm text-dark/55">Edit the live storefront content for public pages from one place.</p>
                </div>

                <div className="grid gap-2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === tab.key ? "bg-primary/20 text-accent" : "text-dark/60 hover:bg-secondary/10 hover:text-dark"}`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 grid gap-3">
                    <Button variant="primary" className="rounded-2xl" onClick={handleSave} disabled={saving || loading || totalErrors > 0}>
                        {saving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </Button>
                    <Link href={activeTab === "home" ? "/" : activeTab === "contact" ? "/contact" : activeTab === "about" ? "/about" : activeTab === "footer" ? "/" : "/rules"} target="_blank">
                        <Button variant="outline" className="w-full rounded-2xl">
                            <Eye className="mr-2 h-4 w-4" /> Preview Page
                        </Button>
                    </Link>
                </div>

                <div className="mt-4 rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-3 text-xs text-dark/60">
                    <p className="font-semibold text-dark">{isDirty ? "Unsaved changes" : "All changes saved"}</p>
                    <p className="mt-1">{currentTabErrors > 0 ? `${currentTabErrors} validation issue(s) in this section.` : "No validation issues in this section."}</p>
                </div>

                {saveMessage ? (
                    <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${saveTone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : saveTone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-secondary/10 bg-secondary/5 text-dark/60"}`}>
                        {saveMessage}
                    </div>
                ) : null}
            </aside>

            <div className="grid gap-6">
                {loading ? <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-sm text-dark/40 shadow-sm">Loading content settings...</div> : null}

                {!loading && activeTab === "home" ? (
                    <>
                        <SectionCard title="Homepage Hero" description="Manage the rotating hero slides shown on the storefront home page.">
                            {content.homeHeroSlides.map((slide, index) => (
                                <div key={slide.id} className="rounded-2xl border border-secondary/10 bg-secondary/5 p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-sm font-bold text-dark">Slide {index + 1}</p>
                                        {content.homeHeroSlides.length > 1 ? (
                                            <button type="button" className="text-xs font-semibold text-red-500" onClick={() => removeHeroSlide(index)}>
                                                Remove
                                            </button>
                                        ) : null}
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Tag" value={slide.tag} onChange={(value) => updateHeroSlide(index, { tag: value })} error={getError(`homeHeroSlides.${index}.tag`)} />
                                        <Field label="Image URL" value={slide.image} onChange={(value) => updateHeroSlide(index, { image: value })} error={getError(`homeHeroSlides.${index}.image`)} />
                                        <Field label="Title" value={slide.title} onChange={(value) => updateHeroSlide(index, { title: value })} error={getError(`homeHeroSlides.${index}.title`)} />
                                        <Field label="Accent Word" value={slide.titleAccent} onChange={(value) => updateHeroSlide(index, { titleAccent: value })} error={getError(`homeHeroSlides.${index}.titleAccent`)} />
                                        <Field label="Primary CTA Text" value={slide.ctaText} onChange={(value) => updateHeroSlide(index, { ctaText: value })} error={getError(`homeHeroSlides.${index}.ctaText`)} />
                                        <Field label="Primary CTA Link" value={slide.ctaLink} onChange={(value) => updateHeroSlide(index, { ctaLink: value })} error={getError(`homeHeroSlides.${index}.ctaLink`)} />
                                        <Field label="Secondary CTA Text" value={slide.secondaryCtaText} onChange={(value) => updateHeroSlide(index, { secondaryCtaText: value })} error={getError(`homeHeroSlides.${index}.secondaryCtaText`)} />
                                        <Field label="Secondary CTA Link" value={slide.secondaryCtaLink} onChange={(value) => updateHeroSlide(index, { secondaryCtaLink: value })} error={getError(`homeHeroSlides.${index}.secondaryCtaLink`)} />
                                        <Field label="Badge One" value={slide.badges[0]} onChange={(value) => updateHeroSlide(index, { badges: [value, slide.badges[1], slide.badges[2]] })} error={getError(`homeHeroSlides.${index}.badges.0`)} />
                                        <Field label="Badge Two" value={slide.badges[1]} onChange={(value) => updateHeroSlide(index, { badges: [slide.badges[0], value, slide.badges[2]] })} error={getError(`homeHeroSlides.${index}.badges.1`)} />
                                        <Field label="Badge Three" value={slide.badges[2]} onChange={(value) => updateHeroSlide(index, { badges: [slide.badges[0], slide.badges[1], value] })} error={getError(`homeHeroSlides.${index}.badges.2`)} />
                                    </div>
                                    <div className="mt-4">
                                        <TextareaField label="Description" value={slide.description} onChange={(value) => updateHeroSlide(index, { description: value })} rows={3} error={getError(`homeHeroSlides.${index}.description`)} />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="rounded-2xl" onClick={addHeroSlide}>
                                Add Hero Slide
                            </Button>
                        </SectionCard>

                        <SectionCard title="Promotion Banner" description="Control the thin promo strip displayed above the homepage hero.">
                            <label className="flex items-center gap-3 rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-3 text-sm font-medium text-dark">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-accent"
                                    checked={content.promotionBanner.enabled}
                                    onChange={(event) => setContent((current) => ({
                                        ...current,
                                        promotionBanner: { ...current.promotionBanner, enabled: event.target.checked },
                                    }))}
                                />
                                Show promotion banner on storefront
                            </label>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Highlight Text" value={content.promotionBanner.highlight} onChange={(value) => setContent((current) => ({ ...current, promotionBanner: { ...current.promotionBanner, highlight: value } }))} error={getError("promotionBanner.highlight")} />
                                <Field label="Banner Text" value={content.promotionBanner.text} onChange={(value) => setContent((current) => ({ ...current, promotionBanner: { ...current.promotionBanner, text: value } }))} error={getError("promotionBanner.text")} />
                            </div>
                        </SectionCard>
                    </>
                ) : null}

                {!loading && activeTab === "contact" ? (
                    <>
                        <SectionCard title="Contact Hero" description="Edit the contact page heading and intro copy.">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Eyebrow" value={content.contact.heroEyebrow} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, heroEyebrow: value } }))} />
                                <Field label="Hero Title" value={content.contact.heroTitle} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, heroTitle: value } }))} error={getError("contact.heroTitle")} />
                                <Field label="Hero Accent" value={content.contact.heroAccent} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, heroAccent: value } }))} error={getError("contact.heroAccent")} />
                                <Field label="Form Title" value={content.contact.formTitle} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, formTitle: value } }))} error={getError("contact.formTitle")} />
                            </div>
                            <TextareaField label="Hero Description" value={content.contact.heroDescription} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, heroDescription: value } }))} error={getError("contact.heroDescription")} />
                            <Field label="Form Subtitle" value={content.contact.formSubtitle} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, formSubtitle: value } }))} />
                        </SectionCard>

                        <SectionCard title="Contact Details" description="Update the contact cards and order-help callout.">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Phone Label" value={content.contact.phoneLabel} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, phoneLabel: value } }))} />
                                <Field label="Phone Number" value={content.contact.phoneNumber} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, phoneNumber: value } }))} error={getError("contact.phoneNumber")} />
                                <Field label="Phone Hours" value={content.contact.phoneHours} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, phoneHours: value } }))} />
                                <Field label="Social Label" value={content.contact.socialLabel} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, socialLabel: value } }))} />
                                <Field label="Telegram Handle" value={content.contact.telegramHandle} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, telegramHandle: value } }))} />
                                <Field label="Instagram Handle" value={content.contact.instagramHandle} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, instagramHandle: value } }))} />
                                <Field label="Location Label" value={content.contact.locationLabel} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, locationLabel: value } }))} />
                                <Field label="Location Line One" value={content.contact.locationLineOne} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, locationLineOne: value } }))} />
                                <Field label="Location Line Two" value={content.contact.locationLineTwo} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, locationLineTwo: value } }))} />
                                <Field label="Order Help Title" value={content.contact.orderHelpTitle} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, orderHelpTitle: value } }))} />
                            </div>
                            <TextareaField label="Order Help Text" value={content.contact.orderHelpText} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, orderHelpText: value } }))} rows={4} />
                        </SectionCard>
                    </>
                ) : null}

                {!loading && activeTab === "about" ? (
                    <>
                        <SectionCard title="About Hero & Story" description="Manage the About page headline and story copy.">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Hero Eyebrow" value={content.about.heroEyebrow} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, heroEyebrow: value } }))} />
                                <Field label="Hero Title" value={content.about.heroTitle} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, heroTitle: value } }))} error={getError("about.heroTitle")} />
                                <Field label="Hero Accent" value={content.about.heroAccent} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, heroAccent: value } }))} />
                                <Field label="Story Title" value={content.about.storyTitle} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, storyTitle: value } }))} error={getError("about.storyTitle")} />
                            </div>
                            <TextareaField label="Hero Description" value={content.about.heroDescription} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, heroDescription: value } }))} rows={3} />
                            <TextareaField label="Story Paragraph One" value={content.about.storyParagraphOne} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, storyParagraphOne: value } }))} rows={5} error={getError("about.storyParagraphOne")} />
                            <TextareaField label="Story Paragraph Two" value={content.about.storyParagraphTwo} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, storyParagraphTwo: value } }))} rows={5} error={getError("about.storyParagraphTwo")} />
                            <TextareaField label="Quote" value={content.about.quote} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, quote: value } }))} rows={2} />
                        </SectionCard>

                        <SectionCard title="About Values" description="Edit the values cards shown on the About page.">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Values Title" value={content.about.valuesTitle} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, valuesTitle: value } }))} />
                                <Field label="Values Accent" value={content.about.valuesAccent} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, valuesAccent: value } }))} />
                                <Field label="Values Subtitle" value={content.about.valuesSubtitle} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, valuesSubtitle: value } }))} />
                            </div>
                            {content.about.values.map((value, index) => (
                                <div key={value.id} className="rounded-2xl border border-secondary/10 bg-secondary/5 p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-sm font-bold text-dark">Value {index + 1}</p>
                                        {content.about.values.length > 1 ? <button type="button" className="text-xs font-semibold text-red-500" onClick={() => removeAboutValue(index)}>Remove</button> : null}
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Field label="Title" value={value.title} onChange={(next) => updateAboutValue(index, { title: next })} error={getError(`about.values.${index}.title`)} />
                                        <Field label="Icon" value={value.icon} onChange={(next) => updateAboutValue(index, { icon: next as AboutValueContent["icon"] })} placeholder="Shield | Star | Heart | Zap" />
                                        <TextareaField label="Description" value={value.description} onChange={(next) => updateAboutValue(index, { description: next })} rows={2} error={getError(`about.values.${index}.description`)} />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="rounded-2xl" onClick={addAboutValue}>Add Value</Button>
                        </SectionCard>

                        <SectionCard title="Team & CTA" description="Manage the team list and the closing About page CTA block.">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Team Title" value={content.about.teamTitle} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, teamTitle: value } }))} />
                                <Field label="Team Accent" value={content.about.teamAccent} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, teamAccent: value } }))} />
                                <Field label="Team Subtitle" value={content.about.teamSubtitle} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, teamSubtitle: value } }))} />
                                <Field label="CTA Title" value={content.about.ctaTitle} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, ctaTitle: value } }))} />
                                <Field label="CTA Subtitle" value={content.about.ctaSubtitle} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, ctaSubtitle: value } }))} />
                                <Field label="CTA Button Text" value={content.about.ctaButtonText} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, ctaButtonText: value } }))} error={getError("about.ctaButtonText")} />
                            </div>
                            {content.about.team.map((member, index) => (
                                <div key={member.id} className="rounded-2xl border border-secondary/10 bg-secondary/5 p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-sm font-bold text-dark">Team Member {index + 1}</p>
                                        {content.about.team.length > 1 ? <button type="button" className="text-xs font-semibold text-red-500" onClick={() => removeTeamMember(index)}>Remove</button> : null}
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Field label="Name" value={member.name} onChange={(value) => updateTeamMember(index, { name: value })} error={getError(`about.team.${index}.name`)} />
                                        <Field label="Role" value={member.role} onChange={(value) => updateTeamMember(index, { role: value })} error={getError(`about.team.${index}.role`)} />
                                        <Field label="Image URL" value={member.image} onChange={(value) => updateTeamMember(index, { image: value })} error={getError(`about.team.${index}.image`)} />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="rounded-2xl" onClick={addTeamMember}>Add Team Member</Button>
                        </SectionCard>
                    </>
                ) : null}

                {!loading && activeTab === "footer" ? (
                    <SectionCard title="Footer & Social Links" description="Update global footer copy and social/account links.">
                        <TextareaField label="Brand Description" value={content.footer.brandDescription} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, brandDescription: value } }))} rows={3} error={getError("footer.brandDescription")} />
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Address" value={content.footer.addressLineOne} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, addressLineOne: value } }))} />
                            <Field label="Phone" value={content.footer.phone} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, phone: value } }))} />
                            <Field label="Email" value={content.footer.email} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, email: value } }))} error={getError("footer.email")} />
                            <Field label="Instagram URL" value={content.footer.instagramUrl} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, instagramUrl: value } }))} error={getError("footer.instagramUrl")} />
                            <Field label="Facebook URL" value={content.footer.facebookUrl} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, facebookUrl: value } }))} error={getError("footer.facebookUrl")} />
                            <Field label="Twitter URL" value={content.footer.twitterUrl} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, twitterUrl: value } }))} error={getError("footer.twitterUrl")} />
                        </div>
                    </SectionCard>
                ) : null}

                {!loading && activeTab === "policies" ? (
                    <>
                        <SectionCard title="Rules Page" description="Edit the public ordering rules page content.">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Page Title" value={content.rules.pageTitle} onChange={(value) => setContent((current) => ({ ...current, rules: { ...current.rules, pageTitle: value } }))} error={getError("rules.pageTitle")} />
                                <Field label="Page Subtitle" value={content.rules.pageSubtitle} onChange={(value) => setContent((current) => ({ ...current, rules: { ...current.rules, pageSubtitle: value } }))} />
                                <Field label="Delivery Title" value={content.rules.deliveryTitle} onChange={(value) => setContent((current) => ({ ...current, rules: { ...current.rules, deliveryTitle: value } }))} />
                                <Field label="Availability Title" value={content.rules.availabilityTitle} onChange={(value) => setContent((current) => ({ ...current, rules: { ...current.rules, availabilityTitle: value } }))} />
                                <Field label="Payment Title" value={content.rules.paymentTitle} onChange={(value) => setContent((current) => ({ ...current, rules: { ...current.rules, paymentTitle: value } }))} />
                            </div>
                            <TextareaField label="Delivery Text" value={content.rules.deliveryText} onChange={(value) => setContent((current) => ({ ...current, rules: { ...current.rules, deliveryText: value } }))} rows={3} error={getError("rules.deliveryText")} />
                            <TextareaField label="Availability Text" value={content.rules.availabilityText} onChange={(value) => setContent((current) => ({ ...current, rules: { ...current.rules, availabilityText: value } }))} rows={3} error={getError("rules.availabilityText")} />
                            <TextareaField label="Payment Text" value={content.rules.paymentText} onChange={(value) => setContent((current) => ({ ...current, rules: { ...current.rules, paymentText: value } }))} rows={3} error={getError("rules.paymentText")} />
                        </SectionCard>

                        <SectionCard title="Terms Page" description="Edit Terms & Conditions heading and section list.">
                            <Field label="Page Title" value={content.terms.pageTitle} onChange={(value) => setContent((current) => ({ ...current, terms: { ...current.terms, pageTitle: value } }))} error={getError("terms.pageTitle")} />
                            {content.terms.sections.map((section, index) => (
                                <div key={section.id} className="rounded-2xl border border-secondary/10 bg-secondary/5 p-5">
                                    <p className="mb-3 text-sm font-bold text-dark">Section {index + 1}</p>
                                    <div className="grid gap-4">
                                        <Field
                                            label="Title"
                                            value={section.title}
                                            error={getError(`terms.sections.${index}.title`)}
                                            onChange={(value) => setContent((current) => ({
                                                ...current,
                                                terms: {
                                                    ...current.terms,
                                                    sections: current.terms.sections.map((item, itemIndex) => itemIndex === index ? { ...item, title: value } : item),
                                                },
                                            }))}
                                        />
                                        <TextareaField
                                            label="Body"
                                            value={section.body}
                                            error={getError(`terms.sections.${index}.body`)}
                                            onChange={(value) => setContent((current) => ({
                                                ...current,
                                                terms: {
                                                    ...current.terms,
                                                    sections: current.terms.sections.map((item, itemIndex) => itemIndex === index ? { ...item, body: value } : item),
                                                },
                                            }))}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            ))}
                        </SectionCard>

                        <SectionCard title="Checkout Page" description="Edit public checkout instructions, payment details, and confirmation copy.">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Empty State Title" value={content.checkout.emptyStateTitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, emptyStateTitle: value } }))} />
                                <Field label="Order Info Title" value={content.checkout.orderInfoTitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, orderInfoTitle: value } }))} error={getError("checkout.orderInfoTitle")} />
                                <Field label="Order Info Subtitle" value={content.checkout.orderInfoSubtitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, orderInfoSubtitle: value } }))} />
                                <Field label="Payment Title" value={content.checkout.paymentTitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, paymentTitle: value } }))} error={getError("checkout.paymentTitle")} />
                                <Field label="Payment Subtitle" value={content.checkout.paymentSubtitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, paymentSubtitle: value } }))} />
                                <Field label="Success Title" value={content.checkout.successTitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, successTitle: value } }))} error={getError("checkout.successTitle")} />
                            </div>
                            <TextareaField label="Success Message Template (use {{name}})" value={content.checkout.successMessageTemplate} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, successMessageTemplate: value } }))} rows={2} error={getError("checkout.successMessageTemplate")} />
                            <TextareaField label="Final Step Title" value={content.checkout.finalStepTitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, finalStepTitle: value } }))} rows={2} />
                            <TextareaField label="Final Step Text" value={content.checkout.finalStepText} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, finalStepText: value } }))} rows={3} />
                            <TextareaField label="Guest Tracking Text" value={content.checkout.guestTrackText} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, guestTrackText: value } }))} rows={3} />
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Contact Label" value={content.checkout.paymentContactLabel} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, paymentContactLabel: value } }))} />
                                <Field label="Contact Value" value={content.checkout.paymentContactValue} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, paymentContactValue: value } }))} />
                                <Field label="Contact Hint" value={content.checkout.paymentContactHint} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, paymentContactHint: value } }))} />
                                <Field label="Telebirr Title" value={content.checkout.telebirrTitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, telebirrTitle: value } }))} />
                                <Field label="Telebirr Account" value={content.checkout.telebirrAccount} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, telebirrAccount: value } }))} error={getError("checkout.telebirrAccount")} />
                                <Field label="CBE Title" value={content.checkout.cbeTitle} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, cbeTitle: value } }))} />
                                <Field label="CBE Account" value={content.checkout.cbeAccount} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, cbeAccount: value } }))} error={getError("checkout.cbeAccount")} />
                            </div>
                            <TextareaField label="Payment Step One" value={content.checkout.paymentStepOne} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, paymentStepOne: value } }))} rows={2} />
                            <TextareaField label="Payment Step Two" value={content.checkout.paymentStepTwo} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, paymentStepTwo: value } }))} rows={2} />
                            <TextareaField label="Payment Step Three" value={content.checkout.paymentStepThree} onChange={(value) => setContent((current) => ({ ...current, checkout: { ...current.checkout, paymentStepThree: value } }))} rows={2} />
                        </SectionCard>
                    </>
                ) : null}
            </div>
        </div>
    );
}
