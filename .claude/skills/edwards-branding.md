# Edwards Lifesciences - Wytyczne Brandingu

Źródło: Edwards_RGB_31Dec2021.ase (oficjalna paleta kolorów)
Wersja: 2.0 - Styczeń 2025

## Kolory główne (Primary Colors)

| Zastosowanie      | Nazwa        | HEX       | RGB            | Pantone |
|-------------------|--------------|-----------|----------------|---------|
| Logo, H1, CTA     | Edwards Red  | `#C8102E` | 200, 16, 46    | 186     |
| Tekst główny      | Dark Gray    | `#505759` | 80, 87, 89     | 445     |
| Tekst drugorzędny | Medium Gray  | `#898D8D` | 137, 141, 141  | 423     |

## Kolory do wykresów (Chart Colors)

Oficjalna paleta ASE - używaj w podanej kolejności:

| #  | Nazwa       | HEX       | RGB            | Pantone | Zastosowanie    |
|----|-------------|-----------|----------------|---------|-----------------|
| 1  | Edwards Red | `#C8102E` | 200, 16, 46    | 186     | Seria główna    |
| 2  | Teal        | `#6ABCB6` | 106, 188, 182  | 563     | Porównanie      |
| 3  | Blue Gray   | `#7A99AC` | 122, 153, 172  | 5425    | Drugorzędna     |
| 4  | Tan         | `#A89968` | 168, 153, 104  | 7503    | Trzecia seria   |
| 5  | Taupe Gray  | `#B7B09C` | 183, 176, 156  | 7535    | Tła             |
| 6  | Warm Gray   | `#A39382` | 163, 147, 130  | 7530    | Dodatkowa       |

## Kolory tła (Background Colors)

| Nazwa    | HEX       | RGB            | Pantone |
|----------|-----------|----------------|---------|
| Peach    | `#D7A181` | 215, 161, 129  | 2430    |
| Sand     | `#D3BBA8` | 211, 187, 168  | 481     |
| Blush    | `#C09AA1` | 192, 154, 161  | 4036    |
| Lavender | `#B095B1` | 176, 149, 177  | 5215    |
| Ice Blue | `#A4BCC2` | 164, 188, 194  | 7542    |
| Sage     | `#94A596` | 148, 165, 150  | 5635    |
| Gold     | `#CEB888` | 206, 184, 136  | 7502    |

## Kolory akcentowe (Accent Colors)

| Nazwa    | HEX       | RGB            | Pantone | Zastosowanie      |
|----------|-----------|----------------|---------|-------------------|
| Orange   | `#CF4520` | 207, 69, 32    | 173     | Alerty            |
| Burgundy | `#8A2A2B` | 138, 42, 43    | 7623    | Negatywne trendy  |
| Berry    | `#9B2743` | 155, 39, 67    | 194     | Emfaza            |
| Purple   | `#624C80` | 98, 76, 128    | 668     | Kategorie         |
| Navy     | `#356584` | 53, 101, 132   | 7699    | Korporacyjne      |
| Deep Blue| `#00568C` | 0, 86, 140     | 7692    | Linki             |
| Deep Teal| `#00626C` | 0, 98, 108     | 7715    | Sukces            |
| Forest   | `#446A5F` | 68, 106, 95    | 5545    | Natura            |
| Brown    | `#645142` | 100, 81, 66    | 7532    | Ziemia            |
| Ochre    | `#8E6325` | 142, 99, 37    | 4027    | Ostrzeżenie       |

## Typografia

**Czcionka:** Arial (fallback: Helvetica, sans-serif)

| Element          | Rozmiar  | Waga    | Kolor     |
|------------------|----------|---------|-----------|
| Tytuł (H1)      | 28pt     | Bold    | `#C8102E` |
| Sekcja (H2)     | 18-20pt  | Bold    | `#505759` |
| Podsekcja (H3)  | 14-16pt  | Bold    | `#505759` |
| Tekst treści     | 11-12pt  | Regular | `#505759` |
| Tekst tabeli     | 10pt     | Regular | `#505759` |
| Etykiety wykresów| 10pt     | Regular | `#505759` |

## Wytyczne dla wykresów

### Ogólne zasady
1. Maksymalizuj czytelność danych - wygląd drugorzędny
2. Edwards Red TYLKO dla głównej serii lub najważniejszych wartości
3. Unikaj więcej niż 3-4 serii w jednym wykresie
4. Zawsze zaznacz legendę
5. Brak cieni, gradientów, efektów 3D

### Wykresy słupkowe
- Paleta w kolejności: Edwards Red → Teal → Blue Gray → Tan → Taupe Gray → Warm Gray
- Rozstaw między grupami: 1.5x szerokości słupka

### Wykresy liniowe
- Grubość linii: 2-2.5pt (główna), 1.5pt (dodatkowe)
- Trend spadkowy: Burgundy `#8A2A2B`

### Wykresy kołowe
- MAKSYMALNIE 6 segmentów
- Więcej kategorii = użyj wykresu słupkowego

## Wytyczne dla tabel

| Element              | Tło       | Tekst     |
|----------------------|-----------|-----------|
| Nagłówek             | `#C8102E` | biały     |
| Wiersze normalne     | `#FFFFFF` | `#505759` |
| Wiersze naprzemienne | `#F5F5F5` | `#505759` |

- Wyrównanie: lewa dla tekstu, prawa dla liczb

### Tabele DOCX (docx-js / python-docx)
- ZAWSZE używaj DXA (twips) dla szerokości tabeli, NIGDY PERCENTAGE
- A4 z marginesami 0.7": width = 9890 DXA
- A4 z marginesami 1": width = 9026 DXA
- Formuła: `(page_width_inches - 2 × margin_inches) × 1440 = DXA`

## ZAKAZANE

### Kolory - NIGDY nie używaj
- Czyste Blue, Green, Yellow - używaj tylko palety ASE
- Gradienty, cienie, efekty 3D

### Typografia - NIGDY nie używaj
- Georgia, Times New Roman, Comic Sans
- Rozmiary poniżej 9pt

### Design - NIGDY nie używaj
- Więcej niż 6 serii w wykresie
- Zaokrąglone narożniki z cieniami
- Efekty rozmycia, przezroczystości, animacje

## Organizacja plików

- Zapisuj pliki do `~/Desktop/[ProjectFolder]/`, nigdy luźno na pulpicie
- Nazewnictwo ZIP: `[PROJECT]_[AREA]_v[VERSION].zip`
- Dokumenty: wersje PL + EN, executive summary, checklists

## Quick Reference (do kopiowania)

```
Primary:        #C8102E (Edwards Red, Pantone 186)
Text:           #505759 (Dark Gray, Pantone 445)
Chart palette:  #C8102E, #6ABCB6, #7A99AC, #A89968, #B7B09C, #A39382
Negative:       #8A2A2B (Burgundy, Pantone 7623)
Font:           Arial
Table A4 0.7":  9890 DXA
Table A4 1":    9026 DXA
```
