export const YOUNGMINDS_BRAND = {
  name: "YoungMinds",
  descriptor: "afterschool si loc de joaca",
  website: "https://youngminds.live",
  audience: "parinti cu copii de varsta scolara care cauta afterschool, activitati educationale si un spatiu sigur de joaca si dezvoltare",
  promise: "un loc cald si curios unde copiii invata prin joaca, tehnologie, miscare, muzica si limbi straine",
  tone: "prietenos, cald, ludic, clar, de incredere pentru parinti, fara promisiuni exagerate",
  colors: {
    midnight: "#26336F",
    indigo: "#5668B5",
    softBlue: "#9FB6E3",
    yellow: "#FFC51B",
    orange: "#F59B23",
    pink: "#E64E9A",
    white: "#FFFFFF",
    cloud: "#F6F8FF"
  },
  activities: [
    { name: "STEM", details: "juguetronica, learning resources, tabla interactiva multitouch" },
    { name: "Pian", details: "muzica, ritm, atentie si expresivitate" },
    { name: "Tae-kwon do", details: "disciplina, coordonare si incredere" },
    { name: "Robotica", details: "Lego Wedo, Boost, Mindstorms" },
    { name: "Limbi straine", details: "comunicare, vocabular si curaj de exprimare" },
    { name: "Yoga", details: "calm, respiratie, autoreglare si prezenta" }
  ],
  contentPillars: [
    "activitati educationale explicate pe intelesul parintilor",
    "beneficii reale pentru copii: curiozitate, autonomie, atentie, incredere",
    "viata de zi cu zi in afterschool si in spatiul de joaca",
    "sfaturi utile pentru parinti",
    "campanii de inscriere, evenimente, ateliere si zile speciale"
  ],
  defaultGoal: "creeaza continut Instagram care atrage parinti catre YoungMinds, explica activitatile, construieste incredere si invita la vizita sau inscriere",
  defaultScript: "Scrie aici tema postarii sau un script scurt. Exemplu: vrem sa explicam parintilor de ce robotica ii ajuta pe copii sa gandeasca logic, sa colaboreze si sa invete prin joaca."
} as const;

export function getYoungMindsActivityList() {
  return YOUNGMINDS_BRAND.activities.map((activity) => `${activity.name}: ${activity.details}`).join("; ");
}
