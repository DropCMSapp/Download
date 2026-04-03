#!/usr/bin/env python3
"""Generate DropCMS industry template JSON files (English + Swedish)."""

import json
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

INDUSTRIES = {
    "consulting": {
        "en": {
            "hero": {
                "tagline": "Strategic Business Consulting",
                "title1": "Elevate Your",
                "title2": "Business Strategy",
                "description": "We partner with ambitious organizations to unlock growth, streamline operations, and build lasting competitive advantages.",
                "stat1_num": "15+",
                "stat1_label": "Years Experience",
                "stat2_num": "200+",
                "stat2_label": "Projects Delivered",
                "stat3_num": "98%",
                "stat3_label": "Client Retention"
            },
            "services": {
                "title": "Our Services",
                "cards": [
                    {
                        "title": "Strategy & Growth",
                        "subtitle": "Business Development",
                        "price": "We help you identify untapped opportunities and craft actionable roadmaps that drive sustainable revenue growth and market expansion.",
                        "items": ["Market Analysis", "Growth Strategy", "Competitive Positioning", "Revenue Optimization"],
                        "highlight": False
                    },
                    {
                        "title": "Digital Transformation",
                        "subtitle": "Technology & Innovation",
                        "price": "Modernize your operations with tailored digital strategies that improve efficiency, enhance customer experience, and future-proof your business.",
                        "items": ["Process Automation", "Technology Roadmap", "Change Management", "Performance Analytics"],
                        "highlight": True
                    },
                    {
                        "title": "Leadership Advisory",
                        "subtitle": "Executive Coaching",
                        "price": "Empower your leadership team with proven frameworks for decision-making, team alignment, and organizational excellence.",
                        "items": ["Executive Coaching", "Team Development", "Organizational Design", "Succession Planning"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "About Us",
                "description": "We are a boutique consulting firm built on deep industry expertise and a genuine commitment to our clients' success. Our approach combines data-driven insights with hands-on execution, ensuring that every strategy we develop translates into measurable results."
            },
            "contact": {
                "title": "Start a Conversation",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Strategic Planning", "Business Analysis", "Change Management", "Digital Strategy", "Leadership Development", "Process Optimization"],
                "quote": "\"The best way to predict the future is to create it.\""
            },
            "footer": {
                "description": "Strategic consulting that transforms ambition into measurable business results."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-default",
                "theme_light": "light-default"
            },
            "projects": {
                "categories": [
                    {"id": "strategy", "title": "Strategy"},
                    {"id": "digital", "title": "Digital"},
                    {"id": "leadership", "title": "Leadership"},
                    {"id": "operations", "title": "Operations"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Strategisk Företagsrådgivning",
                "title1": "Lyft Din",
                "title2": "Affärsstrategi",
                "description": "Vi samarbetar med ambitiösa organisationer för att frigöra tillväxt, effektivisera verksamheten och bygga varaktiga konkurrensfördelar.",
                "stat1_num": "15+",
                "stat1_label": "Års Erfarenhet",
                "stat2_num": "200+",
                "stat2_label": "Levererade Projekt",
                "stat3_num": "98%",
                "stat3_label": "Nöjda Kunder"
            },
            "services": {
                "title": "Våra Tjänster",
                "cards": [
                    {
                        "title": "Strategi & Tillväxt",
                        "subtitle": "Affärsutveckling",
                        "price": "Vi hjälper dig identifiera outnyttjade möjligheter och skapar handlingskraftiga färdplaner som driver hållbar intäktstillväxt och marknadsexpansion.",
                        "items": ["Marknadsanalys", "Tillväxtstrategi", "Konkurrenspositionering", "Intäktsoptimering"],
                        "highlight": False
                    },
                    {
                        "title": "Digital Transformation",
                        "subtitle": "Teknologi & Innovation",
                        "price": "Modernisera din verksamhet med skräddarsydda digitala strategier som förbättrar effektiviteten, stärker kundupplevelsen och framtidssäkrar ditt företag.",
                        "items": ["Processautomation", "Teknologisk Färdplan", "Förändringsledning", "Resultatanalys"],
                        "highlight": True
                    },
                    {
                        "title": "Ledarskapsrådgivning",
                        "subtitle": "Executive Coaching",
                        "price": "Stärk ditt ledarskapsteam med beprövade ramverk för beslutsfattande, teamkoordinering och organisatorisk excellens.",
                        "items": ["Executive Coaching", "Teamutveckling", "Organisationsdesign", "Successionsplanering"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Om Oss",
                "description": "Vi är en specialiserad konsultfirma byggd på djup branschexpertis och ett genuint engagemang för våra kunders framgång. Vårt arbetssätt kombinerar datadriven insikt med praktiskt genomförande, så att varje strategi vi utvecklar omsätts i mätbara resultat."
            },
            "contact": {
                "title": "Inled Ett Samtal",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Strategisk Planering", "Verksamhetsanalys", "Förändringsledning", "Digital Strategi", "Ledarskapsutveckling", "Processoptimering"],
                "quote": "\"Det bästa sättet att förutsäga framtiden är att skapa den.\""
            },
            "footer": {
                "description": "Strategisk rådgivning som omvandlar ambition till mätbara affärsresultat."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-default",
                "theme_light": "light-default"
            },
            "projects": {
                "categories": [
                    {"id": "strategi", "title": "Strategi"},
                    {"id": "digitalt", "title": "Digitalt"},
                    {"id": "ledarskap", "title": "Ledarskap"},
                    {"id": "verksamhet", "title": "Verksamhet"}
                ]
            }
        }
    },
    "frisor": {
        "en": {
            "hero": {
                "tagline": "Premium Hair Studio",
                "title1": "Your Style,",
                "title2": "Perfected",
                "description": "Where artistry meets precision. Experience personalized hair care that brings out your best self.",
                "stat1_num": "12+",
                "stat1_label": "Years in the Chair",
                "stat2_num": "5000+",
                "stat2_label": "Happy Clients",
                "stat3_num": "100%",
                "stat3_label": "Passion for Hair"
            },
            "services": {
                "title": "Our Services",
                "cards": [
                    {
                        "title": "Cut & Style",
                        "subtitle": "Precision Haircutting",
                        "price": "From classic cuts to trend-setting styles, every visit begins with a thorough consultation to ensure your look reflects your personality and lifestyle.",
                        "items": ["Women's Cut & Style", "Men's Cut & Grooming", "Children's Haircuts", "Blow Dry & Finish"],
                        "highlight": False
                    },
                    {
                        "title": "Color & Highlights",
                        "subtitle": "Creative Color",
                        "price": "Transform your look with expert color services. We use premium, low-damage products to achieve vibrant, long-lasting results that keep your hair healthy.",
                        "items": ["Full Color", "Balayage & Ombré", "Highlights & Lowlights", "Color Correction"],
                        "highlight": True
                    },
                    {
                        "title": "Treatments & Care",
                        "subtitle": "Hair Wellness",
                        "price": "Restore and revitalize your hair with our luxury treatments. From deep conditioning to scalp therapy, we bring damaged hair back to life.",
                        "items": ["Deep Conditioning", "Keratin Treatment", "Scalp Therapy", "Bridal & Event Styling"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "About the Studio",
                "description": "Our studio is a creative sanctuary where skilled stylists and premium products come together. We believe that great hair isn't just about looking good — it's about feeling confident every single day. Step in and let us take care of the rest."
            },
            "contact": {
                "title": "Book Your Visit",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Precision Cutting", "Creative Coloring", "Bridal Styling", "Hair Restoration", "Trend Expertise", "Personalized Consultation"],
                "quote": "\"Life is too short for boring hair.\""
            },
            "footer": {
                "description": "A premium hair studio dedicated to making you look and feel extraordinary."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-rose",
                "theme_light": "light-warm"
            },
            "projects": {
                "categories": [
                    {"id": "cuts", "title": "Cuts & Styles"},
                    {"id": "color", "title": "Color"},
                    {"id": "bridal", "title": "Bridal"},
                    {"id": "transformations", "title": "Transformations"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Premiumsalong",
                "title1": "Din Stil,",
                "title2": "Fulländad",
                "description": "Där konstnärlighet möter precision. Upplev personlig hårvård som lyfter fram det bästa i dig.",
                "stat1_num": "12+",
                "stat1_label": "År i Stolen",
                "stat2_num": "5000+",
                "stat2_label": "Nöjda Kunder",
                "stat3_num": "100%",
                "stat3_label": "Passion för Hår"
            },
            "services": {
                "title": "Våra Tjänster",
                "cards": [
                    {
                        "title": "Klippning & Styling",
                        "subtitle": "Precisionsklippning",
                        "price": "Från klassiska frisyrer till trendiga stilar börjar varje besök med en grundlig konsultation för att säkerställa att din look speglar din personlighet och livsstil.",
                        "items": ["Damklippning & Styling", "Herrklippning & Skäggtrim", "Barnklippning", "Föning & Styling"],
                        "highlight": False
                    },
                    {
                        "title": "Färg & Slingor",
                        "subtitle": "Kreativ Färgning",
                        "price": "Förvandla din look med expert färgtjänster. Vi använder premiumprodukter med låg skadegrad för livfulla, långvariga resultat som håller håret friskt.",
                        "items": ["Helfärgning", "Balayage & Ombré", "Slingor & Lowlights", "Färgkorrigering"],
                        "highlight": True
                    },
                    {
                        "title": "Behandlingar & Vård",
                        "subtitle": "Hårhälsa",
                        "price": "Återställ och vitalisera ditt hår med våra lyxbehandlingar. Från djupvårdande inpackningar till hårbottenbehandling — vi ger skadat hår nytt liv.",
                        "items": ["Djupvårdande Inpackning", "Keratinbehandling", "Hårbottenbehandling", "Bröllops- & Eventstyling"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Om Salongen",
                "description": "Vår salong är en kreativ oas där skickliga stylister och premiumprodukter möts. Vi tror att fantastiskt hår inte bara handlar om att se bra ut — det handlar om att känna sig självsäker varje dag. Kliv in och låt oss ta hand om resten."
            },
            "contact": {
                "title": "Boka Ditt Besök",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Precisionsklippning", "Kreativ Färgning", "Bröllopsstyling", "Hårrestaurering", "Trendexpertis", "Personlig Konsultation"],
                "quote": "\"Livet är för kort för tråkigt hår.\""
            },
            "footer": {
                "description": "En premiumsalong dedikerad till att få dig att se och känna dig fantastisk."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-rose",
                "theme_light": "light-warm"
            },
            "projects": {
                "categories": [
                    {"id": "klippningar", "title": "Klippningar & Stilar"},
                    {"id": "farg", "title": "Färg"},
                    {"id": "brollop", "title": "Bröllop"},
                    {"id": "transformationer", "title": "Förvandlingar"}
                ]
            }
        }
    },
    "musiker": {
        "en": {
            "hero": {
                "tagline": "Professional Musician",
                "title1": "Feel the",
                "title2": "Music",
                "description": "Captivating live performances and studio sessions that create unforgettable sonic experiences.",
                "stat1_num": "20+",
                "stat1_label": "Years Performing",
                "stat2_num": "300+",
                "stat2_label": "Live Shows",
                "stat3_num": "50+",
                "stat3_label": "Recordings"
            },
            "services": {
                "title": "What I Offer",
                "cards": [
                    {
                        "title": "Live Performance",
                        "subtitle": "Events & Venues",
                        "price": "Bring your event to life with a tailored live performance. From intimate gatherings to large-scale events, every show is crafted to match the moment.",
                        "items": ["Corporate Events", "Private Parties", "Festival Sets", "Wedding Entertainment"],
                        "highlight": False
                    },
                    {
                        "title": "Studio Sessions",
                        "subtitle": "Recording & Production",
                        "price": "Professional session work and production services. Whether you need a featured performance or a full arrangement, I bring musicality and precision to every track.",
                        "items": ["Session Recording", "Arrangement", "Music Production", "Mixing Collaboration"],
                        "highlight": True
                    },
                    {
                        "title": "Teaching & Workshops",
                        "subtitle": "Music Education",
                        "price": "Personalized lessons and group workshops for all skill levels. Learn technique, theory, and the art of musical expression from an experienced performer.",
                        "items": ["Private Lessons", "Group Workshops", "Masterclasses", "Online Coaching"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "About Me",
                "description": "Music has been my language for over two decades. From smoky jazz clubs to grand concert halls, I've dedicated my life to the craft of sound. Every performance is a conversation — between the music, the audience, and the moment."
            },
            "contact": {
                "title": "Let's Make Music",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Live Performance", "Studio Recording", "Music Production", "Arrangement", "Music Education", "Event Entertainment"],
                "quote": "\"Where words fail, music speaks.\""
            },
            "footer": {
                "description": "Professional musician delivering unforgettable performances and studio excellence."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-violet",
                "theme_light": "light-default"
            },
            "projects": {
                "categories": [
                    {"id": "live", "title": "Live"},
                    {"id": "studio", "title": "Studio"},
                    {"id": "collaborations", "title": "Collaborations"},
                    {"id": "teaching", "title": "Teaching"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Professionell Musiker",
                "title1": "Känn",
                "title2": "Musiken",
                "description": "Fängslande liveframträdanden och studiosessioner som skapar oförglömliga musikupplevelser.",
                "stat1_num": "20+",
                "stat1_label": "År på Scen",
                "stat2_num": "300+",
                "stat2_label": "Livekonserter",
                "stat3_num": "50+",
                "stat3_label": "Inspelningar"
            },
            "services": {
                "title": "Vad Jag Erbjuder",
                "cards": [
                    {
                        "title": "Liveframträdande",
                        "subtitle": "Event & Scener",
                        "price": "Ge ditt event liv med ett skräddarsytt liveframträdande. Från intima sammankomster till storskaliga event anpassas varje spelning efter stunden.",
                        "items": ["Företagsevent", "Privata Fester", "Festivalspelningar", "Bröllopsunderhållning"],
                        "highlight": False
                    },
                    {
                        "title": "Studiosessioner",
                        "subtitle": "Inspelning & Produktion",
                        "price": "Professionellt sessionsspel och produktionstjänster. Oavsett om du behöver ett solistiskt bidrag eller ett komplett arrangemang levererar jag musikalitet och precision i varje spår.",
                        "items": ["Sessionsinspelning", "Arrangemang", "Musikproduktion", "Mixsamarbete"],
                        "highlight": True
                    },
                    {
                        "title": "Undervisning & Workshops",
                        "subtitle": "Musikutbildning",
                        "price": "Personliga lektioner och gruppworkshops för alla nivåer. Lär dig teknik, teori och konsten att uttrycka dig musikaliskt av en erfaren musiker.",
                        "items": ["Privatlektioner", "Gruppworkshops", "Masterclass", "Onlinecoaching"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Om Mig",
                "description": "Musiken har varit mitt språk i över två decennier. Från rökiga jazzklubbar till stora konserthallar har jag ägnat mitt liv åt ljudets hantverk. Varje framträdande är ett samtal — mellan musiken, publiken och ögonblicket."
            },
            "contact": {
                "title": "Låt Oss Skapa Musik",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Liveframträdande", "Studioinspelning", "Musikproduktion", "Arrangemang", "Musikundervisning", "Eventunderhållning"],
                "quote": "\"Där orden tar slut börjar musiken.\""
            },
            "footer": {
                "description": "Professionell musiker som levererar oförglömliga framträdanden och studioexcellens."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-violet",
                "theme_light": "light-default"
            },
            "projects": {
                "categories": [
                    {"id": "live", "title": "Live"},
                    {"id": "studio", "title": "Studio"},
                    {"id": "samarbeten", "title": "Samarbeten"},
                    {"id": "undervisning", "title": "Undervisning"}
                ]
            }
        }
    },
    "portfolio": {
        "en": {
            "hero": {
                "tagline": "Creative Design Studio",
                "title1": "Design That",
                "title2": "Speaks Volumes",
                "description": "Thoughtful, purposeful design that elevates brands and creates meaningful digital experiences.",
                "stat1_num": "10+",
                "stat1_label": "Years in Design",
                "stat2_num": "150+",
                "stat2_label": "Projects Completed",
                "stat3_num": "40+",
                "stat3_label": "Brand Identities"
            },
            "services": {
                "title": "Services",
                "cards": [
                    {
                        "title": "Brand Identity",
                        "subtitle": "Visual Strategy",
                        "price": "Build a brand that resonates. From logo design to complete visual systems, we create cohesive identities that tell your story and connect with your audience.",
                        "items": ["Logo Design", "Brand Guidelines", "Visual Identity Systems", "Brand Strategy"],
                        "highlight": False
                    },
                    {
                        "title": "Web & Digital",
                        "subtitle": "Digital Design",
                        "price": "Beautiful, functional websites and digital products designed with the user in mind. Every pixel serves a purpose, every interaction feels intuitive.",
                        "items": ["Website Design", "UI/UX Design", "Responsive Layouts", "Interactive Prototypes"],
                        "highlight": True
                    },
                    {
                        "title": "Print & Editorial",
                        "subtitle": "Graphic Design",
                        "price": "From brochures to packaging, we craft print materials that demand attention and communicate your message with clarity and elegance.",
                        "items": ["Editorial Layout", "Packaging Design", "Marketing Materials", "Art Direction"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "About",
                "description": "I'm a designer who believes that great design is invisible — it just works. With a background spanning brand identity, digital products, and editorial design, I bring a holistic perspective to every project. The goal is always the same: create something that looks beautiful and works brilliantly."
            },
            "contact": {
                "title": "Start a Project",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Brand Identity", "Web Design", "UI/UX", "Typography", "Art Direction", "Creative Strategy"],
                "quote": "\"Design is not just what it looks like. Design is how it works.\""
            },
            "footer": {
                "description": "A creative studio crafting purposeful design that connects brands with people."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-default",
                "theme_light": "light-ocean"
            },
            "projects": {
                "categories": [
                    {"id": "branding", "title": "Branding"},
                    {"id": "web", "title": "Web"},
                    {"id": "print", "title": "Print"},
                    {"id": "photography", "title": "Photography"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Kreativ Designstudio",
                "title1": "Design Som",
                "title2": "Gör Intryck",
                "description": "Genomtänkt, målmedveten design som lyfter varumärken och skapar meningsfulla digitala upplevelser.",
                "stat1_num": "10+",
                "stat1_label": "År inom Design",
                "stat2_num": "150+",
                "stat2_label": "Genomförda Projekt",
                "stat3_num": "40+",
                "stat3_label": "Varumärkesidentiteter"
            },
            "services": {
                "title": "Tjänster",
                "cards": [
                    {
                        "title": "Varumärkesidentitet",
                        "subtitle": "Visuell Strategi",
                        "price": "Bygg ett varumärke som berör. Från logotypdesign till kompletta visuella system skapar vi sammanhängande identiteter som berättar din historia och når din målgrupp.",
                        "items": ["Logotypdesign", "Varumärkesriktlinjer", "Visuella Identitetssystem", "Varumärkesstrategi"],
                        "highlight": False
                    },
                    {
                        "title": "Webb & Digitalt",
                        "subtitle": "Digital Design",
                        "price": "Vackra, funktionella webbplatser och digitala produkter designade med användaren i fokus. Varje pixel har ett syfte, varje interaktion känns intuitiv.",
                        "items": ["Webbdesign", "UI/UX-design", "Responsiva Layouter", "Interaktiva Prototyper"],
                        "highlight": True
                    },
                    {
                        "title": "Tryck & Redaktionellt",
                        "subtitle": "Grafisk Design",
                        "price": "Från broschyrer till förpackningar skapar vi trycksaker som fångar uppmärksamhet och förmedlar ditt budskap med klarhet och elegans.",
                        "items": ["Redaktionell Layout", "Förpackningsdesign", "Marknadsföringsmaterial", "Art Direction"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Om Mig",
                "description": "Jag är en designer som tror att bra design är osynlig — den bara fungerar. Med en bakgrund som spänner över varumärkesidentitet, digitala produkter och redaktionell design tar jag ett helhetsperspektiv på varje projekt. Målet är alltid detsamma: skapa något som ser vackert ut och fungerar briljant."
            },
            "contact": {
                "title": "Starta Ett Projekt",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Varumärkesidentitet", "Webbdesign", "UI/UX", "Typografi", "Art Direction", "Kreativ Strategi"],
                "quote": "\"Design är inte bara hur det ser ut. Design är hur det fungerar.\""
            },
            "footer": {
                "description": "En kreativ studio som skapar målmedveten design som förenar varumärken med människor."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-default",
                "theme_light": "light-ocean"
            },
            "projects": {
                "categories": [
                    {"id": "varumarke", "title": "Varumärke"},
                    {"id": "webb", "title": "Webb"},
                    {"id": "tryck", "title": "Tryck"},
                    {"id": "fotografi", "title": "Fotografi"}
                ]
            }
        }
    },
    "restaurant": {
        "en": {
            "hero": {
                "tagline": "Fine Dining Experience",
                "title1": "Taste the",
                "title2": "Extraordinary",
                "description": "A culinary journey where seasonal ingredients meet creative passion, served in an atmosphere you won't forget.",
                "stat1_num": "15+",
                "stat1_label": "Years of Excellence",
                "stat2_num": "50K+",
                "stat2_label": "Guests Served",
                "stat3_num": "4.9",
                "stat3_label": "Average Rating"
            },
            "services": {
                "title": "Our Menus",
                "cards": [
                    {
                        "title": "Lunch Menu",
                        "subtitle": "Weekdays 11–14",
                        "price": "A refined midday experience featuring seasonal dishes crafted with locally sourced ingredients. Perfect for a business lunch or a well-deserved break.",
                        "items": ["Seasonal Starter", "Choice of Main Course", "Dessert of the Day", "Coffee & Petit Fours"],
                        "highlight": False
                    },
                    {
                        "title": "Tasting Menu",
                        "subtitle": "Chef's Selection",
                        "price": "Our signature experience. Five courses that take you on a journey through the best flavors of the season, each paired with carefully selected wines.",
                        "items": ["Five Curated Courses", "Wine Pairing Option", "Amuse-Bouche", "Seasonal Ingredients"],
                        "highlight": True
                    },
                    {
                        "title": "À La Carte",
                        "subtitle": "Evening Dining",
                        "price": "Explore our full evening menu, where classic techniques meet modern creativity. Every dish tells a story of craftsmanship and passion.",
                        "items": ["Starters & Small Plates", "Fish & Seafood", "Meat & Game", "Artisan Desserts"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Our Story",
                "description": "What started as a dream in a small kitchen has grown into one of the city's most beloved dining destinations. We source our ingredients from local farms and fishermen, and our menu evolves with the seasons. Here, every meal is an experience — crafted with care and served with heart."
            },
            "contact": {
                "title": "Reserve a Table",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Seasonal Cuisine", "Wine Pairings", "Private Dining", "Catering", "Tasting Menus", "Local Ingredients"],
                "quote": "\"Cooking is an art, but all art requires knowing something about the techniques and materials.\""
            },
            "footer": {
                "description": "A fine dining experience where seasonal ingredients and creative passion come together."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-amber",
                "theme_light": "light-warm"
            },
            "projects": {
                "categories": [
                    {"id": "dishes", "title": "Signature Dishes"},
                    {"id": "ambiance", "title": "Ambiance"},
                    {"id": "events", "title": "Private Events"},
                    {"id": "team", "title": "Our Team"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Exklusiv Matupplevelse",
                "title1": "Smaka det",
                "title2": "Extraordinära",
                "description": "En kulinarisk resa där säsongens råvaror möter kreativ passion, serverad i en atmosfär du sent glömmer.",
                "stat1_num": "15+",
                "stat1_label": "År av Excellens",
                "stat2_num": "50K+",
                "stat2_label": "Serverade Gäster",
                "stat3_num": "4.9",
                "stat3_label": "Snittbetyg"
            },
            "services": {
                "title": "Våra Menyer",
                "cards": [
                    {
                        "title": "Lunchmeny",
                        "subtitle": "Vardagar 11–14",
                        "price": "En förfinad middagsupplevelse med säsongsrätter lagade på närproducerade råvaror. Perfekt för en affärslunch eller en välförtjänt paus.",
                        "items": ["Säsongens Förrätt", "Valfri Huvudrätt", "Dagens Dessert", "Kaffe & Petit Fours"],
                        "highlight": False
                    },
                    {
                        "title": "Avsmakningmeny",
                        "subtitle": "Kockens Val",
                        "price": "Vår signaturupplevelse. Fem rätter som tar dig på en resa genom säsongens bästa smaker, var och en matchad med noggrant utvalda viner.",
                        "items": ["Fem Kurerade Rätter", "Vinpaket", "Amuse-Bouche", "Säsongens Råvaror"],
                        "highlight": True
                    },
                    {
                        "title": "À La Carte",
                        "subtitle": "Kvällsmeny",
                        "price": "Utforska vår kompletta kvällsmeny där klassiska tekniker möter modern kreativitet. Varje rätt berättar en historia om hantverk och passion.",
                        "items": ["Förrätter & Smårätter", "Fisk & Skaldjur", "Kött & Vilt", "Hantverksdessert"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Vår Historia",
                "description": "Det som började som en dröm i ett litet kök har vuxit till en av stadens mest älskade matdestinationer. Vi hämtar våra råvaror från lokala gårdar och fiskare, och vår meny utvecklas med säsongerna. Här är varje måltid en upplevelse — skapad med omsorg och serverad med hjärta."
            },
            "contact": {
                "title": "Boka Bord",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Säsongsbaserad Meny", "Vinrekommendationer", "Privata Middagar", "Catering", "Avsmakningsmenyer", "Lokala Råvaror"],
                "quote": "\"Matlagning är en konst, men all konst kräver kunskap om tekniker och råvaror.\""
            },
            "footer": {
                "description": "En exklusiv matupplevelse där säsongens råvaror och kreativ passion förenas."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-amber",
                "theme_light": "light-warm"
            },
            "projects": {
                "categories": [
                    {"id": "ratter", "title": "Signaturrätter"},
                    {"id": "miljo", "title": "Miljö"},
                    {"id": "event", "title": "Privata Event"},
                    {"id": "team", "title": "Vårt Team"}
                ]
            }
        }
    },
    "shop": {
        "en": {
            "hero": {
                "tagline": "Curated Goods",
                "title1": "Discover",
                "title2": "Something Special",
                "description": "A thoughtfully curated collection of quality products, handpicked for people who appreciate craftsmanship and design.",
                "stat1_num": "500+",
                "stat1_label": "Products",
                "stat2_num": "50+",
                "stat2_label": "Trusted Brands",
                "stat3_num": "10K+",
                "stat3_label": "Happy Customers"
            },
            "services": {
                "title": "Collections",
                "cards": [
                    {
                        "title": "Everyday Essentials",
                        "subtitle": "Daily Finds",
                        "price": "Carefully selected everyday items that combine quality and design. Products you'll reach for again and again, built to last and made to love.",
                        "items": ["Premium Materials", "Timeless Design", "Sustainably Sourced", "Gift Ready"],
                        "highlight": False
                    },
                    {
                        "title": "Signature Collection",
                        "subtitle": "Editor's Picks",
                        "price": "Our flagship selection of standout pieces from the world's most exciting makers. Each item is chosen for its quality, story, and ability to bring joy.",
                        "items": ["Artisan Crafted", "Limited Editions", "Exclusive Collaborations", "Curated Selection"],
                        "highlight": True
                    },
                    {
                        "title": "Gifts & Occasions",
                        "subtitle": "Meaningful Gifting",
                        "price": "Find the perfect gift for every occasion. From beautifully wrapped sets to personalized options, make every moment memorable.",
                        "items": ["Gift Boxes", "Personalization", "Corporate Gifting", "Seasonal Collections"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Our Philosophy",
                "description": "We believe that the things you surround yourself with should bring you joy. Every product in our store is handpicked for its quality, design, and the story behind it. We work directly with makers and artisans who share our commitment to craftsmanship and sustainability."
            },
            "contact": {
                "title": "Visit Us",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Curated Selection", "Quality Products", "Sustainable Sourcing", "Gift Wrapping", "Personal Shopping", "Worldwide Shipping"],
                "quote": "\"Have nothing in your houses that you do not know to be useful, or believe to be beautiful.\""
            },
            "footer": {
                "description": "A curated shop where quality, design, and craftsmanship come together."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-emerald",
                "theme_light": "light-forest"
            },
            "projects": {
                "categories": [
                    {"id": "home", "title": "Home"},
                    {"id": "accessories", "title": "Accessories"},
                    {"id": "gifts", "title": "Gifts"},
                    {"id": "seasonal", "title": "Seasonal"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Handplockade Produkter",
                "title1": "Upptäck",
                "title2": "Något Speciellt",
                "description": "En omsorgsfullt kurerad kollektion av kvalitetsprodukter, handplockade för dig som uppskattar hantverk och design.",
                "stat1_num": "500+",
                "stat1_label": "Produkter",
                "stat2_num": "50+",
                "stat2_label": "Betrodda Varumärken",
                "stat3_num": "10K+",
                "stat3_label": "Nöjda Kunder"
            },
            "services": {
                "title": "Kollektioner",
                "cards": [
                    {
                        "title": "Vardagsfavoriter",
                        "subtitle": "Dagliga Fynd",
                        "price": "Noggrant utvalda vardagsprodukter som kombinerar kvalitet och design. Produkter du kommer att älska att använda om och om igen, byggda för att hålla.",
                        "items": ["Premiummaterial", "Tidlös Design", "Hållbart Producerat", "Presentfärdigt"],
                        "highlight": False
                    },
                    {
                        "title": "Signaturkollektion",
                        "subtitle": "Redaktionens Val",
                        "price": "Vårt flaggskepsurval av utstickande produkter från världens mest spännande tillverkare. Varje föremål är valt för sin kvalitet, historia och förmåga att sprida glädje.",
                        "items": ["Hantverkstillverkat", "Limiterade Upplagor", "Exklusiva Samarbeten", "Kurerat Urval"],
                        "highlight": True
                    },
                    {
                        "title": "Presenter & Tillfällen",
                        "subtitle": "Meningsfull Presentgivning",
                        "price": "Hitta den perfekta presenten för varje tillfälle. Från vackert inslagna set till personliga alternativ — gör varje ögonblick minnesvärt.",
                        "items": ["Presentboxar", "Personalisering", "Företagspresenter", "Säsongskollektion"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Vår Filosofi",
                "description": "Vi tror att sakerna du omger dig med ska ge dig glädje. Varje produkt i vår butik är handplockad för sin kvalitet, design och berättelsen bakom den. Vi arbetar direkt med tillverkare och hantverkare som delar vårt engagemang för hantverk och hållbarhet."
            },
            "contact": {
                "title": "Besök Oss",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Kurerat Urval", "Kvalitetsprodukter", "Hållbar Sourcing", "Presentinslagning", "Personlig Shopping", "Världsomspännande Frakt"],
                "quote": "\"Ha inget i ditt hem som du inte vet är användbart, eller tror är vackert.\""
            },
            "footer": {
                "description": "En kurerad butik där kvalitet, design och hantverk förenas."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-emerald",
                "theme_light": "light-forest"
            },
            "projects": {
                "categories": [
                    {"id": "hem", "title": "Hem"},
                    {"id": "accessoarer", "title": "Accessoarer"},
                    {"id": "presenter", "title": "Presenter"},
                    {"id": "sasong", "title": "Säsong"}
                ]
            }
        }
    },
    "snickare": {
        "en": {
            "hero": {
                "tagline": "Master Carpentry",
                "title1": "Built with",
                "title2": "Craftsmanship",
                "description": "From bespoke furniture to complete renovations, we bring precision and passion to every project we touch.",
                "stat1_num": "25+",
                "stat1_label": "Years of Experience",
                "stat2_num": "800+",
                "stat2_label": "Projects Built",
                "stat3_num": "100%",
                "stat3_label": "Quality Guaranteed"
            },
            "services": {
                "title": "Our Craft",
                "cards": [
                    {
                        "title": "Custom Furniture",
                        "subtitle": "Bespoke Woodwork",
                        "price": "Handcrafted furniture designed to fit your space and style perfectly. From dining tables to built-in shelving, every piece is made to last generations.",
                        "items": ["Dining Tables & Chairs", "Shelving & Storage", "Bedroom Furniture", "Office Desks"],
                        "highlight": False
                    },
                    {
                        "title": "Kitchens & Interiors",
                        "subtitle": "Complete Joinery",
                        "price": "Transform your home with custom kitchens, wardrobes, and interior woodwork. We handle everything from design to installation with meticulous attention to detail.",
                        "items": ["Kitchen Cabinets", "Built-in Wardrobes", "Bathroom Vanities", "Interior Paneling"],
                        "highlight": True
                    },
                    {
                        "title": "Renovations & Restoration",
                        "subtitle": "Structural Work",
                        "price": "Whether you're renovating a modern home or restoring a heritage building, we bring structural expertise and a deep respect for materials to every job.",
                        "items": ["Home Renovations", "Heritage Restoration", "Deck & Patio", "Structural Carpentry"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "About Our Workshop",
                "description": "We're a family-run carpentry workshop with over two decades of experience. Every project begins with a conversation and ends with something you'll be proud to call yours. We work with sustainably sourced timber and traditional techniques, because we believe the best results come from respecting the material."
            },
            "contact": {
                "title": "Get a Free Quote",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Custom Furniture", "Kitchen Installation", "Renovations", "Heritage Restoration", "Sustainable Materials", "Precision Joinery"],
                "quote": "\"The details are not the details. They make the design.\""
            },
            "footer": {
                "description": "Master carpentry and joinery — built with precision, crafted with passion."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-amber",
                "theme_light": "light-warm"
            },
            "projects": {
                "categories": [
                    {"id": "furniture", "title": "Furniture"},
                    {"id": "kitchens", "title": "Kitchens"},
                    {"id": "renovations", "title": "Renovations"},
                    {"id": "restoration", "title": "Restoration"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Mästerligt Snickeri",
                "title1": "Byggt med",
                "title2": "Hantverk",
                "description": "Från skräddarsydda möbler till kompletta renoveringar — vi levererar precision och passion i varje projekt.",
                "stat1_num": "25+",
                "stat1_label": "Års Erfarenhet",
                "stat2_num": "800+",
                "stat2_label": "Genomförda Projekt",
                "stat3_num": "100%",
                "stat3_label": "Kvalitetsgaranti"
            },
            "services": {
                "title": "Vårt Hantverk",
                "cards": [
                    {
                        "title": "Specialmöbler",
                        "subtitle": "Måttbeställt Snickeri",
                        "price": "Handgjorda möbler designade för att passa ditt utrymme och din stil perfekt. Från matbord till inbyggda hyllor — varje möbel är gjord för att hålla i generationer.",
                        "items": ["Matbord & Stolar", "Hyllor & Förvaring", "Sovrumsmobler", "Skrivbord"],
                        "highlight": False
                    },
                    {
                        "title": "Kök & Inredning",
                        "subtitle": "Komplett Snickeritjänst",
                        "price": "Förvandla ditt hem med specialbyggda kök, garderober och inredningssnickeri. Vi hanterar allt från design till montering med noggrann uppmärksamhet på detaljer.",
                        "items": ["Köksluckor & Stommar", "Inbyggda Garderober", "Badrumsinredning", "Väggpaneler"],
                        "highlight": True
                    },
                    {
                        "title": "Renovering & Restaurering",
                        "subtitle": "Byggarbeten",
                        "price": "Oavsett om du renoverar ett modernt hem eller restaurerar en kulturbyggnad levererar vi strukturell expertis och djup respekt för materialet.",
                        "items": ["Husrenovering", "Kulturbyggnadsrestaurering", "Altan & Trädäck", "Byggsnickeri"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Om Vår Verkstad",
                "description": "Vi är ett familjedrivet snickeri med över två decenniers erfarenhet. Varje projekt börjar med ett samtal och slutar med något du kan vara stolt över. Vi arbetar med hållbart utvunnet virke och traditionella tekniker, för vi tror att de bästa resultaten kommer av att respektera materialet."
            },
            "contact": {
                "title": "Begär Fri Offert",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Specialmöbler", "Köksmontering", "Renovering", "Kulturrestaurering", "Hållbara Material", "Precisionssnickeri"],
                "quote": "\"Detaljerna är inte detaljer. De skapar designen.\""
            },
            "footer": {
                "description": "Mästerligt snickeri och inredning — byggt med precision, skapat med passion."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-amber",
                "theme_light": "light-warm"
            },
            "projects": {
                "categories": [
                    {"id": "mobler", "title": "Möbler"},
                    {"id": "kok", "title": "Kök"},
                    {"id": "renovering", "title": "Renovering"},
                    {"id": "restaurering", "title": "Restaurering"}
                ]
            }
        }
    },
    "tech": {
        "en": {
            "hero": {
                "tagline": "Technology Solutions",
                "title1": "Build the",
                "title2": "Future",
                "description": "We design and develop cutting-edge software solutions that help businesses scale, innovate, and stay ahead of the curve.",
                "stat1_num": "10+",
                "stat1_label": "Years Shipping Code",
                "stat2_num": "100+",
                "stat2_label": "Products Launched",
                "stat3_num": "99.9%",
                "stat3_label": "Uptime SLA"
            },
            "services": {
                "title": "What We Build",
                "cards": [
                    {
                        "title": "Web Applications",
                        "subtitle": "Full-Stack Development",
                        "price": "Custom web applications built with modern frameworks and best practices. From MVPs to enterprise platforms, we deliver scalable solutions that perform.",
                        "items": ["React & Next.js", "API Development", "Cloud Architecture", "Performance Optimization"],
                        "highlight": False
                    },
                    {
                        "title": "SaaS Products",
                        "subtitle": "Product Engineering",
                        "price": "End-to-end product development for SaaS companies. We handle architecture, development, deployment, and ongoing iteration to help you find product-market fit faster.",
                        "items": ["Product Strategy", "Microservices", "CI/CD Pipelines", "Analytics & Monitoring"],
                        "highlight": True
                    },
                    {
                        "title": "Consulting & DevOps",
                        "subtitle": "Technical Advisory",
                        "price": "Expert guidance on architecture decisions, technology selection, and infrastructure optimization. We help teams work smarter and ship faster.",
                        "items": ["Architecture Review", "Infrastructure as Code", "Security Audits", "Team Augmentation"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "About Us",
                "description": "We're a team of engineers and product thinkers who love solving hard problems with elegant code. We've helped startups launch their first product and enterprises modernize legacy systems. Our approach is pragmatic: ship fast, iterate often, and never stop learning."
            },
            "contact": {
                "title": "Let's Build Something",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Full-Stack Development", "Cloud Architecture", "DevOps & CI/CD", "Product Strategy", "Security", "Performance Engineering"],
                "quote": "\"Any sufficiently advanced technology is indistinguishable from magic.\""
            },
            "footer": {
                "description": "Modern technology solutions that help businesses scale and innovate."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-default",
                "theme_light": "light-ocean"
            },
            "projects": {
                "categories": [
                    {"id": "web-apps", "title": "Web Apps"},
                    {"id": "saas", "title": "SaaS"},
                    {"id": "mobile", "title": "Mobile"},
                    {"id": "infrastructure", "title": "Infrastructure"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Teknologilösningar",
                "title1": "Bygg",
                "title2": "Framtiden",
                "description": "Vi designar och utvecklar banbrytande mjukvarulösningar som hjälper företag att skala, förnya och ligga steget före.",
                "stat1_num": "10+",
                "stat1_label": "År av Kodleverans",
                "stat2_num": "100+",
                "stat2_label": "Lanserade Produkter",
                "stat3_num": "99.9%",
                "stat3_label": "Drifttid SLA"
            },
            "services": {
                "title": "Vad Vi Bygger",
                "cards": [
                    {
                        "title": "Webbapplikationer",
                        "subtitle": "Full-Stack-utveckling",
                        "price": "Skräddarsydda webbapplikationer byggda med moderna ramverk och best practices. Från MVP till enterpriseplattformar levererar vi skalbara lösningar som presterar.",
                        "items": ["React & Next.js", "API-utveckling", "Molnarkitektur", "Prestandaoptimering"],
                        "highlight": False
                    },
                    {
                        "title": "SaaS-produkter",
                        "subtitle": "Produktutveckling",
                        "price": "Komplett produktutveckling för SaaS-bolag. Vi hanterar arkitektur, utveckling, deployment och löpande iteration för att hjälpa dig hitta product-market fit snabbare.",
                        "items": ["Produktstrategi", "Mikrotjänster", "CI/CD-pipelines", "Analys & Övervakning"],
                        "highlight": True
                    },
                    {
                        "title": "Rådgivning & DevOps",
                        "subtitle": "Teknisk Konsultation",
                        "price": "Expertguidning kring arkitekturbeslut, teknikval och infrastrukturoptimering. Vi hjälper team att arbeta smartare och leverera snabbare.",
                        "items": ["Arkitekturgranskning", "Infrastructure as Code", "Säkerhetsgranskningar", "Teamförstärkning"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Om Oss",
                "description": "Vi är ett team av ingenjörer och produkttänkare som älskar att lösa svåra problem med elegant kod. Vi har hjälpt startups att lansera sin första produkt och storföretag att modernisera legacysystem. Vårt arbetssätt är pragmatiskt: leverera snabbt, iterera ofta och aldrig sluta lära."
            },
            "contact": {
                "title": "Låt Oss Bygga Något",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Full-Stack-utveckling", "Molnarkitektur", "DevOps & CI/CD", "Produktstrategi", "Säkerhet", "Prestandaoptimering"],
                "quote": "\"Tillräckligt avancerad teknologi är oskiljbar från magi.\""
            },
            "footer": {
                "description": "Moderna teknologilösningar som hjälper företag att skala och förnya sig."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-default",
                "theme_light": "light-ocean"
            },
            "projects": {
                "categories": [
                    {"id": "webbappar", "title": "Webbappar"},
                    {"id": "saas", "title": "SaaS"},
                    {"id": "mobil", "title": "Mobil"},
                    {"id": "infrastruktur", "title": "Infrastruktur"}
                ]
            }
        }
    },
    "transport": {
        "en": {
            "hero": {
                "tagline": "Reliable Transport Solutions",
                "title1": "Moving Your",
                "title2": "Business Forward",
                "description": "Professional logistics and transport services built on reliability, efficiency, and a commitment to on-time delivery.",
                "stat1_num": "20+",
                "stat1_label": "Years on the Road",
                "stat2_num": "50K+",
                "stat2_label": "Deliveries Made",
                "stat3_num": "99.5%",
                "stat3_label": "On-Time Rate"
            },
            "services": {
                "title": "Our Services",
                "cards": [
                    {
                        "title": "Local & Regional",
                        "subtitle": "Express Delivery",
                        "price": "Fast and reliable local and regional transport. From same-day express to scheduled routes, we keep your supply chain running smoothly.",
                        "items": ["Same-Day Delivery", "Scheduled Routes", "Last-Mile Solutions", "Temperature Controlled"],
                        "highlight": False
                    },
                    {
                        "title": "Freight & Logistics",
                        "subtitle": "Full-Scale Transport",
                        "price": "Comprehensive freight solutions for businesses of all sizes. We manage everything from route planning to customs clearance, so you can focus on your core business.",
                        "items": ["Full Truckload (FTL)", "Partial Load (LTL)", "Cross-Border Transport", "Warehousing"],
                        "highlight": True
                    },
                    {
                        "title": "Specialized Transport",
                        "subtitle": "Custom Solutions",
                        "price": "Handling sensitive, oversized, or high-value cargo requires expertise. Our specialized fleet and trained crews ensure your goods arrive safely, every time.",
                        "items": ["Fragile Goods", "Heavy & Oversized", "High-Value Cargo", "Hazardous Materials"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "About Our Company",
                "description": "Built on a foundation of reliability and hard work, we've grown from a single truck operation to a full-service transport company. We invest in modern vehicles, GPS tracking, and rigorous safety standards because we know your cargo is your livelihood. When we say on time, we mean it."
            },
            "contact": {
                "title": "Request a Quote",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Freight Logistics", "Express Delivery", "Warehousing", "Route Optimization", "GPS Tracking", "Safety Certified"],
                "quote": "\"The road to success is always under construction — and we know every mile of it.\""
            },
            "footer": {
                "description": "Professional transport and logistics — delivering reliability on every route."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-emerald",
                "theme_light": "light-default"
            },
            "projects": {
                "categories": [
                    {"id": "fleet", "title": "Our Fleet"},
                    {"id": "logistics", "title": "Logistics"},
                    {"id": "specialized", "title": "Specialized"},
                    {"id": "warehouse", "title": "Warehousing"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Pålitliga Transportlösningar",
                "title1": "Vi Driver Din",
                "title2": "Verksamhet Framåt",
                "description": "Professionella logistik- och transporttjänster byggda på pålitlighet, effektivitet och ett löfte om leverans i tid.",
                "stat1_num": "20+",
                "stat1_label": "År på Vägen",
                "stat2_num": "50K+",
                "stat2_label": "Genomförda Leveranser",
                "stat3_num": "99.5%",
                "stat3_label": "Leverans i Tid"
            },
            "services": {
                "title": "Våra Tjänster",
                "cards": [
                    {
                        "title": "Lokalt & Regionalt",
                        "subtitle": "Expressleverans",
                        "price": "Snabb och pålitlig lokal och regional transport. Från expressleverans samma dag till schemalagda rutter håller vi din leveranskedja igång.",
                        "items": ["Leverans Samma Dag", "Schemalagda Rutter", "Sista-milen-lösningar", "Temperaturkontrollerat"],
                        "highlight": False
                    },
                    {
                        "title": "Frakt & Logistik",
                        "subtitle": "Fullskalig Transport",
                        "price": "Omfattande fraktlösningar för företag i alla storlekar. Vi hanterar allt från ruttplanering till tullklarering, så att du kan fokusera på din kärnverksamhet.",
                        "items": ["Hellass (FTL)", "Dellast (LTL)", "Gränsöverskridande Transport", "Lagerhållning"],
                        "highlight": True
                    },
                    {
                        "title": "Specialtransport",
                        "subtitle": "Anpassade Lösningar",
                        "price": "Hantering av känsligt, överdimensionerat eller värdefullt gods kräver expertis. Vår specialflotta och utbildade personal säkerställer att dina varor anländer säkert, varje gång.",
                        "items": ["Ömtåligt Gods", "Tungt & Överdimensionerat", "Värdegods", "Farligt Gods"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Om Vårt Företag",
                "description": "Byggt på en grund av pålitlighet och hårt arbete har vi vuxit från en enskild lastbil till ett fullserviceföretag inom transport. Vi investerar i moderna fordon, GPS-spårning och rigorösa säkerhetsstandarder för vi vet att ditt gods är din verksamhet. När vi säger i tid menar vi det."
            },
            "contact": {
                "title": "Begär Offert",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Fraktlogistik", "Expressleverans", "Lagerhållning", "Ruttoptimering", "GPS-spårning", "Säkerhetscertifierad"],
                "quote": "\"Vägen till framgång är alltid under konstruktion — och vi känner varje mil av den.\""
            },
            "footer": {
                "description": "Professionell transport och logistik — pålitlighet på varje rutt."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-emerald",
                "theme_light": "light-default"
            },
            "projects": {
                "categories": [
                    {"id": "flotta", "title": "Vår Flotta"},
                    {"id": "logistik", "title": "Logistik"},
                    {"id": "special", "title": "Specialtransport"},
                    {"id": "lager", "title": "Lagerhållning"}
                ]
            }
        }
    },
    "vvs": {
        "en": {
            "hero": {
                "tagline": "Professional Plumbing & HVAC",
                "title1": "Comfort You",
                "title2": "Can Count On",
                "description": "Expert plumbing, heating, and ventilation services for homes and businesses. Fast response, lasting solutions.",
                "stat1_num": "20+",
                "stat1_label": "Years in the Trade",
                "stat2_num": "3000+",
                "stat2_label": "Jobs Completed",
                "stat3_num": "24/7",
                "stat3_label": "Emergency Service"
            },
            "services": {
                "title": "Our Services",
                "cards": [
                    {
                        "title": "Plumbing",
                        "subtitle": "Installation & Repair",
                        "price": "From leaking faucets to complete bathroom renovations, our certified plumbers deliver reliable workmanship backed by years of hands-on experience.",
                        "items": ["Pipe Installation", "Leak Detection & Repair", "Bathroom Renovation", "Drain Cleaning"],
                        "highlight": False
                    },
                    {
                        "title": "Heating & Cooling",
                        "subtitle": "Climate Systems",
                        "price": "Stay comfortable year-round with expert heating and cooling solutions. We install, maintain, and repair all major systems to keep your indoor climate perfect.",
                        "items": ["Heat Pump Installation", "Underfloor Heating", "AC Installation", "System Maintenance"],
                        "highlight": True
                    },
                    {
                        "title": "Ventilation",
                        "subtitle": "Air Quality",
                        "price": "Proper ventilation is essential for health and energy efficiency. We design and install ventilation systems that ensure fresh, clean air throughout your property.",
                        "items": ["Ventilation Design", "Duct Installation", "Air Quality Testing", "Energy Recovery"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "About Us",
                "description": "We're a team of certified professionals who take pride in doing the job right the first time. With over two decades of experience in plumbing, heating, and ventilation, we've built our reputation on honest work, fair pricing, and solutions that stand the test of time."
            },
            "contact": {
                "title": "Get in Touch",
                "address": "Your Street, Your City",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Your Street Address<br>Your City<br>Your Country",
                "competencies": ["Plumbing", "Heating Systems", "Air Conditioning", "Ventilation", "Emergency Service", "Energy Efficiency"],
                "quote": "\"The bitterness of poor quality remains long after the sweetness of low price is forgotten.\""
            },
            "footer": {
                "description": "Professional plumbing and HVAC services — reliable comfort for homes and businesses."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-default",
                "theme_light": "light-default"
            },
            "projects": {
                "categories": [
                    {"id": "plumbing", "title": "Plumbing"},
                    {"id": "heating", "title": "Heating"},
                    {"id": "ventilation", "title": "Ventilation"},
                    {"id": "renovations", "title": "Renovations"}
                ]
            }
        },
        "sv": {
            "hero": {
                "tagline": "Professionell VVS-teknik",
                "title1": "Komfort Du",
                "title2": "Kan Lita På",
                "description": "Expert inom rörmokeri, värme och ventilation för hem och företag. Snabb respons, hållbara lösningar.",
                "stat1_num": "20+",
                "stat1_label": "År i Branschen",
                "stat2_num": "3000+",
                "stat2_label": "Utförda Jobb",
                "stat3_num": "24/7",
                "stat3_label": "Jourservice"
            },
            "services": {
                "title": "Våra Tjänster",
                "cards": [
                    {
                        "title": "Rörmokeri",
                        "subtitle": "Installation & Reparation",
                        "price": "Från droppande kranar till kompletta badrumsrenoveringar levererar våra certifierade rörmokare pålitligt arbete med mångårig erfarenhet som grund.",
                        "items": ["Rörinstallation", "Läcksökning & Reparation", "Badrumsrenovering", "Avloppsspolning"],
                        "highlight": False
                    },
                    {
                        "title": "Värme & Kyla",
                        "subtitle": "Klimatsystem",
                        "price": "Håll dig bekväm året runt med expertlösningar för värme och kyla. Vi installerar, underhåller och reparerar alla större system för ett perfekt inomhusklimat.",
                        "items": ["Värmepumpsinstallation", "Golvvärme", "AC-installation", "Systemunderhåll"],
                        "highlight": True
                    },
                    {
                        "title": "Ventilation",
                        "subtitle": "Luftkvalitet",
                        "price": "Rätt ventilation är avgörande för hälsa och energieffektivitet. Vi projekterar och installerar ventilationssystem som säkerställer frisk, ren luft i hela fastigheten.",
                        "items": ["Ventilationsprojektering", "Kanalinstallation", "Luftkvalitetstestning", "Värmeåtervinning"],
                        "highlight": False
                    }
                ]
            },
            "about": {
                "title": "Om Oss",
                "description": "Vi är ett team av certifierade yrkesmänniskor som tar stolthet i att göra jobbet rätt från start. Med över två decenniers erfarenhet inom VVS har vi byggt vårt rykte på ärligt arbete, rättvisa priser och lösningar som håller över tid."
            },
            "contact": {
                "title": "Kontakta Oss",
                "address": "Din Gata, Din Stad",
                "company_name": "__SITE_NAME__",
                "company_info": "__SITE_NAME__<br>Din Gatuadress<br>Din Stad<br>Ditt Land",
                "competencies": ["Rörmokeri", "Värmesystem", "Luftkonditionering", "Ventilation", "Jourservice", "Energieffektivitet"],
                "quote": "\"Bitterheten av dålig kvalitet kvarstår långt efter att glädjen av ett lågt pris är bortglömd.\""
            },
            "footer": {
                "description": "Professionell VVS-teknik — pålitlig komfort för hem och företag."
            },
            "hero_bg": {
                "bg_image": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=80",
                "overlay_dark": "0.65",
                "overlay_light": "0.60"
            },
            "settings": {
                "ga_id": "",
                "availability_status": "accent",
                "theme_dark": "dark-default",
                "theme_light": "light-default"
            },
            "projects": {
                "categories": [
                    {"id": "ror", "title": "Rörmokeri"},
                    {"id": "varme", "title": "Värme"},
                    {"id": "ventilation", "title": "Ventilation"},
                    {"id": "renovering", "title": "Renovering"}
                ]
            }
        }
    }
}


def main():
    files_written = 0
    for name, langs in INDUSTRIES.items():
        # English
        en_path = os.path.join(OUTPUT_DIR, f"{name}.json")
        with open(en_path, "w", encoding="utf-8") as f:
            json.dump(langs["en"], f, indent=4, ensure_ascii=False)
        print(f"  Written: {en_path}")
        files_written += 1

        # Swedish
        sv_path = os.path.join(OUTPUT_DIR, f"{name}_sv.json")
        with open(sv_path, "w", encoding="utf-8") as f:
            json.dump(langs["sv"], f, indent=4, ensure_ascii=False)
        print(f"  Written: {sv_path}")
        files_written += 1

    print(f"\nDone! {files_written} files written.")


if __name__ == "__main__":
    main()
