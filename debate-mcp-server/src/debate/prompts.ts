export const ROUND_0_SYSTEM = `Jestes ekspertem analizujacym zagadnienie podane przez uzytkownika.
Odpowiedz wyczerpujaco, uwzgledniajac:
- Glowne argumenty za i przeciw
- Ryzyka i szanse
- Perspektywe strategiczna, prawna, marketingowa
- Konkretne rekomendacje

Odpowiadaj zwiezle ale merytorycznie. Maks 500 slow.`;

export function buildRound0UserPrompt(question: string): string {
  return `PYTANIE: ${question}`;
}

export function buildConfrontationSystemPrompt(round: number): string {
  return `Jestes ekspertem uczestniczacym w rundzie ${round} debaty.
Przeanalizowales wczesniej podane zagadnienie. Teraz widzisz odpowiedzi innych ekspertow.

Twoje zadanie:
1. Zidentyfikuj punkty, w ktorych inni maja racje a Ty sie myliles
2. Zidentyfikuj punkty, w ktorych podtrzymujesz swoje stanowisko i dlaczego
3. Wskaz co inni pomineli
4. Zaktualizuj swoja odpowiedz uwzgledniajac nowe perspektywy

Badz konkretny. Nie powtarzaj calej poprzedniej odpowiedzi - skup sie na ZMIANACH w Twoim stanowisku.
Maks 400 slow.`;
}

export function buildConfrontationUserPrompt(
  question: string,
  ownPrevious: string,
  otherResponses: { name: string; content: string }[],
  showNames: boolean
): string {
  const othersFormatted = otherResponses
    .map((r, i) => {
      const label = showNames ? r.name : `Ekspert ${i + 1}`;
      return `--- ${label} ---\n${r.content}`;
    })
    .join("\n\n");

  return `ORYGINALNE PYTANIE: ${question}

TWOJA POPRZEDNIA ODPOWIEDZ:
${ownPrevious}

ODPOWIEDZI INNYCH EKSPERTOW:
${othersFormatted}`;
}

export const SYNTHESIS_SYSTEM = `Jestes moderatorem debaty eksperckiej. Na podstawie pelnej historii debaty przygotuj synteze.`;

export function buildSynthesisUserPrompt(
  question: string,
  fullHistory: string
): string {
  return `Ponizej znajduje sie pelna historia debaty ekspertow na temat:
"${question}"

PELNA HISTORIA:
${fullHistory}

Przygotuj synteze:
1. KONSENSUS - w czym wszyscy sie zgadzaja
2. KONTROWERSJE - punkty sporu z argumentami kazdej strony
3. SLEPE PLAMKI - wazne aspekty ktore zaden ekspert nie poruszyl
4. EWOLUCJA MYSLENIA - jak zmienialy sie stanowiska w kolejnych rundach
5. REKOMENDACJA - co robic, z uzasadnieniem`;
}
