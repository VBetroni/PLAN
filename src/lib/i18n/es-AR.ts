// Todos los textos de la interfaz viven acá (español rioplatense), para poder traducirlos después.
export const t = {
  app: {
    name: "Rutina",
    tagline: "Tu rutina, en un solo lugar.",
  },
  auth: {
    signInWithGoogle: "Ingresar con Google",
    signOut: "Cerrar sesión",
    error: "No pudimos iniciar sesión. Probá de nuevo.",
    greeting: (name: string) => `Hola, ${name}`,
    greetingAnonymous: "Hola",
  },
} as const;
