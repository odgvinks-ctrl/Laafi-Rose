export function lire(cle, defaut) {
  try {
    const valeur = localStorage.getItem(cle);
    return valeur ? JSON.parse(valeur) : defaut;
  } catch {
    return defaut;
  }
}

export function ecrire(cle, valeur) {
  try {
    if (valeur === null || valeur === undefined) {
      localStorage.removeItem(cle);
    } else {
      localStorage.setItem(cle, JSON.stringify(valeur));
    }
  } catch {
    return;
  }
}
