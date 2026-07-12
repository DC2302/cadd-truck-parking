"use client";

/**
 * CADD bilingual content — American English + Mexican Spanish.
 *
 * All customer-facing UI strings live here. The full Terms & Conditions
 * document intentionally stays in English (lib/terms.ts) — the Spanish UI
 * links to it and says so, and the acceptance record stores which language
 * the customer used. (Recommend an attorney-certified Spanish translation
 * before publishing a bilingual legal text.)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Lang = "en" | "es";

/* ────────────────────────────────────────────────────────────── */

const en = {
  nav: { rates: "Rates", amenities: "Amenities", location: "Location", blog: "Driver's Log", terms: "Terms", reserve: "Reserve a Space" },
  hero: {
    kicker: "Est. 2018 · Midland, Texas · Permian Basin",
    line1: "Park it.",
    line2: "Lock it.",
    line3: "Rest easy.",
    sub: "Secure, fenced, camera-watched truck parking with hot showers, laundry, and a real driver lounge — owned and operated in the heart of the Permian Basin since 2018.",
    ctaReserve: "Reserve a Space",
    ctaRates: "See Rates",
    stats: [
      ["24/7", "Lot Access"],
      ["100%", "Fenced Lot"],
      ["#", "Assigned Spaces"],
      ["$25", "Daily, From"],
    ] as [string, string][],
  },
  marquee: ["Fenced & Secure", "24/7 Cameras", "Assigned Spaces", "Hot Showers", "Laundry On Site", "Driver Lounge", "Pre-Trip Air Stations", "Est. 2018"],
  amenities: {
    kicker: "What You Get",
    title: "More than a patch of dirt.",
    items: [
      { n: "01", title: "Safe & Secure Lot", desc: "Fully fenced with gated entry points and 24/7 camera surveillance across the lot — every space numbered and assigned to you." },
      { n: "02", title: "Hot Showers", desc: "Clean, private, hot showers whenever you roll in. Pay-as-you-go at $1/minute on Trailblazer, or unlimited on the IronHauler plan." },
      { n: "03", title: "Driver Lounge", desc: "WiFi, satellite TV, coffee, vending machines, microwave, and clean restrooms. A real place to reset between hauls." },
      { n: "04", title: "Laundry On Site", desc: "Commercial washers and dryers so you're not hunting for a laundromat on your reset." },
      { n: "05", title: "Grill & Picnic Area", desc: "Gas and charcoal grills with picnic tables. Cook a real meal under the West Texas sky." },
      { n: "06", title: "Pre-Trip Ready", desc: "Air stations for your tires, room to walk your rig, and vetted local service referrals when you need a hand." },
    ],
  },
  rates: {
    kicker: "Two Plans · Four Ways To Pay",
    title: "Pick your ride.",
    sub: "Daily, weekly, monthly, or annual — every space is assigned, numbered, and inside the fence. Reserve and pay online, or accept the terms online and pay by Zelle, Cash App, or cash on arrival.",
    annualNote: "Annual = pay for 10 months, park for 12 — two months free",
    saveVsMonthly: "save {amount} vs monthly",
    reserveBtn: "Reserve {plan}",
    terms: { daily: "Daily", weekly: "Weekly", monthly: "Monthly", annual: "Annual" },
    units: { daily: "/ day", weekly: "/ week", monthly: "/ month", annual: "/ year" },
    termTag: {
      daily: "No commitment — roll in tonight",
      weekly: "For the week-long haul",
      monthly: "Auto-renews on the 1st",
      annual: "Pay for 10 months, park 12",
    },
    mostPopular: "Most Popular",
    included: "What's included with {plan}",
    twoFree: "2 months free",
    plans: {
      trailblazer: {
        kicker: "The Essentials",
        blurb: "A numbered, assigned space inside the fence with full lot access — everything you need to park with peace of mind.",
        showers: "Hot showers available at $1 per minute",
        features: ["Assigned, numbered parking space", "24/7 access to the fenced lot", "24/7 camera surveillance", "Driver lounge, restrooms & WiFi", "Laundry & vending on site", "Pre-trip air stations", "Hot showers — pay as you go ($1/min)"],
      },
      ironhauler: {
        kicker: "The Full Ride",
        blurb: "Everything in Trailblazer, plus unlimited hot showers and priority treatment. Built for drivers who live on the road.",
        showers: "Unlimited hot showers included",
        features: ["Everything in Trailblazer", "UNLIMITED hot showers — no coins, no clock", "Priority space assignment", "Priority support from the facilities officer", "Grill & picnic area access", "First call on service-provider referrals"],
      },
    },
    showerCompare: {
      basicTitle: "Showers on Trailblazer",
      basicPrice: "$1",
      basicUnit: "/ minute",
      basicDesc: "Quick rinse or a long soak — you only pay for the minutes you use.",
      proTitle: "Showers on IronHauler",
      proPrice: "Unlimited",
      proDesc: "No coins, no clock, no cap. Shower every single day — it's included.",
    },
  },
  gallery: {
    kicker: "The Lot",
    title: "See where you're parking.",
    comingSoon: "Lot photo {n} — coming soon",
  },
  brand: {
    kicker: "The CADD Standard",
    title: "Family-owned. Driver-first.",
    body: "CADD isn't a corporate chain — it's a family operation that's been taking care of Permian Basin drivers since 2018. We built the lot we'd want to park in ourselves: clean showers, a real lounge, honest prices, and somebody who answers the phone.",
    point1: "Owned & operated since 2018",
    point2: "A facilities officer on premise 24/7",
    point3: "Group rates for fleets",
  },
  testimonials: {
    kicker: "From The CB",
    title: "Drivers talk.",
    who: "Verified driver review",
    quotes: [
      "Reasonable pricing with onsite showers and laundry machines. Everything a driver actually needs.",
      "The place is very clean and very well kept up.",
      "Great amenities — shower, lounge, and air pumps to fill tires before heading out.",
    ],
  },
  faq: {
    kicker: "Good To Know",
    title: "Straight answers.",
    fleet: "Fleet manager? We offer group rates for multiple trucks —",
    items: [
      { q: "How do I access the restrooms and showers?", a: "The private restroom has a keypad — you get the code as soon as your payment is received. Shower facilities are on the backside of the main building, and IronHauler members get 24/7 access with their own key." },
      { q: "Where can I park my personal vehicle?", a: "There's personal-vehicle parking by the pre-trip station and the exit gate. You can also keep your personal vehicle in your assigned spot, as long as it doesn't sit outside your designated space." },
      { q: "How do I pay for showers, laundry, and vending?", a: "Showers, laundry, vending, and the pre-trip stations all take coins or in-app payment through PayRange — no change machine needed. PayRange purchases even earn points toward free laundry days and showers." },
      { q: "Are pets allowed?", a: "Yes — pets are welcome as long as they're leashed and attended at all times. Please bring your own waste bags and use the trash cans." },
      { q: "Is there a mechanic on site?", a: "We don't employ a mechanic, but plenty of local technicians serve our customers — several offer discounts for CADD parkers. Their cards are in the lounge, and most parts vendors deliver right to the lot. There are also 5 truck fuel stations within a 3-mile radius." },
      { q: "Do you offer group or fleet rates?", a: "Yes! We offer special pricing on group parking passes for fleets. Call 1-833-4PARKLOT and ask about group options." },
    ],
  },
  location: {
    kicker: "Location",
    title: "Easy off the highway. Right in the Basin.",
    desc: "Minutes from the loop, positioned for Permian Basin routes. Lot access around the clock, every day of the year.",
    directions: "Get Directions",
    call: "Call {phone}",
  },
  cta: {
    title: "Your space is waiting.",
    sub: "Reserve online in under two minutes. Accept the terms, pick your plan, and your space is ready when you are.",
    btn: "Reserve a Space Now",
  },
  chat: {
    title: "Big D — CADD Assistant",
    subtitle: "Ask about rates, showers, or booking",
    open: "Chat with Big D",
    placeholder: "Type a question…",
    send: "Send",
    greeting:
      "Howdy! I'm Big D, the virtual facilities officer here at CADD. Ask me about rates, showers, the lounge — or let's get you a space.",
    chips: ["What are your rates?", "Tell me about the showers", "How do I book a space?", "Where are you located?"],
    bookBtn: "Reserve a space",
    termsBtn: "Read the Terms",
    callBtn: "Call 1-833-4PARKLOT",
    disclaimer: "Never share card numbers in chat — payment happens on the secure form.",
    error: "Hmm, I couldn't connect. Give it another try or call 1-833-4PARKLOT.",
    thinking: "Big D is typing…",
  },
  footer: {
    tagline: "Secure parking. Real comfort. Built for truckers. Serving the Permian Basin since 2018.",
    findUs: "Find Us",
    hours: "Open 24/7 · Office on call",
    quickLinks: "Quick Links",
    linkReserve: "Reserve a Space",
    linkRates: "Rates & Plans",
    linkTerms: "Terms & Conditions",
    rights: "All rights reserved",
  },
  book: {
    metaKicker: "Reserve a Space",
    title: "Two minutes to peace-of-mind parking.",
    sub: "Pick your plan and rate, tell us who's parking, accept the terms, and choose how to pay. Card payments run through Square — or reserve now and pay by Zelle, Cash App, or cash.",
    stepSpace: "Pick your space on the lot",
    map: {
      note: "Green spaces are open — tap up to 4 to pick exactly where you park. Skip this step and we'll assign you the best open space automatically.",
      selected: "Selected:",
      none: "No spaces picked — we'll auto-assign yours",
      full: "All numbered spaces are taken right now — submit your reservation and the office will assign you a space as one frees up, or call 1-833-4PARKLOT.",
      fleetNote: "Need more than 4 trucks? Call for fleet rates.",
    },
    step1: "Choose your plan",
    step2: "Choose your rate",
    step3: "Driver & vehicle info",
    step4: "Read & accept the terms",
    step5: "How would you like to pay?",
    fields: {
      name: "Full legal name *",
      namePh: "John D. Driver",
      company: "Company (optional)",
      companyPh: "Driver Trucking LLC",
      email: "Email *",
      phone: "Phone *",
      vehicle: "Vehicle — unit #, plate & state, approx. length",
      vehiclePh: "Unit 42 · TX ABC-1234 · 73 ft tractor-trailer",
      signature: "Type your full legal name as your signature *",
    },
    termsBar: "Terms {version} · Effective {date}",
    openFull: "Open full page ↗",
    checkbox: "I have read and agree to the CADD Truck Parking {link} (version {version}), and I agree that checking this box and typing my name below is my electronic signature — the same as signing on paper.",
    checkboxLink: "Terms & Conditions",
    termsLangNote: "",
    payments: {
      square: { label: "Card — pay online now", desc: "Secure checkout by Square. Credit or debit." },
      zelle: { label: "Zelle", desc: "Send to Daniel Sanchez at 325-450-7486 — put your confirmation code in the memo." },
      cashapp: { label: "Cash App", desc: "Send to $dc23cadd — put your confirmation code in the note." },
      cash: { label: "Cash on arrival", desc: "Pay in person at the lot. Receipt provided." },
    },
    payNote: "Whichever way you pay, your acceptance of the terms is recorded the moment you reserve — so drivers paying by Zelle, Cash App, or cash are covered too.",
    submitPay: "Accept Terms & Pay {amount}",
    submitReserve: "Accept Terms & Reserve",
    submitting: "Working…",
    mustAccept: "Check the acceptance box and sign to continue.",
    ticket: {
      draft: "★ Parking Permit — Draft ★",
      facility: "Facility",
      location: "Location",
      plan: "Plan",
      rate: "Rate",
      showers: "Showers",
      holder: "Holder",
      terms: "Terms",
      accepted: "Accepted",
      notAccepted: "Not yet accepted",
      unlimited: "UNLIMITED",
      perMin: "$1 / minute",
      spaceNote: "Space numbers are assigned on confirmation.",
      includes2Free: "Includes 2 free months",
    },
    confirm: {
      paidTitle: "Payment received — you're set.",
      paidLine1: "Thanks for parking with CADD. We've got your signed terms and your payment.",
      paidLine2: "We'll reach out at the contact info you provided with your space number and gate details. Questions? Call {phone}.",
      reservedTitle: "Terms accepted — reservation on file.",
      onFile: "Your acceptance of the Terms & Conditions (version {version}) is documented and on file — that part is done, no matter how you pay.",
      amountDue: "Amount due: {amount} — {plan}, {term}. Questions? {phone1} or {phone2}.",
      code: "Confirmation code",
      space: "Your assigned space",
      home: "Back to Home",
      offline: {
        zelle: "Send your payment with Zelle to Daniel Sanchez at 325-450-7486 and put your confirmation code in the memo — your space locks in when it lands.",
        cashapp: "Send your payment on Cash App to $dc23cadd and put your confirmation code in the note — your space locks in when it lands.",
        cash: "Pay cash when you arrive at the lot — the facilities officer will issue a receipt.",
      },
    },
    errors: {
      generic: "Something went wrong. Please try again.",
      network: "Couldn't reach the server. Please try again or call {phone}.",
    },
  },
};

const es: typeof en = {
  nav: { rates: "Tarifas", amenities: "Servicios", location: "Ubicación", blog: "Bitácora", terms: "Términos", reserve: "Reserva tu Espacio" },
  hero: {
    kicker: "Desde 2018 · Midland, Texas · Cuenca Pérmica",
    line1: "Estaciónalo.",
    line2: "Asegúralo.",
    line3: "Descansa.",
    sub: "Estacionamiento seguro para tráileres — bardeado, con cámaras, regaderas de agua caliente, lavandería y una sala de descanso de verdad. Propiedad de la casa y operado en el corazón de la Cuenca Pérmica desde 2018.",
    ctaReserve: "Reserva tu Espacio",
    ctaRates: "Ver Tarifas",
    stats: [
      ["24/7", "Acceso al Patio"],
      ["100%", "Patio Bardeado"],
      ["#", "Espacios Asignados"],
      ["$25", "Por Día, Desde"],
    ] as [string, string][],
  },
  marquee: ["Bardeado y Seguro", "Cámaras 24/7", "Espacios Asignados", "Regaderas Calientes", "Lavandería", "Sala de Descanso", "Aire para Llantas", "Desde 2018"],
  amenities: {
    kicker: "Lo Que Recibes",
    title: "Más que un pedazo de terreno.",
    items: [
      { n: "01", title: "Patio Seguro", desc: "Patio completamente bardeado con entradas con portón y cámaras de vigilancia 24/7 — cada espacio numerado y asignado a ti." },
      { n: "02", title: "Regaderas Calientes", desc: "Regaderas limpias, privadas y con agua caliente a la hora que llegues. Paga por minuto ($1/min) en Trailblazer, o ilimitadas con el plan IronHauler." },
      { n: "03", title: "Sala de Choferes", desc: "WiFi, TV satelital, café, máquinas expendedoras, microondas y baños limpios. Un lugar de verdad para recuperarte entre viajes." },
      { n: "04", title: "Lavandería", desc: "Lavadoras y secadoras comerciales para que no andes buscando lavandería en tu descanso." },
      { n: "05", title: "Asador y Área de Picnic", desc: "Asadores de gas y carbón con mesas de picnic. Cocina comida de verdad bajo el cielo del oeste de Texas." },
      { n: "06", title: "Listo Para Salir", desc: "Estaciones de aire para tus llantas, espacio para revisar tu unidad y talleres locales de confianza cuando necesites una mano." },
    ],
  },
  rates: {
    kicker: "Dos Planes · Cuatro Formas de Pagar",
    title: "Elige tu plan.",
    sub: "Por día, semana, mes o año — cada espacio está asignado, numerado y dentro del patio bardeado. Reserva y paga en línea, o acepta los términos en línea y paga con Zelle, Cash App o efectivo al llegar.",
    annualNote: "Anual = pagas 10 meses y estacionas 12 — dos meses gratis",
    saveVsMonthly: "ahorras {amount} vs mensual",
    reserveBtn: "Reservar {plan}",
    terms: { daily: "Diario", weekly: "Semanal", monthly: "Mensual", annual: "Anual" },
    units: { daily: "/ día", weekly: "/ semana", monthly: "/ mes", annual: "/ año" },
    termTag: {
      daily: "Sin compromiso — llega hoy mismo",
      weekly: "Para la semana de trabajo",
      monthly: "Se renueva automático el día 1°",
      annual: "Pagas 10 meses, estacionas 12",
    },
    mostPopular: "Más Popular",
    included: "Qué incluye {plan}",
    twoFree: "2 meses gratis",
    plans: {
      trailblazer: {
        kicker: "Lo Esencial",
        blurb: "Un espacio numerado y asignado dentro de la barda con acceso completo al patio — todo lo que necesitas para estacionar tranquilo.",
        showers: "Regaderas calientes a $1 por minuto",
        features: ["Espacio asignado y numerado", "Acceso 24/7 al patio bardeado", "Vigilancia con cámaras 24/7", "Sala de choferes, baños y WiFi", "Lavandería y máquinas expendedoras", "Estaciones de aire para llantas", "Regaderas calientes — pagas por uso ($1/min)"],
      },
      ironhauler: {
        kicker: "El Paquete Completo",
        blurb: "Todo lo de Trailblazer, más regaderas ilimitadas y trato preferente. Hecho para choferes que viven en el camino.",
        showers: "Regaderas calientes ilimitadas incluidas",
        features: ["Todo lo de Trailblazer", "Regaderas ILIMITADAS — sin monedas, sin reloj", "Asignación de espacio preferente", "Atención prioritaria del encargado", "Acceso al asador y área de picnic", "Prioridad en talleres recomendados"],
      },
    },
    showerCompare: {
      basicTitle: "Regaderas en Trailblazer",
      basicPrice: "$1",
      basicUnit: "/ minuto",
      basicDesc: "Un baño rápido o uno largo — solo pagas los minutos que usas.",
      proTitle: "Regaderas en IronHauler",
      proPrice: "Ilimitadas",
      proDesc: "Sin monedas, sin reloj, sin límite. Báñate todos los días — ya está incluido.",
    },
  },
  gallery: {
    kicker: "El Patio",
    title: "Mira dónde vas a estacionar.",
    comingSoon: "Foto del patio {n} — próximamente",
  },
  brand: {
    kicker: "El Estándar CADD",
    title: "Negocio familiar. Primero el chofer.",
    body: "CADD no es una cadena corporativa — es un negocio familiar que cuida a los choferes de la Cuenca Pérmica desde 2018. Construimos el patio donde nosotros mismos quisiéramos estacionar: regaderas limpias, una sala de verdad, precios honestos y alguien que sí contesta el teléfono.",
    point1: "Propiedad de la casa desde 2018",
    point2: "Encargado en el patio 24/7",
    point3: "Tarifas de grupo para flotillas",
  },
  testimonials: {
    kicker: "Del Radio",
    title: "Los choferes hablan.",
    who: "Reseña verificada de chofer",
    quotes: [
      "Precios razonables con regaderas y lavandería en el mismo patio. Todo lo que un chofer de verdad necesita.",
      "El lugar está muy limpio y muy bien cuidado.",
      "Muy buenos servicios — regadera, sala de descanso y aire para las llantas antes de salir.",
    ],
  },
  faq: {
    kicker: "Bueno Saberlo",
    title: "Respuestas directas.",
    fleet: "¿Manejas una flotilla? Tenemos tarifas de grupo para varios tráileres —",
    items: [
      { q: "¿Cómo entro a los baños y regaderas?", a: "El baño privado tiene teclado — recibes el código en cuanto se confirma tu pago. Las regaderas están en la parte trasera del edificio principal, y los miembros IronHauler tienen acceso 24/7 con su propia llave." },
      { q: "¿Dónde estaciono mi vehículo personal?", a: "Hay estacionamiento para vehículos personales junto a la estación de aire y el portón de salida. También puedes dejar tu vehículo en tu espacio asignado, siempre que no se salga de tu área designada." },
      { q: "¿Cómo pago las regaderas, lavandería y máquinas?", a: "Las regaderas, lavandería, máquinas expendedoras y estaciones de aire aceptan monedas o pago desde la app PayRange — no necesitas máquina de cambio. Además, con PayRange acumulas puntos para lavadas y regaderas gratis." },
      { q: "¿Se permiten mascotas?", a: "Sí — las mascotas son bienvenidas siempre que traigan correa y estén acompañadas en todo momento. Trae tus propias bolsitas y usa los botes de basura." },
      { q: "¿Hay mecánico en el patio?", a: "No tenemos mecánico de planta, pero muchos técnicos locales atienden a nuestros clientes — varios dan descuento a los que se estacionan en CADD. Sus tarjetas están en la sala, y la mayoría de las refaccionarias entregan directo al patio. También hay 5 gasolineras de diésel en un radio de 3 millas." },
      { q: "¿Tienen tarifas de grupo o flotilla?", a: "¡Sí! Ofrecemos precios especiales en pases de grupo para flotillas. Llama al 1-833-4PARKLOT y pregunta por las opciones de grupo." },
    ],
  },
  location: {
    kicker: "Ubicación",
    title: "Saliendo de la carretera. En plena Cuenca.",
    desc: "A minutos del loop, bien ubicado para las rutas de la Cuenca Pérmica. Acceso al patio las 24 horas, todos los días del año.",
    directions: "Cómo Llegar",
    call: "Llama al {phone}",
  },
  cta: {
    title: "Tu espacio te espera.",
    sub: "Reserva en línea en menos de dos minutos. Acepta los términos, elige tu plan, y tu espacio te espera.",
    btn: "Reservar Ahora",
  },
  chat: {
    title: "Big D — Asistente CADD",
    subtitle: "Pregunta por tarifas, regaderas o reservas",
    open: "Chatea con Big D",
    placeholder: "Escribe tu pregunta…",
    send: "Enviar",
    greeting:
      "¡Qué tal! Soy Big D, el encargado virtual del patio de CADD. Pregúntame por tarifas, regaderas, la sala — o te aparto un espacio.",
    chips: ["¿Cuáles son las tarifas?", "Cuéntame de las regaderas", "¿Cómo reservo un espacio?", "¿Dónde están ubicados?"],
    bookBtn: "Reservar un espacio",
    termsBtn: "Leer los Términos",
    callBtn: "Llamar al 1-833-4PARKLOT",
    disclaimer: "Nunca compartas números de tarjeta en el chat — el pago se hace en el formulario seguro.",
    error: "Mmm, no pude conectar. Inténtalo de nuevo o llama al 1-833-4PARKLOT.",
    thinking: "Big D está escribiendo…",
  },
  footer: {
    tagline: "Estacionamiento seguro. Comodidad de verdad. Hecho para traileros. Sirviendo a la Cuenca Pérmica desde 2018.",
    findUs: "Encuéntranos",
    hours: "Abierto 24/7 · Oficina disponible por teléfono",
    quickLinks: "Enlaces",
    linkReserve: "Reserva tu Espacio",
    linkRates: "Tarifas y Planes",
    linkTerms: "Términos y Condiciones",
    rights: "Todos los derechos reservados",
  },
  book: {
    metaKicker: "Reserva tu Espacio",
    title: "Dos minutos para estacionar con toda tranquilidad.",
    sub: "Elige tu plan y tarifa, dinos quién va a estacionar, acepta los términos y elige cómo pagar. Los pagos con tarjeta pasan por Square — o reserva ahora y paga con Zelle, Cash App o efectivo.",
    stepSpace: "Elige tu espacio en el patio",
    map: {
      note: "Los espacios verdes están libres — toca hasta 4 para elegir exactamente dónde estacionas. Si te saltas este paso, te asignamos el mejor espacio disponible automáticamente.",
      selected: "Seleccionados:",
      none: "Sin espacios elegidos — te asignamos uno automáticamente",
      full: "Todos los espacios numerados están ocupados por ahora — envía tu reservación y la oficina te asigna un espacio en cuanto se libere, o llama al 1-833-4PARKLOT.",
      fleetNote: "¿Necesitas más de 4 tráileres? Llama para tarifas de flotilla.",
    },
    step1: "Elige tu plan",
    step2: "Elige tu tarifa",
    step3: "Datos del chofer y la unidad",
    step4: "Lee y acepta los términos",
    step5: "¿Cómo quieres pagar?",
    fields: {
      name: "Nombre legal completo *",
      namePh: "Juan D. Chofer",
      company: "Compañía (opcional)",
      companyPh: "Transportes Chofer LLC",
      email: "Correo electrónico *",
      phone: "Teléfono *",
      vehicle: "Unidad — número, placas y estado, largo aprox.",
      vehiclePh: "Unidad 42 · TX ABC-1234 · tráiler de 73 pies",
      signature: "Escribe tu nombre legal completo como tu firma *",
    },
    termsBar: "Términos {version} · Vigentes desde {date}",
    openFull: "Abrir página completa ↗",
    checkbox: "He leído y acepto los {link} de CADD Truck Parking (versión {version}), y acepto que marcar esta casilla y escribir mi nombre abajo constituye mi firma electrónica — igual que firmar en papel.",
    checkboxLink: "Términos y Condiciones",
    termsLangNote: "El documento legal está en inglés y es la versión que rige. Si tienes preguntas, llámanos antes de firmar.",
    payments: {
      square: { label: "Tarjeta — paga en línea ahora", desc: "Pago seguro con Square. Crédito o débito." },
      zelle: { label: "Zelle", desc: "Envía a Daniel Sanchez al 325-450-7486 — pon tu código de confirmación en la nota." },
      cashapp: { label: "Cash App", desc: "Envía a $dc23cadd — pon tu código de confirmación en la nota." },
      cash: { label: "Efectivo al llegar", desc: "Paga en persona en el patio. Te damos recibo." },
    },
    payNote: "Pagues como pagues, tu aceptación de los términos queda registrada en el momento en que reservas — así los choferes que pagan con Zelle, Cash App o efectivo también quedan cubiertos.",
    submitPay: "Aceptar Términos y Pagar {amount}",
    submitReserve: "Aceptar Términos y Reservar",
    submitting: "Procesando…",
    mustAccept: "Marca la casilla de aceptación y firma para continuar.",
    ticket: {
      draft: "★ Permiso de Estacionamiento — Borrador ★",
      facility: "Instalación",
      location: "Ubicación",
      plan: "Plan",
      rate: "Tarifa",
      showers: "Regaderas",
      holder: "Titular",
      terms: "Términos",
      accepted: "Aceptados",
      notAccepted: "Aún sin aceptar",
      unlimited: "ILIMITADAS",
      perMin: "$1 / minuto",
      spaceNote: "El número de espacio se asigna al confirmar.",
      includes2Free: "Incluye 2 meses gratis",
    },
    confirm: {
      paidTitle: "Pago recibido — listo.",
      paidLine1: "Gracias por estacionar con CADD. Ya tenemos tus términos firmados y tu pago.",
      paidLine2: "Te contactaremos a los datos que nos diste con tu número de espacio y los detalles del portón. ¿Preguntas? Llama al {phone}.",
      reservedTitle: "Términos aceptados — reservación registrada.",
      onFile: "Tu aceptación de los Términos y Condiciones (versión {version}) quedó documentada y archivada — esa parte ya está, sin importar cómo pagues.",
      amountDue: "Monto a pagar: {amount} — {plan}, {term}. ¿Preguntas? {phone1} o {phone2}.",
      code: "Código de confirmación",
      space: "Tu espacio asignado",
      home: "Volver al Inicio",
      offline: {
        zelle: "Envía tu pago por Zelle a Daniel Sanchez al 325-450-7486 y pon tu código de confirmación en la nota — tu espacio queda apartado en cuanto llegue.",
        cashapp: "Envía tu pago por Cash App a $dc23cadd y pon tu código de confirmación en la nota — tu espacio queda apartado en cuanto llegue.",
        cash: "Paga en efectivo cuando llegues al patio — el encargado te dará tu recibo.",
      },
    },
    errors: {
      generic: "Algo salió mal. Inténtalo de nuevo.",
      network: "No pudimos conectar con el servidor. Inténtalo de nuevo o llama al {phone}.",
    },
  },
};

export const CONTENT: Record<Lang, typeof en> = { en, es };

/** Tiny template helper: fill("Call {phone}", {phone: "555"}) */
export function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

/* ── Context ─────────────────────────────────────────────────── */

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof en;
}>({ lang: "en", setLang: () => {}, t: en });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("cadd-lang");
    if (saved === "es" || saved === "en") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("cadd-lang", l);
    document.documentElement.lang = l;
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang, t: CONTENT[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
