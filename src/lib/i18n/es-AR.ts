// Todos los textos de la interfaz viven acá (español rioplatense), para poder traducirlos después.
export const t = {
  app: {
    name: "Rutina",
    tagline: "Tu rutina, en un solo lugar.",
  },
  contexts: {
    work: "Trabajo",
    personal: "Personal",
    health: "Salud",
    finance: "Finanzas",
  },
  nav: {
    today: "Hoy",
    inbox: "Inbox",
  },
  inbox: {
    title: "Inbox",
    emptyTitle: "Todo en orden",
    emptyBody: "Anotá lo que se te ocurra abajo y lo ordenamos después.",
  },
  today: {
    title: "Hoy",
    emptyTitle: "Nada para hoy",
    emptyBody: "Disfrutá el día. Si surge algo, anotalo abajo.",
  },
  quickAdd: {
    placeholder: "Anotá algo…",
    submit: "Agregar",
  },
  auth: {
    signInWithGoogle: "Ingresar con Google",
    signOut: "Cerrar sesión",
    error: "No pudimos iniciar sesión. Probá de nuevo.",
    greeting: (name: string) => `Hola, ${name}`,
    greetingAnonymous: "Hola",
  },
} as const;
