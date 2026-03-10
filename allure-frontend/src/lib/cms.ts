export type CmsSettingEntry = {
    key: string;
    value: string;
};

export type HeroSlideContent = {
    id: number;
    tag: string;
    title: string;
    titleAccent: string;
    description: string;
    badges: [string, string, string];
    image: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
};

export type PromotionBannerContent = {
    enabled: boolean;
    highlight: string;
    text: string;
};

export type ContactContent = {
    heroEyebrow: string;
    heroTitle: string;
    heroAccent: string;
    heroDescription: string;
    phoneLabel: string;
    phoneNumber: string;
    phoneHours: string;
    socialLabel: string;
    telegramHandle: string;
    instagramHandle: string;
    locationLabel: string;
    locationLineOne: string;
    locationLineTwo: string;
    orderHelpTitle: string;
    orderHelpText: string;
    formTitle: string;
    formSubtitle: string;
};

export type AboutValueContent = {
    id: number;
    title: string;
    description: string;
    icon: "Shield" | "Star" | "Heart" | "Zap";
};

export type AboutTeamMemberContent = {
    id: number;
    name: string;
    role: string;
    image: string;
};

export type AboutContent = {
    heroEyebrow: string;
    heroTitle: string;
    heroAccent: string;
    heroDescription: string;
    storyTitle: string;
    storyParagraphOne: string;
    storyParagraphTwo: string;
    quote: string;
    valuesTitle: string;
    valuesAccent: string;
    valuesSubtitle: string;
    values: AboutValueContent[];
    teamTitle: string;
    teamAccent: string;
    teamSubtitle: string;
    team: AboutTeamMemberContent[];
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButtonText: string;
};

export type FooterContent = {
    brandDescription: string;
    addressLineOne: string;
    phone: string;
    email: string;
    instagramUrl: string;
    facebookUrl: string;
    twitterUrl: string;
};

export type RulesContent = {
    pageTitle: string;
    pageSubtitle: string;
    deliveryTitle: string;
    deliveryText: string;
    availabilityTitle: string;
    availabilityText: string;
    paymentTitle: string;
    paymentText: string;
};

export type TermsSection = {
    id: number;
    title: string;
    body: string;
};

export type TermsContent = {
    pageTitle: string;
    sections: TermsSection[];
};

export type CheckoutContent = {
    emptyStateTitle: string;
    infoTitle: string;
    infoSubtitle: string;
    paymentTitle: string;
    paymentSubtitle: string;
    successTitle: string;
    successMessageTemplate: string;
    finalStepTitle: string;
    finalStepText: string;
    guestTrackText: string;
    paymentContactLabel: string;
    paymentContactValue: string;
    paymentContactHint: string;
    telebirrTitle: string;
    telebirrAccount: string;
    cbeTitle: string;
    cbeAccount: string;
    paymentStepOne: string;
    paymentStepTwo: string;
    paymentStepThree: string;
    orderInfoTitle: string;
    orderInfoSubtitle: string;
};

export type CmsContent = {
    homeHeroSlides: HeroSlideContent[];
    promotionBanner: PromotionBannerContent;
    contact: ContactContent;
    about: AboutContent;
    footer: FooterContent;
    rules: RulesContent;
    terms: TermsContent;
    checkout: CheckoutContent;
};

export const DEFAULT_CMS_CONTENT: CmsContent = {
    homeHeroSlides: [
        {
            id: 1,
            tag: "Premium Fashion & Lifestyle",
            title: "Clean, Elegant, ",
            titleAccent: "Alluring",
            description: "Discover a curated collection of beautiful products designed for the modern social-media active buyer. Experience fast and friendly shopping.",
            badges: ["Fast delivery", "Premium quality", "Secure checkout"],
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
            ctaText: "Shop Now",
            ctaLink: "/catalog",
            secondaryCtaText: "Custom Request",
            secondaryCtaLink: "/custom-preorder",
        },
        {
            id: 2,
            tag: "New Arrivals",
            title: "Modern, Chic, ",
            titleAccent: "Timeless",
            description: "Explore our latest arrivals that blend contemporary style with timeless elegance. Perfect for any occasion.",
            badges: ["Fresh drops", "Handpicked styles", "Easy ordering"],
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop",
            ctaText: "View Collection",
            ctaLink: "/catalog?category=new",
            secondaryCtaText: "Learn More",
            secondaryCtaLink: "/about",
        },
        {
            id: 3,
            tag: "Exclusive Offers",
            title: "Bold, Unique, ",
            titleAccent: "You",
            description: "Stand out from the crowd with our exclusive limited-time offers. Fashion that expresses your true self.",
            badges: ["Limited offers", "Top picks", "Trusted support"],
            image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop",
            ctaText: "Shop Sale",
            ctaLink: "/catalog?category=sale",
            secondaryCtaText: "Contact Us",
            secondaryCtaLink: "/contact",
        },
    ],
    promotionBanner: {
        enabled: true,
        highlight: "Free Delivery",
        text: "in Addis Ababa! Limited time offer",
    },
    contact: {
        heroEyebrow: "We're Here For You",
        heroTitle: "Get in",
        heroAccent: "Touch",
        heroDescription: "Have questions about an order or a preorder? We're here to help.",
        phoneLabel: "Phone",
        phoneNumber: "0911 223 344",
        phoneHours: "Available 9:00 AM - 8:00 PM",
        socialLabel: "Social Channels",
        telegramHandle: "@AllureOnline",
        instagramHandle: "@allure_et",
        locationLabel: "Location",
        locationLineOne: "Addis Ababa, Ethiopia",
        locationLineTwo: "Bole, Medhanialem Area",
        orderHelpTitle: "Order Issues?",
        orderHelpText: "If you're contacting us about a specific order, please have your order number ready (e.g. ORD-1001) so we can help you faster.",
        formTitle: "Send Us a Message",
        formSubtitle: "We usually reply within a few hours.",
    },
    about: {
        heroEyebrow: "Our Journey",
        heroTitle: "The Allure",
        heroAccent: "Story",
        heroDescription: "Elevating online shopping in Ethiopia with beauty, trust, and speed.",
        storyTitle: "Where Aesthetics Meets Reliability.",
        storyParagraphOne: "Allure Online Shopping started with a simple yet powerful idea: that shopping should be as beautiful as the products themselves. In a fast-paced digital world, we noticed a gap - urban shoppers who value aesthetics and reliability needed a platform that understood their lifestyle.",
        storyParagraphTwo: "We've built Allure to be more than just an e-commerce site. It's a digital foundation for small businesses to grow and a curated sanctuary for shoppers who seek high-quality, handpicked items.",
        quote: '"Our platform is built to be fast and uncluttered, ensuring your products take center stage."',
        valuesTitle: "Our Core",
        valuesAccent: "Values",
        valuesSubtitle: "The principles that guide everything we do.",
        values: [
            { id: 1, title: "Integrity", description: "We believe in honest communication and transparent business practices every step of the way.", icon: "Shield" },
            { id: 2, title: "Quality", description: "Every product in our collection is handpicked and hand-checked for the highest standards.", icon: "Star" },
            { id: 3, title: "Beauty", description: "Aesthetics matters. We curate products that are not just functional but also beautiful.", icon: "Heart" },
            { id: 4, title: "Speed", description: "Fast delivery and responsive support are the foundations of our service.", icon: "Zap" },
        ],
        teamTitle: "Meet the",
        teamAccent: "Creators",
        teamSubtitle: "The passionate individuals working behind the scenes.",
        team: [
            { id: 1, name: "Abebe Kebede", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
            { id: 2, name: "Selamawit Tadesse", role: "Creative Director", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop" },
            { id: 3, name: "Yonas Alemu", role: "Head of Logistics", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" },
        ],
        ctaTitle: "Ready to discover your style?",
        ctaSubtitle: "Browse our latest collections today.",
        ctaButtonText: "Shop All Collection",
    },
    footer: {
        brandDescription: "Your premium destination for social-media active shoppers. Clean, friendly, and fast.",
        addressLineOne: "Addis Ababa, Ethiopia",
        phone: "+251 9XX XXX XXX",
        email: "hello@allure.com",
        instagramUrl: "#",
        facebookUrl: "#",
        twitterUrl: "#",
    },
    rules: {
        pageTitle: "Ordering Rules",
        pageSubtitle: "Everything you need to know about shopping with us.",
        deliveryTitle: "Delivery Policy",
        deliveryText: "Free delivery is available for all orders within Addis Ababa. For other cities, delivery fees and schedules are negotiated manually after order placement.",
        availabilityTitle: "Availability & Pre-Orders",
        availabilityText: "In-Store: Available immediately. 1-2 days delivery. Pre-Order: Products directly from Shein or Turkey. Estimated wait time is 10-14 business days.",
        paymentTitle: "Payment Confirmation",
        paymentText: "All payments are manual. After placing an order, please share your payment confirmation screenshot (Telebirr/CBE) to our official Telegram channel for order validation.",
    },
    terms: {
        pageTitle: "Terms & Conditions",
        sections: [
            {
                id: 1,
                title: "1. Ordering Process",
                body: "By placing an order on Allure Online Shopping, you agree to our manual payment and delivery process. Orders are considered pending until payment confirmation is received.",
            },
            {
                id: 2,
                title: "2. Pre-Orders",
                body: "Items marked as Pre-Order are sourced globally (SHEIN, Turkey, etc.). Estimated arrival times are between 7-14 days. Delays may occur due to international shipping and customs.",
            },
            {
                id: 3,
                title: "3. Payment Policy",
                body: "We accept manual payments via Telebirr, CBE, or Cash on Delivery (for eligible items). Proof of payment (screenshot) must be shared via Telegram or WhatsApp to confirm your order.",
            },
            {
                id: 4,
                title: "4. Returns & Exchanges",
                body: "Due to the nature of our business model (sourcing specifically for you), we generally do not accept returns unless the item is damaged or incorrect. Please check the size guides carefully before ordering.",
            },
            {
                id: 5,
                title: "5. Delivery",
                body: "Free delivery is provided within Addis Ababa. For cities outside Addis, delivery fees are negotiated based on distance and service provider.",
            },
        ],
    },
    checkout: {
        emptyStateTitle: "Nothing to checkout",
        infoTitle: "Order Information",
        infoSubtitle: "Please provide your details for delivery.",
        paymentTitle: "Payment Instructions",
        paymentSubtitle: "Choose your preferred bank and follow the steps.",
        successTitle: "Order Placed!",
        successMessageTemplate: "Thank you {{name}}, your order has been successfully registered in our system.",
        finalStepTitle: "Final Step",
        finalStepText: "To fully confirm your purchase, please complete the manual payment. Orders without payment screenshots are automatically cancelled after 2 hours.",
        guestTrackText: "You can track this order anytime with your order number and phone number. If you create an account later with the same phone, it will sync automatically.",
        paymentContactLabel: "Send Screenshot to",
        paymentContactValue: "+251 911 223 344",
        paymentContactHint: "(Telegram or WhatsApp)",
        telebirrTitle: "Telebirr",
        telebirrAccount: "0911 223 344 (Allure Online)",
        cbeTitle: "Commercial Bank (CBE)",
        cbeAccount: "1000123456789 (Allure Online)",
        paymentStepOne: "Complete the transfer through your bank app.",
        paymentStepTwo: "Take a screenshot of the successful transaction.",
        paymentStepThree: "Your order ID is generated on the next screen.",
        orderInfoTitle: "Order Information",
        orderInfoSubtitle: "Please provide your details for delivery.",
    },
};

const safeJsonParse = <T,>(value: string | undefined, fallback: T): T => {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
};

const getString = (map: Map<string, string>, key: string, fallback: string) => map.get(key) ?? fallback;
const getBoolean = (map: Map<string, string>, key: string, fallback: boolean) => {
    const value = map.get(key);
    if (typeof value === "undefined") {
        return fallback;
    }
    return value === "true";
};

const sanitizeHeroSlides = (slides: HeroSlideContent[]): HeroSlideContent[] => {
    if (!Array.isArray(slides) || slides.length === 0) {
        return DEFAULT_CMS_CONTENT.homeHeroSlides;
    }

    return slides.map((slide, index) => ({
        ...DEFAULT_CMS_CONTENT.homeHeroSlides[index] ?? DEFAULT_CMS_CONTENT.homeHeroSlides[0],
        ...slide,
        id: slide.id ?? index + 1,
        badges: [slide.badges?.[0] ?? "", slide.badges?.[1] ?? "", slide.badges?.[2] ?? ""],
    }));
};

export const mapSettingsToCmsContent = (settings: CmsSettingEntry[]): CmsContent => {
    const map = new Map(settings.map((item) => [item.key, item.value]));

    return {
        homeHeroSlides: sanitizeHeroSlides(
            safeJsonParse<HeroSlideContent[]>(map.get("home_hero_slides"), DEFAULT_CMS_CONTENT.homeHeroSlides)
        ),
        promotionBanner: {
            enabled: getBoolean(map, "promotion_banner_enabled", DEFAULT_CMS_CONTENT.promotionBanner.enabled),
            highlight: getString(map, "promotion_banner_highlight", DEFAULT_CMS_CONTENT.promotionBanner.highlight),
            text: getString(map, "promotion_banner_text", DEFAULT_CMS_CONTENT.promotionBanner.text),
        },
        contact: {
            heroEyebrow: getString(map, "contact_hero_eyebrow", DEFAULT_CMS_CONTENT.contact.heroEyebrow),
            heroTitle: getString(map, "contact_hero_title", DEFAULT_CMS_CONTENT.contact.heroTitle),
            heroAccent: getString(map, "contact_hero_accent", DEFAULT_CMS_CONTENT.contact.heroAccent),
            heroDescription: getString(map, "contact_hero_description", DEFAULT_CMS_CONTENT.contact.heroDescription),
            phoneLabel: getString(map, "contact_phone_label", DEFAULT_CMS_CONTENT.contact.phoneLabel),
            phoneNumber: getString(map, "contact_phone_number", DEFAULT_CMS_CONTENT.contact.phoneNumber),
            phoneHours: getString(map, "contact_phone_hours", DEFAULT_CMS_CONTENT.contact.phoneHours),
            socialLabel: getString(map, "contact_social_label", DEFAULT_CMS_CONTENT.contact.socialLabel),
            telegramHandle: getString(map, "contact_social_telegram", DEFAULT_CMS_CONTENT.contact.telegramHandle),
            instagramHandle: getString(map, "contact_social_instagram", DEFAULT_CMS_CONTENT.contact.instagramHandle),
            locationLabel: getString(map, "contact_location_label", DEFAULT_CMS_CONTENT.contact.locationLabel),
            locationLineOne: getString(map, "contact_location_line_one", DEFAULT_CMS_CONTENT.contact.locationLineOne),
            locationLineTwo: getString(map, "contact_location_line_two", DEFAULT_CMS_CONTENT.contact.locationLineTwo),
            orderHelpTitle: getString(map, "contact_order_help_title", DEFAULT_CMS_CONTENT.contact.orderHelpTitle),
            orderHelpText: getString(map, "contact_order_help_text", DEFAULT_CMS_CONTENT.contact.orderHelpText),
            formTitle: getString(map, "contact_form_title", DEFAULT_CMS_CONTENT.contact.formTitle),
            formSubtitle: getString(map, "contact_form_subtitle", DEFAULT_CMS_CONTENT.contact.formSubtitle),
        },
        about: {
            heroEyebrow: getString(map, "about_hero_eyebrow", DEFAULT_CMS_CONTENT.about.heroEyebrow),
            heroTitle: getString(map, "about_hero_title", DEFAULT_CMS_CONTENT.about.heroTitle),
            heroAccent: getString(map, "about_hero_accent", DEFAULT_CMS_CONTENT.about.heroAccent),
            heroDescription: getString(map, "about_hero_description", DEFAULT_CMS_CONTENT.about.heroDescription),
            storyTitle: getString(map, "about_story_title", DEFAULT_CMS_CONTENT.about.storyTitle),
            storyParagraphOne: getString(map, "about_story_paragraph_one", DEFAULT_CMS_CONTENT.about.storyParagraphOne),
            storyParagraphTwo: getString(map, "about_story_paragraph_two", DEFAULT_CMS_CONTENT.about.storyParagraphTwo),
            quote: getString(map, "about_story_quote", DEFAULT_CMS_CONTENT.about.quote),
            valuesTitle: getString(map, "about_values_title", DEFAULT_CMS_CONTENT.about.valuesTitle),
            valuesAccent: getString(map, "about_values_accent", DEFAULT_CMS_CONTENT.about.valuesAccent),
            valuesSubtitle: getString(map, "about_values_subtitle", DEFAULT_CMS_CONTENT.about.valuesSubtitle),
            values: safeJsonParse<AboutValueContent[]>(map.get("about_values_items"), DEFAULT_CMS_CONTENT.about.values),
            teamTitle: getString(map, "about_team_title", DEFAULT_CMS_CONTENT.about.teamTitle),
            teamAccent: getString(map, "about_team_accent", DEFAULT_CMS_CONTENT.about.teamAccent),
            teamSubtitle: getString(map, "about_team_subtitle", DEFAULT_CMS_CONTENT.about.teamSubtitle),
            team: safeJsonParse<AboutTeamMemberContent[]>(map.get("about_team_items"), DEFAULT_CMS_CONTENT.about.team),
            ctaTitle: getString(map, "about_cta_title", DEFAULT_CMS_CONTENT.about.ctaTitle),
            ctaSubtitle: getString(map, "about_cta_subtitle", DEFAULT_CMS_CONTENT.about.ctaSubtitle),
            ctaButtonText: getString(map, "about_cta_button_text", DEFAULT_CMS_CONTENT.about.ctaButtonText),
        },
        footer: {
            brandDescription: getString(map, "footer_brand_description", DEFAULT_CMS_CONTENT.footer.brandDescription),
            addressLineOne: getString(map, "footer_address_line_one", DEFAULT_CMS_CONTENT.footer.addressLineOne),
            phone: getString(map, "footer_phone", DEFAULT_CMS_CONTENT.footer.phone),
            email: getString(map, "footer_email", DEFAULT_CMS_CONTENT.footer.email),
            instagramUrl: getString(map, "footer_instagram_url", DEFAULT_CMS_CONTENT.footer.instagramUrl),
            facebookUrl: getString(map, "footer_facebook_url", DEFAULT_CMS_CONTENT.footer.facebookUrl),
            twitterUrl: getString(map, "footer_twitter_url", DEFAULT_CMS_CONTENT.footer.twitterUrl),
        },
        rules: {
            pageTitle: getString(map, "rules_page_title", DEFAULT_CMS_CONTENT.rules.pageTitle),
            pageSubtitle: getString(map, "rules_page_subtitle", DEFAULT_CMS_CONTENT.rules.pageSubtitle),
            deliveryTitle: getString(map, "rules_delivery_title", DEFAULT_CMS_CONTENT.rules.deliveryTitle),
            deliveryText: getString(map, "rules_delivery_text", DEFAULT_CMS_CONTENT.rules.deliveryText),
            availabilityTitle: getString(map, "rules_availability_title", DEFAULT_CMS_CONTENT.rules.availabilityTitle),
            availabilityText: getString(map, "rules_availability_text", DEFAULT_CMS_CONTENT.rules.availabilityText),
            paymentTitle: getString(map, "rules_payment_title", DEFAULT_CMS_CONTENT.rules.paymentTitle),
            paymentText: getString(map, "rules_payment_text", DEFAULT_CMS_CONTENT.rules.paymentText),
        },
        terms: {
            pageTitle: getString(map, "terms_page_title", DEFAULT_CMS_CONTENT.terms.pageTitle),
            sections: safeJsonParse<TermsSection[]>(map.get("terms_sections"), DEFAULT_CMS_CONTENT.terms.sections),
        },
        checkout: {
            emptyStateTitle: getString(map, "checkout_empty_state_title", DEFAULT_CMS_CONTENT.checkout.emptyStateTitle),
            infoTitle: getString(map, "checkout_info_title", DEFAULT_CMS_CONTENT.checkout.infoTitle),
            infoSubtitle: getString(map, "checkout_info_subtitle", DEFAULT_CMS_CONTENT.checkout.infoSubtitle),
            paymentTitle: getString(map, "checkout_payment_title", DEFAULT_CMS_CONTENT.checkout.paymentTitle),
            paymentSubtitle: getString(map, "checkout_payment_subtitle", DEFAULT_CMS_CONTENT.checkout.paymentSubtitle),
            successTitle: getString(map, "checkout_success_title", DEFAULT_CMS_CONTENT.checkout.successTitle),
            successMessageTemplate: getString(map, "checkout_success_message_template", DEFAULT_CMS_CONTENT.checkout.successMessageTemplate),
            finalStepTitle: getString(map, "checkout_final_step_title", DEFAULT_CMS_CONTENT.checkout.finalStepTitle),
            finalStepText: getString(map, "checkout_final_step_text", DEFAULT_CMS_CONTENT.checkout.finalStepText),
            guestTrackText: getString(map, "checkout_guest_track_text", DEFAULT_CMS_CONTENT.checkout.guestTrackText),
            paymentContactLabel: getString(map, "checkout_payment_contact_label", DEFAULT_CMS_CONTENT.checkout.paymentContactLabel),
            paymentContactValue: getString(map, "checkout_payment_contact_value", DEFAULT_CMS_CONTENT.checkout.paymentContactValue),
            paymentContactHint: getString(map, "checkout_payment_contact_hint", DEFAULT_CMS_CONTENT.checkout.paymentContactHint),
            telebirrTitle: getString(map, "checkout_telebirr_title", DEFAULT_CMS_CONTENT.checkout.telebirrTitle),
            telebirrAccount: getString(map, "checkout_telebirr_account", DEFAULT_CMS_CONTENT.checkout.telebirrAccount),
            cbeTitle: getString(map, "checkout_cbe_title", DEFAULT_CMS_CONTENT.checkout.cbeTitle),
            cbeAccount: getString(map, "checkout_cbe_account", DEFAULT_CMS_CONTENT.checkout.cbeAccount),
            paymentStepOne: getString(map, "checkout_payment_step_one", DEFAULT_CMS_CONTENT.checkout.paymentStepOne),
            paymentStepTwo: getString(map, "checkout_payment_step_two", DEFAULT_CMS_CONTENT.checkout.paymentStepTwo),
            paymentStepThree: getString(map, "checkout_payment_step_three", DEFAULT_CMS_CONTENT.checkout.paymentStepThree),
            orderInfoTitle: getString(map, "checkout_order_info_title", DEFAULT_CMS_CONTENT.checkout.orderInfoTitle),
            orderInfoSubtitle: getString(map, "checkout_order_info_subtitle", DEFAULT_CMS_CONTENT.checkout.orderInfoSubtitle),
        },
    };
};

export const mapCmsContentToSettings = (content: CmsContent): CmsSettingEntry[] => [
    { key: "home_hero_slides", value: JSON.stringify(content.homeHeroSlides) },
    { key: "promotion_banner_enabled", value: String(content.promotionBanner.enabled) },
    { key: "promotion_banner_highlight", value: content.promotionBanner.highlight },
    { key: "promotion_banner_text", value: content.promotionBanner.text },
    { key: "contact_hero_eyebrow", value: content.contact.heroEyebrow },
    { key: "contact_hero_title", value: content.contact.heroTitle },
    { key: "contact_hero_accent", value: content.contact.heroAccent },
    { key: "contact_hero_description", value: content.contact.heroDescription },
    { key: "contact_phone_label", value: content.contact.phoneLabel },
    { key: "contact_phone_number", value: content.contact.phoneNumber },
    { key: "contact_phone_hours", value: content.contact.phoneHours },
    { key: "contact_social_label", value: content.contact.socialLabel },
    { key: "contact_social_telegram", value: content.contact.telegramHandle },
    { key: "contact_social_instagram", value: content.contact.instagramHandle },
    { key: "contact_location_label", value: content.contact.locationLabel },
    { key: "contact_location_line_one", value: content.contact.locationLineOne },
    { key: "contact_location_line_two", value: content.contact.locationLineTwo },
    { key: "contact_order_help_title", value: content.contact.orderHelpTitle },
    { key: "contact_order_help_text", value: content.contact.orderHelpText },
    { key: "contact_form_title", value: content.contact.formTitle },
    { key: "contact_form_subtitle", value: content.contact.formSubtitle },
    { key: "about_hero_eyebrow", value: content.about.heroEyebrow },
    { key: "about_hero_title", value: content.about.heroTitle },
    { key: "about_hero_accent", value: content.about.heroAccent },
    { key: "about_hero_description", value: content.about.heroDescription },
    { key: "about_story_title", value: content.about.storyTitle },
    { key: "about_story_paragraph_one", value: content.about.storyParagraphOne },
    { key: "about_story_paragraph_two", value: content.about.storyParagraphTwo },
    { key: "about_story_quote", value: content.about.quote },
    { key: "about_values_title", value: content.about.valuesTitle },
    { key: "about_values_accent", value: content.about.valuesAccent },
    { key: "about_values_subtitle", value: content.about.valuesSubtitle },
    { key: "about_values_items", value: JSON.stringify(content.about.values) },
    { key: "about_team_title", value: content.about.teamTitle },
    { key: "about_team_accent", value: content.about.teamAccent },
    { key: "about_team_subtitle", value: content.about.teamSubtitle },
    { key: "about_team_items", value: JSON.stringify(content.about.team) },
    { key: "about_cta_title", value: content.about.ctaTitle },
    { key: "about_cta_subtitle", value: content.about.ctaSubtitle },
    { key: "about_cta_button_text", value: content.about.ctaButtonText },
    { key: "footer_brand_description", value: content.footer.brandDescription },
    { key: "footer_address_line_one", value: content.footer.addressLineOne },
    { key: "footer_phone", value: content.footer.phone },
    { key: "footer_email", value: content.footer.email },
    { key: "footer_instagram_url", value: content.footer.instagramUrl },
    { key: "footer_facebook_url", value: content.footer.facebookUrl },
    { key: "footer_twitter_url", value: content.footer.twitterUrl },
    { key: "rules_page_title", value: content.rules.pageTitle },
    { key: "rules_page_subtitle", value: content.rules.pageSubtitle },
    { key: "rules_delivery_title", value: content.rules.deliveryTitle },
    { key: "rules_delivery_text", value: content.rules.deliveryText },
    { key: "rules_availability_title", value: content.rules.availabilityTitle },
    { key: "rules_availability_text", value: content.rules.availabilityText },
    { key: "rules_payment_title", value: content.rules.paymentTitle },
    { key: "rules_payment_text", value: content.rules.paymentText },
    { key: "terms_page_title", value: content.terms.pageTitle },
    { key: "terms_sections", value: JSON.stringify(content.terms.sections) },
    { key: "checkout_empty_state_title", value: content.checkout.emptyStateTitle },
    { key: "checkout_info_title", value: content.checkout.infoTitle },
    { key: "checkout_info_subtitle", value: content.checkout.infoSubtitle },
    { key: "checkout_payment_title", value: content.checkout.paymentTitle },
    { key: "checkout_payment_subtitle", value: content.checkout.paymentSubtitle },
    { key: "checkout_success_title", value: content.checkout.successTitle },
    { key: "checkout_success_message_template", value: content.checkout.successMessageTemplate },
    { key: "checkout_final_step_title", value: content.checkout.finalStepTitle },
    { key: "checkout_final_step_text", value: content.checkout.finalStepText },
    { key: "checkout_guest_track_text", value: content.checkout.guestTrackText },
    { key: "checkout_payment_contact_label", value: content.checkout.paymentContactLabel },
    { key: "checkout_payment_contact_value", value: content.checkout.paymentContactValue },
    { key: "checkout_payment_contact_hint", value: content.checkout.paymentContactHint },
    { key: "checkout_telebirr_title", value: content.checkout.telebirrTitle },
    { key: "checkout_telebirr_account", value: content.checkout.telebirrAccount },
    { key: "checkout_cbe_title", value: content.checkout.cbeTitle },
    { key: "checkout_cbe_account", value: content.checkout.cbeAccount },
    { key: "checkout_payment_step_one", value: content.checkout.paymentStepOne },
    { key: "checkout_payment_step_two", value: content.checkout.paymentStepTwo },
    { key: "checkout_payment_step_three", value: content.checkout.paymentStepThree },
    { key: "checkout_order_info_title", value: content.checkout.orderInfoTitle },
    { key: "checkout_order_info_subtitle", value: content.checkout.orderInfoSubtitle },
];