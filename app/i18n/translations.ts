export type Locale = "nl" | "en";

export const defaultLocale: Locale = "nl";

export const translations = {
  nl: {
    nav: {
      about: "Over",
      live: "Media",
      music: "Muziek",
      contact: "Contact",
      book: "Boek",
      primary: "Hoofdnavigatie",
      mobile: "Mobiele navigatie",
    },
    hero: {
      tagline: "Allround DJ | House | Hardstyle | Reggaeton",
      supporting:
        "Allround DJ met ruim 7 jaar ervaring — voelt de zaal aan en krijgt elke vloer in beweging.",
      listen: "Luister naar mixes",
      book: "Boek ALIGATR",
    },
    about: {
      eyebrow: "Over",
      titleLine1: "Voelt de zaal aan.",
      titleLine2: "Krijgt de vloer in beweging.",
      paragraphs: [
        "Met inmiddels ruim 7 jaar ervaring is ALIGATR een DJ die precies weet wat een evenement nodig heeft. Hij is actief in de regio’s Twente en Delft en staat bekend om zijn enthousiasme: deze DJ is zijn hele leven al met muziek bezig en deelt die passie graag vanaf het podium.",
        "De kracht van ALIGATR ligt in zijn veelzijdigheid. Als Allround DJ voelt hij de sfeer feilloos aan en past hij zijn set aan op het publiek. Of het nu gaat om een clubavond, een verjaardag of een bedrijfsfeest: het doel is altijd om mensen aan het dansen te krijgen.",
        "Daarnaast heeft ALIGATR een grote voorliefde voor genres als House, Hardstyle en Reggaeton. Door zijn passie voor deze stijlen heeft hij ook hier ruime ervaring in opgebouwd: of het nu gaat om het brede spectrum van House, een energieke Hardstyle-set of zonnige Reggaeton-vibes.",
        "ALIGATR heeft vlieguren gemaakt op zeer uiteenlopende locaties. Van optredens in Nederland tot sets in het buitenland op Gran Canaria. Een mooi hoogtepunt op zijn CV is de Paasparty in Bentelo, waar hij voor een groot publiek zijn energieke draaistijl heeft laten zien.",
      ],
    },
    live: {
      eyebrow: "Media",
      title: "Op het podium",
      intro:
        "Momenten van de vloer — clubs, festivals en nachten waar de energie piekt.",
      photos: [
        { src: "/gallery/press-front.png", alt: "ALIGATR pressfoto" },
        { src: "/gallery/press-side.png", alt: "ALIGATR pressfoto zijaanzicht" },
        {
          src: "/gallery/paasparty-aftermovie.mp4",
          alt: "Paasparty aftermovie",
          type: "video",
        },
        { src: "/gallery/hbo-feest.png", alt: "ALIGATR op HBO Feest" },
        { src: "/gallery/la-costa.png", alt: "ALIGATR op La Costa Gran Canaria" },
        { src: "/gallery/koningsdag.png", alt: "ALIGATR op Koningsdag" },
        {
          src: "/gallery/nacht-van-hengelo.png",
          alt: "ALIGATR op Nacht van Hengelo",
        },
        { src: "/gallery/de-musketier.png", alt: "ALIGATR in De Musketier" },
      ],
    },
    music: {
      eyebrow: "Muziek",
      title: "Mixen & Sets",
      intro:
        "Een selectie van de nieuwste mixen en sets — rechtstreeks te beluisteren.",
      playing: "Speelt",
      ready: "Klaar",
      play: "Speel",
      pause: "Pauzeer",
      loading: "Mixes laden…",
      error: "Mixes konden niet geladen worden.",
      openPlaylist: "Open playlist op SoundCloud",
      trackFallback: "ALIGATR mixtape via SoundCloud.",
      nowPlaying: "Nu aan het spelen",
    },
    contact: {
      eyebrow: "Boeken",
      title: "Boek ALIGATR",
      intro:
        "Vertel over je event — datum, sfeer en zaalgrootte. Liever zelf contact? Gebruik de directe kanalen hieronder.",
      email: "E-mail",
      social: "Social",
      name: "Naam",
      namePlaceholder: "Jouw naam",
      emailLabel: "E-mail",
      emailPlaceholder: "jij@email.com",
      date: "Datum",
      eventType: "Type event",
      eventTypePlaceholder: "Kies type event",
      message: "Bericht",
      messagePlaceholder:
        "Locatie, setlengte, sfeer en alles wat ALIGATR moet weten...",
      submit: "VERSTUUR BOEKINGSVERZOEK",
      successTitle: "Aanvraag ontvangen",
      successBody:
        "Bedankt voor je bericht. ALIGATR neemt zo snel mogelijk contact op.",
      eventTypes: [
        "Clubnacht",
        "Festival",
        "Privéfeest",
        "Bruiloft",
        "Zakelijk",
        "Anders",
      ],
    },
    footer: {
      rights: "Alle rechten voorbehouden.",
    },
    lang: {
      label: "Taal",
      nl: "NL",
      en: "EN",
    },
  },
  en: {
    nav: {
      about: "About",
      live: "Media",
      music: "Music",
      contact: "Contact",
      book: "Book",
      primary: "Primary",
      mobile: "Mobile",
    },
    hero: {
      tagline: "All-Round DJ | House | Hardstyle | Reggaeton",
      supporting:
        "All-round DJ with over 7 years of experience — reads the room and gets every floor moving.",
      listen: "Listen to Mixes",
      book: "Book ALIGATR",
    },
    about: {
      eyebrow: "About",
      titleLine1: "Reads the room.",
      titleLine2: "Moves the floor.",
      paragraphs: [
        "With over 7 years of experience, ALIGATR is a DJ who knows exactly what an event needs. Active in the Twente and Delft regions, he’s known for his energy: music has been part of his life from the start, and he loves sharing that passion from the stage.",
        "ALIGATR’s strength is his versatility. As an all-round DJ, he reads the atmosphere effortlessly and shapes his set around the crowd. Whether it’s a club night, a birthday, or a corporate party, the goal is always the same: get people dancing.",
        "He also has a deep love for genres like House, Hardstyle, and Reggaeton. That passion has built real experience across those styles — from the full spectrum of House to high-energy Hardstyle sets and sunny Reggaeton vibes.",
        "ALIGATR has logged hours in very different places, from shows across the Netherlands to sets abroad on Gran Canaria. A highlight on his résumé is Paasparty in Bentelo, where he brought his energetic style to a large crowd.",
      ],
    },
    live: {
      eyebrow: "Media",
      title: "On the floor",
      intro:
        "Moments from the booth — clubs, festivals, and nights where the energy peaks.",
      photos: [
        { src: "/gallery/press-front.png", alt: "ALIGATR press photo" },
        { src: "/gallery/press-side.png", alt: "ALIGATR press photo side view" },
        {
          src: "/gallery/paasparty-aftermovie.mp4",
          alt: "Paasparty aftermovie",
          type: "video",
        },
        { src: "/gallery/hbo-feest.png", alt: "ALIGATR at HBO Feest" },
        {
          src: "/gallery/la-costa.png",
          alt: "ALIGATR at La Costa Gran Canaria",
        },
        { src: "/gallery/koningsdag.png", alt: "ALIGATR on Koningsdag" },
        {
          src: "/gallery/nacht-van-hengelo.png",
          alt: "ALIGATR at Nacht van Hengelo",
        },
        { src: "/gallery/de-musketier.png", alt: "ALIGATR at De Musketier" },
      ],
    },
    music: {
      eyebrow: "Music",
      title: "Mixes & Sets",
      intro:
        "A selection of the latest mixes and sets — ready to play.",
      playing: "Playing",
      ready: "Ready",
      play: "Play",
      pause: "Pause",
      loading: "Loading mixes…",
      error: "Mixes could not be loaded.",
      openPlaylist: "Open playlist on SoundCloud",
      trackFallback: "ALIGATR mixtape via SoundCloud.",
      nowPlaying: "Now playing",
    },
    contact: {
      eyebrow: "Booking",
      title: "Book ALIGATR",
      intro:
        "Tell us about your event — date, vibe, and room size. Direct lines below if you prefer to reach out yourself.",
      email: "Email",
      social: "Social",
      name: "Name",
      namePlaceholder: "Your name",
      emailLabel: "Email",
      emailPlaceholder: "you@email.com",
      date: "Date",
      eventType: "Event Type",
      eventTypePlaceholder: "Select event type",
      message: "Message",
      messagePlaceholder:
        "Venue, set length, vibe, and anything else ALIGATR should know...",
      submit: "SEND BOOKING REQUEST",
      successTitle: "Request received",
      successBody:
        "Thanks for reaching out. ALIGATR will get back to you soon.",
      eventTypes: [
        "Club Night",
        "Festival",
        "Private Party",
        "Wedding",
        "Corporate",
        "Other",
      ],
    },
    footer: {
      rights: "All rights reserved.",
    },
    lang: {
      label: "Language",
      nl: "NL",
      en: "EN",
    },
  },
} as const;

export type Dictionary = (typeof translations)[Locale];
